import { PrismaClient, Prisma } from '@prisma/client';

// Types pour les données Prisma avec inclusions
type VariantWithGrowerData = Prisma.ProductVariantGetPayload<{
    include: {
        unit: true;
        growers: {
            include: {
                grower: true;
            };
        };
    };
}>;

type GrowerProductWithGrower = Prisma.GrowerProductGetPayload<{
    include: {
        grower: true;
    };
}>;

export interface IProductPriceInfo {
    productId: string;
    product: {
        id: string;
        name: string;
    };
    variants: IVariantPriceInfo[];
}

export interface IVariantPriceInfo {
    variantId: string;
    variantName: string;
    variantOptionValue: string;
    variantQuantity?: number;
    variantUnitSymbol?: string;
    lowestPrice: number;
    growerPrices: IGrowerPrice[];
}

export interface IGrowerPrice {
    growerId: string;
    growerName: string;
    growerAvatar?: string;
    price: number;
    stock: number;
}

export class GrowerPricingService {
    constructor(private prisma: PrismaClient) {}

    async getLowestPriceForVariant(variantId: string): Promise<number | null> {
        const growerProducts = await this.prisma.growerProduct.findMany({
            where: {
                variantId: variantId,
                price: { not: null }
            },
            orderBy: {
                price: 'asc'
            },
            take: 1
        });

        return growerProducts.length > 0 ? growerProducts[0].price?.toNumber() || null : null;
    }

    async getProductPriceInfo(productId: string): Promise<IProductPriceInfo | null> {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
            include: {
                variants: {
                    include: {
                        unit: true,
                        growers: {
                            include: {
                                grower: true
                            },
                            where: {
                                price: { not: null }
                            }
                        }
                    }
                }
            }
        });

        if (!product) return null;

        const variants: IVariantPriceInfo[] = product.variants.map((variant: VariantWithGrowerData) => {
            const growerPrices: IGrowerPrice[] = variant.growers.map((gp: GrowerProductWithGrower) => ({
                growerId: gp.growerId,
                growerName: gp.grower.name,
                growerAvatar: gp.grower.profilePhoto || undefined,
                price: gp.price?.toNumber() || 0,
                stock: gp.stock?.toNumber() || 0
            }));

            const lowestPrice = growerPrices.length > 0 
                ? Math.min(...growerPrices.map(gp => gp.price))
                : 0;

            return {
                variantId: variant.id,
                variantName: variant.description || variant.optionValue,
                variantOptionValue: variant.optionValue,
                variantQuantity: variant.quantity || undefined,
                variantUnitSymbol: variant.unit?.symbol || undefined,
                lowestPrice,
                growerPrices
            };
        });

        return {
            productId,
            product: {
                id: product.id,
                name: product.name
            },
            variants
        };
    }

    async getGrowerPricesForVariant(variantId: string): Promise<IGrowerPrice[]> {
        const growerProducts = await this.prisma.growerProduct.findMany({
            where: {
                variantId: variantId,
                price: { not: null }
            },
            include: {
                grower: true
            }
        });

        return growerProducts.map(gp => ({
            growerId: gp.growerId,
            growerName: gp.grower.name,
            growerAvatar: gp.grower.profilePhoto || undefined,
            price: gp.price?.toNumber() || 0,
            stock: gp.stock?.toNumber() || 0
        }));
    }

    async getAllProductsPriceRanges(): Promise<Record<string, { min: number; max: number }>> {
        const products = await this.prisma.product.findMany({
            include: {
                variants: {
                    include: {
                        growers: {
                            where: {
                                price: { not: null }
                            }
                        }
                    }
                }
            }
        });

        const priceRanges: Record<string, { min: number; max: number }> = {};

        products.forEach(product => {
            const allPrices: number[] = [];
            
            product.variants.forEach(variant => {
                variant.growers.forEach(gp => {
                    if (gp.price) {
                        allPrices.push(gp.price.toNumber());
                    }
                });
            });

            if (allPrices.length > 0) {
                priceRanges[product.id] = {
                    min: Math.min(...allPrices),
                    max: Math.max(...allPrices)
                };
            }
        });

        return priceRanges;
    }

    async updateGrowerPrice(params: {
        growerId: string;
        variantId: string;
        price: number;
    }): Promise<void> {
        const { growerId, variantId, price } = params;

        // Récupérer le productId à partir du variant
        const variant = await this.prisma.productVariant.findUnique({
            where: { id: variantId },
            select: { productId: true }
        });

        if (!variant) {
            throw new Error(`Variant with id ${variantId} not found`);
        }

        await this.prisma.growerProduct.upsert({
            where: {
                growerId_productId: {
                    growerId,
                    productId: variant.productId
                }
            },
            update: {
                price
            },
            create: {
                growerId,
                variantId,
                productId: variant.productId,
                price,
                stock: 0
            }
        });
    }
}