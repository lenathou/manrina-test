import { useQuery } from '@tanstack/react-query';
import { backendFetchService } from '@/service/BackendFetchService';
import { GrowerStockValidationStatus } from '@/server/grower/IGrowerStockValidation';
import { IGrowerStockUpdateWithRelations } from '@/hooks/useGrowerStockValidation';

/**
 * Hook optimisé pour récupérer uniquement le nombre de demandes de validation en attente
 * Utilise la même API que useAdminStockValidation mais ne retourne que le count
 */
export function usePendingStockValidationCount() {
    const {
        data: pendingCount = 0,
        isLoading,
        error,
    } = useQuery<number>({
        queryKey: ['pending-stock-validation-count'],
        queryFn: async (): Promise<number> => {
            try {
                const allPendingUpdates: IGrowerStockUpdateWithRelations[] = 
                    await backendFetchService.getAllPendingStockRequests();
                
                // Compter uniquement les demandes avec le statut PENDING
                const pendingCount = allPendingUpdates.filter(
                    (request) => request.status === GrowerStockValidationStatus.PENDING
                ).length;
                
                return pendingCount;
            } catch (error) {
                console.error('Erreur lors de la récupération du nombre de demandes en attente:', error);
                return 0;
            }
        },
        // Rafraîchir toutes les 30 secondes pour avoir des données à jour
        refetchInterval: 30000,
        // Garder les données en cache pendant 5 minutes
        staleTime: 5 * 60 * 1000,
    });

    return {
        pendingCount,
        isLoading,
        error,
        hasPendingRequests: pendingCount > 0,
    };
}