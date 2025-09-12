import { useQuery } from '@tanstack/react-query';
import { backendFetchService } from '@/service/BackendFetchService';
import { IProduct } from '@/server/product/IProduct';

interface UseProductGlobalStockProps {
    product: IProduct;
}

export function useProductGlobalStock({ product }: UseProductGlobalStockProps) {
    return useQuery({
        queryKey: ['product-global-stock', product.id],
        queryFn: async () => {
            try {
                // Récupérer le stock total du produit directement
                const response = await backendFetchService.getGrowerStocksForProduct(product.id);
                return response.reduce((total, growerStock) => total + (growerStock.stock || 0), 0);
            } catch (error) {
                console.error('Erreur lors de la récupération du stock global du produit:', error);
                return 0;
            }
        },
        staleTime: 30000, // Cache pendant 30 secondes
        refetchOnWindowFocus: false, // Ne pas refetch au focus
        refetchOnMount: false, // Ne pas refetch au mount si les données sont fraîches
    });
}