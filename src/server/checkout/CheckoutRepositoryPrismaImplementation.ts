import { Prisma, PrismaClient } from '@prisma/client';
import { Customer } from '../customer/Customer';
import { CheckoutRepository } from './CheckoutRepository';
import { CheckoutSessionWithBasket } from './CheckoutSessionWithBasket';
import { Basket, IBasket, IBasketWithCheckoutSessions } from './IBasket';
import { CheckoutSession } from './ICheckout';

type RawCustomer = {
    email: string;
    name: string;
    phone: string;
    comments?: string;
};

type PAYMENT_STATUSES = 'pending' | 'paid' | 'failed';

export class CheckoutRepositoryPrismaImplementation implements CheckoutRepository {
    constructor(private prisma: PrismaClient) {}

    public createBasketSession = async (basketSession: Basket): Promise<Basket> => {
        // Récupérer l'email du client pour déterminer s'il est authentifié
        const customer = await this.prisma.customer.findUnique({
            where: { id: basketSession.customerId },
            select: { email: true },
        });

        const isAuthenticatedCustomer = customer && !customer.email.startsWith('temp_');

        // Pour les clients authentifiés, chercher une adresse existante avec les mêmes données
        let addressToConnect = null;
        if (isAuthenticatedCustomer && basketSession.address) {
            addressToConnect = await this.prisma.address.findFirst({
                where: {
                    customerId: basketSession.customerId,
                    postalCode: basketSession.address.postalCode,
                    address: basketSession.address.address,
                    city: basketSession.address.city,
                    country: basketSession.address.country,
                    type: basketSession.address.type,
                },
            });
        }

        // Pour les clients non authentifiés, chercher aussi une adresse existante pour éviter les doublons
        if (!isAuthenticatedCustomer && basketSession.address) {
            addressToConnect = await this.prisma.address.findFirst({
                where: {
                    customerId: null, // Adresses non liées à un client
                    postalCode: basketSession.address.postalCode,
                    address: basketSession.address.address,
                    city: basketSession.address.city,
                    country: basketSession.address.country,
                    type: basketSession.address.type,
                },
            });
        }

        // Préparer les données pour la création, en omettant addressId si undefined
        const createData: Prisma.BasketSessionCreateInput = {
            id: basketSession.id,
            // orderIndex omis pour laisser Prisma gérer l'auto-incrémentation
            customer: {
                connect: { id: basketSession.customerId }
            },
            items: {
                create: await Promise.all(basketSession.items.map(async (item) => {
                    // Vérifier si c'est un panier (ID virtuel)
                    const isPanyen = item.productVariantId.startsWith('panyen_variant_');
                    
                    if (isPanyen) {
                        // Pour les paniers, utiliser des IDs de produits réels existants comme fallback
                        // Utilisation d'un produit Ananas existant dans la base de données
                        const fallbackProductId = '2849c32d-9d22-4495-9450-5c805ea21659'; // Ananas
                        const fallbackVariantId = '7e50147d-214a-437e-97a6-70f076e3d855'; // Unité
                        
                        return {
                            productId: fallbackProductId, // Utiliser un produit existant comme fallback
                            productVariantId: fallbackVariantId, // Utiliser un variant existant comme fallback
                            quantity: item.quantity,
                            name: item.name,
                            price: item.price,
                            description: item.description,
                        };
                    } else {
                        // Pour les produits normaux, utiliser l'ID tel quel
                        return {
                            productId: item.productId,
                            productVariantId: item.productVariantId,
                            quantity: item.quantity,
                            name: item.name,
                            price: item.price,
                            description: item.description,
                        };
                    }
                })),
            },
            total: basketSession.total,
            paymentStatus: basketSession.paymentStatus,
            deliveryCost: basketSession.deliveryCost,
            deliveryDay: basketSession.deliveryDay,
            delivered: basketSession.delivered,
            retrieved: basketSession.retrieved,
            rawCustomer: basketSession.rawCustomer || undefined,
            deliveryMessage: basketSession.deliveryMessage,
            walletAmountUsed: basketSession.walletAmountUsed || 0,
        };

        // Ajouter la relation address seulement si elle existe
        if (basketSession.address && addressToConnect) {
            createData.address = {
                connect: { id: addressToConnect.id }
            };
        }

        const basketSessionCreated = await this.prisma.basketSession.create({
            data: createData,
            include: {
                items: true,
                address: true,
            },
        });

        // Si nous devons créer une nouvelle adresse, la créer séparément
        if (basketSession.address && !addressToConnect) {
            // Vérification finale pour éviter les doublons lors de soumissions multiples rapides
            const existingAddress = await this.prisma.address.findFirst({
                where: {
                    ...(isAuthenticatedCustomer ? { customerId: basketSession.customerId } : { customerId: null }),
                    postalCode: basketSession.address.postalCode,
                    address: basketSession.address.address,
                    city: basketSession.address.city,
                    country: basketSession.address.country,
                    type: basketSession.address.type,
                },
            });

            if (existingAddress) {
                // Utiliser l'adresse existante trouvée
                addressToConnect = existingAddress;
                
                // Mettre à jour le basketSession avec l'ID de l'adresse existante
                await this.prisma.basketSession.update({
                    where: { id: basketSessionCreated.id },
                    data: { addressId: existingAddress.id },
                });
            } else {
                // Créer une nouvelle adresse seulement si aucune n'existe
                const newAddress = await this.prisma.address.create({
                    data: {
                        postalCode: basketSession.address.postalCode,
                        address: basketSession.address.address,
                        city: basketSession.address.city,
                        country: basketSession.address.country,
                        name: basketSession.address.name || null,
                        type: basketSession.address.type,
                        // Connecter l'adresse au client seulement s'il est authentifié
                        ...(isAuthenticatedCustomer ? { customer: { connect: { id: basketSession.customerId } } } : {}),
                    },
                });

                addressToConnect = newAddress;

                // Mettre à jour le basketSession avec l'ID de la nouvelle adresse
                await this.prisma.basketSession.update({
                    where: { id: basketSessionCreated.id },
                    data: { addressId: newAddress.id },
                });
            }

            // Récupérer le basketSession mis à jour avec l'adresse
            const updatedBasketSession = await this.prisma.basketSession.findUnique({
                where: { id: basketSessionCreated.id },
                include: {
                    items: true,
                    address: true,
                },
            });

            if (!updatedBasketSession) {
                throw new Error('Failed to retrieve updated basket session');
            }

            // Mapper les données Prisma vers l'interface IBasket
            const basketData: IBasket = {
                id: updatedBasketSession.id,
                orderIndex: updatedBasketSession.orderIndex,
                createdAt: updatedBasketSession.createdAt,
                customerId: updatedBasketSession.customerId,
                items: updatedBasketSession.items.map((item) => ({
                    id: item.id,
                    productId: item.productId,
                    productVariantId: item.productVariantId,
                    quantity: item.quantity,
                    name: item.name,
                    price: item.price,
                    description: item.description,
                    refundStatus: item.refundStatus as 'refunded' | 'none' | undefined,
                })),
                total: updatedBasketSession.total,
                paymentStatus: updatedBasketSession.paymentStatus,
                address: updatedBasketSession.address
                    ? {
                          id: updatedBasketSession.address.id,
                          postalCode: updatedBasketSession.address.postalCode,
                          address: updatedBasketSession.address.address,
                          city: updatedBasketSession.address.city,
                          country: updatedBasketSession.address.country,
                          name: updatedBasketSession.address.name,
                          type: updatedBasketSession.address.type,
                      }
                    : null,
                deliveryCost: updatedBasketSession.deliveryCost,
                deliveryDay: updatedBasketSession.deliveryDay,
                delivered: updatedBasketSession.delivered,
                retrieved: updatedBasketSession.retrieved,
                rawCustomer: updatedBasketSession.rawCustomer as RawCustomer | null,
                deliveryMessage: updatedBasketSession.deliveryMessage,
                walletAmountUsed: updatedBasketSession.walletAmountUsed,
            };

            return new Basket(basketData);
        }

        // Mapper les données Prisma vers l'interface IBasket
        const basketData: IBasket = {
            id: basketSessionCreated.id,
            orderIndex: basketSessionCreated.orderIndex,
            createdAt: basketSessionCreated.createdAt,
            customerId: basketSessionCreated.customerId,
            items: basketSessionCreated.items.map((item) => ({
                id: item.id,
                productId: item.productId,
                productVariantId: item.productVariantId,
                quantity: item.quantity,
                name: item.name,
                price: item.price,
                description: item.description,
                refundStatus: item.refundStatus as 'refunded' | 'none' | undefined,
            })),
            total: basketSessionCreated.total,
            paymentStatus: basketSessionCreated.paymentStatus,
            address: basketSessionCreated.address
                ? {
                      id: basketSessionCreated.address.id,
                      postalCode: basketSessionCreated.address.postalCode,
                      address: basketSessionCreated.address.address,
                      city: basketSessionCreated.address.city,
                      country: basketSessionCreated.address.country,
                      name: basketSessionCreated.address.name,
                      type: basketSessionCreated.address.type,
                  }
                : null,
            deliveryCost: basketSessionCreated.deliveryCost,
            deliveryDay: basketSessionCreated.deliveryDay,
            delivered: basketSessionCreated.delivered,
            retrieved: basketSessionCreated.retrieved,
            rawCustomer: basketSessionCreated.rawCustomer as RawCustomer | null,
            deliveryMessage: basketSessionCreated.deliveryMessage,
            walletAmountUsed: basketSessionCreated.walletAmountUsed,
        };

        return new Basket(basketData);
    };

    public getBasketSessions = async (_filters?: {
        afterDate?: string;
        paid?: boolean;
        notDelivered?: boolean;
        authenticatedCustomers?: boolean;
    }): Promise<IBasketWithCheckoutSessions[]> => {
        const filters = _filters || {};

        // Construire les conditions de filtrage pour les clients authentifiés
        let customerFilter = {};
        if (filters.authenticatedCustomers === true) {
            // Clients authentifiés : on peut utiliser une approche différente
            // Par exemple, vérifier si le client a un email valide (non temporaire)
            customerFilter = {
                customer: {
                    email: {
                        not: {
                            startsWith: 'temp_',
                        },
                    },
                },
            };
        } else if (filters.authenticatedCustomers === false) {
            // Clients sans compte : ceux avec un email temporaire
            customerFilter = {
                customer: {
                    email: {
                        startsWith: 'temp_',
                    },
                },
            };
        }

        const basketSessions = await this.prisma.basketSession.findMany({
            where: {
                createdAt: filters.afterDate ? { gt: filters.afterDate } : Prisma.skip,
                paymentStatus: filters.paid ? 'paid' : Prisma.skip,
                delivered: filters.notDelivered ? null : Prisma.skip,
                ...customerFilter,
            },
            orderBy: {
                orderIndex: 'asc',
            },
            include: {
                items: true,
                address: true,
                checkoutSession: true,
                customer: true,
            },
        });
        return basketSessions.map(
            (basketSession) =>
                new IBasketWithCheckoutSessions(
                    new Basket(basketSession as IBasket),
                    basketSession.checkoutSession.map((checkoutSession) => new CheckoutSession(checkoutSession)),
                    new Customer(basketSession.customer),
                ),
        );
    };

    public getBasketSessionById = async (basketId: string): Promise<IBasketWithCheckoutSessions> => {
        const basketSession = await this.prisma.basketSession.findUniqueOrThrow({
            where: { id: basketId },
            include: {
                items: true,
                address: true,
                checkoutSession: true,
                customer: true,
            },
        });
        return new IBasketWithCheckoutSessions(
            new Basket(basketSession as IBasket),
            basketSession.checkoutSession.map((checkoutSession) => new CheckoutSession(checkoutSession)),
            new Customer(basketSession.customer),
        );
    };

    public getCheckoutSessionById = async (checkoutSessionId: string): Promise<CheckoutSessionWithBasket> => {
        const data = await this.prisma.checkoutSession.findUniqueOrThrow({
            where: { id: checkoutSessionId },
            include: {
                basketSession: {
                    include: { items: true, address: true },
                },
            },
        });
        const { basketSession, ...checkoutSession } = data;
        return {
            checkoutSession: new CheckoutSession(checkoutSession),
            basketSession: new Basket(basketSession as IBasket),
        };
    };

    public saveCheckoutSession = async ({
        ...checkoutSession
    }: CheckoutSession): Promise<CheckoutSession> => {
        // Convertir successPayload en JSON compatible avec Prisma
        const prismaData = {
            ...checkoutSession,
            successPayload: checkoutSession.successPayload ? JSON.parse(JSON.stringify(checkoutSession.successPayload)) : null
        };
        
        const checkoutSessionSaved = await this.prisma.checkoutSession.upsert({
            where: { id: checkoutSession.id },
            update: prismaData,
            create: prismaData,
            select: {
                id: true,
                basketSessionId: true,
                paymentAmount: true,
                paymentStatus: true,
                createdAt: true,
                updatedAt: true,
                successPayload: true,
            },
        });
        return new CheckoutSession(checkoutSessionSaved);
    };

    public markCheckoutSessionAsPaid = async (checkoutSession: CheckoutSession, rawPayload: Prisma.JsonObject) => {
        await this.prisma.checkoutSession.update({
            where: { id: checkoutSession.id },
            data: {
                paymentStatus: 'paid' as PAYMENT_STATUSES,
                basketSession: {
                    update: {
                        paymentStatus: 'paid' as PAYMENT_STATUSES,
                    },
                },
                successPayload: rawPayload,
            },
        });
    };

    public setDeliveryDate = async (basketId: string, deliveryDate: string): Promise<Basket> => {
        const updatedBasket = await this.prisma.basketSession.update({
            where: { id: basketId },
            data: {
                delivered: deliveryDate,
            },
            include: {
                items: true,
                address: true,
            },
        });
        return new Basket(updatedBasket as IBasket);
    };

    public getBasketById = async (basketId: string): Promise<Basket> => {
        const basket = await this.prisma.basketSession.findUnique({
            where: { id: basketId },
            include: {
                items: true,
                address: true,
            },
        });
        if (!basket) {
            throw new Error(`Basket with id ${basketId} not found`);
        }
        return new Basket(basket as IBasket);
    };

    public updateBasketItemRefundStatus = async (
        basketItemId: string,
        refundStatus: 'refunded' | 'none',
    ): Promise<{ success: boolean; message?: string }> => {
        try {
            await this.prisma.basketSessionItem.update({
                where: { id: basketItemId },
                data: { refundStatus },
            });
            return { success: true };
        } catch (error) {
            return { success: false, message: (error as Error).message };
        }
    };

    public getBasketItemById = async (basketItemId: string) => {
        const basketItem = await this.prisma.basketSessionItem.findUnique({
            where: { id: basketItemId },
        });
        if (!basketItem) {
            throw new Error(`Basket item with id ${basketItemId} not found`);
        }
        return basketItem;
    };
}
