import { CheckoutStockUpdate, StockAdjustment } from './IStock';
import { StockRepository } from './StockRepository';

export class StockUseCases {
    constructor(private stockRepository: StockRepository) {}

    public adjustStock = async (adjustment: StockAdjustment) => {
        return await this.stockRepository.adjustStock(adjustment);
    };

    public getStockMovements = async (variantId: string) => {
        return await this.stockRepository.getStockMovements(variantId);
    };

    public updateStockAfterCheckout = async (update: CheckoutStockUpdate) => {
        return await this.stockRepository.updateStockAfterCheckout(update);
    };
}
