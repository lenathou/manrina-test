import { useQuery } from '@tanstack/react-query';
import { backendFetchService } from '@/service/BackendFetchService';
import { IProduct } from '@/server/product/IProduct';

export const useProductQuery = () => {
    return useQuery<IProduct[]>({
        queryKey: ['products'],
        queryFn: () => backendFetchService.getAllProductsWithStock(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false, // Éviter les refetch automatiques
        refetchOnMount: false, // Ne pas refetch si les données sont fraîches (optimisation)
        refetchOnReconnect: true, // Refetch en cas de reconnexion
        retry: 3, // Retry en cas d'échec
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Backoff exponentiel
        networkMode: 'always', // Toujours essayer de charger
        meta: {
            priority: 'high', // Priorité élevée pour les produits
        },
    });
};
