import { CheckoutUseCases } from '../checkout/CheckoutUseCases';
import { Basket } from '../checkout/IBasket';
import { CheckoutSession } from '../checkout/ICheckout';
import { ICustomer } from '../customer/Customer';
import { PaymentService } from './PaymentService';

export class PaymentUseCases {
    constructor(
        private stripeService: PaymentService,
        private checkoutUseCases: CheckoutUseCases,
    ) {}

    public getTaxRates = async () => {
        return await this.stripeService.getTaxRates();
    };

    public getPaymentLink = async (
        customer: ICustomer,
        basket: Basket,
        checkoutSession: CheckoutSession,
        checkoutStatusUrl: string,
    ) => {
        try {
            const stripeCheckout = await this.stripeService.getPaymentLink(
                customer,
                basket,
                checkoutSession.id,
                checkoutStatusUrl,
            );
            if (!stripeCheckout.url) {
                throw new Error('Error creating checkout session, please retry later');
            }
            return { checkoutSession, paymentUrl: stripeCheckout.url };
        } catch (e) {
            console.error((e as Error).message, customer);
            // console.error(e);
            throw new Error('Error creating checkout session, please retry later');
        }
    };

    public handleWebhook = async (reqBody: string | Buffer, reqHeaders: Record<string, string>) => {
        const event = await this.stripeService.handleWebhook(reqBody, reqHeaders);
        if (event) {
            switch (event.type) {
                case 'basketPaid': {
                    const checkoutSessionId = event.checkoutSessionId;
                    await this.checkoutUseCases.handleSuccessfulPayment(checkoutSessionId, event.rawPayload);
                    return {
                        message: 'Checkout session paid',
                    };
                }
            }
            throw new Error('Webhook event not handled');
        }
        throw new Error('No event found');
    };
}
