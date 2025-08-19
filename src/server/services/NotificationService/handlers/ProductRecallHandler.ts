import { PrismaClient } from '@prisma/client';
import { BaseNotificationHandler } from './INotificationHandler';
import { CreateNotificationInput, NotificationHandlerContext, NotificationHandlerResult } from './INotificationHandler';
import { NotificationType } from '@prisma/client';
import { BrevoEmailNotificationService } from '../../BrevoEmailNotificationService';
import { NotificationConfigUtils } from '@/config/notifications/NotificationConfigUtils';

/**
 * Handler spécialisé pour les notifications de rappel de produit
 * Étend BaseNotificationHandler avec une logique métier spécifique
 */
export class ProductRecallHandler extends BaseNotificationHandler {
  readonly type = NotificationType.PRODUCT_RECALL;
  protected readonly notificationType = NotificationType.PRODUCT_RECALL;

  /**
   * Valide les données d'entrée spécifiques au rappel de produit
   */
  async validateInput(input: CreateNotificationInput): Promise<string[]> {
    const errors = await super.validateInput(input);

    // Validation du message (obligatoire et détaillé)
    if (!input.message || input.message.trim().length < 50) {
      errors.push('Le message doit contenir au moins 50 caractères pour expliquer le rappel');
    }

    return errors;
  }

  async prepareNotificationData(
    input: CreateNotificationInput
  ): Promise<any> {
    return {
      type: this.type,
      title: input.title,
      message: input.message,
      metadata: input.metadata,
      createdAt: new Date(),
    };
  }

  async getEmailRecipients(
    input: CreateNotificationInput,
    context: NotificationHandlerContext
  ): Promise<string[]> {
    const productId = (input.metadata as any)?.productId;
    if (!productId) return [];

    const product = await context.prisma.product.findUnique({
      where: { id: productId },
      include: {
        grower: { select: { email: true } },
        orders: {
          include: {
            customer: { select: { email: true } }
          }
        }
      }
    });

    if (!product) return [];

    const emails = [product.grower.email];
    product.orders.forEach((order: any) => {
      if (order.customer?.email) {
        emails.push(order.customer.email);
      }
    });

    return Array.from(new Set(emails));
  }

  async sendEmails(
    input: CreateNotificationInput,
    recipients: string[],
    context: NotificationHandlerContext
  ): Promise<number> {
    let emailsSent = 0;
    const config = NotificationConfigUtils.getConfig(this.type);

    for (const email of recipients) {
      try {
        await context.emailService.sendEmail(
          email,
          input.title,
          input.message
        );
        emailsSent++;
      } catch (error) {
        console.error(`Erreur envoi email à ${email}:`, error);
      }
    }

    return emailsSent;
  }

  /**
   * Traite une notification de rappel de produit
   */
  async handle(
    input: CreateNotificationInput,
    context: NotificationHandlerContext
  ): Promise<NotificationHandlerResult> {
    try {
      // Validation des données
      const validationErrors = await this.validateInput(input);
      if (validationErrors.length > 0) {
        return {
          notification: null,
          emailsSent: 0,
          errors: validationErrors,
        };
      }

      // Récupération des informations du produit
      const product = await context.prisma.product.findUnique({
        where: { id: (input.metadata as any)?.productId! },
        include: {
          grower: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!product) {
        return {
          notification: null,
          emailsSent: 0,
          errors: ['Produit non trouvé'],
        };
      }

      // Création de la notification
      const notification = await context.prisma.notification.create({
        data: {
          type: this.notificationType,
          title: input.title,
          message: input.message,
          metadata: {
             productName: product.name,
             growerName: product.grower.name,
             ...(typeof input.metadata === 'object' && input.metadata !== null ? input.metadata : {})
           },
          createdAt: new Date(),
        },
      });

      // Envoi des emails si le service est disponible
      if (context.emailService) {
        const recipients = await this.getEmailRecipients(input, context);
        await this.sendEmails(input, recipients, context);
      }

      return {
        notification,
        emailsSent: 0,
        errors: [],
        metadata: {
          productId: product.id,
          productName: product.name,
          growerNotified: true,
        },
      };
    } catch (error) {
      console.error('Erreur lors du traitement du rappel de produit:', error);
      return {
        notification: null,
        emailsSent: 0,
        errors: ['Erreur interne lors du traitement de la notification'],
      };
    }
  }

  /**
   * Récupère les destinataires des emails pour le rappel de produit
   */


  /**
   * Construit le contenu HTML de l'email
   */
  private buildEmailContent(
    input: CreateNotificationInput,
    recipient: { email: string; name: string },
    product: any
  ): { html: string; text: string } {
    const { generateProductRecallEmailHTML } = require('@/templates/email');
    
    const emailData = {
      input,
      recipient: {
        email: recipient?.email || '',
        name: recipient?.name || 'Cher client'
      },
      product: {
        id: product?.id || 'Non spécifiée',
        name: product?.name || 'Produit non spécifié',
        grower: {
          name: product?.grower?.name || 'Non spécifié'
        }
      }
    };
    
    const html = generateProductRecallEmailHTML(emailData);
    
    const text = `
      RAPPEL DE PRODUIT URGENT
      
      Bonjour ${recipient.name},
      
      ${input.title}
      
      Produit concerné :
      - Nom : ${product.name}
      - Producteur : ${product.grower.name}
      
      Détails du rappel :
      ${input.message}
      
      ⚠️ Action requise : Si vous avez acheté ce produit, veuillez suivre les instructions ci-dessus.
      
      Cordialement,
      L'équipe Manrina
    `;

    return { html, text };
  }

  /**
   * Actions post-traitement spécifiques au rappel de produit
   */
  async postProcess(
    result: NotificationHandlerResult,
    context: NotificationHandlerContext
  ): Promise<void> {
    if (result.notification && result.errors.length === 0) {
      const metadata = result.notification.metadata as any;
      const productId = metadata?.productId;
      
      console.log(`Rappel de produit traité avec succès:`, {
        notificationId: result.notification.id,
        productId: productId,
        timestamp: new Date().toISOString(),
      });

      // Marquer le produit comme rappelé dans la base de données
      if (productId) {
        await context.prisma.product.update({
          where: { id: productId as string },
          data: {
            // Ajouter un champ 'recalled' si nécessaire dans le schéma
            // recalled: true,
            // recallDate: new Date(),
          },
        });
      }

      // Potentiellement notifier les autorités compétentes
      // await this.notifyAuthorities(result);
    }
  }
}