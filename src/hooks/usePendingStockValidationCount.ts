import { useQuery } from '@tanstack/react-query';
import { backendFetchService } from '@/service/BackendFetchService';

/**
 * Hook optimisé pour récupérer uniquement le nombre de demandes de validation en attente
 * Utilise la même API que useAdminStockValidation mais ne retourne que le count
 */
export const usePendingStockValidationCount = ({ enabled = true }: { enabled?: boolean } = {}) => {
    return useQuery({
        queryKey: ['pendingStockValidationCount'],
        queryFn: () => backendFetchService.getAllPendingStockRequests(),
        select: (data) => data.length,
        refetchInterval: 120000, // 2 minutes
        staleTime: 90000, // 90 secondes
        refetchOnWindowFocus: false,
        enabled,
        networkMode: 'online', // Seulement quand en ligne
        meta: {
            priority: 'low', // Priorité basse pour ne pas interférer
        },
    });
};
