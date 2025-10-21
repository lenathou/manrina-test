import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/server/prisma';

/**
 * API pour récupérer le nombre de réponses de validation de stock non consultées
 * GET /api/grower/stock-validation-responses-count?growerId={id}
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    const { growerId } = req.query;

    if (!growerId || typeof growerId !== 'string') {
      return res.status(400).json({ message: 'ID du producteur requis' });
    }

    // Compter les demandes de validation de stock qui ont été traitées (approuvées ou rejetées)
    // mais pas encore consultées par le producteur
    const unviewedResponsesCount = await prisma.growerStockUpdate.count({
      where: {
        growerId: growerId,
        status: {
          in: ['APPROVED', 'REJECTED']
        },
        processedDate: {
          not: null
        }
      }
    });

    return res.status(200).json({ count: unviewedResponsesCount });
  } catch (error) {
    console.error('Erreur lors de la récupération du nombre de réponses de validation:', error);
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  }
}