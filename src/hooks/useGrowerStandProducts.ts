import { useState, useEffect, useCallback } from 'react';
import { Prisma } from '@prisma/client';

type GrowerStandProduct = Prisma.GrowerStandProductGetPayload<{
    include: {
        product: true;
        variant: true;
        unit: true;
    };
}>;

interface UseGrowerStandProductsReturn {
    standProducts: GrowerStandProduct[];
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    addStandProduct: (data: {
        productId: string;
        variantId: string;
        unitId: string;
        price: number;
        quantity?: number;
    }) => Promise<boolean>;
    updateStandProduct: (id: string, data: {
        price?: number;
        unitId?: string;
        quantity?: number;
        isActive?: boolean;
    }) => Promise<boolean>;
    removeStandProduct: (id: string) => Promise<boolean>;
}

export function useGrowerStandProducts(growerId?: string): UseGrowerStandProductsReturn {
    const [standProducts, setStandProducts] = useState<GrowerStandProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Charger les produits du stand
    const fetchStandProducts = useCallback(async () => {
        if (!growerId) {
            setStandProducts([]);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            
            const response = await fetch(`/api/grower/stand-products?growerId=${growerId}`);
            
            if (!response.ok) {
                throw new Error('Erreur lors du chargement des produits du stand');
            }
            
            const data = await response.json();
            setStandProducts(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
            setError(errorMessage);
            console.error('Error fetching stand products:', err);
        } finally {
            setIsLoading(false);
        }
    }, [growerId]);

    // Charger les données au montage et quand growerId change
    useEffect(() => {
        fetchStandProducts();
    }, [fetchStandProducts]);

    // Ajouter un produit au stand
    const addStandProduct = useCallback(async (data: {
        productId: string;
        variantId: string;
        unitId: string;
        price: number;
        quantity?: number;
    }): Promise<boolean> => {
        if (!growerId) return false;

        try {
            const response = await fetch('/api/grower/stand-products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    growerId,
                    ...data
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erreur lors de l\'ajout du produit');
            }

            // Recharger la liste après ajout
            await fetchStandProducts();
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
            setError(errorMessage);
            console.error('Error adding stand product:', err);
            return false;
        }
    }, [growerId, fetchStandProducts]);

    // Mettre à jour un produit du stand
    const updateStandProduct = useCallback(async (id: string, data: {
        price?: number;
        unitId?: string;
        quantity?: number;
        isActive?: boolean;
    }): Promise<boolean> => {
        try {
            const response = await fetch(`/api/grower/stand-products/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erreur lors de la mise à jour');
            }

            // Recharger la liste après mise à jour
            await fetchStandProducts();
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
            setError(errorMessage);
            console.error('Error updating stand product:', err);
            return false;
        }
    }, [fetchStandProducts]);

    // Supprimer un produit du stand
    const removeStandProduct = useCallback(async (id: string): Promise<boolean> => {
        try {
            const response = await fetch(`/api/grower/stand-products/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erreur lors de la suppression');
            }

            // Recharger la liste après suppression
            await fetchStandProducts();
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
            setError(errorMessage);
            console.error('Error removing stand product:', err);
            return false;
        }
    }, [fetchStandProducts]);

    return {
        standProducts,
        isLoading,
        error,
        refetch: fetchStandProducts,
        addStandProduct,
        updateStandProduct,
        removeStandProduct
    };
}