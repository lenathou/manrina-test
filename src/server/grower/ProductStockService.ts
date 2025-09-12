import { PrismaClient } from '@prisma/client';

export interface IGrowerProductStockInfo {
    growerId: string;
    growerName: string;
    growerAvatar?: string;
    stock: number;
    lastUpdated?: Date;
}

export interface IProductStockInfo {
    productId: string;
    productName: string;
    productBaseUnitSymbol?: string | null;
    totalStock: number;
    growerStocks: IGrowerProductStockInfo[];
    variants: {
        variantId: string;
        variantOptionValue: string;
        variantQuantity?: number | null;
        variantUnitSymbol?: string | null;
    }[];
}

export class ProductStockService {
    constructor(private prisma: PrismaClient) {}

    /**
     * Obtient tous les stocks des producteurs pour un produit donné
     */
    async getGrowerStocksForProduct(productId: string): Promise<IGrowerProductStockInfo[]> {
        // Récupérer tous les growerProducts pour ce produit au niveau produit (pas variant)
        const growerProducts = await this.prisma.growerProduct.findMany({
            where: {
                productId,
                variantId: null, // Stock au niveau produit uniquement
            },
            select: {
                stock: true,
                updatedAt: true,
                growerId: true,
                grower: {
                    select: {
                        id: true,
                        name: true,
                        profilePhoto: true,
                    },
                },
            },
        });

        // Convertir directement en IGrowerProductStockInfo (plus besoin de grouper)
        return growerProducts.map((gp) => ({
            growerId: gp.grower.id,
            growerName: gp.grower.name,
            growerAvatar: gp.grower.profilePhoto || undefined,
            stock: Number(gp.stock),
            lastUpdated: gp.updatedAt,
        })).sort((a, b) => b.stock - a.stock);
    }

    /**
     * Obtient le stock total pour un produit
     */
    async getTotalStockForProduct(productId: string): Promise<number> {
        const result = await this.prisma.growerProduct.aggregate({
            where: {
                productId,
                variantId: null, // Stock au niveau produit uniquement
            },
            _sum: {
                stock: true,
            },
        });

        return Number(result._sum.stock || 0);
    }

    /**
     * Obtient les informations de stock pour un produit
     */
    async getProductStockInfo(productId: string): Promise<IProductStockInfo> {
        const product = await this.prisma.product.findUniqueOrThrow({
            where: { id: productId },
            include: {
                baseUnit: {
                    select: {
                        symbol: true,
                    },
                },
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

        const growerStocks = await this.getGrowerStocksForProduct(productId);
        const totalStock = await this.getTotalStockForProduct(productId);

        const variants = product.variants.map((variant) => ({
            variantId: variant.id,
            variantOptionValue: variant.optionValue,
            variantQuantity: variant.quantity,
            variantUnitSymbol: variant.unit?.symbol || null,
        }));

        return {
            productId,
            productName: product.name,
            productBaseUnitSymbol: product.baseUnit?.symbol || null,
            totalStock,
            growerStocks,
            variants,
        };
    }


}
