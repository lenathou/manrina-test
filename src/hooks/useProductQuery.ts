import { useQuery } from '@tanstack/react-query';
import { backendFetchService } from '@/service/BackendFetchService';
import { IProduct } from '@/server/product/IProduct';

export const useProductQuery = () => {
    return useQuery<IProduct[]>({
        queryKey: ['products'],
        queryFn: () => backendFetchService.getAllProductsWithStock(),
        staleTime: 15 * 60 * 1000, // 15 minutes (augmenté de 5 à 15 min)
        gcTime: 30 * 60 * 1000, // 30 minutes (augmenté de 10 à 30 min)
        refetchOnWindowFocus: false, // Éviter les refetch automatiques
        refetchOnMount: false, // Ne pas refetch si les données sont fraîches
        refetchOnReconnect: 'always', // Refetch en cas de reconnexion
        refetchInterval: false, // Pas de refetch automatique par intervalle
        retry: 2, // Réduire les tentatives pour éviter les délais
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Délai plus court
        networkMode: 'online', // Seulement quand en ligne
        meta: {
            priority: 'high',
            description: 'Liste principale des produits avec cache optimisé',
        },
    });
};
