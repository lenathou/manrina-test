import { NotificationType } from '@prisma/client';

/**
 * Configuration centralisée pour les types de notifications
 * Facilite l'ajout de nouveaux types sans modification du code existant
 */

export interface NotificationTypeUIConfig {
  /** Icône à afficher (emoji ou nom d'icône) */
  icon: string;
  /** Couleur de fond pour la modal */
  backgroundColor: string;
  /** Couleur du texte */
  textColor: string;
  /** Couleur de l'icône */
  iconColor: string;
  /** Titre par défaut */
  defaultTitle: string;
  /** Durée d'affichage automatique (ms) */
  displayDuration: number;
  /** Priorité d'affichage (1 = haute, 5 = basse) */
  priority: number;
  /** Nécessite une action utilisateur pour fermer */
  requiresUserAction: boolean;
  /** Son à jouer (optionnel) */
  sound?: string;
}

export interface NotificationTypeEmailConfig {
  /** Template d'email à utiliser */
  emailTemplate: string;
  /** Sujet par défaut de l'email */
  defaultSubject: string;
  /** Envoyer un email automatiquement */
  autoSendEmail: boolean;
  /** Délai avant envoi email (ms) */
  emailDelay?: number;
}

export interface NotificationTypeConfig {
  /** Configuration UI */
  ui: NotificationTypeUIConfig;
  /** Configuration email */
  email: NotificationTypeEmailConfig;
  /** Métadonnées additionnelles */
  metadata: {
    /** Description du type de notification */
    description: string;
    /** Catégorie (système, marché, utilisateur, etc.) */
    category: string;
    /** Actif ou non */
    enabled: boolean;
  };
}

/**
 * Configuration complète des types de notifications
 * Utilise les couleurs du design system existant
 */
export const NOTIFICATION_TYPE_CONFIGS: Record<NotificationType, NotificationTypeConfig> = {
  [NotificationType.MARKET_CANCELLATION]: {
    ui: {
      icon: '🚫',
      backgroundColor: '#FEF2F2', // Rouge très clair
      textColor: '#991B1B', // Rouge foncé
      iconColor: '#DC2626', // Rouge
      defaultTitle: 'Marché annulé',
      displayDuration: 8000,
      priority: 1,
      requiresUserAction: true,
      sound: 'alert'
    },
    email: {
      emailTemplate: 'market-cancellation',
      defaultSubject: 'Annulation de marché - Manrina',
      autoSendEmail: true,
      emailDelay: 0
    },
    metadata: {
      description: 'Notification d\'annulation de marché',
      category: 'marché',
      enabled: true
    }
  },

  [NotificationType.GENERAL_ANNOUNCEMENT]: {
    ui: {
      icon: '📢',
      backgroundColor: '#F0F9FF', // Bleu très clair
      textColor: '#1E40AF', // Bleu foncé
      iconColor: '#3B82F6', // Bleu
      defaultTitle: 'Annonce générale',
      displayDuration: 6000,
      priority: 3,
      requiresUserAction: false
    },
    email: {
      emailTemplate: 'general-announcement',
      defaultSubject: 'Annonce importante - Manrina',
      autoSendEmail: false
    },
    metadata: {
      description: 'Annonce générale pour tous les utilisateurs',
      category: 'général',
      enabled: true
    }
  },

  [NotificationType.SYSTEM_MAINTENANCE]: {
    ui: {
      icon: '🔧',
      backgroundColor: '#FFFBEB', // Orange très clair (design system)
      textColor: '#92400E', // Orange foncé
      iconColor: '#F59E0B', // Orange
      defaultTitle: 'Maintenance système',
      displayDuration: 10000,
      priority: 2,
      requiresUserAction: true,
      sound: 'maintenance'
    },
    email: {
      emailTemplate: 'system-maintenance',
      defaultSubject: 'Maintenance programmée - Manrina',
      autoSendEmail: true,
      emailDelay: 3600000 // 1 heure avant
    },
    metadata: {
      description: 'Notification de maintenance système',
      category: 'système',
      enabled: true
    }
  },

  [NotificationType.PRODUCT_RECALL]: {
    ui: {
      icon: '⚠️',
      backgroundColor: '#FEF2F2', // Rouge très clair
      textColor: '#991B1B', // Rouge foncé
      iconColor: '#DC2626', // Rouge
      defaultTitle: 'Rappel de produit',
      displayDuration: 0, // Pas d'expiration automatique
      priority: 1,
      requiresUserAction: true,
      sound: 'alert'
    },
    email: {
      emailTemplate: 'product-recall',
      defaultSubject: 'Rappel de produit urgent - Manrina',
      autoSendEmail: true,
      emailDelay: 0
    },
    metadata: {
      description: 'Notification de rappel de produit',
      category: 'marché',
      enabled: true
    }
  }
};

/**
 * Utilitaires pour la configuration des notifications
 */
export class NotificationConfigUtils {
  /**
   * Récupère la configuration d'un type de notification
   */
  static getConfig(type: NotificationType): NotificationTypeConfig {
    return NOTIFICATION_TYPE_CONFIGS[type];
  }

  /**
   * Récupère la configuration UI d'un type de notification
   */
  static getUIConfig(type: NotificationType): NotificationTypeUIConfig {
    return NOTIFICATION_TYPE_CONFIGS[type].ui;
  }

  /**
   * Récupère la configuration email d'un type de notification
   */
  static getEmailConfig(type: NotificationType): NotificationTypeEmailConfig {
    return NOTIFICATION_TYPE_CONFIGS[type].email;
  }

  /**
   * Vérifie si un type de notification est actif
   */
  static isEnabled(type: NotificationType): boolean {
    return NOTIFICATION_TYPE_CONFIGS[type].metadata.enabled;
  }

  /**
   * Récupère tous les types de notifications actifs
   */
  static getEnabledTypes(): NotificationType[] {
    return Object.entries(NOTIFICATION_TYPE_CONFIGS)
      .filter(([, config]) => config.metadata.enabled)
      .map(([type]) => type as NotificationType);
  }

  /**
   * Récupère les types de notifications par catégorie
   */
  static getTypesByCategory(category: string): NotificationType[] {
    return Object.entries(NOTIFICATION_TYPE_CONFIGS)
      .filter(([, config]) => config.metadata.category === category)
      .map(([type]) => type as NotificationType);
  }

  /**
   * Récupère les types de notifications triés par priorité
   */
  static getTypesByPriority(): NotificationType[] {
    return Object.entries(NOTIFICATION_TYPE_CONFIGS)
      .sort(([, a], [, b]) => a.ui.priority - b.ui.priority)
      .map(([type]) => type as NotificationType);
  }
}

/**
 * Type guard pour vérifier si un type de notification existe
 */
export function isValidNotificationType(type: string): type is NotificationType {
  return Object.values(NotificationType).includes(type as NotificationType);
}

/**
 * Constantes pour les catégories de notifications
 */
export const NOTIFICATION_CATEGORIES = {
  MARKET: 'marché',
  SYSTEM: 'système',
  GENERAL: 'général',
  USER: 'utilisateur'
} as const;

export type NotificationCategory = typeof NOTIFICATION_CATEGORIES[keyof typeof NOTIFICATION_CATEGORIES];