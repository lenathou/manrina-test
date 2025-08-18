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

    // Déterminer l'ID utilisateur
    let userId: string;
    
    if (adminToken) {
      userId = adminToken.id;
    } else if (customerToken) {
      userId = customerToken.id;
    } else if (growerToken) {
      userId = growerToken.id;
    } else if (delivererToken) {
      userId = delivererToken.id;
    } else {
      return res.status(401).json({ error: 'Non autorisé' });
    }

    const { id } = req.query;

    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'ID de notification invalide' });
    }

    switch (req.method) {
      case 'POST': {
        await notificationService.markAsRead(id, userId);
        return res.status(200).json({ success: true });
      }

      default:
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: `Méthode ${req.method} non autorisée` });
    }
  } catch (error) {
    console.error('Erreur API mark as read:', error);
    return res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}