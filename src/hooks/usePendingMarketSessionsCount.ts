import { useQuery } from '@tanstack/react-query';

interface PendingSessionsResponse {
    totalNewParticipations: number;
    sessions: Array<{
        id: string;
        name: string;
        newParticipationsCount: number;
    }>;
}

/**
 * Hook pour récupérer le nombre de sessions de marché avec de nouvelles participations non consultées
 */
export function usePendingMarketSessionsCount(options?: { enabled?: boolean }) {
    const { data, isLoading, error } = useQuery<PendingSessionsResponse>({
        queryKey: ['pending-market-sessions-count'],
        queryFn: async (): Promise<PendingSessionsResponse> => {
            const response = await fetch('/api/admin/market/pending-sessions-count');
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des sessions en attente');
            }
            return response.json();
        },
        // Rafraîchir toutes les 2 minutes pour réduire la charge
        refetchInterval: 120000, // 2 minutes au lieu de 30 secondes
        // Données considérées comme fraîches pendant 90 secondes
        staleTime: 90000,
        // Désactiver le refetch au focus pour éviter les appels excessifs
        refetchOnWindowFocus: false,
        // Refetch lors de la reconnexion
        refetchOnReconnect: true,
        // Permettre de désactiver la requête conditionnellement
        enabled: options?.enabled !== false,
        networkMode: 'online', // Seulement quand en ligne
        meta: {
            priority: 'low', // Priorité basse pour ne pas interférer
        },
    });

    return {
        pendingCount: data?.totalNewParticipations || 0,
        sessions: data?.sessions || [],
        isLoading,
        error,
        hasPendingRequests: (data?.totalNewParticipations || 0) > 0,
    };
}
