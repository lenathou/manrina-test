import { useQuery } from '@tanstack/react-query';
import { backendFetchService } from '@/service/BackendFetchService';
import { IProduct } from '@/server/product/IProduct';
import { useMemo } from 'react';

interface UseAllProductsGlobalStockProps {
    products: IProduct[];
    enabled?: boolean;
}

export function useAllProductsGlobalStock({ products, enabled = true }: UseAllProductsGlobalStockProps) {
    // Stabiliser la liste des IDs pour éviter les re-renders inutiles
    const productIds = useMemo(() => {
        if (!products || products.length === 0) return [];
        return products.map(p => p.id).sort();
    }, [products]);
    
    // Créer une clé stable pour éviter les re-renders
    const stableKey = useMemo(() => productIds.join(','), [productIds]);
    
    return useQuery({
        queryKey: ['all-products-global-stock', stableKey],
        queryFn: async (): Promise<Record<string, number>> => {
            try {
                if (productIds.length === 0) return {};
                
                // Utiliser la nouvelle API batch pour récupérer tous les stocks en une seule requête
                const stockMap = await backendFetchService.getAllProductsGlobalStock(productIds);
                return stockMap;
            } catch (error) {
                console.error('Erreur lors de la récupération des stocks globaux:', error);
                // Retourner un objet avec des stocks à 0 pour tous les produits
                const fallbackStocks: Record<string, number> = {};
                products.forEach(product => {
                    fallbackStocks[product.id] = 0;
                });
                return fallbackStocks;
            }
        },
        staleTime: 5 * 60 * 1000, // 5 minutes (augmenté de 30s à 5min)
        gcTime: 10 * 60 * 1000, // 10 minutes de cache
        refetchOnWindowFocus: false, // Ne pas refetch au focus
        refetchOnMount: false, // Ne pas refetch au mount si les données sont fraîches
        refetchInterval: false, // Pas de refetch automatique
        enabled: enabled && productIds.length > 0,
        meta: {
            priority: 'medium',
            description: 'Stocks globaux avec cache optimisé',
        },
    });
}

// Hook pour obtenir le stock d'un produit spécifique depuis le cache global
export function useProductGlobalStockFromCache(productId: string, allStocks?: Record<string, number>) {
    if (!allStocks) return undefined;
    return allStocks[productId] ?? 0;
}
