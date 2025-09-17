import { useQuery } from '@tanstack/react-query';
import { backendFetchService } from '@/service/BackendFetchService';
import { IProductPriceInfo, IVariantPriceInfo, IGrowerPrice } from '@/server/grower/GrowerPricingService';

export interface IGrowerProductVariantPrice {
    variantId: string;
    variantName: string;
    variantOptionValue: string;
    variantQuantity?: number;
    variantUnitSymbol?: string;
    price: number;
    stock: number;
}

export function useGrowerProductPrices(productId: string, growerId: string) {
    return useQuery({
        queryKey: ['grower-product-prices', productId, growerId],
        queryFn: async (): Promise<IGrowerProductVariantPrice[]> => {
            if (!productId || !growerId) return [];
            
            try {
                const productPriceInfo: IProductPriceInfo | null = await backendFetchService.getProductPriceInfo(productId);
                
                if (!productPriceInfo) return [];
                
                const growerVariantPrices: IGrowerProductVariantPrice[] = [];
                
                productPriceInfo.variants.forEach((variant: IVariantPriceInfo) => {
                    const growerPrice = variant.growerPrices.find((gp: IGrowerPrice) => gp.growerId === growerId);
                    
                    if (growerPrice) {
                        growerVariantPrices.push({
                            variantId: variant.variantId,
                            variantName: variant.variantName,
                            variantOptionValue: variant.variantOptionValue,
                            variantQuantity: variant.variantQuantity,
                            variantUnitSymbol: variant.variantUnitSymbol,
                            price: growerPrice.price,
                            stock: growerPrice.stock
                        });
                    }
                });
                
                return growerVariantPrices;
            } catch (error) {
                console.error('Erreur lors de la récupération des prix du producteur:', error);
                return [];
            }
        },
        enabled: !!productId && !!growerId,
        staleTime: 5 * 60 * 1000, // Cache pendant 5 minutes
        refetchOnWindowFocus: false,
    });
}