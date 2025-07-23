import { ContactInfo } from '../../payments/ContactInfo';
import { BasketElement } from '../../types/BasketElement';
import { DeliveryMethod } from '../../types/DeliveryMethodsType';

export type ICheckoutSession = {
    id: string;
    contact: ContactInfo;
    dayChosen: string;
    deliveryMethod: DeliveryMethod;
    items: BasketElement[];
    paymentStatus?: 'paid' | 'pending';
};

export interface ICheckoutPayload extends ICheckoutCreatePayload {
    id: string;
}

export interface ICheckoutCreatePayload {
    contact: ContactInfo;
    dayChosen: string;
    deliveryMethod: DeliveryMethod;
    items: BasketElement[];
    lastUpdated: string;
    deliveryMessage?: string;
    walletAmountUsed?: number;
}

const anonymizeText = (text: string) => {
    if (text.length < 2) {
        return text;
    }
    // only keep first letter and last letter
    return text.charAt(0) + '*'.repeat(text.length - 2) + text.charAt(text.length - 1);
};

export const anonymizeCheckoutSession = (checkoutSession: ICheckoutSession): ICheckoutSession => {
    return {
        ...checkoutSession,
        contact: {
            name: anonymizeText(checkoutSession.contact.name),
            email: anonymizeText(checkoutSession.contact.email),
            phone: anonymizeText(checkoutSession.contact.phone),
            comments: checkoutSession.contact.comments ? anonymizeText(checkoutSession.contact.comments) : undefined,
        },
    };
};
