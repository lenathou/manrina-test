import { useQuery } from '@tanstack/react-query';
import { backendFetchService } from '../service/BackendFetchService';
import { IProductDisplayPrice } from '../server/product/ProductPriceService';

/**
 * Hook pour récupérer les prix d'affichage de tous les produits
 */
export const useAllProductsDisplayPrices = () => {
  return useQuery<IProductDisplayPrice[]>({
    queryKey: ['products', 'displayPrices', 'all'],
    queryFn: async () => {
      const response = await backendFetchService.getProductsDisplayPrices();
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook pour récupérer les prix d'affichage de produits spécifiques
 */
export const useProductsDisplayPrices = (productIds: string[]) => {
  return useQuery<IProductDisplayPrice[]>({
    queryKey: ['products', 'displayPrices', productIds.sort()],
    queryFn: async () => {
      if (productIds.length === 0) return [];
      
      const response = await backendFetchService.getProductsDisplayPrices(productIds);
      return response;
    },
    enabled: productIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook pour récupérer le prix d'affichage d'un produit spécifique depuis le cache
 */
export function useProductDisplayPriceFromCache(productId: string, allDisplayPrices?: IProductDisplayPrice[]) {
  return allDisplayPrices?.find(p => p.productId === productId);
}

/**
 * Hook pour récupérer le prix d'affichage d'un variant spécifique depuis le cache
 */
export function useVariantDisplayPriceFromCache(
  productId: string, 
  variantId: string, 
  allDisplayPrices?: IProductDisplayPrice[]
) {
  const productDisplayPrice = allDisplayPrices?.find(p => p.productId === productId);
  return productDisplayPrice?.variants.find(v => v.variantId === variantId);
}