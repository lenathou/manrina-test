import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { backendFetchService } from '@/service/BackendFetchService';
import { useMemo } from 'react';
import { IProduct, IUnit } from '@/server/product/IProduct';
import { IGrowerProduct, groupVariantsByProduct } from '@/types/grower';
import { IGrowerProductVariant } from '@/server/grower/IGrower';
import { IGrowerProductWithRelations } from '@/server/grower/IGrowerRepository';
import { IGrowerStockUpdateWithRelations } from './useGrowerStockValidation';
import { GROWER_STOCK_QUERY_KEY } from './useGrowerStock';
import { STOCK_GET_ALL_PRODUCTS_QUERY_KEY } from '@/components/admin/stock.config';

export const GROWER_STOCK_PAGE_DATA_QUERY_KEY = 'growerStockPageData';

export interface IGrowerStockPageData {
    growerProducts: IGrowerProductWithRelations[];
    allProducts: IProduct[];
    units: IUnit[];
    pendingStockRequests: IGrowerStockUpdateWithRelations[];
}

export function useGrowerStockPageData(growerId: string | undefined) {
    const queryClient = useQueryClient();

    // Charger toutes les données de la page en une seule requête
    const {
        data,
        isLoading,
        refetch,
    } = useQuery({
        queryKey: [GROWER_STOCK_PAGE_DATA_QUERY_KEY, growerId],
        queryFn: async (): Promise<IGrowerStockPageData> => {
            if (!growerId) {
                return {
                    growerProducts: [],
                    allProducts: [],
                    units: [],
                    pendingStockRequests: [],
                };
            }
            return await backendFetchService.getGrowerStockPageData(growerId);
        },
        enabled: !!growerId,
    });

    // Transformer les produits en format groupé
    const growerProducts: IGrowerProduct[] = useMemo(() => {
        if (!data?.growerProducts?.length || !data?.allProducts?.length) {
            return [];
        }
        
        // Transformer IGrowerProductWithRelations[] en IGrowerProductVariant[]
        const growerVariants: IGrowerProductVariant[] = data.growerProducts
            .filter(gp => gp.variant) // Filtrer ceux qui ont un variant
            .map(gp => ({
                productId: gp.productId,
                productName: gp.product.name,
                productImageUrl: gp.product.imageUrl,
                variantId: gp.variant!.id,
                variantOptionValue: gp.variant!.optionValue,
                price: gp.variant!.price,
                stock: gp.stock,
            }));
        
        return groupVariantsByProduct(growerVariants, data.allProducts);
    }, [data?.growerProducts, data?.allProducts]);

    // Produits disponibles à ajouter (non encore dans la liste du producteur)
    const addableProducts = useMemo(() => {
        if (!data?.allProducts) return [];
        return data.allProducts.filter(
            (product: IProduct) => 
                product.showInStore && 
                !growerProducts.some(gp => gp.id === product.id)
        );
    }, [data?.allProducts, growerProducts]);

    // Ajouter un produit
    const addGrowerProduct = useMutation({
        mutationFn: async ({ product, forceReplace = false }: { product: IProduct; forceReplace?: boolean }) => {
            if (!growerId) {
                throw new Error('Invalid data');
            }
            
            return backendFetchService.addGrowerProduct(
                growerId,
                product.id,
                0,
                forceReplace
            );
        },
        onSuccess: (_, { product }) => {
            queryClient.invalidateQueries({ queryKey: [GROWER_STOCK_PAGE_DATA_QUERY_KEY, growerId] });
            queryClient.invalidateQueries({ queryKey: [GROWER_STOCK_QUERY_KEY, growerId] });
            queryClient.invalidateQueries({ queryKey: ['calculateGlobalStock', product.id] });
            queryClient.invalidateQueries({ queryKey: ['stock-products-all'] });
            queryClient.invalidateQueries({ queryKey: STOCK_GET_ALL_PRODUCTS_QUERY_KEY });
        },
    });
    
    // Supprimer un produit
    const removeGrowerProduct = useMutation({
        mutationFn: async (productId: string) => {
            if (!growerId) throw new Error('No growerId');
            
            return backendFetchService.removeGrowerProduct({
                growerId,
                productId
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [GROWER_STOCK_PAGE_DATA_QUERY_KEY, growerId] });
            queryClient.invalidateQueries({ queryKey: [GROWER_STOCK_QUERY_KEY, growerId] });
            queryClient.invalidateQueries({ queryKey: ['calculateGlobalStock'] });
            queryClient.invalidateQueries({ queryKey: ['stock-products-all'] });
            queryClient.invalidateQueries({ queryKey: STOCK_GET_ALL_PRODUCTS_QUERY_KEY });
        },
    });
    
    // Mettre à jour les prix des variants d'un produit (version optimisée)
    const updateVariantPrices = useMutation({
        mutationFn: async ({ variantPrices }: { productId: string; variantPrices: Record<string, number> }) => {
            if (!growerId) throw new Error('No growerId');
            
            // Convertir l'objet en tableau pour l'API batch
            const variantPricesArray = Object.entries(variantPrices).map(([variantId, price]) => ({
                variantId,
                price
            }));
            
            return backendFetchService.updateMultipleVariantPrices({
                growerId,
                variantPrices: variantPricesArray
            });
        },
        onSuccess: (_, { productId }) => {
            queryClient.invalidateQueries({ queryKey: [GROWER_STOCK_PAGE_DATA_QUERY_KEY, growerId] });
            queryClient.invalidateQueries({ queryKey: [GROWER_STOCK_QUERY_KEY, growerId] });
            queryClient.invalidateQueries({ queryKey: ['calculateGlobalStock', productId] });
        },
    });

    return {
        // Données
        growerProducts,
        allProducts: data?.allProducts || [],
        units: data?.units || [],
        pendingStockRequests: data?.pendingStockRequests || [],
        addableProducts,
        
        // États de chargement
        isLoading,
        isLoadingProducts: isLoading,
        isLoadingGrowerProducts: isLoading,
        isLoadingUnits: isLoading,
        
        // Mutations
        addGrowerProduct,
        removeGrowerProduct,
        updateVariantPrices,
        
        // Utilitaires
        refetch,
    };
}