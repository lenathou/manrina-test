import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export interface IGrowerPriceInfo {
    growerId: string;
    growerName: string;
    growerAvatar?: string;
    price: Decimal;
    stock: number;
}

export interface IVariantPriceInfo {
    variantId: string;
<<<<<<< HEAD
    variantOptionValue: string;
    variantQuantity?: number | null;
    variantUnitSymbol?: string | null;
    price: Decimal | null;
=======
    lowestPrice: Decimal | null;
>>>>>>> origin/staging
    growerPrices: IGrowerPriceInfo[];
}

export interface IProductPriceInfo {
    productId: string;
    variants: IVariantPriceInfo[];
}

export class GrowerPricingService {
    constructor(private prisma: PrismaClient) {}

    /**
     * Obtient le prix le plus bas pour un variant donné parmi tous les producteurs
     */
    async getLowestPriceForVariant(variantId: string): Promise<Decimal | null> {
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
            .map(gp => gp.price)
            .filter((price): price is Decimal => price !== null);

        if (prices.length === 0) {
            return null;
        }

        return prices.reduce((min, current) => 
            current.lessThan(min) ? current : min
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
            price: gp.price!,
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
<<<<<<< HEAD
                        optionValue: true,
                        quantity: true,
                        unit: {
                            select: {
                                symbol: true,
                            },
                        },
=======
>>>>>>> origin/staging
                    },
                },
            },
        });

        const variants: IVariantPriceInfo[] = [];

        for (const variant of product.variants) {
            const growerPrices = await this.getGrowerPricesForVariant(variant.id);
<<<<<<< HEAD
            const price = await this.getLowestPriceForVariant(variant.id);

            variants.push({
                variantId: variant.id,
                variantOptionValue: variant.optionValue,
                variantQuantity: variant.quantity,
                variantUnitSymbol: variant.unit?.symbol || null,
                price,
=======
            const lowestPrice = await this.getLowestPriceForVariant(variant.id);

            variants.push({
                variantId: variant.id,
                lowestPrice,
>>>>>>> origin/staging
                growerPrices,
            });
        }

        return {
            productId,
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
    async getLowestPricesForProducts(productIds: string[]): Promise<Map<string, Decimal | null>> {
        const result = new Map<string, Decimal | null>();

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

            let lowestProductPrice: Decimal | null = null;

            for (const variant of product.variants) {
                const variantLowestPrice = await this.getLowestPriceForVariant(variant.id);
                
                if (variantLowestPrice !== null) {
                    if (lowestProductPrice === null || variantLowestPrice.lessThan(lowestProductPrice)) {
                        lowestProductPrice = variantLowestPrice;
                    }
                }
            }

            result.set(productId, lowestProductPrice);
        }

        return result;
    }
}