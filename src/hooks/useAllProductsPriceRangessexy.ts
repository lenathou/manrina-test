import { useQuery } from '@tanstack/react-query';
import { backendFetchService } from '@/service/BackendFetchService';
import { IProductPriceInfo } from '@/server/grower/GrowerPricingService';

// Type pour les ranges de prix de tous les produits
export interface ProductPriceRange {
  productId: string;
  minPrice: number;
  maxPrice: number;
  hasVariants: boolean;
}

export type AllProductsPriceRanges = Record<string, ProductPriceRange>;

/**
 * Hook pour récupérer les ranges de prix de tous les produits en une seule requête
 * Optimise les performances en évitant les multiples appels API
 */
export function useAllProductsPriceRanges() {
  return useQuery({
    queryKey: ['all-products-price-ranges'],
    queryFn: async (): Promise<AllProductsPriceRanges> => {
      const data = await backendFetchService.getAllProductsPriceRanges();
      
      // Transformer les données en format optimisé pour le cache
      const ranges: AllProductsPriceRanges = {};
      Object.entries(data).forEach(([productId, priceInfo]) => {
        ranges[productId] = {
          productId,
          minPrice: priceInfo.min,
          maxPrice: priceInfo.max,
          hasVariants: true // Assumé vrai pour l'instant
        };
      });
      
      return ranges;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook pour récupérer les prix d'un produit spécifique depuis le cache global
 * Utilise les données déjà chargées pour éviter des appels API supplémentaires
 */
export function useProductPriceRangesFromCache(productId: string) {
  const { data: allPrices, isLoading, error } = useAllProductsPriceRanges();
  
  const productPriceRange = allPrices?.[productId];
  
  return {
    data: productPriceRange ? {
      minPrice: productPriceRange.minPrice,
      maxPrice: productPriceRange.maxPrice,
      hasVariants: productPriceRange.hasVariants,
    } : null,
    isLoading,
    error,
    // Indique si les données sont disponibles dans le cache
    isFromCache: !!allPrices && !!productPriceRange,
  };
}

/**
 * Hook de fallback pour les détails complets par variant (si nécessaire)
 * À utiliser uniquement quand les détails par variant sont requis
 */
export function useDetailedProductPriceRanges(productId: string, enabled = false) {
  return useQuery({
    queryKey: ['product-grower-prices-detailed', productId],
    queryFn: async (): Promise<IProductPriceInfo | null> => {
      const priceInfo = await backendFetchService.getProductPriceInfo(productId);
      return priceInfo;
    },
    enabled: enabled && !!productId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}