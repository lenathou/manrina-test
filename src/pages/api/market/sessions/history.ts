import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/server/prisma';
import { apiUseCases } from '@/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Vérifier l'authentification du producteur
  const growerResult = apiUseCases.verifyGrowerToken({ req, res });
  if (!growerResult) {
    return res.status(401).json({ message: 'Non autorisé' });
  }

  const { growerId } = req.query;

  // Vérifier que le producteur demande ses propres données
  if (growerId !== growerResult.id.toString()) {
    return res.status(403).json({ message: 'Accès interdit' });
  }

  try {
    // Récupérer toutes les sessions où le producteur a participé
    const sessions = await prisma.marketSession.findMany({
      where: {
        participations: {
          some: {
            growerId: growerResult.id
          }
        },
        status: 'COMPLETED' // Seulement les sessions terminées pour l'historique
      },
      include: {
        participations: {
          where: {
            growerId: growerResult.id
          },
          include: {
            grower: true
          }
        },
        growerCommissions: {
          where: {
            growerId: growerResult.id
          }
        },
        _count: {
          select: {
            participations: true,
            marketProducts: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    return res.status(200).json(sessions);
  } catch (error) {
    console.error('Erreur lors du chargement de l\'historique:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
}