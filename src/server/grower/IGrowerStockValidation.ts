export enum GrowerStockValidationStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
}

export interface IGrowerStockUpdate {
    id: string;
    growerId: string;
    productId: string;
    currentStock?: number;
    newStock: number;
    variantPrices?: Array<{
        variantId: string;
        newPrice: number;
    }>;
    status: GrowerStockValidationStatus;
    reason: string;
    adminComment?: string;
    requestDate: Date;
    processedDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface IGrowerStockUpdateCreateParams {
    growerId: string;
    productId: string;
    newStock: number;
    variantPrices?: Array<{
        variantId: string;
        newPrice: number;
    }>;
    reason: string;
    status: GrowerStockValidationStatus;
    requestDate: string;
}

export interface IGrowerStockUpdateApprovalParams {
    requestId: string;
    status: GrowerStockValidationStatus.APPROVED | GrowerStockValidationStatus.REJECTED;
    adminComment?: string;
    processedDate?: string;
}

export interface IGrowerProductVariantWithValidation {
    productId: string;
    productName: string;
    productImageUrl: string;
    variantId: string;
    variantOptionValue: string;
    price: number;
    stock: number;
    pendingStockUpdate?: IGrowerStockUpdate;
    hasVariantOptions?: boolean;
    availableVariants?: Array<{
        id: string;
        optionValue: string;
        price: number;
        stock: number;
    }>;
}