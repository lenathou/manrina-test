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
    const productIds = useMemo(() => products.map(p => p.id).sort(), [products]);
    
    return useQuery({
        queryKey: ['all-products-global-stock', productIds],
        queryFn: async (): Promise<Record<string, number>> => {
            try {
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
        staleTime: 30000, // Cache pendant 30 secondes
        refetchOnWindowFocus: false, // Ne pas refetch au focus
        refetchOnMount: false, // Ne pas refetch au mount si les données sont fraîches
        enabled: enabled && products.length > 0,
    });
}

// Hook pour obtenir le stock d'un produit spécifique depuis le cache global
export function useProductGlobalStockFromCache(productId: string, allStocks?: Record<string, number>) {
    if (!allStocks) return undefined;
    return allStocks[productId] ?? 0;
}
