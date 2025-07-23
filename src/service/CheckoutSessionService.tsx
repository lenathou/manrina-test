import { ICheckoutSession } from '../server/payment/CheckoutSession';

type CheckoutSessionWithCreatedAt = ICheckoutSession & {
    createdAt: string;
};

class CheckoutSessionService {
    _CHECKOUT_SESSION_KEY = 'checkoutSession';
    saveCheckoutSession = (checkoutSession: ICheckoutSession) => {
        const checkoutSessions = this.getCheckoutSessions();
        checkoutSessions[checkoutSession.id] = {
            ...checkoutSession,
            createdAt: new Date().toISOString(),
        };
        localStorage.setItem(this._CHECKOUT_SESSION_KEY, JSON.stringify(checkoutSessions));
    };
    getCheckoutSessions = (): Record<string, CheckoutSessionWithCreatedAt> => {
        return JSON.parse(localStorage.getItem(this._CHECKOUT_SESSION_KEY) || '{}');
    };
    private getCheckoutSessionById = (checkoutId: string) => {
        const checkoutSessions = this.getCheckoutSessions();
        const checkoutSession = checkoutSessions[checkoutId];
        if (!checkoutSession) {
            throw new Error('Checkout session not found');
        }
        return checkoutSession;
    };
    markCheckoutSessionAsPaid = (checkoutId: string) => {
        const checkoutSession = this.getCheckoutSessionById(checkoutId);
        if (checkoutSession.paymentStatus === 'paid') {
            return { shouldEraseBasket: false };
        }
        this.saveCheckoutSession({ ...checkoutSession, paymentStatus: 'paid' });
        return { shouldEraseBasket: true };
    };
}
export const checkoutSessionService = new CheckoutSessionService();
