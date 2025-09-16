import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MarketSessionWithProducts,
  CreateMarketSessionRequest,
  UpdateMarketSessionRequest,
  SessionFilters,
  DuplicateError
} from '../types/market';

// Clés de requête pour React Query
const MARKET_SESSIONS_QUERY_KEY = 'market-sessions';

// Hook optimisé pour récupérer les sessions de marché avec React Query
export function useMarketSessionsQuery(filters?: SessionFilters) {
  // Créer une clé de requête stable basée sur les filtres
  const queryKey = [MARKET_SESSIONS_QUERY_KEY, filters];

  const {
    data: sessions = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters?.status) params.append('status', filters.status);
      if (filters?.upcoming) params.append('upcoming', 'true');
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await fetch(`/api/market/sessions?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }
      
      const data = await response.json();
      return data.sessions as MarketSessionWithProducts[];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - données considérées comme fraîches
    gcTime: 10 * 60 * 1000, // 10 minutes - durée de conservation en cache
    refetchOnWindowFocus: false, // Éviter les rechargements automatiques au focus
    refetchOnMount: false, // Éviter les rechargements automatiques au montage si on a des données en cache
    retry: (failureCount, error) => {
      // Retry seulement pour les erreurs réseau, pas pour les erreurs 4xx
      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        return failureCount < 2;
      }
      return false;
    }
  });

  return {
    sessions,
    loading,
    error: error?.message || null,
    refetch: () => refetch()
  };
}

// Hook pour les mutations de sessions
export function useMarketSessionMutations() {
  const queryClient = useQueryClient();

  const createSessionMutation = useMutation({
    mutationFn: async (sessionData: CreateMarketSessionRequest) => {
      const response = await fetch('/api/market/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        
        // Gestion spéciale pour les erreurs de duplication (409)
        if (response.status === 409) {
          const duplicateError: DuplicateError = Object.assign(
            new Error(errorData.error || 'Session duplicate détectée'),
            {
              isDuplicate: true,
              details: errorData.details,
              existingSessionId: errorData.existingSessionId
            }
          );
          throw duplicateError;
        }
        
        throw new Error(errorData.error || 'Failed to create session');
      }
      
      return response.json() as Promise<MarketSessionWithProducts>;
    },
    onSuccess: () => {
      // Invalider toutes les requêtes de sessions pour les rafraîchir
      queryClient.invalidateQueries({ queryKey: [MARKET_SESSIONS_QUERY_KEY] });
    }
  });

  const updateSessionMutation = useMutation({
    mutationFn: async (sessionData: UpdateMarketSessionRequest) => {
      const response = await fetch('/api/market/sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        
        // Gestion spéciale pour les erreurs de duplication (409)
        if (response.status === 409) {
          const duplicateError: DuplicateError = Object.assign(
            new Error(errorData.error || 'Session duplicate détectée'),
            {
              isDuplicate: true,
              details: errorData.details,
              existingSessionId: errorData.existingSessionId
            }
          );
          throw duplicateError;
        }
        
        throw new Error(errorData.error || 'Failed to update session');
      }
      
      return response.json() as Promise<MarketSessionWithProducts>;
    },
    onSuccess: () => {
      // Invalider toutes les requêtes de sessions pour les rafraîchir
      queryClient.invalidateQueries({ queryKey: [MARKET_SESSIONS_QUERY_KEY] });
    }
  });

  const deleteSessionMutation = useMutation({
    mutationFn: async ({ sessionId, createNext = false }: { sessionId: string; createNext?: boolean }) => {
      const response = await fetch(`/api/market/sessions?id=${sessionId}&createNext=${createNext}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete session');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalider toutes les requêtes de sessions pour les rafraîchir
      queryClient.invalidateQueries({ queryKey: [MARKET_SESSIONS_QUERY_KEY] });
    }
  });

  return {
    createSession: createSessionMutation.mutateAsync,
    updateSession: updateSessionMutation.mutateAsync,
    deleteSession: (sessionId: string, createNext = false) => 
      deleteSessionMutation.mutateAsync({ sessionId, createNext }),
    isCreating: createSessionMutation.isPending,
    isUpdating: updateSessionMutation.isPending,
    isDeleting: deleteSessionMutation.isPending
  };
}

// Hook combiné pour une compatibilité avec l'ancien hook
export function useMarketSessions(filters?: SessionFilters) {
  const { sessions, loading, error, refetch } = useMarketSessionsQuery(filters);
  const { createSession, updateSession, deleteSession } = useMarketSessionMutations();

  return {
    sessions,
    loading,
    error,
    refetch,
    createSession,
    updateSession,
    deleteSession,
    invalidateCache: () => refetch() // Pour compatibilité
  };
}