import { NotificationType, Prisma } from '@prisma/client';
import {
  BaseNotificationHandler,
  CreateNotificationInput,
  NotificationHandlerContext,
  NotificationHandlerResult
} from './INotificationHandler';
import { NotificationConfigUtils } from '@/config/notifications/NotificationConfigUtils';

/**
 * Handler spécialisé pour les notifications d'annulation de marché
 * Gère l'envoi d'emails aux clients ayant des commandes pour le marché annulé
 */
export class MarketCancellationHandler extends BaseNotificationHandler {
  readonly type = NotificationType.MARKET_CANCELLATION;

  async validateInput(input: CreateNotificationInput): Promise<string[]> {
    const baseErrors = await super.validateInput(input);
    const errors = [...baseErrors];

    // Validation spécifique pour l'annulation de marché
    if (!input.marketId) {
      errors.push('L\'ID du marché est requis pour une annulation de marché');
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

      // 2. Préparer les données de notification
      const notificationData = await this.prepareNotificationData(input);

      // 3. Créer la notification en base
      result.notification = await context.prisma.notification.create({
        data: notificationData
      });

      // 4. Récupérer les destinataires des emails
      const emailRecipients = await this.getEmailRecipients(input, context);

      // 5. Envoyer les emails si configuré
      const emailConfig = NotificationConfigUtils.getEmailConfig(this.type);
      if (emailConfig.autoSendEmail && emailRecipients.length > 0) {
        result.emailsSent = await this.sendEmails(input, emailRecipients, context);
      }

      // 6. Métadonnées de résultat
      result.metadata = {
        marketId: input.marketId,
        recipientsCount: emailRecipients.length,
        emailsEnabled: emailConfig.autoSendEmail
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      result.errors.push(errorMessage);
      console.error('Erreur dans MarketCancellationHandler:', error);
    }

    return result;
  }

  async getEmailRecipients(
    input: CreateNotificationInput,
    context: NotificationHandlerContext
  ): Promise<string[]> {
    if (!input.marketId) {
      return [];
    }

    try {
      // Récupérer tous les clients ayant des commandes pour ce marché
      const basketSessions = await context.prisma.basketSession.findMany({
        where: {
          marketSessionId: input.marketId,
          paymentStatus: 'paid'
        },
        include: {
          customer: {
            select: {
              email: true
            }
          }
        }
      });

      // Extraire les emails uniques
      const emails = basketSessions
        .map((session: any) => session.customer?.email)
        .filter((email: string | undefined): email is string => {
          return typeof email === 'string' && email.length > 0;
        });

      // Supprimer les doublons
      return [...new Set(emails)] as string[];

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
      // Récupérer les détails du marché pour l'email
      const marketSession = input.marketId
        ? await context.prisma.marketSession.findUnique({
            where: { id: input.marketId },
            select: {
              name: true,
              date: true,
              startTime: true,
              endTime: true
            }
          })
        : null;

      // Préparer le contenu de l'email
      const emailSubject = emailConfig.defaultSubject;
      const emailContent = this.buildEmailContent(input, marketSession);

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
  private buildEmailContent(input: CreateNotificationInput, marketSession: any): string {
    const { generateMarketCancellationEmailHTML } = require('@/templates/email');
    const marketData = marketSession ? {
      name: marketSession.name || 'Marché',
      date: marketSession.date || 'Date non spécifiée'
    } : undefined;
    
    return generateMarketCancellationEmailHTML(input, marketData);
  }

  /**
   * Construit le contenu texte de l'email (fallback)
   */
  private buildTextContent(input: CreateNotificationInput, marketSession: any): string {
    const marketName = marketSession?.name || 'Marché';
    const marketDate = marketSession?.date
      ? new Date(marketSession.date).toLocaleDateString('fr-FR')
      : 'Date non spécifiée';

    return `
${input.title}

Bonjour,

${input.message}

Détails du marché :
- Nom : ${marketName}
- Date : ${marketDate}

Nous nous excusons pour la gêne occasionnée et vous remercions de votre compréhension.

L'équipe Manrina
Votre marché local de confiance
    `.trim();
  }

  async postProcess(
    result: NotificationHandlerResult,
    context: NotificationHandlerContext
  ): Promise<void> {
    // Actions post-traitement spécifiques aux annulations de marché
    if (result.notification && result.emailsSent > 0) {
      console.log(
        `Notification d'annulation de marché créée (ID: ${result.notification.id}) - ` +
        `${result.emailsSent} emails envoyés`
      );
    }

    // Ici on pourrait ajouter d'autres actions comme :
    // - Mise à jour du statut du marché
    // - Notification aux producteurs
    // - Logs d'audit
    // - etc.
  }
}