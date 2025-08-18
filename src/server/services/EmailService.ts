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
                <!DOCTYPE html>
                <html>
                  <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Réinitialisation de mot de passe</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                  </head>
                  <body>
                    <div class="font-sans max-w-2xl mx-auto">
                      <h2 class="text-2xl font-bold mb-4">Réinitialisation de votre mot de passe</h2>
                      <p class="mb-4">Bonjour,</p>
                      <p class="mb-4">Vous avez demandé une réinitialisation de votre mot de passe pour votre compte ${userTypeLabel} Manrina.</p>
                      <p class="mb-4">Veuillez cliquer sur le lien ci-dessous pour continuer :</p>
                      <div class="text-center my-8">
                        <a href="${resetUrl}" class="bg-green-500 text-white px-6 py-3 no-underline rounded inline-block hover:bg-green-600">Réinitialiser mon mot de passe</a>
                      </div>
                      <p class="mb-4"><strong>Ce lien expirera dans une heure.</strong></p>
                      <p class="mb-4">Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer cet email.</p>
                      <hr class="my-8 border-0 border-t border-gray-200">
                      <p class="text-gray-600 text-xs">L'équipe Manrina</p>
                    </div>
                  </body>
                </html>
            `,
        });
    }
}