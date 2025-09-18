// DEPRECATED: Cette API utilise une architecture obsolète.
// TODO: Migrer vers l'architecture recommandée avec MarketUseCases et le système [functionToRun].
// Cette route devrait être refactorisée pour utiliser apiUseCases au lieu d'accéder directement à PrismaClient.

import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, Prisma } from '@prisma/client';
import { MarketStatus } from '@prisma/client';
import {
  MarketSessionWhereInput,
  MarketSessionUpdateData,
  CreateMarketSessionBody,
  UpdateMarketSessionBody,
} from '@/types/api';
import { convertMartiniqueToUTC } from '@/utils/dateUtils';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case 'GET':
        return await getMarketSessions(req, res);
      case 'POST':
        return await createMarketSession(req, res);
      case 'PUT':
        return await updateMarketSession(req, res);
      case 'DELETE':
        return await deleteMarketSession(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Market sessions API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /api/market/sessions - Récupérer les sessions de marché
async function getMarketSessions(req: NextApiRequest, res: NextApiResponse) {
  const { status, upcoming, limit } = req.query;

  const where: MarketSessionWhereInput = {};
  
  if (status && typeof status === 'string') {
    where.status = status as MarketStatus;
  }
  
  if (upcoming === 'true') {
    where.date = {
      gte: new Date()
    };
  } else if (upcoming === 'false') {
    where.date = {
      lt: new Date()
    };
  }

  // Construire les options de requête
  const isSummary = req.query.summary === "true";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const queryOptions: any = {
    where,
    include: isSummary
      ? {
          partners: { include: { partner: { select: { id: true, name: true } } } },
          _count: { select: { marketProducts: true, participations: true } },
        }
      : {
          marketProducts: { include: { grower: { select: { id: true, name: true, email: true } } } },
          participations: { include: { grower: { select: { id: true, name: true, email: true } } } },
          partners: { include: { partner: true } },
          _count: { select: { marketProducts: true, participations: true } },
        },
    orderBy: { date: 'asc' },
  };

  // Ajouter take seulement si limit est valide
  if (limit && typeof limit === 'string') {
    const parsedLimit = parseInt(limit, 10);
    if (!isNaN(parsedLimit) && parsedLimit > 0) {
      queryOptions.take = parsedLimit;
    }
  }

  const sessions = await prisma.marketSession.findMany(queryOptions);

  return res.status(200).json({ sessions });
}

// POST /api/market/sessions - Créer une nouvelle session de marché
async function createMarketSession(req: NextApiRequest, res: NextApiResponse) {
  const { name, date, description, location, startTime, endTime, partnerIds }: CreateMarketSessionBody = req.body;

  if (!name || !date) {
    return res.status(400).json({ error: 'Name and date are required' });
  }

  // Convertir les dates et heures de Martinique vers UTC
  const sessionDate = convertMartiniqueToUTC(date);
  const sessionStartTime = startTime ? convertMartiniqueToUTC(date, startTime) : null;
  const sessionEndTime = endTime ? convertMartiniqueToUTC(date, endTime) : null;

  // Vérifier s'il existe déjà une session avec exactement les mêmes caractéristiques
  const existingSession = await prisma.marketSession.findFirst({
    where: {
      name: name.trim(),
      date: sessionDate,
      description: description?.trim() || null,
      location: location?.trim() || null,
      startTime: sessionStartTime,
      endTime: sessionEndTime,
    }
  });

  if (existingSession) {
    return res.status(409).json({ 
      error: 'Une session de marché identique existe déjà',
      details: 'Une session avec le même nom, date, description, lieu et horaires existe déjà dans le système.',
      existingSessionId: existingSession.id
    });
  }

  // Préparer les données de création
  const createData: Prisma.MarketSessionCreateInput = {
    name: name.trim(),
    date: sessionDate,
    description: description?.trim() || null,
    location: location?.trim() || null,
    startTime: sessionStartTime,
    endTime: sessionEndTime,
    status: MarketStatus.UPCOMING
  };

  // Ajouter les partenaires seulement s'il y en a
  if (partnerIds && partnerIds.length > 0) {
    createData.partners = {
      create: partnerIds.map(partnerId => ({
        partnerId
      }))
    };
  }

  const session = await prisma.marketSession.create({
    data: createData,
    include: {
      _count: {
        select: {
          marketProducts: true
        }
      },
      partners: {
        include: {
          partner: true
        }
      }
    }
  });

  return res.status(201).json(session);
}

// PUT /api/market/sessions - Mettre à jour une session de marché
async function updateMarketSession(req: NextApiRequest, res: NextApiResponse) {
  const { id, name, date, description, location, startTime, endTime, status, partnerIds }: UpdateMarketSessionBody = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Session ID is required' });
  }

  try {

  // Récupérer la session existante pour obtenir la date si elle n'est pas fournie
  let sessionDate = date;
  if (!sessionDate && (startTime !== undefined || endTime !== undefined)) {
    const existingSession = await prisma.marketSession.findUnique({
      where: { id },
      select: { date: true }
    });
    if (existingSession) {
      // Convertir la date UTC de la base vers le format YYYY-MM-DD en heure locale Martinique
      sessionDate = existingSession.date.toISOString().split('T')[0];
    }
  }

  const updateData: MarketSessionUpdateData = {};
  
  if (name) updateData.name = name;
  if (date) {
    // Convertir la date de Martinique vers UTC
    updateData.date = convertMartiniqueToUTC(date);
  }
  if (description !== undefined) updateData.description = description;
  if (location !== undefined) updateData.location = location;
  if (startTime !== undefined) updateData.startTime = startTime && sessionDate ? convertMartiniqueToUTC(sessionDate, startTime) : null;
  if (endTime !== undefined) updateData.endTime = endTime && sessionDate ? convertMartiniqueToUTC(sessionDate, endTime) : null;
  if (status) updateData.status = status as MarketStatus;

  // Utiliser une transaction pour mettre à jour la session et les partenaires
  const session = await prisma.$transaction(async (tx) => {
    // Mettre à jour la session

    // Gérer la mise à jour des partenaires si fournis
    if (partnerIds !== undefined) {
      // Supprimer les relations existantes
      await tx.marketSessionPartner.deleteMany({
        where: { marketSessionId: id }
      });
      
      // Créer les nouvelles relations
      if (partnerIds.length > 0) {
        await tx.marketSessionPartner.createMany({
          data: partnerIds.map(partnerId => ({
            marketSessionId: id,
            partnerId
          }))
        });
      }
    }

    // Récupérer la session complète avec les relations
    return await tx.marketSession.findUnique({
      where: { id },
      include: {
        marketProducts: {
          include: {
            grower: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            marketProducts: true
          }
        },
        partners: {
          include: {
            partner: true
          }
        }
      }
    });
  });

  return res.status(200).json(session);
  } catch (error) {
    console.error('Error updating market session:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// DELETE /api/market/sessions - Supprimer une session de marché
async function deleteMarketSession(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Session ID is required' });
  }

  try {
    // Vérifier si la session existe et si elle peut être supprimée
    const session = await prisma.marketSession.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            marketProducts: true
          }
        }
      }
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Empêcher la suppression si la session est active
    if (session.status === MarketStatus.ACTIVE) {
      return res.status(400).json({ error: 'Cannot delete an active market session' });
    }

    // Note: Les produits associés seront supprimés automatiquement grâce à onDelete: Cascade

    await prisma.marketSession.delete({
      where: { id }
    });

    return res.status(200).json({ 
      message: 'Session deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting session:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

