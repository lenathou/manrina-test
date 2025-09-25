import { useQuery } from '@tanstack/react-query';
import { backendFetchService } from '@/service/BackendFetchService';

export interface UseNewMarketParticipationsResult {
    growersWithNewMarketParticipations: string[];
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useNewMarketParticipations(sessionId: string | null): UseNewMarketParticipationsResult {
    const {
        data: growersWithNewMarketParticipations = [],
        isLoading,
        error,
        refetch
    } = useQuery<string[], Error>({
        queryKey: ['newMarketParticipations', sessionId],
        queryFn: async (): Promise<string[]> => {
            if (!sessionId) {
                return [];
            }
            return await backendFetchService.getGrowersWithNewMarketParticipations(sessionId);
        },
        enabled: !!sessionId,
        staleTime: 30 * 1000, // Les données restent fraîches pendant 30 secondes
        gcTime: 5 * 60 * 1000, // Garde en cache pendant 5 minutes (anciennement cacheTime)
        refetchOnWindowFocus: false, // Ne pas refetch automatiquement au focus
        retry: 2, // Retry 2 fois en cas d'erreur
    });

    return {
        growersWithNewMarketParticipations,
        isLoading,
        error: error ? (error instanceof Error ? error.message : 'Erreur lors de la récupération des nouvelles participations au marché') : null,
        refetch: () => refetch()
    };
}