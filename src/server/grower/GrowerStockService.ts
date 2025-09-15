import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export interface IGrowerStockInfo {
    growerId: string;
    growerName: string;
    growerAvatar?: string;
    stock: number;
    lastUpdated?: Date;
}

export interface IVariantStockInfo {
    variantId: string;
    variantOptionValue: string;
    variantQuantity?: number | null;
    variantUnitSymbol?: string | null;
    productBaseUnitSymbol?: string | null;
    totalStock: number;
    growerStocks: IGrowerStockInfo[];
}

export interface IProductStockInfo {
    productId: string;
    productName: string;
    variants: IVariantStockInfo[];
}

export class GrowerStockService {
    constructor(private prisma: PrismaClient) {}

    /**
     * Obtient tous les stocks des producteurs pour un produit donné
     */
    async getGrowerStocksForProduct(productId: string): Promise<IGrowerStockInfo[]> {
        const growerProducts = await this.prisma.growerProduct.findMany({
            where: {
                productId,
            },
            select: {
                stock: true,
                updatedAt: true,
                grower: {
                    select: {
                        id: true,
                        name: true,
                        profilePhoto: true,
                    },
                },
            },
            orderBy: {
                stock: 'desc',
            },
        });

        return growerProducts.map(gp => ({
            growerId: gp.grower.id,
            growerName: gp.grower.name,
            growerAvatar: gp.grower.profilePhoto || undefined,
            stock: Number(gp.stock),
            lastUpdated: gp.updatedAt,
        }));
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

        // Récupérer le stock global du produit
        const growerStocks = await this.getGrowerStocksForProduct(productId);
        const totalStock = await this.getTotalStockForProduct(productId);

        // Créer une entrée de variant unique avec le stock global
        const variants: IVariantStockInfo[] = product.variants.map(variant => ({
            variantId: variant.id,
            variantOptionValue: variant.optionValue,
            variantQuantity: variant.quantity,
            variantUnitSymbol: variant.unit?.symbol || null,
            productBaseUnitSymbol: product.baseUnit?.symbol || null,
            totalStock,
            growerStocks,
        }));

        return {
            productId,
            productName: product.name,
            variants,
        };
    }

    /**
     * Obtient le stock global total d'un produit (somme de tous les stocks producteurs de tous les variants)
     */
    async getTotalStockForProduct(productId: string): Promise<number> {
        const result = await this.prisma.growerProduct.aggregate({
            where: {
                variant: {
                    productId,
                },
            },
            _sum: {
                stock: true,
            },
        });

        return Number(result._sum.stock) || 0;
    }

    /**
     * Met à jour le stock d'un producteur pour un produit
     */
    async updateGrowerStock(params: {
        growerId: string;
        productId: string;
        stock: number;
    }): Promise<void> {
        await this.prisma.growerProduct.updateMany({
            where: {
                growerId: params.growerId,
                productId: params.productId,
            },
            data: {
                stock: params.stock,
            },
        });
    }

    /**
     * Récupère les stocks globaux pour plusieurs produits en une seule requête
     */
    async getAllProductsGlobalStock(productIds: string[]): Promise<Record<string, number>> {
        const stockMap: Record<string, number> = {};
        
        // Récupérer tous les stocks en une seule requête
        const allGrowerProducts = await this.prisma.growerProduct.findMany({
            where: {
                productId: { in: productIds },
                variantId: null, // Stock au niveau produit uniquement
            },
            select: {
                productId: true,
                stock: true,
            },
        });
        
        // Grouper par productId et calculer le total
         productIds.forEach((productId: string) => {
             const productStocks = allGrowerProducts.filter((gp: { productId: string; stock: Decimal }) => gp.productId === productId);
             const totalStock = productStocks.reduce((total: number, gp: { stock: Decimal }) => total + gp.stock.toNumber(), 0);
             stockMap[productId] = totalStock;
         });
         
         return stockMap;
     }
}