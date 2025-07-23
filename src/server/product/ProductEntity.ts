import { IProduct, IProductVariant } from './IProduct';

export class ProductEntity implements IProduct {
    id: string;
    category?: string;
    name: string;
    description?: string;
    imageUrl: string;
    showInStore: boolean;
    variants: IProductVariant[];

    constructor(product: IProduct) {
        this.id = product.id;
        this.category = product.category || undefined;
        this.name = product.name;
        this.description = product.description || undefined;
        this.imageUrl = product.imageUrl;
        this.showInStore = product.showInStore;
        this.variants = product.variants;
    }
}
