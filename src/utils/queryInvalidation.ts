import { QueryClient } from '@tanstack/react-query';
import { STOCK_GET_ALL_PRODUCTS_QUERY_KEY } from '@/components/admin/stock.config';

/**
 * Invalide toutes les requêtes liées aux produits de manière cohérente
 * pour éviter les problèmes de synchronisation entre les différents caches
 */
export const invalidateAllProductQueries = (queryClient: QueryClient) => {
    // Invalider toutes les clés de requête liées aux produits
    queryClient.invalidateQueries({ queryKey: STOCK_GET_ALL_PRODUCTS_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: ['products_with_stock'] });
    queryClient.invalidateQueries({ queryKey: ['products'] });
    queryClient.invalidateQueries({ queryKey: ['calculateGlobalStock'] });
};

/**
 * Invalide les requêtes de stock pour un produit spécifique
 */
export const invalidateProductStockQueries = (queryClient: QueryClient, productId: string) => {
    queryClient.invalidateQueries({ queryKey: ['calculateGlobalStock', productId] });
    queryClient.invalidateQueries({ queryKey: ['product-global-stock', productId] });
    queryClient.invalidateQueries({ queryKey: ['grower-stocks-for-variant'] });
};