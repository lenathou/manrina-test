import { BasketStorage } from '../hooks/useBasketStorage';
import { DeliveryMethod } from '../types/DeliveryMethodsType';

export const getTotalPriceWithDelivery = (basketStorage: BasketStorage, deliveryMethod?: DeliveryMethod) => {
    const basketTotalPrice = basketStorage.items.reduce(
        (total, element) => total + element.quantity * element.productVariant.price,
        0,
    );
    const deliveryCost = deliveryMethod?.basePrice || 0;
    const totalPrice = basketTotalPrice + deliveryCost;
    return { basketTotalPrice, deliveryCost, totalPrice };
};
