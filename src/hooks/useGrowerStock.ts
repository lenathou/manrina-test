import { IGrowerProductVariant } from '@/server/grower/IGrower';
import { backendFetchService } from '@/service/BackendFetchService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const GROWER_STOCK_QUERY_KEY = 'grower-stock';

export function useGrowerStock(growerId: string | undefined) {
    const queryClient = useQueryClient();

    // Fetch all grower product variants
    const {
        data: growerProducts = [],
        isLoading,
        refetch,
    } = useQuery<IGrowerProductVariant[]>({
        queryKey: [GROWER_STOCK_QUERY_KEY, growerId],
        queryFn: async () => {
            if (!growerId) return [];
            const products = await backendFetchService.listGrowerProducts(growerId);
            // Flatten to IGrowerProductVariant[] if needed
            const flatVariants: IGrowerProductVariant[] = [];
            for (const p of products) {
                if (p.variant) {
                    flatVariants.push({
                        productId: p.product.id,
                        productName: p.product.name,
                        productImageUrl: p.product.imageUrl,
                        variantId: p.variant.id,
                        variantOptionValue: p.variant.optionValue,
                        price: p.variant.price,
                        stock: p.stock,
                    });
                }
            }
            return flatVariants;
        },
        enabled: !!growerId,
    });

    // Add variants
    const addGrowerProduct = useMutation({
        mutationFn: async (payload: { productId: string; variantId: string; stock: number }) => {
            if (!growerId) throw new Error('No growerId');
            return backendFetchService.addGrowerProduct({ growerId, ...payload });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [GROWER_STOCK_QUERY_KEY, growerId] });
        },
    });

    // Remove variant
    const removeGrowerProduct = useMutation({
        mutationFn: async (variantId: string) => {
            if (!growerId) throw new Error('No growerId');
            return backendFetchService.removeGrowerProduct({ growerId, variantId });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [GROWER_STOCK_QUERY_KEY, growerId] });
        },
    });

    // Update stock
    const updateGrowerProductStock = useMutation({
        mutationFn: async ({ variantId, stock }: { variantId: string; stock: number }) => {
            if (!growerId) throw new Error('No growerId');
            return backendFetchService.updateGrowerProductStock({ growerId, variantId, stock });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [GROWER_STOCK_QUERY_KEY, growerId] });
        },
    });

    return {
        growerProducts,
        isLoading,
        refetch,
        addGrowerProduct,
        removeGrowerProduct,
        updateGrowerProductStock,
    };
}
