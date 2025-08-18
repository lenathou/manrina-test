import { Notification, NotificationType, Prisma } from '@prisma/client';
import { BrevoEmailNotificationService } from './NotificationService/BrevoEmailNotificationService';
import { prisma } from '../prisma';

export interface CreateNotificationInput {
  type: NotificationType;
  title: string;
  message: string;
  marketId?: string;
  targetUsers: string[]; // Array of user IDs or ["ALL"] for all users
  expiresAt?: Date;
}

export interface NotificationWithReadStatus extends Notification {
  isRead: boolean;
}

export class NotificationService {
  private emailService: BrevoEmailNotificationService;

  constructor() {
    this.emailService = new BrevoEmailNotificationService();
  }

  /**
   * Créer une nouvelle notification
   */
  async createNotification(input: CreateNotificationInput): Promise<Notification> {
    const notification = await prisma.notification.create({
      data: {
        type: input.type,
        title: input.title,
        message: input.message,
        marketId: input.marketId,
        targetUsers: input.targetUsers,
        expiresAt: input.expiresAt,
        readBy: [],
      },
    });

    // Si c'est une annulation de marché, envoyer des emails
    if (input.type === 'MARKET_CANCELLATION') {
      await this.sendCancellationEmails(notification);
    }

    return notification;
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
            OR: [
              { targetUsers: { has: userId } },
              { targetUsers: { has: "ALL" } },
            ],
          },
          {
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date() } },
            ],
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
    return notifications.filter(notification => !notification.isRead);
  }

  /**
   * Envoyer des emails de notification d'annulation
   */
  private async sendCancellationEmails(notification: Notification): Promise<void> {
    try {
      // Récupérer les emails des utilisateurs concernés
      let emails: string[] = [];

      if (notification.targetUsers.includes('ALL')) {
        // Récupérer tous les emails des clients et producteurs
        const [customers, growers] = await Promise.all([
          prisma.customer.findMany({ select: { email: true } }),
          prisma.grower.findMany({ select: { email: true } }),
        ]);
        
        emails = [
          ...customers.map(c => c.email),
          ...growers.map(g => g.email),
        ];
      } else {
        // Récupérer les emails des utilisateurs spécifiques
        const [customers, growers] = await Promise.all([
          prisma.customer.findMany({
            where: { id: { in: notification.targetUsers } },
            select: { email: true },
          }),
          prisma.grower.findMany({
            where: { id: { in: notification.targetUsers } },
            select: { email: true },
          }),
        ]);
        
        emails = [
          ...customers.map(c => c.email),
          ...growers.map(g => g.email),
        ];
      }

      // Envoyer les emails
      const emailPromises = emails.map(email =>
        this.emailService.sendEmail(
          email,
          notification.title,
          this.formatEmailContent(notification)
        )
      );

      await Promise.allSettled(emailPromises);
    } catch (error) {
      console.error('Erreur lors de l\'envoi des emails de notification:', error);
    }
  }

  /**
   * Formater le contenu de l'email
   */
  private formatEmailContent(notification: Notification): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #e74c3c;">${notification.title}</h2>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              ${notification.message.replace(/\n/g, '<br>')}
            </div>
            <p style="color: #666; font-size: 14px;">
              Cordialement,<br>
              L'équipe Manrina
            </p>
          </div>
        </body>
      </html>
    `;
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