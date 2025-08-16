import { StockRepository, GlobalStockAdjustment } from './StockRepository';
import { StockAdjustment, CheckoutStockUpdate, StockMovement } from './IStock';

export class StockUseCases {
    constructor(private stockRepository: StockRepository) {}

    public adjustStock = async (adjustment: StockAdjustment) => {
        return await this.stockRepository.adjustStock(adjustment);
    };

    public getStockMovements = async (variantId: string): Promise<StockMovement[]> => {
        return this.stockRepository.getStockMovements(variantId);
    };

    public updateStockAfterCheckout = async (update: CheckoutStockUpdate) => {
        return await this.stockRepository.updateStockAfterCheckout(update);
    };

    public adjustGlobalStock = async (adjustment: GlobalStockAdjustment): Promise<void> => {
        await this.stockRepository.adjustGlobalStock(adjustment);
    };

    public updateGlobalStockAfterCheckout = async (update: CheckoutStockUpdate): Promise<void> => {
        return this.stockRepository.updateGlobalStockAfterCheckout(update);
    };

    public calculateGlobalStock = async (productId: string) => {
        return this.stockRepository.calculateGlobalStock(productId);
    };
}
