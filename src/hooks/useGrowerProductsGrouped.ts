import { IProduct } from '@/server/product/IProduct';
import { backendFetchService } from '@/service/BackendFetchService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { GROWER_STOCK_QUERY_KEY } from './useGrowerStock';
import { STOCK_GET_ALL_PRODUCTS_QUERY_KEY } from '@/components/admin/stock.config';
import { 
    IGrowerProduct,  
    IGrowerProductStockUpdate,
    groupVariantsByProduct
} from '@/types/grower';

export function useGrowerProductsGrouped(growerId: string | undefined) {
    const queryClient = useQueryClient();
    // Charger les données consolidées (produits producteur + produits + unités)
    const { data: pageData, isLoading: isLoadingPageData, refetch } = useQuery({
        queryKey: ['growerStockPageData', growerId],
        queryFn: async () => {
            if (!growerId) return null as any;
            return await backendFetchService.getGrowerStockPageData(growerId);
        },
        enabled: !!growerId,
    });
    const allProducts: IProduct[] = pageData?.allProducts || [];
    // Construire un tableau de variantes à partir des produits du producteur (stock au niveau produit uniquement)
    const growerVariants = useMemo(() => {
        const result: Array<{ productId: string; productName: string; productImageUrl: string; variantId: string; variantOptionValue: string; price: number; stock: number }>
            = [];
        if (!pageData?.growerProducts) return result;
        for (const gp of pageData.growerProducts) {
            const p = gp.product;
            if (!p || !Array.isArray(p.variants) || p.variants.length === 0) continue;
            const total = Number(gp.stock) || 0;
            p.variants.forEach((v: any, idx: number) => {
                result.push({
                    productId: p.id,
                    productName: p.name,
                    productImageUrl: p.imageUrl || '',
                    variantId: v.id,
                    variantOptionValue: v.optionValue,
                    price: Number(v.price) || 0,
                    stock: idx === 0 ? total : 0,
                });
            });
        }
        return result;
    }, [pageData]);
    
    // Grouper les variants par produit avec mémorisation stable
    const growerProducts: IGrowerProduct[] = useMemo(() => {
        if (!growerVariants.length || !allProducts.length) return [];
        return groupVariantsByProduct(growerVariants as any, allProducts);
    }, [growerVariants, allProducts]);
    
    // Le stock total est déjà calculé dans groupVariantsByProduct

    // Produits disponibles à ajouter (non encore dans la liste du producteur)
    const addableProducts = useMemo(() => {
        return allProducts.filter(
            (product: IProduct) => product.showInStore && !growerProducts.some(gp => gp.id === product.id),
        );
    }, [allProducts, growerProducts]);
    
    // Ajouter un produit
    const addGrowerProduct = useMutation({
        mutationFn: async ({ product, forceReplace = false }: { product: IProduct; forceReplace?: boolean }) => {
            if (!growerId) {
                throw new Error('Invalid data');
            }
            
            // Ajouter le produit avec stock initial 0
            return backendFetchService.addGrowerProduct(
                growerId,
                product.id,
                0,
                forceReplace
            );
        },
        onSuccess: (_, { product }) => {
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
            
            // Supprimer le produit
            return backendFetchService.removeGrowerProduct({
                growerId,
                productId
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [GROWER_STOCK_QUERY_KEY, growerId] });
            queryClient.invalidateQueries({ queryKey: ['calculateGlobalStock'] });
            queryClient.invalidateQueries({ queryKey: ['stock-products-all'] });
            queryClient.invalidateQueries({ queryKey: STOCK_GET_ALL_PRODUCTS_QUERY_KEY });
        },
    });
    
    // Mettre à jour les prix des variants d'un produit
    const updateVariantPrices = useMutation({
        mutationFn: async ({  variantPrices }: { productId: string; variantPrices: Record<string, number> }) => {
            if (!growerId) throw new Error('No growerId');
            
            // Mettre à jour le prix de chaque variant
            const promises = Object.entries(variantPrices).map(([variantId, price]) =>
                backendFetchService.updateGrowerProductPrice({
                    growerId,
                    variantId,
                    price
                })
            );
            
            return Promise.all(promises);
        },
        onSuccess: (_, { productId }) => {
            queryClient.invalidateQueries({ queryKey: [GROWER_STOCK_QUERY_KEY, growerId] });
            queryClient.invalidateQueries({ queryKey: ['calculateGlobalStock', productId] });
        },
    });
    
    // Mettre à jour le stock global d'un produit
    const updateProductStock = useMutation({
        mutationFn: async ({ productId, totalStock }: IGrowerProductStockUpdate) => {
            if (!growerId) throw new Error('No growerId');
            
            const growerProduct = growerProducts.find(gp => gp.id === productId);
            if (!growerProduct) throw new Error('Product not found');
            
            // Mettre à jour le stock du produit directement
            return backendFetchService.updateGrowerProductStock({
                growerId,
                productId: productId,
                stock: totalStock
            });
        },
        onSuccess: (_, { productId }) => {
            // Invalidation optimisée pour éviter les re-renders complets
            queryClient.invalidateQueries({ 
                queryKey: [GROWER_STOCK_QUERY_KEY, growerId],
                refetchType: 'none'
            });
            queryClient.invalidateQueries({ 
                queryKey: ['calculateGlobalStock', productId],
                refetchType: 'none'
            });
            queryClient.invalidateQueries({ 
                queryKey: ['stock-products-all'],
                refetchType: 'none'
            });
        },
    });
    
    // Ajuster le stock global de manière additive
    const adjustGlobalStockAdditive = useMutation({
        mutationFn: async ({ productId, additionalStock, growerId }: { productId: string; additionalStock: number; growerId: string }) => {
            if (!growerId) throw new Error('No growerId');
            
            // Récupérer le produit pour obtenir le stock global actuel
            const product = allProducts.find(p => p.id === productId);
            if (!product) throw new Error('Product not found');
            
            
            return backendFetchService.adjustGlobalStock({
                productId,
                adjustment: additionalStock,
                type: 'add'
            });
        },
        onSuccess: (_, { productId }) => {
            // Invalidation optimisée pour éviter les re-renders complets
            queryClient.invalidateQueries({ 
                queryKey: [GROWER_STOCK_QUERY_KEY, growerId],
                refetchType: 'none'
            });
            queryClient.invalidateQueries({ 
                queryKey: ['calculateGlobalStock', productId],
                refetchType: 'none'
            });
            queryClient.invalidateQueries({ 
                queryKey: ['stock-products-all'],
                refetchType: 'none'
            });
            queryClient.invalidateQueries({ 
                queryKey: ['products'],
                refetchType: 'none'
            });
        },
    });

    return {
        growerProducts,
        addableProducts,
        isLoading: isLoadingPageData,
        refetch,
        addGrowerProduct,
        removeGrowerProduct,
        updateVariantPrices,
        updateProductStock,
        adjustGlobalStockAdditive,
    };
}
