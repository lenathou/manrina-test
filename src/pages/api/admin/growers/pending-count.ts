import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/server/prisma';
import { apiUseCases } from '@/server';

/**
 * API pour récupérer le nombre de candidatures de producteurs en attente de validation
 * GET /api/admin/growers/pending-count
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    // Vérifier l'authentification admin
    const adminResult = apiUseCases.verifyAdminToken({ req, res });
    if (!adminResult) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    // Compter les producteurs non approuvés (candidatures en attente)
    const pendingApplicationsCount = await prisma.grower.count({
      where: {
        approved: false
      }
    });

    return res.status(200).json({ count: pendingApplicationsCount });
  } catch (error) {
    console.error('Erreur lors de la récupération du nombre de candidatures en attente:', error);
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  }
}