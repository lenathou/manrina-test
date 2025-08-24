import { PasswordService } from '@/server/services/PasswordService';
import { PrismaClient, DeliveryStatus } from '@prisma/client';
import { IDeliverer, IDelivery } from './IDeliverer';
import { IDelivererRepository } from './IDelivererRepository';
import { IBasket } from '../checkout/IBasket';

// Add this type definition near the top of the file
// Corriger le type pour utiliser l'enum DeliveryStatus
type DeliveryUpdateData = {
    status: DeliveryStatus;
    notes?: string;
    deliveredAt?: Date;
};

export class DelivererRepositoryPrismaImplementation implements IDelivererRepository {
    constructor(
        private prisma: PrismaClient,
        private passwordService: PasswordService,
    ) {}

    public async findByEmail(email: string): Promise<IDeliverer | undefined> {
        const deliverer = await this.prisma.deliverer.findUnique({
            where: { email },
        });
        
        if (!deliverer) return undefined;
        
        return {
            ...deliverer,
            phone: deliverer.phone ?? undefined,
            vehicle: deliverer.vehicle ?? undefined,
            zone: deliverer.zone ?? undefined,
        };
    }

    public async findByIdWithPassword(delivererId: string): Promise<IDeliverer | undefined> {
        const deliverer = await this.prisma.deliverer.findUnique({
            where: { id: delivererId },
        });
        
        if (!deliverer) return undefined;
        
        return {
            ...deliverer,
            phone: deliverer.phone ?? undefined,
            vehicle: deliverer.vehicle ?? undefined,
            zone: deliverer.zone ?? undefined,
        };
    }

    public async createDeliverer(data: Omit<IDeliverer, 'id' | 'createdAt' | 'updatedAt'>): Promise<IDeliverer> {
        const hashedPassword = await this.passwordService.hash(data.password);
        const created = await this.prisma.deliverer.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
                phone: data.phone ?? null,
                vehicle: data.vehicle ?? null,
                zone: data.zone ?? null,
                isActive: data.isActive,
            },
        });
        
        return {
            ...created,
            phone: created.phone ?? undefined,
            vehicle: created.vehicle ?? undefined,
            zone: created.zone ?? undefined,
        };
    }

    public async updateProfile(delivererId: string, data: Partial<IDeliverer>): Promise<IDeliverer> {
        const updated = await this.prisma.deliverer.update({
            where: { id: delivererId },
            data: {
                name: data.name,
                phone: data.phone ?? null,
                vehicle: data.vehicle ?? null,
                zone: data.zone ?? null,
                isActive: data.isActive,
            },
        });
        
        return {
            ...updated,
            phone: updated.phone ?? undefined,
            vehicle: updated.vehicle ?? undefined,
            zone: updated.zone ?? undefined,
        };
    }

    public async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
        return this.passwordService.verify(plainPassword, hashedPassword);
    }

    public async updatePassword(delivererId: string, newPassword: string): Promise<void> {
        const hashedPassword = await this.passwordService.hash(newPassword);
        await this.prisma.deliverer.update({
            where: { id: delivererId },
            data: { password: hashedPassword },
        });
    }


    public async listDeliverers(): Promise<IDeliverer[]> {
        const deliverers = await this.prisma.deliverer.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' },
        });
        
        return deliverers.map(deliverer => ({
            ...deliverer,
            phone: deliverer.phone ?? undefined,
            vehicle: deliverer.vehicle ?? undefined,
            zone: deliverer.zone ?? undefined,
        }));
    }

    public async getAssignedDeliveries(delivererId: string): Promise<IDelivery[]> {
        const deliveries = await this.prisma.delivery.findMany({
            where: { delivererId },
            include: {
                baskets: {
                    include: {
                        customer: true,
                        address: true,
                        items: {
                            include: {
                                product: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
        });
        
        return deliveries.map(delivery => ({
            ...delivery,
            delivererId: delivery.delivererId ?? undefined,
            scheduledAt: delivery.scheduledAt ?? undefined,
            deliveredAt: delivery.deliveredAt ?? undefined,
            notes: delivery.notes ?? undefined,
            baskets: delivery.baskets?.map(basket => ({
                id: basket.id,
                customerId: basket.customerId,
                status: basket.paymentStatus, // Map paymentStatus to status
                totalAmount: basket.total,
            })) ?? [],
        }));
    }

    public async assignDelivery(deliveryId: string, delivererId: string): Promise<void> {
        await this.prisma.delivery.update({
            where: { id: deliveryId },
            data: {
                delivererId,
                status: 'ASSIGNED',
            },
        });
    }

    public async assignBasketsToDelivery(basketIds: string[], delivererId: string): Promise<IDelivery> {
        // Créer une nouvelle livraison
        const delivery = await this.prisma.delivery.create({
            data: {
                delivererId,
                status: 'ASSIGNED',
            },
        });

        // Assigner les paniers à cette livraison
        await this.prisma.basketSession.updateMany({
            where: {
                id: { in: basketIds },
                deliveryId: null, // Seulement les paniers non assignés
            },
            data: {
                deliveryId: delivery.id,
            },
        });

        return {
            ...delivery,
            delivererId: delivery.delivererId ?? undefined,
            scheduledAt: delivery.scheduledAt ?? undefined,
            deliveredAt: delivery.deliveredAt ?? undefined,
            notes: delivery.notes ?? undefined,
        };
    }

    // Méthode pour obtenir les paniers non assignés
    public async getUnassignedBaskets(): Promise<IBasket[]> {
        const basketSessions = await this.prisma.basketSession.findMany({
            where: {
                deliveryId: null,
                paymentStatus: 'paid', // Seulement les paniers payés
            },
            include: {
                customer: true,
                address: true,
                items: true,
            },
            orderBy: { createdAt: 'asc' },
        });

        return basketSessions.map(basketSession => ({
            id: basketSession.id,
            orderIndex: basketSession.orderIndex,
            createdAt: basketSession.createdAt,
            customerId: basketSession.customerId,
            items: basketSession.items.map(item => ({
                 id: item.id,
                 productId: item.productId,
                 productVariantId: item.productVariantId,
                 quantity: item.quantity,
                 name: item.name,
                 price: item.price,
                 description: item.description,
                 refundStatus: item.refundStatus as 'refunded' | 'none' | undefined,
             })),
             total: basketSession.total,
            paymentStatus: basketSession.paymentStatus,
            address: basketSession.address ? {
                id: basketSession.address.id,
                postalCode: basketSession.address.postalCode,
                address: basketSession.address.address,
                city: basketSession.address.city,
                country: basketSession.address.country,
                name: basketSession.address.name,
                type: basketSession.address.type,
            } : null,
            deliveryCost: basketSession.deliveryCost,
            deliveryDay: basketSession.deliveryDay,
            delivered: basketSession.delivered,
            retrieved: basketSession.retrieved,
            rawCustomer: basketSession.customer ? {
                email: basketSession.customer.email,
                name: basketSession.customer.name,
                phone: basketSession.customer.phone,
            } : null,
            deliveryMessage: basketSession.deliveryMessage,
            walletAmountUsed: basketSession.walletAmountUsed || null,
        }));
    }

    public async updateDeliveryStatus(deliveryId: string, status: string, notes?: string): Promise<void> {
        const updateData: DeliveryUpdateData = { status: status as DeliveryStatus };
        if (notes) {
            updateData.notes = notes;
        }
        if (status === 'DELIVERED') {
            updateData.deliveredAt = new Date();
        }

        await this.prisma.delivery.update({
            where: { id: deliveryId },
            data: updateData,
        });
    }
}