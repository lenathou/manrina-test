// Export des configurations de notifications
export  { NotificationConfigUtils } from './NotificationConfigUtils';
export type { 
  NOTIFICATION_TYPE_CONFIGS,
  NotificationTypeConfig,
  NotificationTypeUIConfig,
  NotificationTypeEmailConfig,
  isValidNotificationType,
  NOTIFICATION_CATEGORIES,
  NotificationCategory
} from './NotificationTypeConfig';

// Re-export du type NotificationType depuis Prisma
export { NotificationType } from '@prisma/client';

// Adaptateur pour la compatibilité avec les tests existants
import { NOTIFICATION_TYPE_CONFIGS } from './NotificationTypeConfig';
import { NotificationType } from '@prisma/client';

// Transformation de la nouvelle structure vers l'ancienne pour les tests
export const NOTIFICATION_CONFIG = Object.fromEntries(
  Object.entries(NOTIFICATION_TYPE_CONFIGS).map(([type, config]) => [
    type,
    {
      priority: config.ui.priority,
      channels: ['email', 'push'], // Valeurs par défaut
      ui: {
        backgroundColor: config.ui.backgroundColor.includes('#') 
          ? `bg-${config.ui.backgroundColor.includes('FEF2F2') ? 'red' : config.ui.backgroundColor.includes('F0F9FF') ? 'blue' : config.ui.backgroundColor.includes('F0FDF4') ? 'green' : config.ui.backgroundColor.includes('FFFBEB') ? 'yellow' : config.ui.backgroundColor.includes('F3F4F6') ? 'gray' : 'blue'}-50`
          : config.ui.backgroundColor,
        textColor: config.ui.textColor.includes('#')
          ? `text-${config.ui.textColor.includes('991B1B') ? 'red' : config.ui.textColor.includes('1E40AF') ? 'blue' : config.ui.textColor.includes('166534') ? 'green' : config.ui.textColor.includes('92400E') ? 'yellow' : config.ui.textColor.includes('374151') ? 'gray' : 'blue'}-800`
          : config.ui.textColor,
        borderColor: `border-${config.ui.backgroundColor.includes('FEF2F2') ? 'red' : config.ui.backgroundColor.includes('F0F9FF') ? 'blue' : config.ui.backgroundColor.includes('F0FDF4') ? 'green' : config.ui.backgroundColor.includes('FFFBEB') ? 'yellow' : config.ui.backgroundColor.includes('F3F4F6') ? 'gray' : 'blue'}-200`,
        iconColor: config.ui.iconColor.includes('#')
          ? `text-${config.ui.iconColor.includes('DC2626') ? 'red' : config.ui.iconColor.includes('3B82F6') ? 'blue' : config.ui.iconColor.includes('059669') ? 'green' : config.ui.iconColor.includes('D97706') ? 'yellow' : config.ui.iconColor.includes('6B7280') ? 'gray' : 'blue'}-600`
          : config.ui.iconColor
      },
      email: {
        template: config.email.emailTemplate,
        subject: config.email.defaultSubject,
        priority: config.ui.priority === 1 ? 'high' : config.ui.priority === 2 ? 'normal' : 'low'
      },
      retentionDays: config.ui.priority === 1 ? 90 : config.ui.priority === 2 ? 60 : 30,
      autoExpire: config.ui.priority > 2
    }
  ])
);