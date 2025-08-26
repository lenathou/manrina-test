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
      const validatedParticipations = await prisma.marketParticipation.findMany({
        where: {
          sessionId: id,
          status: 'VALIDATED'
        },
        include: {
            grower: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                createdAt: true,
              }
            }
          },
        orderBy: {
          grower: {
            name: 'asc'
          }
        }
      });

      res.status(200).json(validatedParticipations);
    } catch (error) {
      console.error('Error fetching validated producers:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}