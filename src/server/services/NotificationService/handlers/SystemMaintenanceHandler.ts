import { NotificationType, Prisma } from '@prisma/client';
import {
  BaseNotificationHandler,
  CreateNotificationInput,
  NotificationHandlerContext,
  NotificationHandlerResult
} from './INotificationHandler';
import { NotificationConfigUtils } from '@/config/notifications/NotificationConfigUtils';

/**
 * Handler spécialisé pour les notifications de maintenance système
 * Gère les notifications d'information sur les maintenances planifiées
 */
export class SystemMaintenanceHandler extends BaseNotificationHandler {
  readonly type = NotificationType.SYSTEM_MAINTENANCE;

  async validateInput(input: CreateNotificationInput): Promise<string[]> {
    const baseErrors = await super.validateInput(input);
    const errors = [...baseErrors];

    // Validation spécifique pour les maintenances système
    if (input.expiresAt && input.expiresAt <= new Date()) {
      errors.push('La date d\'expiration d\'une maintenance doit être dans le futur');
    }

    return errors;
  }

  async handle(
    input: CreateNotificationInput,
    context: NotificationHandlerContext
  ): Promise<NotificationHandlerResult> {
    const result: NotificationHandlerResult = {
      notification: null,
      emailsSent: 0,
      errors: []
    };

    try {
      // 1. Valider les données d'entrée
      const validationErrors = await this.validateInput(input);
      if (validationErrors.length > 0) {
        result.errors = validationErrors;
        throw new Error(`Erreurs de validation: ${validationErrors.join(', ')}`);
      }

      // 2. Préparer les données de notification avec expiration automatique
      const notificationData = await this.prepareNotificationData(input);
      
      // Si pas d'expiration définie, définir une expiration par défaut (7 jours)
      if (!notificationData.expiresAt) {
        const defaultExpiration = new Date();
        defaultExpiration.setDate(defaultExpiration.getDate() + 7);
        notificationData.expiresAt = defaultExpiration;
      }

      // 3. Créer la notification en base
      result.notification = await context.prisma.notification.create({
        data: notificationData
      });

      // 4. Récupérer les destinataires des emails si nécessaire
      const emailConfig = NotificationConfigUtils.getEmailConfig(this.type);
      if (emailConfig.autoSendEmail) {
        const emailRecipients = await this.getEmailRecipients(input, context);
        
        if (emailRecipients.length > 0) {
          result.emailsSent = await this.sendEmails(input, emailRecipients, context);
        }
      }

      // 5. Métadonnées de résultat
      result.metadata = {
        maintenanceType: 'system',
        emailsEnabled: emailConfig.autoSendEmail,
        expiresAt: result.notification.expiresAt?.toISOString(),
        targetAudience: input.targetUsers.includes('ALL') ? 'all' : 'specific'
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      result.errors.push(errorMessage);
      console.error('Erreur dans SystemMaintenanceHandler:', error);
    }

    return result;
  }

  async getEmailRecipients(
    input: CreateNotificationInput,
    context: NotificationHandlerContext
  ): Promise<string[]> {
    try {
      let whereClause: any = {
        email: {
          not: null
        }
      };

      // Si des utilisateurs spécifiques sont ciblés
      if (!input.targetUsers.includes('ALL')) {
        whereClause.id = {
          in: input.targetUsers
        };
      } else {
        // Pour les maintenances système, cibler principalement les utilisateurs actifs
        // (ayant une activité récente)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        whereClause.OR = [
          {
            lastLoginAt: {
              gte: thirtyDaysAgo
            }
          },
          {
            createdAt: {
              gte: thirtyDaysAgo
            }
          }
        ];
      }

      // Récupérer les emails des utilisateurs ciblés
      const users = await context.prisma.user.findMany({
        where: whereClause,
        select: {
          email: true
        }
      });

      // Extraire les emails valides
      const emails = users
        .map((user: any) => user.email)
        .filter((email: string | undefined): email is string => {
          return typeof email === 'string' && email.length > 0;
        });

      return emails;

    } catch (error) {
      console.error('Erreur lors de la récupération des destinataires:', error);
      return [];
    }
  }

  async sendEmails(
    input: CreateNotificationInput,
    recipients: string[],
    context: NotificationHandlerContext
  ): Promise<number> {
    if (recipients.length === 0) {
      return 0;
    }

    const emailConfig = NotificationConfigUtils.getEmailConfig(this.type);
    let emailsSent = 0;

    try {
      // Préparer le contenu de l'email
      const emailSubject = emailConfig.defaultSubject;
      const emailContent = this.buildEmailContent(input);

      // Envoyer l'email à chaque destinataire
      for (const email of recipients) {
        try {
          await context.emailService.sendEmail(
            email,
            emailSubject,
            emailContent
          );
          emailsSent++;
        } catch (emailError) {
          console.error(`Erreur envoi email à ${email}:`, emailError);
        }
      }

    } catch (error) {
      console.error('Erreur lors de l\'envoi des emails:', error);
    }

    return emailsSent;
  }

  /**
   * Construit le contenu HTML de l'email
   */
  private buildEmailContent(input: CreateNotificationInput): string {
    const { generateSystemMaintenanceEmailHTML } = require('@/templates/email');
    return generateSystemMaintenanceEmailHTML(input);
  }

  /**
   * Construit le contenu texte de l'email (fallback)
   */
  private buildTextContent(input: CreateNotificationInput): string {
    const maintenanceDate = input.expiresAt
      ? new Date(input.expiresAt).toLocaleDateString('fr-FR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : 'Date à déterminer';

    return `
${input.title}

Bonjour,

Information importante :
${input.message}

${input.expiresAt ? `Période concernée : ${maintenanceDate}\n` : ''}
Nous nous excusons pour la gêne occasionnée et vous remercions de votre compréhension.

L'équipe technique Manrina
Votre marché local de confiance
    `.trim();
  }

  async postProcess(
    result: NotificationHandlerResult,
    context: NotificationHandlerContext
  ): Promise<void> {
    // Actions post-traitement spécifiques aux maintenances système
    if (result.notification) {
      console.log(
        `Notification de maintenance système créée (ID: ${result.notification.id}) - ` +
        `${result.emailsSent} emails envoyés - ` +
        `Expire le: ${result.notification.expiresAt?.toISOString()}`
      );
    }

    // Ici on pourrait ajouter d'autres actions comme :
    // - Programmation de rappels
    // - Mise à jour du statut système
    // - Notifications aux administrateurs
    // - Logs d'audit
    // - etc.
  }
}