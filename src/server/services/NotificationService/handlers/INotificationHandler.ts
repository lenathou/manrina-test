import { NotificationType, Prisma } from '@prisma/client';
import { IEmailNotificationService } from '../IEmailNotificationService';

/**
 * Interface pour les données d'entrée de création de notification
 */
export interface CreateNotificationInput {
    type: NotificationType;
    title: string;
    message: string;
    marketId?: string;
    targetUsers: string[]; // Array of user IDs or ["ALL"] for all users
    expiresAt?: Date;
    metadata?: Record<string, any>;
}

/**
 * Interface pour le contexte d'exécution des handlers
 */
export interface NotificationHandlerContext {
    /** Service email pour l'envoi d'emails */
    emailService: IEmailNotificationService;
    /** Client Prisma pour les opérations base de données */
    prisma: any; // Type sera affiné selon le contexte
    /** Utilisateur qui déclenche la notification (optionnel) */
    triggeredBy?: string;
    /** Métadonnées additionnelles */
    metadata?: Record<string, any>;
}

/**
 * Résultat de l'exécution d'un handler
 */
export interface NotificationHandlerResult {
    /** Notification créée */
    notification: any; // Type Prisma Notification
    /** Emails envoyés */
    emailsSent: number;
    /** Erreurs rencontrées */
    errors: string[];
    /** Métadonnées de résultat */
    metadata?: Record<string, any>;
}

/**
 * Interface principale pour les handlers de notifications
 * Implémente le pattern Strategy pour gérer différents types de notifications
 */
export interface INotificationHandler {
    /**
     * Type de notification géré par ce handler
     */
    readonly type: NotificationType;

    /**
     * Vérifie si ce handler peut traiter le type de notification donné
     */
    canHandle(type: NotificationType): boolean;

    /**
     * Valide les données d'entrée pour ce type de notification
     */
    validateInput(input: CreateNotificationInput): Promise<string[]>;

    /**
     * Traite la création de la notification
     */
    handle(input: CreateNotificationInput, context: NotificationHandlerContext): Promise<NotificationHandlerResult>;

    /**
     * Prépare les données de notification pour la base de données
     */
    prepareNotificationData(input: CreateNotificationInput): Promise<Prisma.NotificationCreateInput>;

    /**
     * Récupère les destinataires pour les emails
     */
    getEmailRecipients(input: CreateNotificationInput, context: NotificationHandlerContext): Promise<string[]>;

    /**
     * Envoie les emails de notification
     */
    sendEmails(
        input: CreateNotificationInput,
        recipients: string[],
        context: NotificationHandlerContext,
    ): Promise<number>;

    /**
     * Actions post-création (optionnel)
     */
    postProcess?(result: NotificationHandlerResult, context: NotificationHandlerContext): Promise<void>;
}

/**
 * Classe de base abstraite pour les handlers de notifications
 * Fournit une implémentation par défaut des méthodes communes
 */
export abstract class BaseNotificationHandler implements INotificationHandler {
    abstract readonly type: NotificationType;

    canHandle(type: NotificationType): boolean {
        return this.type === type;
    }

    async validateInput(input: CreateNotificationInput): Promise<string[]> {
        const errors: string[] = [];

        if (!input.title?.trim()) {
            errors.push('Le titre est requis');
        }

        if (!input.message?.trim()) {
            errors.push('Le message est requis');
        }

        if (input.title && input.title.length > 255) {
            errors.push('Le titre ne peut pas dépasser 255 caractères');
        }

        if (input.message && input.message.length > 2000) {
            errors.push('Le message ne peut pas dépasser 2000 caractères');
        }

        return errors;
    }

    async prepareNotificationData(input: CreateNotificationInput): Promise<Prisma.NotificationCreateInput> {
        const data: Prisma.NotificationCreateInput = {
            type: input.type,
            title: input.title,
            message: input.message,
            targetUsers: input.targetUsers,
            readBy: [],
            isActive: true,
        };

        if (input.marketId) {
            data.market = { connect: { id: input.marketId } };
        }

        if (input.expiresAt) {
            data.expiresAt = input.expiresAt;
        }

        return data;
    }

    abstract handle(
        input: CreateNotificationInput,
        context: NotificationHandlerContext,
    ): Promise<NotificationHandlerResult>;

    abstract getEmailRecipients(input: CreateNotificationInput, context: NotificationHandlerContext): Promise<string[]>;

    abstract sendEmails(
        input: CreateNotificationInput,
        recipients: string[],
        context: NotificationHandlerContext,
    ): Promise<number>;

    /**
     * Implémentation par défaut - ne fait rien
     */
    async postProcess?(result: NotificationHandlerResult, context: NotificationHandlerContext): Promise<void> {
        // Implémentation par défaut vide
    }
}

/**
 * Factory pour créer les handlers de notifications
 */
export interface INotificationHandlerFactory {
    /**
     * Crée un handler pour le type de notification donné
     */
    createHandler(type: NotificationType): INotificationHandler;

    /**
     * Enregistre un nouveau handler
     */
    registerHandler(handler: INotificationHandler): void;

    /**
     * Récupère tous les handlers enregistrés
     */
    getAllHandlers(): INotificationHandler[];

    /**
     * Vérifie si un handler existe pour le type donné
     */
    hasHandler(type: NotificationType): boolean;
}
