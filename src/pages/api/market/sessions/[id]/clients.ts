import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/server/prisma';
import { apiUseCases } from '@/server';
import { ClientMarketAttendance } from '@prisma/client';

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
      // Récupérer les clients qui ont signalé leur participation à cette session
      const clientAttendances = await prisma.clientMarketAttendance.findMany({
          where: {
            marketSessionId: id
          },
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                createdAt: true,
              }
            },
            marketSession: {
              select: {
                id: true,
                name: true,
                date: true,
              }
            }
          }
        });

      // Transformer les données pour correspondre à l'interface ClientAttendance
      const clients = clientAttendances.map((attendance: ClientMarketAttendance & {
        customer: {
          id: string;
          name: string;
          email: string;
          phone: string;
          createdAt: Date;
        };
        marketSession: {
          id: string;
          name: string;
          date: Date;
        };
      }) => ({
        id: attendance.id,
        customer: {
          id: attendance.customer.id,
          name: attendance.customer.name,
          email: attendance.customer.email,
          phone: attendance.customer.phone,
          createdAt: attendance.customer.createdAt,
        }
      }));

      res.status(200).json(clients);
    } catch (error) {
      console.error('Error fetching session clients:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}