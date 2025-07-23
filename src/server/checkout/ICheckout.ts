import { IdGenerator } from '../../service/IdGenerator';
import { CheckoutSessionSuccessPayload } from '../payment/CheckoutSessionSuccessPayload';
import { MergeWith } from '../utils/MergeWith';

export interface ICheckoutSession {
    id: string;
    basketSessionId: string;
    paymentStatus: string; // pending, paid, failed
    paymentAmount: number;
    createdAt: Date;
    updatedAt: Date;
    successPayload: CheckoutSessionSuccessPayload | null;
}

type WithAnySuccessPayload<T> = MergeWith<T, { successPayload?: any }>;

export const isCheckoutSessionPaid = (checkoutSession: ICheckoutSession) => {
    return checkoutSession.paymentStatus === 'paid';
};

export class CheckoutSession implements ICheckoutSession {
    id: string;
    basketSessionId: string;
    paymentStatus: string; // pending, paid, failed
    paymentAmount: number;
    createdAt: Date;
    updatedAt: Date;
    successPayload: CheckoutSessionSuccessPayload | null;
    constructor(checkoutSession: WithAnySuccessPayload<ICheckoutSession>) {
        this.id = checkoutSession.id;
        this.basketSessionId = checkoutSession.basketSessionId;
        this.paymentStatus = checkoutSession.paymentStatus;
        this.paymentAmount = checkoutSession.paymentAmount;
        this.createdAt = checkoutSession.createdAt;
        this.updatedAt = checkoutSession.updatedAt;
        this.successPayload = checkoutSession.successPayload || null;
    }

    public static newCheckoutSession(basketSessionId: string, paymentAmount: number) {
        return new CheckoutSession({
            id: IdGenerator.generateIdWithPrefix('cs'),
            basketSessionId,
            paymentStatus: 'pending',
            paymentAmount,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }
}
