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
    quantity?: number | null; // Quantité du variant (ex: 500 pour 500g)
    unitId?: string | null; // ID de l'unité (ex: "g" pour grammes)
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
    allProducts: IProduct[],
): IGrowerProduct[] {
    // Regrouper les lignes grower par produit
    const byProduct = new Map<string, IGrowerProductVariant[]>();
    for (const gv of growerVariants) {
        if (!byProduct.has(gv.productId)) byProduct.set(gv.productId, []);
        byProduct.get(gv.productId)!.push(gv);
    }

    const result: IGrowerProduct[] = [];

    for (const [productId, gvs] of Array.from(byProduct.entries())) {
        const product = allProducts.find((p) => p.id === productId);
        if (!product) continue;

        const variants: IGrowerProductVariantWithPrice[] = product.variants.map((v) => {
            const match = gvs.find((gv: IGrowerProductVariant) => gv.variantId === v.id);
            return {
                productId: product.id,
                productName: product.name,
                productImageUrl: product.imageUrl || '',
                variantId: v.id,
                variantOptionValue: v.optionValue,
                price: match?.price ?? v.price,
                stock: match?.stock ?? 0,
                customPrice: match?.price,
                quantity: v.quantity ?? null,
                unitId: v.unitId ?? null,
            };
        });

        const totalStock = gvs.reduce((acc: number, gv: IGrowerProductVariant) => acc + (gv.stock || 0), 0);

        result.push({
            id: product.id,
            name: product.name,
            imageUrl: product.imageUrl || '',
            variants,
            totalStock,
            baseUnitId: product.baseUnitId,
        });
    }

    return result;
}

// Fonction utilitaire pour calculer le stock total d'un produit
export function calculateProductTotalStock(growerProduct: IGrowerProduct): number {
    return growerProduct.variants.reduce((total, variant) => total + variant.stock, 0);
}
