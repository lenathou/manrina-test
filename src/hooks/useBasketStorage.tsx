import { useEffect } from 'react';
import { useLocalStorage } from 'react-use';
import { IProduct } from '../server/product/IProduct';
import { BasketElement } from '../types/BasketElement';

export type BasketStorage = {
    version: string;
    items: BasketElement[];
    lastUpdated: string;
};

const BASKET_STORAGE_KEY = '__basket__1';
const BASKET_STORAGE_VERSION = '1.0';
const DEFAULT_BASKET_STORAGE: BasketStorage = {
    version: BASKET_STORAGE_VERSION,
    items: [],
    lastUpdated: new Date().toISOString(),
};

export const useBasketStorage = () => {
    const [_basketStorage, _updateBasketStorage] = useLocalStorage<BasketStorage>(
        BASKET_STORAGE_KEY,
        DEFAULT_BASKET_STORAGE,
    );

    const basketStorage = _basketStorage || DEFAULT_BASKET_STORAGE;
    const updateBasketStorage = (newBasketStorage: Partial<BasketStorage>) => {
        _updateBasketStorage({
            ...basketStorage,
            ...newBasketStorage,
            lastUpdated: new Date().toISOString(),
        });
    };

    const updateProductQuantity = (
        productId: string,
        variantId: string,
        quantity: number,
        setQuantity: boolean = false,
    ) => {
        const existingProduct = basketStorage.items.find(
            (element) => element.product.id === productId && element.productVariant.id === variantId,
        );

        if (existingProduct) {
            const newItems = basketStorage.items.map((item) => {
                if (item.product.id === productId && item.productVariant.id === variantId) {
                    return {
                        ...item,
                        quantity: setQuantity ? quantity : item.quantity + quantity,
                    };
                }
                return item;
            });
            updateBasketStorage({
                items: newItems,
            });
            return true;
        }
        return false;
    };

    useEffect(() => {
        if (_basketStorage?.version !== BASKET_STORAGE_VERSION) {
            updateBasketStorage({
                items: [],
            });
        }
    }, [_basketStorage]);

    const addProductToBasket = (product: IProduct, quantity: number, variantId?: string) => {
        // Default to first variant if none specified
        const variant = variantId ? product.variants.find((v) => v.id === variantId) : product.variants[0];

        if (!variant) {
            console.error('No variant found for product', product);
            return;
        }

        // Try to update quantity if product exists
        if (updateProductQuantity(product.id, variant.id, quantity)) {
            return;
        }

        // If product doesn't exist, add it to basket
        const name = `${product.name} ${variant.optionSet} ${variant.optionValue}`.trim();
        const newItems = [
            ...basketStorage.items,
            {
                product,
                productVariant: variant,
                quantity,
                name,
                price: variant.price,
            },
        ];
        updateBasketStorage({
            items: newItems,
        });
    };

    const removeProductFromBasket = (productId: string, variantId: string) => {
        const updatedItems = basketStorage.items.filter(
            (basketItem) => !(basketItem.product.id === productId && basketItem.productVariant.id === variantId),
        );
        updateBasketStorage({
            items: updatedItems,
        });
    };

    const decrementProductQuantity = (productId: string, variantId: string) => {
        const updatedItems = basketStorage.items
            .map((basketItem) => {
                if (basketItem.product.id === productId && basketItem.productVariant.id === variantId) {
                    return {
                        ...basketItem,
                        quantity: basketItem.quantity > 1 ? basketItem.quantity - 1 : 0,
                    };
                }
                return basketItem;
            })
            .filter((basketItem) => basketItem.quantity > 0);
        updateBasketStorage({
            items: updatedItems,
        });
    };

    const resetBasketStorage = () => {
        console.log('resetBasketStorage called - clearing all items');
        updateBasketStorage({ 
            items: [],
            lastUpdated: new Date().toISOString()
        });
        console.log('resetBasketStorage completed - basket should be empty');
    };

    const getProductQuantityInBasket = (productId: string, variantId: string): number => {
        const existingProduct = basketStorage.items.find(
            (element) => element.product.id === productId && element.productVariant.id === variantId,
        );
        return existingProduct ? existingProduct.quantity : 0;
    };

    const totalProducts = basketStorage.items.reduce((total, basketElement) => {
        total += basketElement.quantity;
        return total;
    }, 0);

    return {
        basketStorage,
        totalProducts,
        addProductToBasket,
        removeProductFromBasket,
        decrementProductQuantity,
        resetBasketStorage,
        updateProductQuantity,
        getProductQuantityInBasket,
    };
};
