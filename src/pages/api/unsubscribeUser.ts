import { NextApiRequest, NextApiResponse } from 'next';
import { apiUseCases } from '@/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const result = await apiUseCases.unsubscribeUser();
    return res.status(200).json(result);
  } catch (error) {
    console.error('Erreur lors du désabonnement:', error);
    return res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}