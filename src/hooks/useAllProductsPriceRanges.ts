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
 * Hook pour rÃ©cupÃ©rer les ranges de prix de tous les produits en une seule requÃªte
 * Optimise les performances en Ã©vitant les multiples appels API
 */
export function useAllProductsPriceRanges() {
  return useQuery({
    queryKey: ['all-products-price-ranges'],
    queryFn: async (): Promise<AllProductsPriceRanges> => {
      const data = await backendFetchService.getAllProductsPriceRanges() as Record<string, { min: number; max: number }>;
      
      // Transformer les donnÃ©es en format optimisÃ© pour le cache
      const ranges: AllProductsPriceRanges = {};
      Object.entries(data).forEach(([productId, priceInfo]) => {
        ranges[productId] = {
          productId,
          minPrice: priceInfo.min,
          maxPrice: priceInfo.max,
          hasVariants: true // AssumÃ© vrai pour l'instant
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
 * Hook pour rÃ©cupÃ©rer les prix d'un produit spÃ©cifique depuis le cache global
 * Utilise les donnÃ©es dÃ©jÃ  chargÃ©es pour Ã©viter des appels API supplÃ©mentaires
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
    // Indique si les donnÃ©es sont disponibles dans le cache
    isFromCache: !!allPrices && !!productPriceRange,
  };
}

/**
 * Hook de fallback pour les dÃ©tails complets par variant (si nÃ©cessaire)
 * Ã€ utiliser uniquement quand les dÃ©tails par variant sont requis
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

// Nouveau: ranges min/max par variante (clÃ©: variantId)
export type AllVariantsPriceRanges = Record<string, { min: number; max: number }>;

export function useAllVariantsPriceRanges() {
  return useQuery({
    queryKey: ['all-variants-price-ranges'],
    queryFn: async (): Promise<AllVariantsPriceRanges> => {
      const data = await backendFetchService.getAllVariantsPriceRanges();
      return data as AllVariantsPriceRanges;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

