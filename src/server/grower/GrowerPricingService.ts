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
        const rows = await this.prisma.growerVariantPrice.findMany({
            where: { variantId },
            orderBy: { price: 'asc' },
            take: 1,
        });
        if (rows.length === 0) return null;
        // @ts-ignore Prisma Decimal
        return rows[0].price?.toNumber?.() ?? Number(rows[0].price);
    }

    async getProductPriceInfo(productId: string): Promise<IProductPriceInfo | null> {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
            include: {
                variants: {
                    include: {
                        unit: true
                    }
                }
            }
        });

        if (!product) return null;

        const variantIds = product.variants.map(v => v.id);
        const priceRows = await this.prisma.growerVariantPrice.findMany({
            where: { variantId: { in: variantIds } },
            include: { grower: true }
        });
        const byVariant = new Map<string, any[]>();
        priceRows.forEach((r: any) => {
            const arr = byVariant.get(r.variantId) ?? [];
            arr.push(r);
            byVariant.set(r.variantId, arr);
        });

        // Récupérer les stocks (par produit) pour les growers trouvés (affichage indicatif)
        const growerIds = Array.from(new Set(priceRows.map((r: any) => r.growerId)));
        const growerStocks = await this.prisma.growerProduct.findMany({
            where: {
                productId: productId,
                growerId: { in: growerIds },
            },
            select: { growerId: true, stock: true },
        });
        const stockByGrowerId = new Map<string, number>();
        growerStocks.forEach((gp: any) => {
            // @ts-ignore Decimal
            stockByGrowerId.set(gp.growerId, gp.stock?.toNumber?.() ?? Number(gp.stock) ?? 0);
        });

        const variants: IVariantPriceInfo[] = product.variants.map((variant: any) => {
            const list = byVariant.get(variant.id) ?? [];
            const growerPrices: IGrowerPrice[] = list.map((row: any) => ({
                growerId: row.growerId,
                growerName: row.grower?.name,
                growerAvatar: row.grower?.profilePhoto || undefined,
                // @ts-ignore Decimal
                price: row.price?.toNumber?.() ?? Number(row.price) ?? 0,
                stock: stockByGrowerId.get(row.growerId) ?? 0
            }));

            const lowestPrice = growerPrices.length > 0 ? Math.min(...growerPrices.map(gp => gp.price)) : 0;

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
        const rows = await this.prisma.growerVariantPrice.findMany({
            where: { variantId },
            include: { grower: true }
        });

        // Récupérer le productId du variant pour associer un stock par producteur
        const variant = await this.prisma.productVariant.findUnique({
            where: { id: variantId },
            select: { productId: true }
        });
        let stockByGrowerId = new Map<string, number>();
        if (variant) {
            const growerIds = Array.from(new Set(rows.map((r: any) => r.growerId)));
            const growerStocks = await this.prisma.growerProduct.findMany({
                where: { productId: variant.productId, growerId: { in: growerIds } },
                select: { growerId: true, stock: true },
            });
            stockByGrowerId = new Map<string, number>();
            growerStocks.forEach((gp: any) => {
                // @ts-ignore Decimal
                stockByGrowerId.set(gp.growerId, gp.stock?.toNumber?.() ?? Number(gp.stock) ?? 0);
            });
        }

        return rows.map((row: any) => ({
            growerId: row.growerId,
            growerName: row.grower?.name,
            growerAvatar: row.grower?.profilePhoto || undefined,
            // @ts-ignore Decimal
            price: row.price?.toNumber?.() ?? Number(row.price) ?? 0,
            stock: stockByGrowerId.get(row.growerId) ?? 0
        }));
    }

    async getAllProductsPriceRanges(): Promise<Record<string, { min: number; max: number }>> {
        const products = await this.prisma.product.findMany({
            include: { variants: { select: { id: true, productId: true } } }
        });

        const variantIdToProductId = new Map<string, string>();
        const allVariantIds: string[] = [];
        products.forEach((p) => {
            p.variants.forEach((v) => {
                variantIdToProductId.set(v.id, v.productId);
                allVariantIds.push(v.id);
            });
        });

        const rows = await this.prisma.growerVariantPrice.findMany({
            where: { variantId: { in: allVariantIds } },
        });

        const priceRanges: Record<string, { min: number; max: number }> = {};
        rows.forEach((row: any) => {
            const productId = variantIdToProductId.get(row.variantId);
            if (!productId) return;
            // @ts-ignore Decimal
            const priceNum = row.price?.toNumber?.() ?? Number(row.price) ?? 0;
            const current = priceRanges[productId];
            if (!current) {
                priceRanges[productId] = { min: priceNum, max: priceNum };
            } else {
                current.min = Math.min(current.min, priceNum);
                current.max = Math.max(current.max, priceNum);
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

        await this.prisma.growerVariantPrice.upsert({
            where: { growerId_variantId: { growerId, variantId } },
            update: { price },
            create: { growerId, variantId, price },
        });
    }
}
