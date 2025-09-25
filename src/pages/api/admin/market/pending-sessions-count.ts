import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/server/prisma';

// Interface pour le type de session avec participations
interface SessionWithParticipations {
  id: string;
  name: string;
  date: Date;
  participations: Array<{
    id: string;
    createdAt: Date;
  }>;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Pour cette implémentation, nous considérons qu'une session a des "nouvelles participations"
    // si elle a des participations confirmées qui n'ont pas encore été vues par l'admin
    // Cette logique est cohérente avec useNewMarketParticipations

    // Récupérer les sessions avec de nouvelles participations non consultées
    const sessionsWithNewParticipations = await prisma.marketSession.findMany({
      where: {
        status: {
          in: ['UPCOMING', 'ACTIVE']
        },
        participations: {
          some: {
            status: 'CONFIRMED',
            viewedAt: null
          }
        }
      },
      include: {
        participations: {
          where: {
            status: 'CONFIRMED',
            viewedAt: null
          },
          include: {
            grower: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    // Calculer le nombre total de nouvelles participations
    const totalNewParticipations = sessionsWithNewParticipations.reduce(
      (total: number, session: SessionWithParticipations) => total + session.participations.length,
      0
    );

    // Formater les données pour la réponse
    const sessions = sessionsWithNewParticipations.map((session: SessionWithParticipations) => ({
      id: session.id,
      name: session.name,
      date: session.date.toISOString(),
      newParticipationsCount: session.participations.length
    }));

    res.status(200).json({
      totalNewParticipations,
      sessions
    });

  } catch (error) {
    console.error('Error fetching pending market sessions count:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération du nombre de sessions en attente',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}