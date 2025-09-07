import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/Toast';
import { Prisma } from '@prisma/client';

type MarketProduct = Prisma.MarketProductGetPayload<{
    include: {
        grower: true;
        marketSession: true;
    };
}>;

type MarketSession = {
    id: string;
    name: string;
    date: Date | string;
    location: string | null;
    status: string;
};

interface UseMarketProductValidationProps {
    growerId: string;
    onSuccess?: () => void;
}

export function useMarketProductValidation({ growerId, onSuccess }: UseMarketProductValidationProps) {
    const { error } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSession, setSelectedSession] = useState<MarketSession | null>(null);

    // Fonction pour basculer l'état actif/inactif d'un produit de marché
    const toggleMarketProduct = useCallback(async (productId: string, isActive: boolean): Promise<boolean> => {
        try {
            const response = await fetch(`/api/grower/stand-products/${productId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isActive }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erreur lors de la mise à jour du produit');
            }

            return true;
        } catch (err) {
            console.error('Erreur lors de la mise à jour du produit:', err);
            return false;
        }
    }, []);

    // Fonction pour valider et envoyer la liste de produits à une session
    const validateMarketProductList = useCallback(async (
        sessionId: string, 
        products: MarketProduct[]
    ): Promise<boolean> => {
        if (!sessionId || products.length === 0) {
            error('Session ou liste de produits invalide');
            return false;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/grower/send-products-to-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionId,
                    growerId,
                    products: products.map(product => ({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        unit: product.unit,
                        description: product.description,
                        category: product.category,
                        stock: product.stock,
                        isActive: product.isActive
                    }))
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erreur lors de l\'envoi des produits');
            }

            
            // Appeler le callback de succès si fourni
            if (onSuccess) {
                onSuccess();
            }

            return true;
        } catch (err) {
            console.error('Erreur lors de l\'envoi des produits:', err);
            error(err instanceof Error ? err.message : 'Erreur lors de l\'envoi des produits');
            return false;
        } finally {
            setIsSubmitting(false);
        }
    }, [growerId, error, onSuccess]);

    // Fonction pour ouvrir le modal de validation avec une session sélectionnée
    const openValidationModal = useCallback((session: MarketSession) => {
        setSelectedSession(session);
        setIsModalOpen(true);
    }, []);

    // Fonction pour fermer le modal de validation
    const closeValidationModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedSession(null);
    }, []);

    // Fonction pour valider directement une liste sans modal (pour compatibilité)
    const sendMarketProductsToSession = useCallback(async (
        sessionId: string,
        standProducts: MarketProduct[]
    ): Promise<void> => {
        const activeProducts = standProducts.filter(product => product.isActive);
        
        if (activeProducts.length === 0) {
            error('Aucun produit actif à envoyer');
            return;
        }

        const success = await validateMarketProductList(sessionId, activeProducts);
        if (success) {
            // Le message de succès est géré dans validateMarketProductList
        }
    }, [validateMarketProductList, error]);

    return {
        // États
        isSubmitting,
        isModalOpen,
        selectedSession,
        
        // Actions pour le modal
        openValidationModal,
        closeValidationModal,
        
        // Actions pour les produits
        toggleMarketProduct,
        validateMarketProductList,
        sendMarketProductsToSession, // Pour compatibilité avec l'ancien code
    };
}

export default useMarketProductValidation;