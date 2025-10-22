import { useState, useEffect, useCallback } from 'react';

// Interface pour les données de variant modifiées
export interface VariantPriceData {
    price: number | null;
    isActive: boolean;
    lastPrice?: number;
}

// Interface pour les modifications en attente d'un produit
export interface PendingProductChanges {
    productId: string;
    productName: string;
    variantData: Record<string, VariantPriceData>;
    stockData?: {
        newStock: number;
        originalStock: number;
    };
    modifiedAt: number; // timestamp
}

// Interface pour toutes les modifications en attente
export interface PendingChanges {
    [productId: string]: PendingProductChanges;
}

const STORAGE_KEY = 'grower_pending_variant_changes';

export const usePendingVariantChanges = (growerId: string) => {
    const [pendingChanges, setPendingChanges] = useState<PendingChanges>({});
    const [isLoading, setIsLoading] = useState(true);

    // Clé de stockage spécifique au producteur
    const storageKey = `${STORAGE_KEY}_${growerId}`;

    // Charger les modifications depuis le localStorage
    const loadPendingChanges = useCallback(() => {
        try {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                const parsed = JSON.parse(stored);
                setPendingChanges(parsed);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des modifications en attente:', error);
        } finally {
            setIsLoading(false);
        }
    }, [storageKey]);

    // Sauvegarder les modifications dans le localStorage
    const savePendingChanges = useCallback((changes: PendingChanges) => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(changes));
            setPendingChanges(changes);
            
            // Déclencher un événement personnalisé pour synchroniser les autres composants
            window.dispatchEvent(new CustomEvent('pendingChangesUpdated'));
        } catch (error) {
            console.error('Erreur lors de la sauvegarde des modifications en attente:', error);
        }
    }, [storageKey]);

    // Ajouter ou mettre à jour les modifications d'un produit
    const savePendingProductChanges = useCallback((
        productId: string,
        productName: string,
        variantData: Record<string, VariantPriceData>
    ) => {
        const existingChanges = pendingChanges[productId];
        const newChanges = {
            ...pendingChanges,
            [productId]: {
                productId,
                productName,
                variantData,
                stockData: existingChanges?.stockData, // Préserver les données de stock existantes
                modifiedAt: Date.now()
            }
        };
        savePendingChanges(newChanges);
    }, [pendingChanges, savePendingChanges]);

    // Ajouter ou mettre à jour les modifications de stock d'un produit
    const savePendingStockChanges = useCallback((
        productId: string,
        productName: string,
        newStock: number,
        originalStock: number
    ) => {
        const existingChanges = pendingChanges[productId];
        const newChanges = {
            ...pendingChanges,
            [productId]: {
                productId,
                productName,
                variantData: existingChanges?.variantData || {}, // Préserver les données de variants existantes
                stockData: {
                    newStock,
                    originalStock
                },
                modifiedAt: Date.now()
            }
        };
        savePendingChanges(newChanges);
    }, [pendingChanges, savePendingChanges]);

    // Fonction unifiée pour sauvegarder prix et stock simultanément (SOLUTION OPTIMALE)
    const savePendingProductAndStockChanges = useCallback((
        productId: string,
        productName: string,
        variantData?: Record<string, VariantPriceData>,
        stockData?: { newStock: number; originalStock: number }
    ) => {
        const existingChanges = pendingChanges[productId];
        const newChanges = {
            ...pendingChanges,
            [productId]: {
                productId,
                productName,
                variantData: variantData || existingChanges?.variantData || {},
                stockData: stockData || existingChanges?.stockData,
                modifiedAt: Date.now()
            }
        };
        savePendingChanges(newChanges);
    }, [pendingChanges, savePendingChanges]);

    // Supprimer les modifications d'un produit spécifique
    const removePendingProductChanges = useCallback((productId: string) => {
        const newChanges = { ...pendingChanges };
        delete newChanges[productId];
        savePendingChanges(newChanges);
    }, [pendingChanges, savePendingChanges]);

    // Vider toutes les modifications en attente
    const clearAllPendingChanges = useCallback(() => {
        try {
            localStorage.removeItem(storageKey);
            setPendingChanges({});
            
            // Déclencher un événement personnalisé pour synchroniser les autres composants
            window.dispatchEvent(new CustomEvent('pendingChangesUpdated'));
        } catch (error) {
            console.error('Erreur lors de la suppression des modifications en attente:', error);
        }
    }, [storageKey]);

    // Vérifier si un produit a des modifications en attente
    const hasProductPendingChanges = useCallback((productId: string): boolean => {
        return productId in pendingChanges;
    }, [pendingChanges]);

    // Obtenir le nombre total de produits modifiés
    const getPendingChangesCount = useCallback((): number => {
        return Object.keys(pendingChanges).length;
    }, [pendingChanges]);

    // Obtenir toutes les modifications sous forme de liste pour l'envoi à l'admin
    const getAllPendingChangesForSubmission = useCallback(() => {
        const allChanges: Array<{
            productId: string;
            variantPrices: Array<{ variantId: string; price: number | null }>;
            stockChange?: { newStock: number; originalStock: number };
        }> = [];

        Object.values(pendingChanges).forEach(productChanges => {
            const variantPrices = Object.entries(productChanges.variantData).map(([variantId, data]) => ({
                variantId,
                price: data.isActive ? data.price : null
            }));

            const changeData: {
                productId: string;
                variantPrices: Array<{ variantId: string; price: number | null }>;
                stockChange?: { newStock: number; originalStock: number };
            } = {
                productId: productChanges.productId,
                variantPrices
            };

            if (productChanges.stockData) {
                changeData.stockChange = productChanges.stockData;
            }

            allChanges.push(changeData);
        });

        return allChanges;
    }, [pendingChanges]);

    // Charger les données au montage du hook
    useEffect(() => {
        loadPendingChanges();
    }, [loadPendingChanges]);

    // Écouter les changements dans le localStorage pour synchroniser entre les composants
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === storageKey) {
                loadPendingChanges();
            }
        };

        // Écouter les événements storage pour la synchronisation entre onglets/composants
        window.addEventListener('storage', handleStorageChange);

        // Écouter les événements personnalisés pour la synchronisation dans le même onglet
        const handleCustomStorageChange = () => {
            loadPendingChanges();
        };

        window.addEventListener('pendingChangesUpdated', handleCustomStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('pendingChangesUpdated', handleCustomStorageChange);
        };
    }, [storageKey, loadPendingChanges]);

    return {
        pendingChanges,
        isLoading,
        savePendingProductChanges,
        savePendingStockChanges,
        savePendingProductAndStockChanges, // Nouvelle fonction unifiée
        removePendingProductChanges,
        clearAllPendingChanges,
        hasProductPendingChanges,
        getPendingChangesCount,
        getAllPendingChangesForSubmission,
        loadPendingChanges
    };
};