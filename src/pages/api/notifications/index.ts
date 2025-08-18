import { NextApiRequest, NextApiResponse } from 'next';
import { NotificationService } from '@/server/services/NotificationService';
import { apiUseCases } from '@/server';

const notificationService = new NotificationService();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Vérifier l'authentification via les tokens JWT existants
    const adminToken = await apiUseCases.verifyAdminToken({ req, res });
    const customerToken = await apiUseCases.verifyCustomerToken({ req, res });
    const growerToken = await apiUseCases.verifyGrowerToken({ req, res });
    const delivererToken = await apiUseCases.verifyDelivererToken({ req, res });
    
    if (!adminToken && !customerToken && !growerToken && !delivererToken) {
      return res.status(401).json({ error: 'Non autorisé' });
    }

    // Déterminer l'ID utilisateur et le rôle
    let userId: string;
    let userRole: string;
    
    if (adminToken) {
      userId = adminToken.id;
      userRole = 'ADMIN';
    } else if (customerToken) {
      userId = customerToken.id;
      userRole = 'CUSTOMER';
    } else if (growerToken) {
      userId = growerToken.id;
      userRole = 'GROWER';
    } else if (delivererToken) {
      userId = delivererToken.id;
      userRole = 'DELIVERER';
    } else {
      return res.status(401).json({ error: 'Non autorisé' });
    }

    switch (req.method) {
      case 'GET': {
        const { unread } = req.query;
        
        let notifications;
        if (unread === 'true') {
          notifications = await notificationService.getUnreadNotificationsForUser(userId);
        } else {
          notifications = await notificationService.getNotificationsForUser(userId);
        }
        
        return res.status(200).json(notifications);
      }

      case 'POST': {
        // Seuls les admins peuvent créer des notifications
        if (userRole !== 'ADMIN') {
          return res.status(403).json({ error: 'Accès refusé' });
        }

        const { type, title, message, marketId, targetUsers, expiresAt } = req.body;

        if (!type || !title || !message || !targetUsers) {
          return res.status(400).json({ error: 'Données manquantes' });
        }

        const notificationData: any = {
          type,
          title,
          message,
          marketId,
          targetUsers,
        };

        // Ajouter expiresAt seulement s'il est défini
        if (expiresAt) {
          notificationData.expiresAt = new Date(expiresAt);
        }

        const notification = await notificationService.createNotification(notificationData);

        return res.status(201).json(notification);
      }

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Méthode ${req.method} non autorisée` });
    }
  } catch (error) {
    console.error('Erreur API notifications:', error);
    return res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}