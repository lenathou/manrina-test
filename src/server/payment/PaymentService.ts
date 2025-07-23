import { Basket } from '../checkout/IBasket';
import { ICustomer } from '../customer/Customer';
import { CheckoutSessionSuccessPayload } from './CheckoutSessionSuccessPayload';

export interface TaxRate {
    taxRate: number;
    taxId: string;
    displayName: string;
    description?: string;
    country?: string;
    isDefault?: boolean;
}

export interface PaymentService {
    getTaxRates: () => Promise<{ defaultTaxRate: TaxRate; allRates: TaxRate[] }>;
    getPaymentLink: (
        customer: ICustomer,
        basket: Basket,
        checkoutSessionId: string,
        checkoutStatusUrl: string,
    ) => Promise<{ id: string; url: string; total: number }>;
    handleWebhook: (
        reqBody: string | Buffer,
        reqHeaders: Record<string, string>,
    ) => Promise<BasketPaid & { rawPayload: CheckoutSessionSuccessPayload }>;
}

type BasketPaid = {
    type: 'basketPaid';
    basketId: string;
    customerId: string;
    checkoutSessionId: string;
};
