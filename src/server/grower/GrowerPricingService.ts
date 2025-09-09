import { PrismaClient } from '@prisma/client';
// Removed Decimal import - using number instead

export interface IGrowerPriceInfo {
    growerId: string;
    growerName: string;
    growerAvatar?: string;
    price: number;
    stock: number;
}

export interface IVariantPriceInfo {
    variantId: string;
    variantOptionValue: string;
    variantQuantity?: number | null;
    variantUnitSymbol?: string | null;
    lowestPrice: number | null;
    growerPrices: IGrowerPriceInfo[];
}

export interface IProductPriceInfo {
    productId: string;
    product: {
        id: string;
        name: string;
        variants: {
            id: string;
            optionValue: string;
            quantity?: number | null;
            unit?: {
                symbol: string;
            } | null;
        }[];
    };
    variants: IVariantPriceInfo[];
}

export class GrowerPricingService {
    constructor(private prisma: PrismaClient) {}

    /**
     * Obtient le prix le plus bas pour un variant donné parmi tous les producteurs
     */
    async getLowestPriceForVariant(variantId: string): Promise<number | null> {
        const growerProducts = await this.prisma.growerProduct.findMany({
            where: {
                variantId,
                price: { not: null },
                stock: { gt: 0 }, // Seulement les producteurs avec du stock
            },
            select: {
                price: true,
            },
        });

        if (growerProducts.length === 0) {
            return null;
        }

        const prices = growerProducts
            .map(gp => gp.price ? Number(gp.price) : null)
            .filter((price): price is number => price !== null);

        if (prices.length === 0) {
            return null;
        }

        return prices.reduce((min, current) => 
            current < min ? current : min
        );
    }

    /**
     * Obtient tous les prix des producteurs pour un variant donné
     */
    async getGrowerPricesForVariant(variantId: string): Promise<IGrowerPriceInfo[]> {
        const growerProducts = await this.prisma.growerProduct.findMany({
            where: {
                variantId,
                price: { not: null },
            },
            select: {
                price: true,
                stock: true,
                grower: {
                    select: {
                        id: true,
                        name: true,
                        profilePhoto: true,
                    },
                },
            },
            orderBy: {
                price: 'asc',
            },
        });

        return growerProducts.map(gp => ({
            growerId: gp.grower.id,
            growerName: gp.grower.name,
            growerAvatar: gp.grower.profilePhoto || undefined,
            price: Number(gp.price!),
            stock: gp.stock,
        }));
    }

    /**
     * Obtient les informations de prix pour tous les variants d'un produit
     */
    async getProductPriceInfo(productId: string): Promise<IProductPriceInfo> {
        const product = await this.prisma.product.findUniqueOrThrow({
            where: { id: productId },
            include: {
                variants: {
                    select: {
                        id: true,
                        optionValue: true,
                        quantity: true,
                        unit: {
                            select: {
                                symbol: true,
                            },
                        },
                    },
                },
            },
        });

        const variants: IVariantPriceInfo[] = [];

        for (const variant of product.variants) {
            const growerPrices = await this.getGrowerPricesForVariant(variant.id);
            const lowestPrice = await this.getLowestPriceForVariant(variant.id);

            variants.push({
                variantId: variant.id,
                variantOptionValue: variant.optionValue,
                variantQuantity: variant.quantity,
                variantUnitSymbol: variant.unit?.symbol || null,
                lowestPrice,
                growerPrices,
            });
        }

        return {
            productId,
            product: {
                id: product.id,
                name: product.name,
                variants: product.variants.map(v => ({
                    id: v.id,
                    optionValue: v.optionValue,
                    quantity: v.quantity,
                    unit: v.unit
                }))
            },
            variants,
        };
    }

    /**
     * Met à jour le prix d'un producteur pour un variant
     */
    async updateGrowerPrice(params: {
        growerId: string;
        variantId: string;
        price: number;
    }): Promise<void> {
        await this.prisma.growerProduct.update({
            where: {
                growerId_variantId: {
                    growerId: params.growerId,
                    variantId: params.variantId,
                },
            },
            data: {
                price: params.price,
            },
        });
    }

    /**
     * Obtient les prix les plus bas pour tous les variants d'une liste de produits
     */
    async getLowestPricesForProducts(productIds: string[]): Promise<Map<string, number | null>> {
        const result = new Map<string, number | null>();

        for (const productId of productIds) {
            const product = await this.prisma.product.findUnique({
                where: { id: productId },
                include: {
                    variants: {
                        select: {
                            id: true,
                        },
                    },
                },
            });

            if (!product) {
                result.set(productId, null);
                continue;
            }

            let lowestProductPrice: number | null = null;

            for (const variant of product.variants) {
                const variantLowestPrice = await this.getLowestPriceForVariant(variant.id);
                
                if (variantLowestPrice !== null) {
                    if (lowestProductPrice === null || variantLowestPrice < lowestProductPrice) {
                        lowestProductPrice = variantLowestPrice;
                    }
                }
            }

            result.set(productId, lowestProductPrice);
        }

        return result;
    }
}