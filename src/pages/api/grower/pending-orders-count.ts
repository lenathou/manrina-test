import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/server/prisma';

/**
 * API pour récupérer le nombre de commandes en attente pour un producteur
 * GET /api/grower/pending-orders-count?growerId={id}
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

    // Compter les commandes en attente pour ce producteur
    // Ici, on considère les commandes avec le statut "PENDING" ou "CONFIRMED"
    // qui contiennent des produits de ce producteur
    const pendingOrdersCount = await prisma.basketSession.count({
      where: {
        paymentStatus: {
          in: ['pending', 'confirmed']
        },
        items: {
          some: {
            product: {
              growers: {
                some: {
                  growerId: growerId
                }
              }
            }
          }
        }
      }
    });

    return res.status(200).json({ count: pendingOrdersCount });
  } catch (error) {
    console.error('Erreur lors de la récupération du nombre de commandes en attente:', error);
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  }
}