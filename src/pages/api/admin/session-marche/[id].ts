import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/server/prisma';
import { Prisma } from '@prisma/client';
import { convertMartiniqueToUTC } from '@/utils/dateUtils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'ID de session invalide' });
  }

  try {
    switch (req.method) {
      case 'GET':
        return await getMarketSession(req, res, id);
      case 'PUT':
        return await updateMarketSession(req, res, id);
      case 'DELETE':
        return await deleteMarketSession(req, res, id);
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }
  } catch (error) {
    console.error('Erreur API:', error);
    return res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}

async function getMarketSession(
  req: NextApiRequest,
  res: NextApiResponse,
  id: string
) {
  try {
    const session = await prisma.marketSession.findUnique({
      where: { id },
      include: {
        participations: {
          include: {
            grower: true,
          },
        },
        marketProducts: true,
        _count: {
          select: {
            participations: true,
            marketProducts: true,
          },
        },
      },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session non trouvée' });
    }

    return res.status(200).json(session);
  } catch (error) {
    console.error('Erreur lors de la récupération de la session:', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération de la session' });
  }
}

async function updateMarketSession(
  req: NextApiRequest,
  res: NextApiResponse,
  id: string
) {
  try {
    const {
      name,
      description,
      location,
      date,
      startTime,
      endTime,
      commissionRate,
      tentsStatus,
      tablesStatus,
    } = req.body;

    // Validation des données
    if (!name || !date) {
      return res.status(400).json({ error: 'Le nom et la date sont requis' });
    }

    if (commissionRate !== undefined && (commissionRate < 0 || commissionRate > 100)) {
      return res.status(400).json({ error: 'Le taux de commission doit être entre 0 et 100%' });
    }

    if (tentsStatus && !['none', 'provided', 'required'].includes(tentsStatus)) {
      return res.status(400).json({ error: 'Statut des chapiteaux invalide' });
    }

    if (tablesStatus && !['none', 'provided', 'required'].includes(tablesStatus)) {
      return res.status(400).json({ error: 'Statut des tables invalide' });
    }

    // Vérifier que la session existe
    const existingSession = await prisma.marketSession.findUnique({
      where: { id },
    });

    if (!existingSession) {
      return res.status(404).json({ error: 'Session non trouvée' });
    }

    // Préparer les données de mise à jour
    const updateData: Prisma.MarketSessionUpdateInput = {
      updatedAt: new Date(),
    };

    // Ajouter les champs seulement s'ils sont fournis
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description || null;
    if (location !== undefined) updateData.location = location || null;
    if (date !== undefined) updateData.date = convertMartiniqueToUTC(date);
    if (startTime !== undefined) {
      if (startTime && startTime.trim() !== '') {
        try {
          updateData.startTime = convertMartiniqueToUTC(date || new Date().toISOString().split('T')[0], startTime);
        } catch (error) {
          console.error('Error parsing startTime:', error);
          updateData.startTime = null;
        }
      } else {
        updateData.startTime = null;
      }
    }
    if (endTime !== undefined) {
      if (endTime && endTime.trim() !== '') {
        try {
          updateData.endTime = convertMartiniqueToUTC(date || new Date().toISOString().split('T')[0], endTime);
        } catch (error) {
          console.error('Error parsing endTime:', error);
          updateData.endTime = null;
        }
      } else {
        updateData.endTime = null;
      }
    }
    if (commissionRate !== undefined) updateData.commissionRate = parseFloat(commissionRate) || 0;
    if (tentsStatus !== undefined) updateData.tentsStatus = tentsStatus;
    if (tablesStatus !== undefined) updateData.tablesStatus = tablesStatus;

    // Mettre à jour la session
    const updatedSession = await prisma.marketSession.update({
      where: { id },
      data: updateData,
      include: {
        participations: {
          include: {
            grower: true,
          },
        },
        marketProducts: true,
        _count: {
          select: {
            participations: true,
            marketProducts: true,
          },
        },
      },
    });

    return res.status(200).json(updatedSession);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la session:', error);
    return res.status(500).json({ error: 'Erreur lors de la mise à jour de la session' });
  }
}

async function deleteMarketSession(
  req: NextApiRequest,
  res: NextApiResponse,
  id: string
) {
  try {
    // Vérifier que la session existe
    const existingSession = await prisma.marketSession.findUnique({
      where: { id },
      include: {
        participations: true,
      },
    });

    if (!existingSession) {
      return res.status(404).json({ error: 'Session non trouvée' });
    }

    // Vérifier s'il y a des participants confirmés
    const confirmedParticipants = existingSession.participations.filter(
      (p: { status: string }) => p.status === 'CONFIRMED'
    );

    if (confirmedParticipants.length > 0) {
      return res.status(400).json({
        error: 'Impossible de supprimer une session avec des participants confirmés',
        confirmedParticipants: confirmedParticipants.length,
      });
    }

    // Supprimer la session (les participations et produits seront supprimés en cascade)
    await prisma.marketSession.delete({
      where: { id },
    });

    return res.status(200).json({ message: 'Session supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la session:', error);
    return res.status(500).json({ error: 'Erreur lors de la suppression de la session' });
  }
}