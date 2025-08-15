import { IProduct, IProductUpdateFields, IProductVariant, IUnit } from './IProduct';
import { ProductEntity } from './ProductEntity';

export interface ProductRepository {
    createProduct: (product: ProductEntity) => Promise<ProductEntity>;
    createProducts: (products: IProduct[]) => Promise<ProductEntity[]>;
    getAllProducts: () => Promise<ProductEntity[]>;
    getAllProductsWithStock: () => Promise<ProductEntity[]>;
    updateVariant: (variantId: string, updates: Partial<IProductVariant>) => Promise<IProductVariant>;
    createVariant: (productId: string, variantData: Omit<IProductVariant, 'id'>) => Promise<IProductVariant>;
    deleteVariant: (variantId: string) => Promise<void>;
    updateProduct: (productId: string, updates: IProductUpdateFields) => Promise<IProduct>;
    deleteProduct: (productId: string) => Promise<void>;
    getAllUnits: () => Promise<IUnit[]>;
}
