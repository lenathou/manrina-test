export interface IEmailNotificationService {
    sendEmail(email: string, subject: string, body: string): Promise<{ success: boolean; message: string }>;
}
