import { Notification, NotificationType, Prisma } from '@prisma/client';
import { BrevoEmailNotificationService } from './NotificationService/BrevoEmailNotificationService';
import { prisma } from '../prisma';
import {
    notificationHandlerFactory,
    CreateNotificationInput,
    NotificationHandlerContext,
} from './NotificationService/handlers';
import { NotificationConfigUtils } from '@/config/notifications/NotificationTypeConfig';

// Re-export pour compatibilité
export type { CreateNotificationInput } from './NotificationService/handlers';

export interface NotificationWithReadStatus extends Notification {
    isRead: boolean;
}

export class NotificationService {
    private emailService: BrevoEmailNotificationService;

    constructor() {
        this.emailService = new BrevoEmailNotificationService();
    }

    /**
     * Créer une nouvelle notification en utilisant le système de handlers
     */
    async createNotification(input: CreateNotificationInput): Promise<Notification> {
        try {
            // Valider le type de notification
            if (!notificationHandlerFactory.hasHandler(input.type)) {
                throw new Error(`Type de notification non supporté: ${input.type}`);
            }

            // Récupérer le handler approprié
            const handler = notificationHandlerFactory.getHandler(input.type);

            // Préparer le contexte pour le handler
            const context: NotificationHandlerContext = {
                prisma,
                emailService: this.emailService,
            };

            // Exécuter le handler
            const result = await handler.handle(input, context);

            // Vérifier les erreurs
            if (result.errors.length > 0) {
                console.error('Erreurs lors de la création de la notification:', result.errors);
                throw new Error(`Erreurs de création: ${result.errors.join(', ')}`);
            }

            // Vérifier que la notification a été créée
            if (!result.notification) {
                throw new Error("La notification n'a pas pu être créée");
            }

            // Post-traitement
            if (handler.postProcess) {
                await handler.postProcess(result, context);
            }

            return result.notification;
        } catch (error) {
            console.error('Erreur dans createNotification:', error);
            throw error;
        }
    }

    /**
     * Récupérer les notifications actives pour un utilisateur
     */
    async getNotificationsForUser(userId: string): Promise<NotificationWithReadStatus[]> {
        const notifications = await prisma.notification.findMany({
            where: {
                AND: [
                    { isActive: true },
                    {
                        OR: [{ targetUsers: { has: userId } }, { targetUsers: { has: 'ALL' } }],
                    },
                    {
                        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
                    },
                ],
            },
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                market: true,
            },
        });

        return notifications.map((notification: any) => ({
            ...notification,
            isRead: notification.readBy.includes(userId),
        }));
    }

    /**
     * Marquer une notification comme lue par un utilisateur
     */
    async markAsRead(notificationId: string, userId: string): Promise<void> {
        const notification = await prisma.notification.findUnique({
            where: { id: notificationId },
        });

        if (!notification || notification.readBy.includes(userId)) {
            return;
        }

        await prisma.notification.update({
            where: { id: notificationId },
            data: {
                readBy: {
                    push: userId,
                },
            },
        });
    }

    /**
     * Récupérer les notifications non lues pour un utilisateur
     */
    async getUnreadNotificationsForUser(userId: string): Promise<NotificationWithReadStatus[]> {
        const notifications = await this.getNotificationsForUser(userId);
        return notifications.filter((notification) => !notification.isRead);
    }

    /**
     * Obtenir les types de notifications supportés
     */
    getSupportedNotificationTypes(): NotificationType[] {
        return notificationHandlerFactory.getSupportedTypes();
    }

    /**
     * Vérifier si un type de notification est supporté
     */
    isNotificationTypeSupported(type: NotificationType): boolean {
        return notificationHandlerFactory.hasHandler(type);
    }

    /**
     * Obtenir la configuration d'un type de notification
     */
    getNotificationTypeConfig(type: NotificationType) {
        return NotificationConfigUtils.getConfig(type);
    }

    /**
     * Désactiver une notification
     */
    async deactivateNotification(notificationId: string): Promise<void> {
        await prisma.notification.update({
            where: { id: notificationId },
            data: { isActive: false },
        });
    }
}
