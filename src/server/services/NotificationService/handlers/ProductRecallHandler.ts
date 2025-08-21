import { Product, Grower, Prisma } from '@prisma/client';
import { BaseNotificationHandler } from './INotificationHandler';
import { CreateNotificationInput, NotificationHandlerContext, NotificationHandlerResult } from './INotificationHandler';
import { NotificationType } from '@prisma/client';

type ProductRecallMetadata = {
    productId: string;
    productName?: string;
    growerName?: string;
    [key: string]: unknown;
};

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

    async prepareNotificationData(input: CreateNotificationInput): Promise<Prisma.NotificationCreateInput> {
        return {
            type: this.type,
            title: input.title,
            message: input.message,
            targetUsers: input.targetUsers || [],
            expiresAt: input.expiresAt,
        };
    }

    async getEmailRecipients(input: CreateNotificationInput, context: NotificationHandlerContext): Promise<string[]> {
        const metadata = input.metadata as ProductRecallMetadata;
        const productId = metadata?.productId;
        if (!productId) return [];

        const product = await context.prisma.product.findUnique({
            where: { id: productId },
            include: {
                growers: {
                    include: {
                        grower: { select: { email: true } }
                    }
                },
                basketSessionItem: {
                    include: {
                        basketSession: {
                            include: {
                                customer: { select: { email: true } }
                            }
                        }
                    }
                }
            },
        });

        if (!product) return [];

        const emails: string[] = [];
        
        // Ajouter les emails des producteurs
        product.growers.forEach((growerProduct: { grower: { email: string } }) => {
            if (growerProduct.grower.email) {
                emails.push(growerProduct.grower.email);
            }
        });
        
        // Ajouter les emails des clients qui ont commandé ce produit
        product.basketSessionItem.forEach((item: { basketSession: { customer: { email: string } | null } }) => {
            if (item.basketSession.customer?.email) {
                emails.push(item.basketSession.customer.email);
            }
        });

        return Array.from(new Set(emails));
    }

    async sendEmails(
        input: CreateNotificationInput,
        recipients: string[],
        context: NotificationHandlerContext,
    ): Promise<number> {
        let emailsSent = 0;
        
        try {
            const product = await context.prisma.product.findFirst({
                where: { id: input.metadata?.productId },
                include: {
                    grower: {
                        select: { id: true, name: true, email: true },
                    },
                },
            });

            if (!product) {
                console.error('Product not found for recall notification');
                return 0;
            }

            for (const email of recipients) {
                try {
                    const { html } = this.buildEmailContent(
                        input,
                        { email, name: 'Client' },
                        product,
                    );

                    await context.emailService.sendEmail(
                         email,
                         input.title,
                         html
                     );

                    emailsSent++;
                } catch (emailError) {
                    console.error(`Failed to send email to ${email}:`, emailError);
                }
            }
        } catch (error) {
            console.error('Error in sendEmails:', error);
        }

        return emailsSent;
    }

    async sendEmailNotifications(input: CreateNotificationInput, context: NotificationHandlerContext): Promise<void> {
        const recipients = await this.getEmailRecipients(input, context);
        const metadata = input.metadata as ProductRecallMetadata;

        for (const email of recipients) {
            try {
                const htmlContent = `
                    <h2>Rappel de produit important</h2>
                    <p>${input.message}</p>
                    <p><strong>Produit concerné:</strong> ${metadata?.productName || 'Non spécifié'}</p>
                    <p><strong>Producteur:</strong> ${metadata?.growerName || 'Non spécifié'}</p>
                    <p>Veuillez prendre les mesures nécessaires concernant ce produit.</p>
                `;
                
                await context.emailService.sendEmail(
                    email,
                    `Rappel de produit: ${metadata?.productName || 'Produit'}`,
                    htmlContent
                );
            } catch (error) {
                console.error(`Erreur lors de l'envoi de l'email à ${email}:`, error);
            }
        }
    }

    /**
     * Traite une notification de rappel de produit
     */
    async handle(
        input: CreateNotificationInput,
        context: NotificationHandlerContext,
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
            const metadata = input.metadata as ProductRecallMetadata;
            if (!metadata?.productId) {
                throw new Error('Product ID is required in metadata');
            }
            const product = await context.prisma.product.findUnique({
                where: { id: metadata.productId },
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
                    targetUsers: input.targetUsers || [],
                    expiresAt: input.expiresAt,
                },
            });

            // Envoi des emails
            await this.sendEmailNotifications(input, context);

            return {
                notification,
                emailsSent: 0, // Will be updated by email service
                errors: [],
                metadata: {
                    productId: input.metadata?.productId,
                    timestamp: new Date().toISOString(),
                },
            };
        } catch (error) {
            console.error('Error in ProductRecallHandler:', error);
            return {
                notification: null,
                emailsSent: 0,
                errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
                metadata: {},
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
        product: Product & { grower: Pick<Grower, 'id' | 'name' | 'email'> },
    ): { html: string; text: string } {
        const html = `
            <h2>Rappel de produit important</h2>
            <p>Bonjour ${recipient?.name || 'Cher client'},</p>
            <p>${input.message}</p>
            <p><strong>Produit concerné:</strong> ${product?.name || 'Produit non spécifié'}</p>
            <p><strong>Producteur:</strong> ${product?.grower?.name || 'Non spécifié'}</p>
            <p>Veuillez prendre les mesures nécessaires concernant ce produit.</p>
        `;

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async postProcess(result: NotificationHandlerResult, context: NotificationHandlerContext): Promise<void> {
        if (result.notification && result.errors.length === 0) {
            console.log('Product recall notification processed successfully', {
                notificationId: result.notification.id,
                emailsSent: result.emailsSent,
                timestamp: new Date().toISOString(),
            });
        }
    }
}
