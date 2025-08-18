// Interfaces et types de base
export type {
  INotificationHandler,
  INotificationHandlerFactory
} from './INotificationHandler';

export {
  BaseNotificationHandler
} from './INotificationHandler';

export type {
  CreateNotificationInput,
  NotificationHandlerContext,
  NotificationHandlerResult
} from './INotificationHandler';

// Handlers spécifiques
export { MarketCancellationHandler } from './MarketCancellationHandler';
export { GeneralAnnouncementHandler } from './GeneralAnnouncementHandler';
export { SystemMaintenanceHandler } from './SystemMaintenanceHandler';
export { ProductRecallHandler } from './ProductRecallHandler';

// Factory
export {
  NotificationHandlerFactory,
  notificationHandlerFactory
} from './NotificationHandlerFactory';