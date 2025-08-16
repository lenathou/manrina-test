import webpush, { PushSubscription } from 'web-push';
import { INotificationManager } from './INotificationManager';

export class NotificationManager implements INotificationManager {
    private subscription: PushSubscription | null = null;

    constructor() {
        this.subscription = null;
    }

    public async subscribeUser(sub: PushSubscription) {
        this.subscription = sub;
        return { success: true };
    }

    public async unsubscribeUser() {
        this.subscription = null;
        return { success: true };
    }

    public async sendNotification(message: string) {
        if (!this.subscription) {
            throw new Error('No subscription available');
        }

        webpush.setVapidDetails(
            'mailto:your-email@example.com',
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
            process.env.VAPID_PRIVATE_KEY!,
        );

        try {
            await webpush.sendNotification(
                this.subscription,
                JSON.stringify({
                    title: 'Test Notification',
                    body: message,
                    icon: '/icon.png',
                }),
            );
            return { success: true };
        } catch (error) {
            console.error('Error sending push notification:', error);
            return { success: false, error: 'Failed to send notification' };
        }
    }
}
