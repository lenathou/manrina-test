import { useQuery } from '@tanstack/react-query';
import { backendFetchService } from '@/service/BackendFetchService';

/**
 * Hook optimisé pour récupérer le nombre de producteurs ayant des demandes de validation en attente
 * Utilise la même API que useAdminStockValidation mais compte les producteurs uniques
 */
export const usePendingStockValidationCount = ({ enabled = true }: { enabled?: boolean } = {}) => {
    return useQuery({
        queryKey: ['pendingStockValidationCount'],
        queryFn: () => backendFetchService.getAllPendingStockRequests(),
        select: (data) => {
            // Compter les producteurs uniques ayant des demandes en attente
            const uniqueGrowers = new Set(data.map(request => request.growerId));
            return uniqueGrowers.size;
        },
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
