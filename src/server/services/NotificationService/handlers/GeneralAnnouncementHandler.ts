import { NotificationType, Prisma } from '@prisma/client';
import {
    BaseNotificationHandler,
    CreateNotificationInput,
    NotificationHandlerContext,
    NotificationHandlerResult,
} from './INotificationHandler';
import { NotificationConfigUtils } from '@/config/notifications/NotificationConfigUtils';

/**
 * Handler spécialisé pour les annonces générales
 * Gère les notifications d'information générale pour tous les utilisateurs
 */
export class GeneralAnnouncementHandler extends BaseNotificationHandler {
    readonly type = NotificationType.GENERAL_ANNOUNCEMENT;

    async validateInput(input: CreateNotificationInput): Promise<string[]> {
        const baseErrors = await super.validateInput(input);
        const errors = [...baseErrors];

        // Validation spécifique pour les annonces générales
        if (input.message && input.message.length > 1000) {
            errors.push("Le message d'une annonce générale ne peut pas dépasser 1000 caractères");
        }

        return errors;
    }

    async handle(
        input: CreateNotificationInput,
        context: NotificationHandlerContext,
    ): Promise<NotificationHandlerResult> {
        const result: NotificationHandlerResult = {
            notification: null,
            emailsSent: 0,
            errors: [],
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
                data: notificationData,
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
                announcementType: 'general',
                emailsEnabled: emailConfig.autoSendEmail,
                targetAudience: input.targetUsers.includes('ALL') ? 'all' : 'specific',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
            result.errors.push(errorMessage);
            console.error('Erreur dans GeneralAnnouncementHandler:', error);
        }

        return result;
    }

    async getEmailRecipients(input: CreateNotificationInput, context: NotificationHandlerContext): Promise<string[]> {
        try {
            let whereClause: any = {
                email: {
                    not: null,
                },
            };

            // Si des utilisateurs spécifiques sont ciblés
            if (!input.targetUsers.includes('ALL')) {
                whereClause.id = {
                    in: input.targetUsers,
                };
            }

            // Récupérer les emails des utilisateurs ciblés
            const users = await context.prisma.user.findMany({
                where: whereClause,
                select: {
                    email: true,
                },
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
        context: NotificationHandlerContext,
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
                    await context.emailService.sendEmail(email, emailSubject, emailContent);
                    emailsSent++;
                } catch (emailError) {
                    console.error(`Erreur envoi email à ${email}:`, emailError);
                }
            }
        } catch (error) {
            console.error("Erreur lors de l'envoi des emails:", error);
        }

        return emailsSent;
    }

    /**
     * Construit le contenu HTML de l'email
     */
    private buildEmailContent(input: CreateNotificationInput): string {
        const { generateGeneralAnnouncementEmailHTML } = require('@/templates/email');
        return generateGeneralAnnouncementEmailHTML(input);
    }

    /**
     * Construit le contenu texte de l'email (fallback)
     */
    private buildTextContent(input: CreateNotificationInput): string {
        return `
${input.title}

Bonjour,

${input.message}

Merci de votre attention.

L'équipe Manrina
Votre marché local de confiance
    `.trim();
    }

    async postProcess(result: NotificationHandlerResult, context: NotificationHandlerContext): Promise<void> {
        // Actions post-traitement spécifiques aux annonces générales
        if (result.notification) {
            console.log(
                `Annonce générale créée (ID: ${result.notification.id}) - ` + `${result.emailsSent} emails envoyés`,
            );
        }

        // Ici on pourrait ajouter d'autres actions comme :
        // - Logs d'audit
        // - Statistiques d'engagement
        // - Notifications push
        // - etc.
    }
}
