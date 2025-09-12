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
    // Vérifier l'authentification admin
    const adminResult = apiUseCases.verifyAdminToken({ req, res });
    if (!adminResult) {
      return res.status(401).json({ error: 'Non autorisé' });
    }

    const { clientId } = req.query;
    if (!clientId || typeof clientId !== 'string') {
      return res.status(400).json({ error: 'ID client requis' });
    }

    // Récupérer le solde du client directement via CustomerUseCases
    const balance = await apiUseCases.getCustomerWalletBalanceById(clientId);
     
     return res.status(200).json({ walletBalance: balance });
  } catch (error) {
    console.error('Erreur lors de la récupération du solde client:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur interne du serveur';
    return res.status(500).json({ error: errorMessage });
  }
}