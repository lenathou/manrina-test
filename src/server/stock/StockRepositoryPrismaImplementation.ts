import { PrismaClient } from '@prisma/client';
import { CheckoutStockUpdate, StockAdjustment, StockMovement, StockMovementType } from './IStock';
import { GlobalStockAdjustment, StockRepository } from './StockRepository';
import { GlobalStockService} from './GlobalStockService';
import { IProduct, IProductVariant, VatRate } from '../product/IProduct';

export class StockRepositoryPrismaImplementation implements StockRepository {
    private globalStockService: GlobalStockService;

    constructor(private prisma: PrismaClient) {
        this.globalStockService = new GlobalStockService();
    }

    public adjustStock = async (adjustment: StockAdjustment) => {
        const variant = await this.prisma.productVariant.findUnique({
            where: { id: adjustment.variantId },
        });

        if (!variant) {
            throw new Error('Variant not found');
        }

        return await this.prisma.$transaction(async (tx) => {
            const movement = await tx.stockMovement.create({
                data: {
                    variantId: adjustment.variantId,
                    previousStock: Number(variant.stock),
                    newStock: adjustment.newStock,
                    quantity: adjustment.newStock - Number(variant.stock),
                    type: StockMovementType.MANUAL_ADJUSTMENT,
                    reason: adjustment.reason,
                    adjustedBy: adjustment.adjustedBy,
                },
            });

            const updatedVariant = await tx.productVariant.update({
                where: { id: adjustment.variantId },
                data: { stock: adjustment.newStock },
                include: {
                    unit: true
                }
            });

            const variantTyped: IProductVariant = {
                ...updatedVariant,
                price: Number(updatedVariant.price),
                stock: Number(updatedVariant.stock),
                quantity: updatedVariant.quantity ? Number(updatedVariant.quantity) : null,
                vatRate: updatedVariant.vatRate as VatRate | null,
                showDescriptionOnPrintDelivery: updatedVariant.showDescriptionOnPrintDelivery ?? undefined,
                unit: updatedVariant.unit ? {
                    id: updatedVariant.unit.id,
                    name: updatedVariant.unit.name,
                    symbol: updatedVariant.unit.symbol,
                    category: updatedVariant.unit.category,
                    baseUnit: updatedVariant.unit.baseUnit,
                    conversionFactor: updatedVariant.unit.conversionFactor ? Number(updatedVariant.unit.conversionFactor) : null,
                    isActive: updatedVariant.unit.isActive
                } : null
            };

            return {
                variant: variantTyped,
                movement: movement as StockMovement,
            };
        });
    };

    public adjustGlobalStock = async (adjustment: GlobalStockAdjustment) => {
        const product = await this.prisma.product.findUnique({
            where: { id: adjustment.productId },
            include: {
                variants: {
                    include: {
                        unit: true
                    }
                },
                baseUnit: true
            }
        });

        if (!product) {
            throw new Error('Product not found');
        }

        // Récupérer toutes les unités pour les calculs

        return await this.prisma.$transaction(async (tx) => {
            // Mettre à jour le stock global du produit
            const updatedProduct = await tx.product.update({
                where: { id: adjustment.productId },
                data: { globalStock: adjustment.newGlobalStock },
                include: {
                    variants: {
                        include: {
                            unit: true
                        }
                    },
                    baseUnit: true
                }
            });

            // Calculer les nouveaux stocks des variants
            const productWithTypedData = {
                ...updatedProduct,
                variants: updatedProduct.variants.map(v => ({
                    ...v,
                    price: Number(v.price),
                    stock: Number(v.stock),
                    quantity: v.quantity ? Number(v.quantity) : null,
                    unit: v.unit ? {
                        id: v.unit.id,
                        name: v.unit.name,
                        symbol: v.unit.symbol,
                        category: v.unit.category,
                        baseUnit: v.unit.baseUnit,
                        conversionFactor: v.unit.conversionFactor ? Number(v.unit.conversionFactor) : null,
                        isActive: v.unit.isActive
                    } : null
                })),
                baseUnit: updatedProduct.baseUnit ? {
                    id: updatedProduct.baseUnit.id,
                    name: updatedProduct.baseUnit.name,
                    symbol: updatedProduct.baseUnit.symbol,
                    category: updatedProduct.baseUnit.category,
                    baseUnit: updatedProduct.baseUnit.baseUnit,
                    conversionFactor: updatedProduct.baseUnit.conversionFactor ? Number(updatedProduct.baseUnit.conversionFactor) : null,
                    isActive: updatedProduct.baseUnit.isActive
                } : null
            } as IProduct;

            const calculation = this.globalStockService.calculateVariantStocks(
                productWithTypedData
            );

            // Mettre à jour les stocks calculés des variants
            for (const variantStock of calculation.variantStocks) {
                await tx.productVariant.update({
                    where: { id: variantStock.variantId },
                    data: { stock: variantStock.calculatedStock }
                });

                // Créer un mouvement de stock pour chaque variant
                const variant = product.variants.find(v => v.id === variantStock.variantId);
                if (variant) {
                    await tx.stockMovement.create({
                        data: {
                            variantId: variantStock.variantId,
                            previousStock: Number(variant.stock),
                            newStock: variantStock.calculatedStock,
                            quantity: variantStock.calculatedStock - Number(variant.stock),
                            type: StockMovementType.MANUAL_ADJUSTMENT,
                            reason: adjustment.reason || 'Global stock adjustment',
                            adjustedBy: adjustment.adjustedBy,
                        },
                    });
                }
            }

            // Convertir le produit en type IProduct
            const productTyped: IProduct = {
                ...updatedProduct,
                globalStock: updatedProduct.globalStock || 0,
                baseQuantity: updatedProduct.baseQuantity || 0,
                variants: updatedProduct.variants.map(v => ({
                    ...v,
                    price: Number(v.price),
                    stock: Number(v.stock),
                    quantity: v.quantity ? Number(v.quantity) : null,
                    vatRate: v.vatRate as VatRate | null,
                    showDescriptionOnPrintDelivery: v.showDescriptionOnPrintDelivery ?? undefined,
                    unit: v.unit ? {
                        id: v.unit.id,
                        name: v.unit.name,
                        symbol: v.unit.symbol,
                        category: v.unit.category,
                        baseUnit: v.unit.baseUnit,
                        conversionFactor: v.unit.conversionFactor ? Number(v.unit.conversionFactor) : null,
                        isActive: v.unit.isActive
                    } : null
                } as IProductVariant)),
                baseUnit: updatedProduct.baseUnit ? {
                    id: updatedProduct.baseUnit.id,
                    name: updatedProduct.baseUnit.name,
                    symbol: updatedProduct.baseUnit.symbol,
                    category: updatedProduct.baseUnit.category,
                    baseUnit: updatedProduct.baseUnit.baseUnit,
                    conversionFactor: updatedProduct.baseUnit.conversionFactor,
                    isActive: updatedProduct.baseUnit.isActive
                } : null
            };

            return {
                product: productTyped,
                calculation
            };
        });
    };

    public getStockMovements = async (variantId: string) => {
        return (await this.prisma.stockMovement.findMany({
            where: { variantId },
            orderBy: { createdAt: 'desc' },
        })) as StockMovement[];
    };

    public updateStockAfterCheckout = async (update: CheckoutStockUpdate) => {
        await this.prisma.$transaction(async (tx) => {
            for (const item of update.items) {
                const variant = await tx.productVariant.findUnique({
                    where: { id: item.variantId },
                });

                if (!variant) {
                    throw new Error('Product to update stock not found');
                }
                const newStock = Number(variant.stock) - item.quantity;

                await tx.stockMovement.create({
                    data: {
                        variantId: item.variantId,
                        previousStock: Number(variant.stock),
                        newStock,
                        quantity: -item.quantity,
                        type: StockMovementType.SALE,
                        checkoutSessionId: update.checkoutSessionId,
                        reason: update.reason,
                        adjustedBy: update.adjustedBy || StockMovementType.SALE,
                    },
                });

                await tx.productVariant.update({
                    where: { id: item.variantId },
                    data: {
                        stock: newStock,
                    },
                });
            }
        });
    };

    public updateGlobalStockAfterCheckout = async (update: CheckoutStockUpdate) => {
        await this.prisma.$transaction(async (tx) => {
            // Grouper les items par produit
            const itemsByProduct = new Map<string, { variantId: string; quantity: number }[]>();
            
            for (const item of update.items) {
                const variant = await tx.productVariant.findUnique({
                    where: { id: item.variantId },
                    include: { product: true, unit: true }
                });
                
                if (!variant) {
                    throw new Error(`Variant ${item.variantId} not found`);
                }
                
                const productId = variant.productId;
                if (!itemsByProduct.has(productId)) {
                    itemsByProduct.set(productId, []);
                }
                itemsByProduct.get(productId)!.push({
                    variantId: item.variantId,
                    quantity: item.quantity
                });
            }

            // Traiter chaque produit
            for (const [productId, productItems] of Array.from(itemsByProduct)) {
                const product = await tx.product.findUnique({
                    where: { id: productId },
                    include: {
                        variants: {
                            include: { unit: true }
                        },
                        baseUnit: true
                    }
                });

                if (!product) {
                    throw new Error(`Product ${productId} not found`);
                }

                // Calculer la réduction totale du stock global pour ce produit
                let totalGlobalStockReduction = 0;
                
                for (const item of productItems) {
                    const variant = product.variants.find(v => v.id === item.variantId);
                    if (!variant || !variant.unit || !variant.quantity) {
                        throw new Error(`Variant ${item.variantId} configuration invalid`);
                    }

                    if (!product.baseUnit) {
                        throw new Error(`Product ${productId} must have a base unit`);
                    }

                    // Convertir la quantité vendue en unités de base
                    const productTyped = {
                        ...product,
                        variants: product.variants.map(v => ({
                            ...v,
                            price: Number(v.price),
                            stock: Number(v.stock),
                            quantity: v.quantity ? Number(v.quantity) : null,
                            unit: v.unit ? {
                                id: v.unit.id,
                                name: v.unit.name,
                                symbol: v.unit.symbol,
                                category: v.unit.category,
                                baseUnit: v.unit.baseUnit,
                                conversionFactor: v.unit.conversionFactor ? Number(v.unit.conversionFactor) : null,
                                isActive: v.unit.isActive
                            } : null
                        })),
                        baseUnit: {
                            id: product.baseUnit.id,
                            name: product.baseUnit.name,
                            symbol: product.baseUnit.symbol,
                            category: product.baseUnit.category,
                            baseUnit: product.baseUnit.baseUnit,
                            conversionFactor: product.baseUnit.conversionFactor ? Number(product.baseUnit.conversionFactor) : null,
                            isActive: product.baseUnit.isActive
                        }
                    } as IProduct;

                    const variantTyped: IProductVariant = {
                        ...variant,
                        price: Number(variant.price),
                        stock: Number(variant.stock),
                        quantity: variant.quantity ? Number(variant.quantity) : null,
                        vatRate: variant.vatRate as VatRate | null,
                        showDescriptionOnPrintDelivery: variant.showDescriptionOnPrintDelivery ?? undefined,
                        unit: {
                            id: variant.unit.id,
                            name: variant.unit.name,
                            symbol: variant.unit.symbol,
                            category: variant.unit.category,
                            baseUnit: variant.unit.baseUnit,
                            conversionFactor: variant.unit.conversionFactor ? Number(variant.unit.conversionFactor) : null,
                            isActive: variant.unit.isActive
                        }
                    };

                    const newGlobalStock = this.globalStockService.updateGlobalStockAfterSale(
                        productTyped,
                        variantTyped,
                        item.quantity
                    );

                    totalGlobalStockReduction += (product.globalStock || 0) - newGlobalStock;
                }

                // Mettre à jour le stock global du produit
                const newGlobalStock = Math.max(0, (product.globalStock || 0) - totalGlobalStockReduction);
                await tx.product.update({
                    where: { id: productId },
                    data: { globalStock: newGlobalStock }
                });

                // Recalculer et mettre à jour les stocks des variants
                const updatedProduct = await tx.product.findUnique({
                    where: { id: productId },
                    include: {
                        variants: { include: { unit: true } },
                        baseUnit: true
                    }
                });

                if (updatedProduct) {
                    const productTyped = {
                        ...updatedProduct,
                        variants: updatedProduct.variants.map(v => ({
                            ...v,
                            price: Number(v.price),
                            stock: Number(v.stock),
                            quantity: v.quantity ? Number(v.quantity) : null,
                            unit: v.unit ? {
                                id: v.unit.id,
                                name: v.unit.name,
                                symbol: v.unit.symbol,
                                category: v.unit.category,
                                baseUnit: v.unit.baseUnit,
                                conversionFactor: v.unit.conversionFactor ? Number(v.unit.conversionFactor) : null,
                                isActive: v.unit.isActive
                            } : null
                        })),
                        baseUnit: updatedProduct.baseUnit ? {
                            id: updatedProduct.baseUnit.id,
                            name: updatedProduct.baseUnit.name,
                            symbol: updatedProduct.baseUnit.symbol,
                            category: updatedProduct.baseUnit.category,
                            baseUnit: updatedProduct.baseUnit.baseUnit,
                            conversionFactor: updatedProduct.baseUnit.conversionFactor ? Number(updatedProduct.baseUnit.conversionFactor) : null,
                            isActive: updatedProduct.baseUnit.isActive
                        } : null
                    } as IProduct;

                    const calculation = this.globalStockService.calculateVariantStocks(
                        productTyped
                    );

                    // Mettre à jour les stocks des variants et créer les mouvements
                    for (const variantStock of calculation.variantStocks) {
                        const currentVariant = product.variants.find(v => v.id === variantStock.variantId);
                        if (currentVariant) {
                            await tx.productVariant.update({
                                where: { id: variantStock.variantId },
                                data: { stock: variantStock.calculatedStock }
                            });

                            await tx.stockMovement.create({
                                data: {
                                    variantId: variantStock.variantId,
                                    previousStock: Number(currentVariant.stock),
                                    newStock: variantStock.calculatedStock,
                                    quantity: variantStock.calculatedStock - Number(currentVariant.stock),
                                    type: StockMovementType.SALE,
                                    checkoutSessionId: update.checkoutSessionId,
                                    reason: update.reason || 'Sale - Global stock update',
                                    adjustedBy: update.adjustedBy || 'system',
                                },
                            });
                        }
                    }
                }
            }
        });
    };

    public calculateGlobalStock = async (productId: string) => {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
            include: {
                variants: {
                    include: {
                        unit: true,
                    },
                },
                baseUnit: true,
            },
        });

        if (!product) {
            return null;
        }

        const productWithTypedData: IProduct = {
            ...product,
            globalStock: product.globalStock || 0,
            baseQuantity: product.baseQuantity || 0,
            variants: product.variants.map((variant) => ({
                ...variant,
                price: Number(variant.price),
                stock: Number(variant.stock),
                quantity: variant.quantity ? Number(variant.quantity) : null,
                vatRate: variant.vatRate ? variant.vatRate as unknown as VatRate : null,
                unit: variant.unit || undefined,
                showDescriptionOnPrintDelivery: variant.showDescriptionOnPrintDelivery ?? undefined,
            })),
        };

        return this.globalStockService.calculateVariantStocks(productWithTypedData);
    };
}
