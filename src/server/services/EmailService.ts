import { Resend } from 'resend';

export interface IEmailService {
    sendPasswordResetEmail(email: string, resetToken: string, userType: 'customer' | 'grower'): Promise<void>;
}

export class EmailService implements IEmailService {
    private resend: Resend;

    constructor() {
        if (!process.env.RESEND_API_KEY) {
            throw new Error('RESEND_API_KEY is required');
        }
        this.resend = new Resend(process.env.RESEND_API_KEY);
    }

    public async sendPasswordResetEmail(email: string, resetToken: string, userType: 'customer' | 'grower'): Promise<void> {
        const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reinitialiser-mot-de-passe?token=${resetToken}&type=${userType}`;
        
        const userTypeLabel = userType === 'customer' ? 'client' : 'producteur';
        
        await this.resend.emails.send({
            from: process.env.EMAIL_FROM!,
            to: email,
            subject: 'Réinitialisation de votre mot de passe Manrina',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Réinitialisation de votre mot de passe</h2>
                    <p>Bonjour,</p>
                    <p>Vous avez demandé une réinitialisation de votre mot de passe pour votre compte ${userTypeLabel} Manrina.</p>
                    <p>Veuillez cliquer sur le lien ci-dessous pour continuer :</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Réinitialiser mon mot de passe</a>
                    </div>
                    <p><strong>Ce lien expirera dans une heure.</strong></p>
                    <p>Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer cet email.</p>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                    <p style="color: #666; font-size: 12px;">L'équipe Manrina</p>
                </div>
            `,
        });
    }
}