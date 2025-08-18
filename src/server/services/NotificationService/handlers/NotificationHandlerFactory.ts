import { NotificationType } from '@prisma/client';
import { INotificationHandler, INotificationHandlerFactory } from './INotificationHandler';
import { MarketCancellationHandler } from './MarketCancellationHandler';
import { GeneralAnnouncementHandler } from './GeneralAnnouncementHandler';
import { SystemMaintenanceHandler } from './SystemMaintenanceHandler';
import { ProductRecallHandler } from './ProductRecallHandler';

/**
 * Factory pour créer les handlers de notifications appropriés
 * Implémente le pattern Factory pour une gestion centralisée des handlers
 */
export class NotificationHandlerFactory implements INotificationHandlerFactory {
  private static instance: NotificationHandlerFactory;
  private handlers: Map<NotificationType, INotificationHandler>;

  private constructor() {
    this.handlers = new Map();
    this.initializeHandlers();
  }

  /**
   * Singleton pattern pour garantir une seule instance de la factory
   */
  public static getInstance(): NotificationHandlerFactory {
    if (!NotificationHandlerFactory.instance) {
      NotificationHandlerFactory.instance = new NotificationHandlerFactory();
    }
    return NotificationHandlerFactory.instance;
  }

  /**
   * Initialise tous les handlers disponibles
   */
  private initializeHandlers(): void {
    // Enregistrer tous les handlers disponibles
    this.registerHandler(new MarketCancellationHandler());
    this.registerHandler(new GeneralAnnouncementHandler());
    this.registerHandler(new SystemMaintenanceHandler());
    this.registerHandler(new ProductRecallHandler());
  }

  /**
   * Enregistre un handler pour un type de notification
   */
  public registerHandler(handler: INotificationHandler): void {
    this.handlers.set(handler.type, handler);
  }

  /**
   * Crée un handler pour un type de notification donné
   */
  public createHandler(type: NotificationType): INotificationHandler {
    return this.getHandler(type);
  }

  /**
   * Récupère le handler approprié pour un type de notification donné
   */
  public getHandler(type: NotificationType): INotificationHandler {
    const handler = this.handlers.get(type);
    if (!handler) {
      throw new Error(`Aucun handler trouvé pour le type de notification: ${type}`);
    }
    return handler;
  }

  /**
   * Vérifie si un handler existe pour un type de notification
   */
  public hasHandler(type: NotificationType): boolean {
    return this.handlers.has(type);
  }

  /**
   * Retourne la liste de tous les types de notifications supportés
   */
  public getSupportedTypes(): NotificationType[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * Retourne la liste de tous les handlers enregistrés
   */
  public getAllHandlers(): INotificationHandler[] {
    return Array.from(this.handlers.values());
  }

  /**
   * Supprime un handler (utile pour les tests ou la configuration dynamique)
   */
  public unregisterHandler(type: NotificationType): boolean {
    return this.handlers.delete(type);
  }

  /**
   * Réinitialise tous les handlers (utile pour les tests)
   */
  public reset(): void {
    this.handlers.clear();
    this.initializeHandlers();
  }

  /**
   * Valide qu'un type de notification est supporté
   */
  public validateNotificationType(type: string): type is NotificationType {
    return Object.values(NotificationType).includes(type as NotificationType);
  }

  /**
   * Retourne des statistiques sur les handlers enregistrés
   */
  public getStats(): {
    totalHandlers: number;
    supportedTypes: NotificationType[];
    handlerDetails: Array<{
      type: NotificationType;
      handlerName: string;
    }>;
  } {
    return {
      totalHandlers: this.handlers.size,
      supportedTypes: this.getSupportedTypes(),
      handlerDetails: Array.from(this.handlers.entries()).map(([type, handler]) => ({
        type,
        handlerName: handler.constructor.name
      }))
    };
  }
}

/**
 * Export d'une instance singleton pour faciliter l'utilisation
 */
export const notificationHandlerFactory = NotificationHandlerFactory.getInstance();