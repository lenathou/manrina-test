import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  MarketSessionWithProducts,
  MarketProduct,
  CreateMarketSessionRequest,
  UpdateMarketSessionRequest,
  CreateMarketProductRequest,
  UpdateMarketProductRequest,
  CopyProductRequest,
  SessionFilters,
  MarketFilters,
  DuplicateError
} from '../types/market';

// Cache global pour éviter les appels répétitifs
const sessionCache = new Map<string, { data: MarketSessionWithProducts[]; timestamp: number; isStale?: boolean }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes (augmenté de 30s)
const STALE_TIME = 2 * 60 * 1000; // 2 minutes - après ce délai, les données sont considérées comme obsolètes mais utilisables

// Gestionnaire d'événements pour les mises à jour en temps réel
type CacheUpdateListener = () => void;
const cacheUpdateListeners = new Set<CacheUpdateListener>();

// Fonction pour notifier tous les listeners d'une mise à jour
const notifyCacheUpdate = () => {
  cacheUpdateListeners.forEach(listener => listener());
};

// Fonction pour invalider tout le cache
const invalidateAllCache = () => {
  sessionCache.clear();
  notifyCacheUpdate();
};

// Fonction pour marquer les données comme obsolètes mais utilisables
const markCacheAsStale = (cacheKey: string) => {
  const cached = sessionCache.get(cacheKey);
  if (cached) {
    sessionCache.set(cacheKey, { ...cached, isStale: true });
  }
};

// Hook pour gérer les sessions de marché
export function useMarketSessions(filters?: SessionFilters) {
  const [sessions, setSessions] = useState<MarketSessionWithProducts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Stabiliser les filtres pour éviter les re-renders inutiles
  const stableFilters = useMemo(() => {
    if (!filters) return null;
    return {
      status: filters.status,
      upcoming: filters.upcoming,
      limit: filters.limit
    };
  }, [filters?.status, filters?.upcoming, filters?.limit]); // eslint-disable-line react-hooks/exhaustive-deps

  // Créer une clé de cache basée sur les filtres
  const cacheKey = useMemo(() => {
    if (!stableFilters) return 'no-filters';
    return JSON.stringify(stableFilters);
  }, [stableFilters]);

  const fetchSessions = useCallback(async (forceRefresh = false) => {
    const cached = sessionCache.get(cacheKey);
    const now = Date.now();
    
    // Stratégie stale-while-revalidate
    if (cached && !forceRefresh) {
      const isExpired = now - cached.timestamp > CACHE_DURATION;
      const isStale = now - cached.timestamp > STALE_TIME;
      
      if (!isExpired) {
        // Cache valide, utiliser directement
        setSessions(cached.data);
        setLoading(false);
        return;
      } else if (isStale && !cached.isStale) {
        // Données obsolètes mais utilisables, afficher en arrière-plan et recharger
        setSessions(cached.data);
        setLoading(false);
        markCacheAsStale(cacheKey);
        // Continuer pour recharger en arrière-plan
      }
    }

    // Annuler la requête précédente si elle existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      // Ne montrer le loading que si on n'a pas de données en cache
      if (!cached || forceRefresh) {
        setLoading(true);
      }
      setError(null);
      
      const params = new URLSearchParams();
      
      if (stableFilters?.status) params.append('status', stableFilters.status);
      if (stableFilters?.upcoming) params.append('upcoming', 'true');
      if (stableFilters?.limit) params.append('limit', stableFilters.limit.toString());

      const response = await fetch(`/api/market/sessions?${params}`, {
        signal: abortControllerRef.current.signal
      });
      
      if (!response.ok) throw new Error('Failed to fetch sessions');
      
      const data = await response.json();
      const sessionsData = data.sessions as MarketSessionWithProducts[];
      
      // Mettre en cache les résultats frais
      sessionCache.set(cacheKey, {
        data: sessionsData,
        timestamp: Date.now(),
        isStale: false
      });
      
      setSessions(sessionsData);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Requête annulée, ne pas traiter comme une erreur
      }
      
      // Si on a des données en cache et qu'il y a une erreur, garder les données en cache
      if (cached && !forceRefresh) {
        console.warn('Failed to refresh sessions, using cached data:', err);
        return;
      }
      
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [stableFilters, cacheKey]);

  const createSession = useCallback(async (sessionData: CreateMarketSessionRequest) => {
    try {
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
      
      const newSession = await response.json();
      
      // Invalider tout le cache et notifier tous les listeners
      invalidateAllCache();
      
      return newSession as MarketSessionWithProducts;
    } catch (err) {
      // Préserver les erreurs de duplication avec leurs propriétés spéciales
      if (err instanceof Error && 'isDuplicate' in err) {
        throw err;
      }
      throw new Error(err instanceof Error ? err.message : 'Failed to create session');
    }
  }, []);

  const updateSession = useCallback(async (sessionData: UpdateMarketSessionRequest) => {
    try {
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
      
      const updatedSession = await response.json();
      
      // Invalider tout le cache et notifier tous les listeners
      invalidateAllCache();
      
      return updatedSession as MarketSessionWithProducts;
    } catch (err) {
      // Préserver les erreurs de duplication avec leurs propriétés spéciales
      if (err instanceof Error && 'isDuplicate' in err) {
        throw err;
      }
      throw new Error(err instanceof Error ? err.message : 'Failed to update session');
    }
  }, []);

  const deleteSession = useCallback(async (sessionId: string, createNext: boolean = false) => {
    try {
      const response = await fetch(`/api/market/sessions?id=${sessionId}&createNext=${createNext}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete session');
      }
      
      const result = await response.json();
      
      // Invalider tout le cache et notifier tous les listeners
      invalidateAllCache();
      
      return result;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete session');
    }
  }, []);

  useEffect(() => {
    fetchSessions();
    
    // Ajouter un listener pour les mises à jour du cache
    const handleCacheUpdate = () => {
      fetchSessions();
    };
    
    cacheUpdateListeners.add(handleCacheUpdate);
    
    // Nettoyage lors du démontage
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      cacheUpdateListeners.delete(handleCacheUpdate);
    };
  }, [fetchSessions]);

  // Fonction pour invalider le cache
  const invalidateCache = useCallback(() => {
    sessionCache.delete(cacheKey);
    fetchSessions();
  }, [cacheKey, fetchSessions]);

  return {
    sessions,
    loading,
    error,
    refetch: (forceRefresh = false) => fetchSessions(forceRefresh),
    createSession,
    updateSession,
    deleteSession,
    invalidateCache
  };
}

// Hook pour gérer les produits du marché
export function useMarketProducts(filters?: MarketFilters) {
  const [products, setProducts] = useState<MarketProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stabiliser les filtres pour éviter les re-renders inutiles
  const stableFilters = useMemo(() => filters, [filters]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (stableFilters?.sessionId) params.append('sessionId', stableFilters.sessionId);
      if (stableFilters?.growerId) params.append('growerId', stableFilters.growerId);
      if (stableFilters?.category) params.append('category', stableFilters.category);
      if (stableFilters?.isActive !== undefined) params.append('isActive', stableFilters.isActive.toString());
      if (stableFilters?.search) params.append('search', stableFilters.search);

      const response = await fetch(`/api/market/products?${params}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [stableFilters]);

  const createProduct = async (productData: CreateMarketProductRequest) => {
    try {
      const response = await fetch('/api/market/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      
      if (!response.ok) throw new Error('Failed to create product');
      
      const newProduct = await response.json();
      setProducts(prev => [newProduct, ...prev]);
      return newProduct;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create product');
    }
  };

  const updateProduct = async (productData: UpdateMarketProductRequest) => {
    try {
      const response = await fetch('/api/market/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      
      if (!response.ok) throw new Error('Failed to update product');
      
      const updatedProduct = await response.json();
      setProducts(prev => prev.map(product => 
        product.id === updatedProduct.id ? updatedProduct : product
      ));
      return updatedProduct;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update product');
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      const response = await fetch(`/api/market/products?id=${productId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete product');
      
      setProducts(prev => prev.filter(product => product.id !== productId));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete product');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct
  };
}

// Hook pour gérer la copie de produits
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