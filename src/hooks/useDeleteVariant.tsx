import { useMutation, useQueryClient } from '@tanstack/react-query';
import { IProduct } from '../server/product/IProduct';
import { backendFetchService } from '../service/BackendFetchService';
import { STOCK_GET_ALL_PRODUCTS_QUERY_KEY } from '../components/admin/stock.config';

export const useDeleteVariant = () => {
    const queryClient = useQueryClient();
    const deleteVariantMutation = useMutation({
        mutationFn: async (props: {
            variantId: string;
            productId: string;
        }) => {
            await backendFetchService.deleteVariant(props.variantId, props.productId);
            return props;
        },
        onSuccess: (props) => {
            // Fonction utilitaire pour supprimer le variant dans un tableau de produits
            const removeVariantFromProducts = (oldProducts: IProduct[] | undefined) => {
                if (!oldProducts) return oldProducts;
                return oldProducts.map((product) => ({
                    ...product,
                    variants: product.variants.filter((v) => v.id !== props.variantId),
                }));
            };

            // Mettre à jour le cache de la page admin/stock
            queryClient.setQueryData<IProduct[]>(
                STOCK_GET_ALL_PRODUCTS_QUERY_KEY,
                (oldProducts) => removeVariantFromProducts(oldProducts),
            );

            // Mettre à jour le cache des produits
            queryClient.setQueryData<IProduct[]>(['products'], (oldProducts) => removeVariantFromProducts(oldProducts));

            // Invalider les caches pour s'assurer de la cohérence
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: STOCK_GET_ALL_PRODUCTS_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: ['calculateGlobalStock'] });
            queryClient.invalidateQueries({ queryKey: ['stock-products-all'] });
        },
        onError: (error) => {
            console.error('Error deleting variant:', error);
        },
    });

    return {
        deleteVariant: deleteVariantMutation.mutate,
        isDeleting: deleteVariantMutation.isPending,
        error: deleteVariantMutation.error,
    };
};