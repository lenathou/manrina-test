import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/server/prisma';
import { apiUseCases } from '@/server';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Vérifier l'authentification admin
  const adminResult = apiUseCases.verifyAdminToken({ req, res });
  if (!adminResult) {
    return res.status(401).json({ error: 'Non autorisé' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID de session invalide' });
  }

  if (req.method === 'GET') {
    try {
      const marketSession = await prisma.marketSession.findUnique({
        where: { id: id },
        include: {
          participations: {
            include: {
              grower: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                }
              }
            }
          },
          marketProducts: {
            include: {
              grower: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                }
              }
            }
          },
          partners: {
            include: {
              partner: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                }
              }
            }
          },
          _count: {
            select: {
              participations: true,
              marketProducts: true,
            }
          }
        }
      });

      if (!marketSession) {
        return res.status(404).json({ error: 'Session non trouvée' });
      }

      res.status(200).json(marketSession);
    } catch (error) {
      console.error('Error fetching market session:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}