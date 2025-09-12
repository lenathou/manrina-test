import { NotificationType } from '@prisma/client';
import { NOTIFICATION_TYPE_CONFIGS } from './NotificationTypeConfig';

/**
 * Utilitaires pour la configuration des notifications
 */
export class NotificationConfigUtils {
  /**
   * Obtient la configuration pour un type de notification donné
   */
  static getConfig(type: NotificationType) {
    const config = NOTIFICATION_TYPE_CONFIGS[type];
    if (!config) {
      console.warn(`Configuration non trouvée pour le type: ${type}`);
      return NOTIFICATION_TYPE_CONFIGS[NotificationType.GENERAL_ANNOUNCEMENT]; // Fallback
    }
    return config;
  }

  /**
   * Vérifie si un type de notification est valide
   */
  static isValidType(type: string): type is NotificationType {
    return Object.values(NotificationType).includes(type as NotificationType);
  }

  /**
   * Obtient tous les types de notifications disponibles
   */
  static getAllTypes(): NotificationType[] {
    return Object.values(NotificationType);
  }

  /**
   * Obtient la configuration UI pour un type donné
   */
  static getUIConfig(type: NotificationType) {
    return this.getConfig(type).ui;
  }

  /**
   * Obtient la configuration email pour un type donné
   */
  static getEmailConfig(type: NotificationType) {
    return this.getConfig(type).email;
  }

}

export default NotificationConfigUtils;