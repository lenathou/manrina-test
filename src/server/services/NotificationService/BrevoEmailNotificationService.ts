import brevo, { SendSmtpEmail, TransactionalEmailsApi, TransactionalEmailsApiApiKeys } from '@getbrevo/brevo';
import { IEmailNotificationService } from './IEmailNotificationService';

const BREVO_API_KEY = process.env.BREVO_API_KEY;

export class BrevoEmailNotificationService implements IEmailNotificationService {
    private apiInstance: brevo.TransactionalEmailsApi;
    constructor() {
        const apiInstance = new TransactionalEmailsApi();

        apiInstance.setApiKey(TransactionalEmailsApiApiKeys.apiKey, BREVO_API_KEY || '');
        this.apiInstance = apiInstance;
        // this.mailgun = BREVO_API_KEY ? new Mailgun(FormData) : undefined;
    }

    public async sendEmail(
        email: string,
        subject: string,
        body: string,
    ): Promise<{ success: boolean; message: string; error?: string }> {
        const sendSmtpEmail = new SendSmtpEmail();

        if (!BREVO_API_KEY) {
            // Mode développement : afficher l'email dans la console
            console.log('\n=== EMAIL DE DÉVELOPPEMENT ===');
            console.log(`📧 Destinataire: ${email}`);
            console.log(`📝 Sujet: ${subject}`);
            console.log(`📄 Contenu HTML:`);
            console.log(body);
            console.log('==============================\n');
            
            // Simulation d'un délai d'envoi
            await new Promise(resolve => setTimeout(resolve, 100));
            
            return { success: true, message: 'Email affiché dans la console (mode développement)' };
        }
        sendSmtpEmail.subject = subject;
        sendSmtpEmail.htmlContent = body;
        sendSmtpEmail.sender = { name: 'Manrina', email: 'gigantix826@gmail.com' };
        sendSmtpEmail.to = [{ email }];
        sendSmtpEmail.replyTo = { email: 'gigantix826@gmail.com', name: 'Manrina' };
        sendSmtpEmail.headers = { 'Some-Custom-Name': 'unique-id-1234' };
        sendSmtpEmail.params = { parameter: 'My param value', subject: ' subject' };

        return await this.apiInstance.sendTransacEmail(sendSmtpEmail).then(
            function (data) {
                console.log('API called successfully. Returned data: ' + JSON.stringify(data));
                return { success: true, message: 'Email sent successfully' };
            },
            function (error) {
                console.error(error);
                return { success: false, message: 'Email not sent', error: error };
            },
        );
    }
}
