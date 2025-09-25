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
export function usePendingMarketSessionsCount() {
  const {
    data,
    isLoading,
    error,
  } = useQuery<PendingSessionsResponse>({
    queryKey: ['pending-market-sessions-count'],
    queryFn: async (): Promise<PendingSessionsResponse> => {
      const response = await fetch('/api/admin/market/pending-sessions-count');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des sessions en attente');
      }
      return response.json();
    },
    refetchInterval: 30000, // Actualiser toutes les 30 secondes comme pour les stocks
    staleTime: 25000, // Considérer les données comme obsolètes après 25 secondes
  });

  return {
    pendingCount: data?.totalNewParticipations || 0,
    sessions: data?.sessions || [],
    isLoading,
    error,
    hasPendingRequests: (data?.totalNewParticipations || 0) > 0,
  };
}