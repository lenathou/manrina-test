import { IProduct, IProductVariant } from '../server/product/IProduct';

export type BasketElement = {
    productVariant: IProductVariant;
    product: IProduct;
    quantity: number;
    name: string;
    price: number;
};
