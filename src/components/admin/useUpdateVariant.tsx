import { useMutation, useQueryClient } from '@tanstack/react-query';
import { IProduct, IProductVariant, IProductVariantUpdateFields } from '../../server/product/IProduct';
import { backendFetchService } from '../../service/BackendFetchService';
import { STOCK_GET_ALL_PRODUCTS_QUERY_KEY } from './stock.config';

export const useUpdateVariant = <AllowedFields extends keyof IProductVariantUpdateFields>(data: {
    errorMessage: string;
}) => {
    const queryClient = useQueryClient();
    const updateVariantMutation = useMutation({
        mutationFn: async (props: {
            variantId: string;
            dataToUpdate: Pick<IProductVariantUpdateFields, AllowedFields>;
        }) => {
            await backendFetchService.updateVariant(props.variantId, props.dataToUpdate);
            return props;
        },
        onSuccess: (props) => {
            // Fonction utilitaire pour mettre à jour les variants dans un tableau de produits
            const updateProductsVariants = (oldProducts: IProduct[] | undefined) => {
                if (!oldProducts) return oldProducts;
                return oldProducts.map((product) => ({
                    ...product,
                    variants: product.variants.map((v: IProductVariant) =>
                        v.id === props.variantId ? { ...v, ...props.dataToUpdate } : v,
                    ),
                }));
            };

            // Mettre à jour le cache de la page admin/stock
            queryClient.setQueryData<IProduct[]>([STOCK_GET_ALL_PRODUCTS_QUERY_KEY], updateProductsVariants);
            
            // Mettre à jour le cache utilisé par AppContext (côté client)
            queryClient.setQueryData<IProduct[]>(['products_with_stock'], updateProductsVariants);
            
            // Mettre à jour aussi le cache 'products' s'il existe
            queryClient.setQueryData<IProduct[]>(['products'], updateProductsVariants);
            
            // Invalider les requêtes pour forcer un refresh si nécessaire
            queryClient.invalidateQueries({ queryKey: ['products_with_stock'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
        onError: () => {
            alert(data.errorMessage);
        },
    });
    return updateVariantMutation;
};
