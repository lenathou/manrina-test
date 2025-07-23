export enum StockMovementType {
    SALE = 'SALE',
    MANUAL_ADJUSTMENT = 'MANUAL_ADJUSTMENT',
    RESTOCK = 'RESTOCK',
}

export interface StockMovement {
    id: string;
    variantId: string;
    previousStock: number;
    newStock: number;
    quantity: number;
    type: StockMovementType;
    reason?: string;
    checkoutSessionId?: string;
    adjustedBy?: string;
    createdAt: Date;
}

export interface StockAdjustment {
    variantId: string;
    newStock: number;
    reason?: string;
    adjustedBy: string;
}

export interface CheckoutStockUpdate {
    checkoutSessionId: string;
    items: Array<{
        variantId: string;
        quantity: number;
    }>;
    reason?: string;
    adjustedBy?: string;
}
