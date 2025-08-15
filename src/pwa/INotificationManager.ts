import { PushSubscription } from 'web-push';

export interface INotificationManager {
    subscribeUser(sub: PushSubscription): Promise<{ success: boolean }>;
    unsubscribeUser(): Promise<{ success: boolean }>;
    sendNotification(message: string): Promise<{ success: boolean }>;
}
