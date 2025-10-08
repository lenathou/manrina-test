import { BrevoEmailNotificationService } from '@/server/services/NotificationService/BrevoEmailNotificationService';

interface PasswordChangeEmailData {
  userEmail: string;
  userName: string;
  changeTime: string;
  userAgent?: string;
  ipAddress?: string;
}

class EmailService {
  private brevoService: BrevoEmailNotificationService;

  constructor() {
    this.brevoService = new BrevoEmailNotificationService();
  }

  async sendPasswordChangeConfirmation(data: PasswordChangeEmailData): Promise<boolean> {
    try {
      const { userEmail, userName, changeTime, userAgent, ipAddress } = data;
      
      const subject = 'Confirmation de changement de mot de passe - Manrina Store';
      
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirmation de changement de mot de passe</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .container {
              background-color: white;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              color: #2c5530;
              margin-bottom: 10px;
            }
            .title {
              color: #2c5530;
              font-size: 24px;
              margin-bottom: 20px;
              text-align: center;
            }
            .content {
              margin-bottom: 25px;
            }
            .info-box {
              background-color: #f8f9fa;
              border-left: 4px solid #28a745;
              padding: 15px;
              margin: 20px 0;
            }
            .warning-box {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              color: #666;
              font-size: 14px;
            }
            .security-info {
              font-size: 12px;
              color: #666;
              margin-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🌱 Manrina Store</div>
              <div style="color: #666;">Votre marché local de confiance</div>
            </div>
            
            <h1 class="title">✅ Mot de passe modifié avec succès</h1>
            
            <div class="content">
              <p>Bonjour <strong>${userName}</strong>,</p>
              
              <p>Nous vous confirmons que votre mot de passe a été modifié avec succès.</p>
              
              <div class="info-box">
                 <h3 style="margin-top: 0; color: #28a745;">📋 Détails de la modification</h3>
                 <p><strong>Date et heure :</strong> ${changeTime}</p>
                 ${ipAddress ? `<p><strong>Adresse IP :</strong> ${ipAddress}</p>` : ''}
                 ${userAgent ? `<div class="security-info"><strong>Navigateur :</strong> ${userAgent}</div>` : ''}
               </div>
              
              <div class="warning-box">
                <h3 style="margin-top: 0; color: #856404;">🔒 Sécurité de votre compte</h3>
                <p>Si vous n'êtes pas à l'origine de cette modification, veuillez :</p>
                <ul>
                  <li>Contacter immédiatement notre équipe de sécurité</li>
                  <li>Vérifier l'activité récente de votre compte</li>
                  <li>Changer à nouveau votre mot de passe</li>
                </ul>
              </div>
              
              <p>Pour votre sécurité, nous vous recommandons de :</p>
              <ul>
                <li>Utiliser un mot de passe unique et complexe</li>
                <li>Ne jamais partager vos identifiants</li>
                <li>Vous déconnecter des appareils partagés</li>
              </ul>
              
              <p>Si vous avez des questions, contactez notre équipe de sécurité.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const result = await this.brevoService.sendEmail(userEmail, subject, htmlContent);
      return result.success;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'alerte sécurité:', error);
      return false;
    }
  }

  async sendSecurityAlert(data: PasswordChangeEmailData & { alertType: 'suspicious_activity' | 'multiple_attempts' }): Promise<boolean> {
    try {
      const { userEmail, userName, alertType, ipAddress, userAgent } = data;

      const alertMessages = {
        suspicious_activity: 'Activité suspecte détectée sur votre compte',
        multiple_attempts: 'Tentatives multiples de changement de mot de passe détectées'
      };

      const subject = `🚨 Alerte sécurité - ${alertMessages[alertType]} - Manrina Store`;
      
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Alerte sécurité</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9fafb; }
            .alert { background-color: #fee2e2; border: 1px solid #ef4444; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .action-button { display: inline-block; background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚨 Alerte Sécurité</h1>
              <h2>Manrina Store</h2>
            </div>
            
            <div class="content">
              <p>Bonjour <strong>${userName}</strong>,</p>
              
              <div class="alert">
                <h3>${alertMessages[alertType]}</h3>
                <p>Nous avons détecté une activité inhabituelle sur votre compte.</p>
              </div>
              
              <p><strong>Actions recommandées :</strong></p>
              <ul>
                <li>Changez immédiatement votre mot de passe si ce n'était pas vous</li>
                <li>Vérifiez vos connexions récentes</li>
                <li>Contactez notre équipe de sécurité si nécessaire</li>
              </ul>
              
              ${ipAddress || userAgent ? `
              <p><strong>Informations de connexion :</strong></p>
              <ul>
                ${ipAddress ? `<li>Adresse IP : ${ipAddress}</li>` : ''}
                ${userAgent ? `<li>Navigateur : ${userAgent}</li>` : ''}
              </ul>
              ` : ''}
            </div>
            
            <div class="footer">
              <p>© 2024 Manrina Store. Tous droits réservés.</p>
              <p>Si vous avez des questions, contactez notre équipe de sécurité.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const result = await this.brevoService.sendEmail(userEmail, subject, htmlContent);
      return result.success;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'alerte sécurité:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
export type { PasswordChangeEmailData };