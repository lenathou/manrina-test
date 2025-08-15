import { IProduct } from '@/server/product/IProduct';
import { backendFetchService } from '@/service/BackendFetchService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useGrowerStock } from './useGrowerStock';
import { useProductQuery } from './useProductQuery';
import { 
    IGrowerProduct,  
    IGrowerProductStockUpdate,
    groupVariantsByProduct
} from '@/types/grower';

export function useGrowerProductsGrouped(growerId: string | undefined) {
    const queryClient = useQueryClient();
    const { growerProducts: growerVariants, isLoading: isLoadingVariants, refetch } = useGrowerStock(growerId);
    const { data: allProducts = [], isLoading: isLoadingProducts } = useProductQuery();
    
    // Grouper les variants par produit avec mémorisation
    const growerProducts: IGrowerProduct[] = useMemo(() => {
        return groupVariantsByProduct(growerVariants, allProducts);
    }, [growerVariants, allProducts]);
    
    // Le stock total est déjà calculé dans groupVariantsByProduct
    
    // Produits disponibles à ajouter (non encore dans la liste du producteur)
    const addableProducts = useMemo(() => {
        return allProducts.filter(
            (product: IProduct) => 
                product.showInStore && 
                !growerProducts.some(gp => gp.id === product.id)
        );
    }, [allProducts, growerProducts]);
    
    // Ajouter un produit complet (tous ses variants)
    const addGrowerProduct = useMutation({
        mutationFn: async (product: IProduct) => {
            if (!growerId || !product.variants || product.variants.length === 0) {
                throw new Error('Invalid data');
            }
            
            // Ajouter tous les variants du produit
            const promises = product.variants.map(variant =>
                backendFetchService.addGrowerProduct({
                    growerId,
                    productId: product.id,
                    variantId: variant.id,
                    stock: 0
                })
            );
            
            return Promise.all(promises);
        },
        onSuccess: (_, product) => {
            queryClient.invalidateQueries({ queryKey: ['grower-stock', growerId] });
            queryClient.invalidateQueries({ queryKey: ['calculateGlobalStock', product.id] });
            queryClient.invalidateQueries({ queryKey: ['stock-products-all'] });
        },
    });
    
    // Supprimer un produit complet (tous ses variants)
    const removeGrowerProduct = useMutation({
        mutationFn: async (productId: string) => {
            if (!growerId) throw new Error('No growerId');
            
            const growerProduct = growerProducts.find(gp => gp.id === productId);
            if (!growerProduct) throw new Error('Product not found');
            
            // Supprimer tous les variants du produit
            const promises = growerProduct.variants.map(variant =>
                backendFetchService.removeGrowerProduct({
                    growerId,
                    variantId: variant.variantId
                })
            );
            
            return Promise.all(promises);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['grower-stock', growerId] });
            queryClient.invalidateQueries({ queryKey: ['calculateGlobalStock'] });
            queryClient.invalidateQueries({ queryKey: ['stock-products-all'] });
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
            queryClient.invalidateQueries({ queryKey: ['grower-stock', growerId] });
            queryClient.invalidateQueries({ queryKey: ['calculateGlobalStock', productId] });
        },
    });
    
    // Mettre à jour le stock global d'un produit
    const updateProductStock = useMutation({
        mutationFn: async ({ productId, totalStock }: IGrowerProductStockUpdate) => {
            if (!growerId) throw new Error('No growerId');
            
            const growerProduct = growerProducts.find(gp => gp.id === productId);
            if (!growerProduct) throw new Error('Product not found');
            
            // D'abord, remettre tous les variants à 0
            await Promise.all(
                growerProduct.variants.map(variant =>
                    backendFetchService.updateGrowerProductStock({
                        growerId,
                        variantId: variant.variantId,
                        stock: 0
                    })
                )
            );
            
            // Ensuite, mettre tout le stock sur le premier variant
            const firstVariant = growerProduct.variants[0];
            if (firstVariant && totalStock > 0) {
                return backendFetchService.updateGrowerProductStock({
                    growerId,
                    variantId: firstVariant.variantId,
                    stock: totalStock
                });
            }
            
            return Promise.resolve();
        },
        onSuccess: (_, { productId }) => {
            // Invalidation optimisée pour éviter les re-renders complets
            queryClient.invalidateQueries({ 
                queryKey: ['grower-stock', growerId],
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
            
            const newGlobalStock = (product.globalStock || 0) + additionalStock;
            
            return backendFetchService.adjustGlobalStock({
                productId,
                newGlobalStock,
                reason: `Ajout de stock par le producteur (${growerId}): +${additionalStock}`,
                adjustedBy: growerId
            });
        },
        onSuccess: (_, { productId }) => {
            // Invalidation optimisée pour éviter les re-renders complets
            queryClient.invalidateQueries({ 
                queryKey: ['grower-stock', growerId],
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
        isLoading: isLoadingVariants || isLoadingProducts,
        refetch,
        addGrowerProduct,
        removeGrowerProduct,
        updateVariantPrices,
        updateProductStock,
        adjustGlobalStockAdditive,
    };
}