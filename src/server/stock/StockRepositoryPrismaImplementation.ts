import { PrismaClient } from '@prisma/client';
import { CheckoutStockUpdate, StockAdjustment, StockMovement, StockMovementType } from './IStock';
import { StockRepository } from './StockRepository';

export class StockRepositoryPrismaImplementation implements StockRepository {
    constructor(private prisma: PrismaClient) {}

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
                    previousStock: variant.stock,
                    newStock: adjustment.newStock,
                    quantity: adjustment.newStock - variant.stock,
                    type: StockMovementType.MANUAL_ADJUSTMENT,
                    reason: adjustment.reason,
                    adjustedBy: adjustment.adjustedBy,
                },
            });

            const updatedVariant = await tx.productVariant.update({
                where: { id: adjustment.variantId },
                data: { stock: adjustment.newStock },
            });

            return {
                variant: updatedVariant,
                movement: movement as StockMovement,
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
                const newStock = variant.stock - item.quantity;

                await tx.stockMovement.create({
                    data: {
                        variantId: item.variantId,
                        previousStock: variant.stock,
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
}
