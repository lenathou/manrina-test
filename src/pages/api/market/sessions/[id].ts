import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/server/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID de session invalide' });
  }

  if (req.method === 'GET') {
    try {
      const marketSession = await prisma.marketSession.findUnique({
        where: { id: id },
        select: {
          id: true,
          name: true,
          description: true,
          location: true,
          date: true,
          startTime: true,
          endTime: true,
          status: true
        }
      });

      if (!marketSession) {
        return res.status(404).json({ error: 'Événement introuvable' });
      }

      // Transformer la réponse pour correspondre au format attendu par la page
      const response = {
        id: marketSession.id,
        date: marketSession.date,
        title: marketSession.name,
        description: marketSession.description,
        location: marketSession.location,
        startTime: marketSession.startTime,
        endTime: marketSession.endTime,
        status: marketSession.status
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error fetching market session:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}