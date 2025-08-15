export interface IProduct {
    id: string;
    category?: string | null;
    name: string;
    imageUrl: string;
    showInStore: boolean;
    description?: string | null;
    variants: IProductVariant[];
    primaryVariantId?: string | null;
    globalStock: number;
    baseUnitId?: string | null;
    baseQuantity: number;
    baseUnit?: IUnit | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export type ProductDtoForCreation = {
    id?: string;
    category?: string;
    name: string;
    imageUrl: string;
    showInStore: boolean;
    description?: string;
};

export interface VatRate {
    taxRate: number;
    taxId: string;
}

export interface IUnit {
    id: string;
    name: string;
    symbol: string;
    category: string;
    baseUnit?: string | null;
    conversionFactor?: number | null;
    isActive: boolean;
}

export type IProductVariant = {
    id: string;
    optionSet: string;
    optionValue: string;
    productId: string;
    description: string | null;
    imageUrl: string | null;
    price: number;
    stock: number;
    vatRate?: VatRate | null;
    showDescriptionOnPrintDelivery?: boolean;
    unit?: IUnit | null;
    unitId?: string | null;
    quantity?: number | null;
    // Nouveau champ pour l'ordre d'affichage
    displayOrder?: number;
    // Nouveau champ pour marquer le variant principal
    isPrimary?: boolean;
};

// Nouveau type pour la création de variants multiples
export type IProductVariantCreationData = {
    optionSet: string;
    optionValue: string;
    productId: string;
    price: number;
    quantity: number;
    unitId: string;
    stock: number;
    description: string | null;
    imageUrl: string | null;
};

export type IProductVariantUpdateFields = Partial<Omit<IProductVariant, 'id' | 'productId'>>;
export type IProductUpdateFields = Partial<Omit<IProduct, 'id' | 'variants'>>;

export const getFirstVariantWithStock = (variants: IProductVariant[]) => {
    return variants.find((v) => v.stock > 0);
};

// Nouvelle fonction utilitaire pour obtenir le variant principal
export const getPrimaryVariant = (product: IProduct): IProductVariant | undefined => {
    if (product.primaryVariantId) {
        return product.variants.find(v => v.id === product.primaryVariantId);
    }
    return product.variants.find(v => v.isPrimary) || product.variants[0];
};
