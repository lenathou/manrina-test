import { useMutation, useQueryClient } from '@tanstack/react-query';
import { IProduct, IProductVariantCreationData } from '../server/product/IProduct';
import { backendFetchService } from '../service/BackendFetchService';
import { STOCK_GET_ALL_PRODUCTS_QUERY_KEY } from '../components/admin/stock.config';

export const useCreateVariant = (data: { errorMessage: string }) => {
    const queryClient = useQueryClient();
    const createVariantMutation = useMutation({
        mutationFn: async (props: { productId: string; variantData: IProductVariantCreationData }) => {
            const newVariant = await backendFetchService.createVariant(props.productId, props.variantData);
            return { ...props, newVariant };
        },
        onSuccess: (props) => {
            // Fonction utilitaire pour ajouter le nouveau variant dans un tableau de produits
            const addVariantToProducts = (oldProducts: IProduct[] | undefined) => {
                if (!oldProducts) return oldProducts;
                return oldProducts.map((product) =>
                    product.id === props.productId
                        ? { ...product, variants: [...product.variants, props.newVariant] }
                        : product,
                );
            };

            // Mettre à jour le cache de la page admin/stock
            queryClient.setQueryData<IProduct[]>(STOCK_GET_ALL_PRODUCTS_QUERY_KEY, addVariantToProducts);

            // Mettre à jour le cache utilisé par AppContext (côté client)
            queryClient.setQueryData<IProduct[]>(['products_with_stock'], addVariantToProducts);

            // Mettre à jour aussi le cache 'products' s'il existe
            queryClient.setQueryData<IProduct[]>(['products'], addVariantToProducts);

            // Invalider les requêtes pour forcer un refresh si nécessaire
            queryClient.invalidateQueries({ queryKey: ['products_with_stock'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            
            // Invalider le cache du calcul du stock global pour le produit affecté
            queryClient.invalidateQueries({ queryKey: ['calculateGlobalStock', props.productId] });
        },
        onError: () => {
            alert(data.errorMessage);
        },
    });
    return createVariantMutation;
};
