import { NextApiRequest, NextApiResponse } from 'next';
import { Prisma } from '@prisma/client';
import { prisma } from '@/server/database/prisma';
import { apiUseCases } from '@/server';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Vérifier l'authentification admin
    const adminToken = await apiUseCases.verifyAdminToken({ req, res });
    
    if (!adminToken) {
      return res.status(401).json({ error: 'Non autorisé' });
    }

    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    return await getClientAttendances(req, res);
  } catch (error) {
    console.error('Erreur dans l\'API client-attendances:', error);
    return res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}

// Récupérer la liste des clients ayant signalé leur présence
async function getClientAttendances(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id: marketSessionId } = req.query;
  const { search, page = '1', limit = '50' } = req.query;

  if (!marketSessionId || typeof marketSessionId !== 'string') {
    return res.status(400).json({ error: 'ID de session de marché requis' });
  }

  try {
    // Vérifier que la session de marché existe
    const marketSession = await prisma.marketSession.findUnique({
      where: { id: marketSessionId }
    });

    if (!marketSession) {
      return res.status(404).json({ error: 'Session de marché non trouvée' });
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Construire les conditions de recherche
    const whereConditions: Prisma.ClientMarketAttendanceWhereInput = {
      marketSessionId,
      status: 'PLANNED' // Seulement les signalements actifs
    };

    // Ajouter la recherche si fournie
    if (search && typeof search === 'string') {
      whereConditions.customer = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } }
        ]
      };
    }

    // Récupérer les signalements avec pagination
    const [attendances, total] = await Promise.all([
      prisma.clientMarketAttendance.findMany({
        where: whereConditions,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              createdAt: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limitNum
      }),
      prisma.clientMarketAttendance.count({
        where: whereConditions
      })
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return res.status(200).json({
      attendances,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: total,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPreviousPage: pageNum > 1
      },
      marketSession: {
        id: marketSession.id,
        name: marketSession.name,
        date: marketSession.date
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des signalements:', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération des signalements' });
  }
}