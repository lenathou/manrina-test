import { IProduct, IProductVariant, IUnit } from './IProduct';

export class ProductEntity implements IProduct {
    id: string;
    category?: string;
    name: string;
    description?: string;
    imageUrl: string;
    showInStore: boolean;
    variants: IProductVariant[];
    primaryVariantId?: string | null;
    globalStock: number;
    baseUnitId?: string | null;
    baseQuantity: number;
    baseUnit?: IUnit | null;
    createdAt?: Date;
    updatedAt?: Date;

    constructor(product: IProduct) {
        this.id = product.id;
        this.category = product.category || undefined;
        this.name = product.name;
        this.description = product.description || undefined;
        this.imageUrl = product.imageUrl;
        this.showInStore = product.showInStore;
        this.variants = product.variants;
        this.primaryVariantId = product.primaryVariantId || null;
        this.globalStock = product.globalStock || 0;
        this.baseUnitId = product.baseUnitId || null;
        this.baseQuantity = product.baseQuantity || 1;
        this.baseUnit = product.baseUnit || null;
        this.createdAt = product.createdAt;
        this.updatedAt = product.updatedAt;
    }
}
