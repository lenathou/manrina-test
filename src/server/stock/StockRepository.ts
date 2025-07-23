import { CheckoutStockUpdate, StockAdjustment, StockMovement } from './IStock';

export interface StockRepository {
    adjustStock: (adjustment: StockAdjustment) => Promise<{
        variant: { id: string; stock: number };
        movement: StockMovement;
    }>;
    getStockMovements: (variantId: string) => Promise<StockMovement[]>;
    updateStockAfterCheckout: (update: CheckoutStockUpdate) => Promise<void>;
}
