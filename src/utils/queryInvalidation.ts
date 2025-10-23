import { QueryClient } from '@tanstack/react-query';
import { STOCK_GET_ALL_PRODUCTS_QUERY_KEY } from '@/components/admin/stock.config';

/**
 * Invalide toutes les requêtes liées aux produits de manière cohérente et optimisée
 * pour éviter les problèmes de synchronisation entre les différents caches
 */
export const invalidateAllProductQueries = (queryClient: QueryClient) => {
    // Invalider avec refetchType: 'none' pour éviter les refetch automatiques
    queryClient.invalidateQueries({ 
        queryKey: STOCK_GET_ALL_PRODUCTS_QUERY_KEY,
        refetchType: 'none'
    });
    queryClient.invalidateQueries({ 
        queryKey: ['products_with_stock'],
        refetchType: 'none'
    });
    queryClient.invalidateQueries({ 
        queryKey: ['products'],
        refetchType: 'none'
    });
    queryClient.invalidateQueries({ 
        queryKey: ['calculateGlobalStock'],
        refetchType: 'none'
    });
    
    // Invalider aussi les caches de stocks globaux
    queryClient.invalidateQueries({ 
        queryKey: ['all-products-global-stock'],
        refetchType: 'none'
    });
};

/**
 * Version optimisée pour les invalidations fréquentes (ex: après modifications)
 * Utilise un délai pour éviter les invalidations multiples rapprochées
 */
let invalidationTimeout: NodeJS.Timeout | null = null;

export const invalidateAllProductQueriesDebounced = (queryClient: QueryClient, delay = 300) => {
    if (invalidationTimeout) {
        clearTimeout(invalidationTimeout);
    }
    
    invalidationTimeout = setTimeout(() => {
        invalidateAllProductQueries(queryClient);
        invalidationTimeout = null;
    }, delay);
};

/**
 * Invalide les requêtes de stock pour un produit spécifique
 */
export const invalidateProductStockQueries = (queryClient: QueryClient, productId: string) => {
    queryClient.invalidateQueries({ queryKey: ['calculateGlobalStock', productId] });
    queryClient.invalidateQueries({ queryKey: ['product-global-stock', productId] });
    queryClient.invalidateQueries({ queryKey: ['grower-stocks-for-variant'] });
};