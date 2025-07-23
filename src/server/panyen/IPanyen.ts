import { IProduct } from '../product/IProduct';

export interface IPanyenProduct {
  id: string;
  name: string;
  description?: string;
  imageUrl: string;
  price: number;
  showInStore: boolean;
  createdAt: Date;
  updatedAt: Date;
  components: IPanyenComponent[];
}

export interface IPanyenComponent {
  id: string;
  panyenProductId: string;
  productId: string;
  productVariantId: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
  product: IProduct;
  productVariant: IProduct['variants'][0];
}

export interface IPanyenCreateInput {
  name: string;
  description?: string;
  imageUrl: string;
  price: number;
  showInStore?: boolean;
  components: {
    productId: string;
    productVariantId: string;
    quantity: number;
  }[];
}

export interface IPanyenUpdateInput {
  name?: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  showInStore?: boolean;
  components?: {
    productId: string;
    productVariantId: string;
    quantity: number;
  }[];
}