import { CheckoutStockUpdate, StockAdjustment, StockMovement } from './IStock';
import { GlobalStockCalculation } from './GlobalStockService';
import { IProduct, IProductVariant } from '../product/IProduct';

export interface GlobalStockAdjustment {
    productId: string;
    newGlobalStock: number;
    reason?: string;
    adjustedBy: string;
}

export interface StockRepository {
    adjustStock: (adjustment: StockAdjustment) => Promise<{
        variant: IProductVariant;
        movement: StockMovement;
    }>;
    adjustGlobalStock: (adjustment: GlobalStockAdjustment) => Promise<{
        product: IProduct;
        calculation: GlobalStockCalculation;
    }>;
    getStockMovements: (variantId: string) => Promise<StockMovement[]>;
    updateStockAfterCheckout: (update: CheckoutStockUpdate) => Promise<void>;
    updateGlobalStockAfterCheckout: (update: CheckoutStockUpdate) => Promise<void>;
    calculateGlobalStock: (productId: string) => Promise<GlobalStockCalculation | null>;
}
