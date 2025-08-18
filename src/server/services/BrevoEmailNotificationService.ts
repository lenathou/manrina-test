export interface IEmailNotificationService {
  sendEmail(email: string, subject: string, body: string): Promise<{ success: boolean; message: string }>;
}

export class BrevoEmailNotificationService implements IEmailNotificationService {
  async sendEmail(email: string, subject: string, body: string): Promise<{ success: boolean; message: string }> {
    // Implémentation temporaire - à remplacer par l'intégration Brevo réelle
    console.log(`Email envoyé à ${email}:`);
    console.log(`Sujet: ${subject}`);
    console.log(`Contenu: ${body}`);
    
    // Simulation d'un délai d'envoi
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return { success: true, message: 'Email envoyé avec succès' };
  }
}