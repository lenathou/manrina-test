import { NextApiRequest, NextApiResponse } from 'next';
import { apiUseCases } from '@/server';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const walletBalance = await apiUseCases.getCustomerWalletBalance({ req, res });
    return res.status(200).json({ walletBalance });
  } catch (error) {
    console.error('Erreur lors de la récupération du solde des avoirs:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur interne du serveur';
    
    if (errorMessage.includes('Token client')) {
      return res.status(401).json({ error: errorMessage });
    }
    
    return res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}