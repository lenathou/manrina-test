import { NextApiRequest, NextApiResponse } from 'next';
import { apiUseCases } from '@/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const subscription = req.body;
    
    if (!subscription) {
      return res.status(400).json({ error: 'Données d\'abonnement manquantes' });
    }

    const result = await apiUseCases.subscribeUser(subscription);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Erreur lors de l\'abonnement:', error);
    return res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}