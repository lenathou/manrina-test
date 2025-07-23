import { CheckoutSessionWithBasket } from './CheckoutSessionWithBasket';
import { Basket, IBasketWithCheckoutSessions } from './IBasket';
import { CheckoutSession } from './ICheckout';

export type BasketSessionFilters = {
    afterDate?: string;
    paid?: boolean;
    notDelivered?: boolean;
    authenticatedCustomers?: boolean; 
};

export interface CheckoutRepository {
    createBasketSession: (basketSession: Basket) => Promise<Basket>;
    getBasketSessions: (filters?: BasketSessionFilters) => Promise<IBasketWithCheckoutSessions[]>;
    getBasketSessionById: (basketId: string) => Promise<IBasketWithCheckoutSessions>;
    getCheckoutSessionById: (checkoutSessionId: string) => Promise<CheckoutSessionWithBasket>;
    saveCheckoutSession: (checkoutSession: CheckoutSession) => Promise<CheckoutSession>;
    markCheckoutSessionAsPaid: (checkoutSession: CheckoutSession, rawPayload: any) => Promise<void>;
    setDeliveryDate: (basketId: string, deliveryDate: string) => Promise<Basket>;
    getBasketById: (basketId: string) => Promise<Basket>;
    updateBasketItemRefundStatus: (basketItemId: string, refundStatus: 'refunded' | 'none') => Promise<{ success: boolean; message?: string }>;
    getBasketItemById: (basketItemId: string) => Promise<{
        id: string;
        quantity: number;
        productVariantId: string;
        basketSessionId: string;
        productId: string;
        name: string;
        price: number;
        description: string | null;
        refundStatus: string;
    } | null>;
}
