import { IProduct } from '@/server/product/IProduct';
import { IGrowerProductVariant } from '@/server/grower/IGrower';

// Type pour représenter un produit groupé avec ses variants pour le producteur
export interface IGrowerProduct {
    id: string;
    name: string;
    imageUrl: string;
    variants: IGrowerProductVariantWithPrice[];
    totalStock: number;
    baseUnitId?: string | null;
}

// Extension de IGrowerProductVariant pour inclure la gestion des prix
export interface IGrowerProductVariantWithPrice extends IGrowerProductVariant {
    customPrice?: number; // Prix personnalisé défini par le producteur
}

// Type pour les données de mise à jour des prix
export interface IGrowerVariantPriceUpdate {
    variantId: string;
    price: number;
}

// Type pour les données de mise à jour du stock global
export interface IGrowerProductStockUpdate {
    productId: string;
    totalStock: number;
}

// Fonction utilitaire pour grouper les variants par produit
export function groupVariantsByProduct(
    growerVariants: IGrowerProductVariant[],
    allProducts: IProduct[]
): IGrowerProduct[] {
    const productMap = new Map<string, IGrowerProduct>();
    
    growerVariants.forEach(growerVariant => {
        const product = allProducts.find(p => p.id === growerVariant.productId);
        if (!product) return;
        
        if (!productMap.has(growerVariant.productId)) {
            productMap.set(growerVariant.productId, {
                id: product.id,
                name: product.name,
                imageUrl: product.imageUrl || '',
                variants: [],
                totalStock: 0,
                baseUnitId: product.baseUnitId
            });
        }
        
        const growerProduct = productMap.get(growerVariant.productId)!;
        const variantWithPrice: IGrowerProductVariantWithPrice = {
            ...growerVariant,
            customPrice: growerVariant.price
        };
        growerProduct.variants.push(variantWithPrice);
        growerProduct.totalStock += growerVariant.stock;
    });
    
    return Array.from(productMap.values());
}

// Fonction utilitaire pour calculer le stock total d'un produit
export function calculateProductTotalStock(growerProduct: IGrowerProduct): number {
    return growerProduct.variants.reduce((total, variant) => total + variant.stock, 0);
}