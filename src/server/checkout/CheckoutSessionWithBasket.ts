import { Basket } from './IBasket';
import { CheckoutSession } from './ICheckout';

export interface CheckoutSessionWithBasket {
    checkoutSession: CheckoutSession;
    basketSession: Basket;
}
