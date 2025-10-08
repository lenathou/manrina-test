import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MarketSessionWithProducts,
  CreateMarketSessionRequest,
  UpdateMarketSessionRequest,
  SessionFilters,
  DuplicateError,
  MarketProduct,
  CreateMarketProductRequest,
  UpdateMarketProductRequest,
  CopyProductRequest,
  MarketFilters,
  PublicExhibitor
} from '../types/market';

// Clés de requête pour React Query
const MARKET_SESSIONS_QUERY_KEY = 'market-sessions';
const MARKET_PRODUCTS_QUERY_KEY = 'market-products';
const MARKET_EXHIBITORS_QUERY_KEY = 'market-exhibitors';

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
      // Request summary payload to reduce load time on index listing
      params.append('summary', 'true');

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

// Hook pour récupérer les produits de marché avec React Query
export function useMarketProductsQuery(filters?: MarketFilters) {
  const queryKey = [MARKET_PRODUCTS_QUERY_KEY, filters];

  const { data: products = [], isLoading: loading, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters?.sessionId) params.append('sessionId', filters.sessionId);
      if (filters?.growerId) params.append('growerId', filters.growerId);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());
      if (filters?.search) params.append('search', filters.search);

      const response = await fetch(`/api/market/products?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json() as Promise<MarketProduct[]>;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    products,
    loading,
    error: error?.message || null,
    refetch
  };
}

// Hook pour les mutations de produits de marché
export function useMarketProductMutations() {
  const queryClient = useQueryClient();

  const createProductMutation = useMutation({
    mutationFn: async (productData: CreateMarketProductRequest) => {
      const response = await fetch('/api/market/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create product');
      }
      
      return response.json() as Promise<MarketProduct>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MARKET_PRODUCTS_QUERY_KEY] });
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: async (productData: UpdateMarketProductRequest) => {
      const response = await fetch('/api/market/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update product');
      }
      
      return response.json() as Promise<MarketProduct>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MARKET_PRODUCTS_QUERY_KEY] });
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const response = await fetch(`/api/market/products?id=${productId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete product');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MARKET_PRODUCTS_QUERY_KEY] });
    }
  });

  return {
    createProduct: createProductMutation.mutateAsync,
    updateProduct: updateProductMutation.mutateAsync,
    deleteProduct: deleteProductMutation.mutateAsync,
    isCreating: createProductMutation.isPending,
    isUpdating: updateProductMutation.isPending,
    isDeleting: deleteProductMutation.isPending
  };
}

// Hook combiné pour les produits de marché
export function useMarketProducts(filters?: MarketFilters) {
  const { products, loading, error, refetch } = useMarketProductsQuery(filters);
  const { createProduct, updateProduct, deleteProduct } = useMarketProductMutations();

  return {
    products,
    loading,
    error,
    refetch,
    createProduct,
    updateProduct,
    deleteProduct
  };
}

// Hook pour la copie de produits
export function useProductCopy() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const copyProduct = async (copyData: CopyProductRequest) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/market/copy-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(copyData)
      });
      
      if (!response.ok) throw new Error('Failed to copy product');
      
      const result = await response.json();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to copy product';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getCopyHistory = async (filters?: {
    productId?: string;
    sourceType?: 'MARKET' | 'DELIVERY';
    targetType?: 'MARKET' | 'DELIVERY';
    limit?: number;
  }) => {
    try {
      const params = new URLSearchParams();
      
      if (filters?.productId) params.append('productId', filters.productId);
      if (filters?.sourceType) params.append('sourceType', filters.sourceType);
      if (filters?.targetType) params.append('targetType', filters.targetType);
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await fetch(`/api/market/copy-products?${params}`);
      if (!response.ok) throw new Error('Failed to fetch copy history');
      
      return await response.json();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to fetch copy history');
    }
  };

  return {
    loading,
    error,
    copyProduct,
    getCopyHistory
  };
}

// Hook pour récupérer les exposants avec React Query
export function useMarketExhibitorsQuery() {
  const { data: exhibitors = [], isLoading: loading, error, refetch } = useQuery({
    queryKey: [MARKET_EXHIBITORS_QUERY_KEY],
    queryFn: async () => {
      const response = await fetch('/api/market/exhibitors');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json() as Promise<PublicExhibitor[]>;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    exhibitors,
    loading,
    error: error?.message || null,
    refetch
  };
}

// Hook combiné pour les exposants
export function useMarketExhibitors() {
  const { exhibitors, loading, error } = useMarketExhibitorsQuery();

  return {
    exhibitors,
    loading,
    error
  };
}
