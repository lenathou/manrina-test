import { NextApiRequest, NextApiResponse } from 'next';
import { apiUseCases } from '@/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { title, message } = req.body;
    
    if (!title || !message) {
      return res.status(400).json({ error: 'Titre et message requis' });
    }

    await apiUseCases.sendNotification(message);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification:', error);
    return res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}