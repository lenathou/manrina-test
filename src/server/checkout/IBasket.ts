import { IdGenerator } from '@/service/IdGenerator';
import { Customer } from '@/server/customer/Customer';
import { ICheckoutCreatePayload } from '@/server/payment/CheckoutSession';
import { CheckoutSession } from '@/server/checkout/ICheckout';

interface IAddress {
    id: string;
    postalCode: string;
    address: string;
    city: string;
    country: string;
    name: string | null;
    type: string; // customer, relay, other
}

type RawCustomer = {
    email: string;
    name: string;
    phone: string;
    comments?: string;
};

type IBasketItem = {
    id?: string;
    productId: string;
    productVariantId: string;
    quantity: number;
    name: string;
    price: number;
    vatRateId?: string;
    description?: string | null;
    refundStatus?: 'refunded' | 'none';
};
export interface IBasket {
    id: string;
    orderIndex: number;
    createdAt: Date | string | null;
    customerId: string;
    items: IBasketItem[];
    total: number;
    paymentStatus: string;
    address: IAddress | null;
    deliveryCost: number;
    deliveryDay: string | null;
    delivered: string | null;
    retrieved: string | null;
    rawCustomer: RawCustomer | null;
    deliveryMessage: string | null;
    walletAmountUsed: number | null;
}

const PAYMENT_STATUS = {
    PENDING: 'pending',
    PAID: 'paid',
    CANCELLED: 'cancelled',
};

export class Basket implements IBasket {
    readonly id: string;
    readonly orderIndex: number;
    readonly createdAt: Date | string | null;
    readonly customerId: string;
    readonly items: IBasketItem[];
    readonly total: number;
    readonly paymentStatus: string;
    readonly address: IAddress | null;
    readonly deliveryCost: number;
    readonly delivered: string | null;
    readonly retrieved: string | null;
    readonly deliveryDay: string | null;
    readonly rawCustomer: RawCustomer | null;
    readonly deliveryMessage: string | null;
    readonly walletAmountUsed: number | null;

    constructor(basket: IBasket) {
        this.id = basket.id;
        this.orderIndex = basket.orderIndex;
        this.createdAt = basket.createdAt;
        this.customerId = basket.customerId;
        this.items = basket.items;
        this.total = basket.total;
        this.paymentStatus = basket.paymentStatus;
        this.address = basket.address;
        this.deliveryCost = basket.deliveryCost;
        this.delivered = basket.delivered;
        this.retrieved = basket.retrieved;
        this.deliveryDay = basket.deliveryDay;
        this.rawCustomer = basket.rawCustomer;
        this.deliveryMessage = basket.deliveryMessage;
        this.walletAmountUsed = basket.walletAmountUsed;
    }

    static fromCheckoutPayload(customerId: string, checkoutPayload: ICheckoutCreatePayload) {
        const totalPanier = checkoutPayload.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
        const deliveryCost = checkoutPayload.deliveryMethod.basePrice || 0;
        const total = totalPanier + deliveryCost;
        return new Basket({
            id: IdGenerator.generateIdWithPrefix('bas'),
            orderIndex: 0, // Sera remplacé par l'auto-incrémentation de Prisma
            createdAt: new Date().toISOString(),
            customerId: customerId,
            items: checkoutPayload.items.map((item) => {
                const name =
                    `${item.product.name} ${item.productVariant.optionSet} ${item.productVariant.optionValue}`.trim();
                return {
                    productId: item.product.id,
                    productVariantId: item.productVariant.id,
                    quantity: item.quantity,
                    name: name,
                    price: item.productVariant.price,
                    description: item.productVariant.description,
                };
            }),
            total: total,
            paymentStatus: PAYMENT_STATUS.PENDING,
            address: {
                id: '', // L'ID sera généré par Prisma lors de la création
                postalCode: checkoutPayload.deliveryMethod.location.postalCode,
                address: checkoutPayload.deliveryMethod.location.address,
                city: checkoutPayload.deliveryMethod.location.city,
                country: 'MQ',
                name: checkoutPayload.deliveryMethod.name,
                type: checkoutPayload.deliveryMethod.id?.includes('pickup') ? 'pickup' : 'delivery',
            },
            deliveryCost: deliveryCost,
            deliveryDay: checkoutPayload.dayChosen,
            delivered: null,
            retrieved: null,
            rawCustomer: checkoutPayload.contact,
            deliveryMessage: checkoutPayload.deliveryMessage || null,
            walletAmountUsed: checkoutPayload.walletAmountUsed || 0,
        });
    }

    canBeMarkedAsDelivered(): boolean {
        return this.paymentStatus === PAYMENT_STATUS.PAID;
    }

    validateDeliveryStatus(): void {
        if (!this.canBeMarkedAsDelivered()) {
            throw new Error('Cannot mark unpaid basket as delivered');
        }
    }
}

export class IBasketWithCheckoutSessions {
    basket: Basket;
    checkoutSessions: CheckoutSession[];
    customer: Customer;
    constructor(basket: Basket, checkoutSessions: CheckoutSession[], customer: Customer) {
        this.basket = basket;
        this.checkoutSessions = checkoutSessions;
        this.customer = customer;
    }

    toCommandToShow = () => {
        const lastCheckoutSession = this.checkoutSessions.find(
            (checkoutSession) => checkoutSession.successPayload?.status === 'complete',
        );
        const customerToUse = this.basket.rawCustomer || this.customer;
        const successPayload = lastCheckoutSession?.successPayload;

        // Pour les commandes gratuites ou payées avec avoir, utiliser les données du panier
        const isFreeOrder =
            (this.basket.total === 0 ||
                (this.basket.walletAmountUsed && this.basket.walletAmountUsed >= this.basket.total)) &&
            this.basket.paymentStatus === 'paid';

        // Calculer le montant réellement payé
        const actualPaidAmount: number = isFreeOrder
            ? Math.max(0, Number(this.basket.total) - Number(this.basket.walletAmountUsed || 0))
            : parseFloat(parseStripeAmount(successPayload?.amount_total) || '0');

        // Calculer le montant des remboursements
        const refundedAmount: number = this.basket.items
            .filter((item) => item.refundStatus === 'refunded')
            .reduce((total: number, item) => total + item.price * item.quantity, 0);

        // Calculer le montant final après déduction des remboursements
        const finalAmount = Math.max(0, actualPaidAmount - refundedAmount);

        return {
            basket: this.basket,
            customer: customerToUse,
            order: {
                'Order': `A_${this.basket.orderIndex}`,
                'Email': customerToUse?.email || '',
                'Date': this.basket.createdAt,
                'Payment status': this.basket.paymentStatus,
                'Paid at': isFreeOrder
                    ? new Date(this.basket.createdAt || Date.now()).getTime()
                    : (successPayload?.created || 0) * 1000,
                'Payment method': isFreeOrder ? 'Commande gratuite' : successPayload?.payment_method_types?.[0] || '',
                'Order status': isFreeOrder ? 'complete' : successPayload?.status || '',
                'Subtotal': isFreeOrder ? this.basket.total : parseStripeAmount(successPayload?.amount_subtotal),
                'Shipping': this.basket.deliveryCost || 0,
                'Taxes': isFreeOrder ? 0 : parseStripeAmount(successPayload?.total_details?.amount_tax),
                'Discount': isFreeOrder ? 0 : parseStripeAmount(successPayload?.total_details?.amount_discount),
                'Total': finalAmount,
                'Customer name': customerToUse?.name || '',
                'Customer phone number': customerToUse?.phone || '',
                'Shipping address - street': this.basket.address?.address || '',
                'Shipping address - street number': this.basket.address?.postalCode || '',
                'Shipping address - city': this.basket.address?.city || '',
                'Shipping address - zip code': this.basket.address?.country || '',
                'Shipping address - country code': this.basket.address?.country || '',
                'Shipping method name': this.basket.address?.id?.includes('pickup')
                    ? 'Retrait en magasin'
                    : 'Livraison à domicile',
                'Shipping method type': 'shipping',
                'Message for customer': 'not usable at the moment',
                'Notes': 'No notes at the moment -- to update',
                'Tracking url': 'not usable at the moment',
                'Is Archived': this.basket.retrieved || this.basket.delivered ? 'Yes' : 'No',
            },
        };
    };
}

const parseStripeAmount = (amount?: number | null) => {
    return amount ? (amount / 100).toFixed(2) : '';
};

export type BasketWithCustomerToShow = ReturnType<IBasketWithCheckoutSessions['toCommandToShow']>;

export const getDeliveryTypeFromBasket = (basket: IBasket) => {
    if (basket.address?.id.includes('pickup')) {
        return ['Retrait en point relais', basket.address?.name].filter(Boolean).join(' | ');
    }
    return 'Livraison à domicile';
};
