import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  MarketSessionWithProducts,
  MarketProduct,
  CreateMarketSessionRequest,
  UpdateMarketSessionRequest,
  CreateMarketProductRequest,
  UpdateMarketProductRequest,
  CopyProductRequest,
  SessionFilters,
  MarketFilters
} from '../types/market';

// Hook pour gérer les sessions de marché
export function useMarketSessions(filters?: SessionFilters) {
  const [sessions, setSessions] = useState<MarketSessionWithProducts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stabiliser les filtres pour éviter les re-renders inutiles
  const stableFilters = useMemo(() => filters, [filters]);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (stableFilters?.status) params.append('status', stableFilters.status);
      if (stableFilters?.upcoming) params.append('upcoming', 'true');
      if (stableFilters?.limit) params.append('limit', stableFilters.limit.toString());

      const response = await fetch(`/api/market/sessions?${params}`);
      if (!response.ok) throw new Error('Failed to fetch sessions');
      
      const data = await response.json();
      setSessions(data as MarketSessionWithProducts[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [stableFilters]);

  const createSession = async (sessionData: CreateMarketSessionRequest) => {
    try {
      const response = await fetch('/api/market/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData)
      });
      
      if (!response.ok) throw new Error('Failed to create session');
      
      const newSession = await response.json();
      setSessions(prev => [newSession as MarketSessionWithProducts, ...prev]);
      return newSession as MarketSessionWithProducts;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create session');
    }
  };

  const updateSession = async (sessionData: UpdateMarketSessionRequest) => {
    try {
      const response = await fetch('/api/market/sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData)
      });
      
      if (!response.ok) throw new Error('Failed to update session');
      
      const updatedSession = await response.json();
      setSessions(prev => prev.map(session => 
        session.id === updatedSession.id ? updatedSession as MarketSessionWithProducts : session
      ));
      return updatedSession as MarketSessionWithProducts;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update session');
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/market/sessions?id=${sessionId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete session');
      
      setSessions(prev => prev.filter(session => session.id !== sessionId));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete session');
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return {
    sessions,
    loading,
    error,
    refetch: fetchSessions,
    createSession,
    updateSession,
    deleteSession
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