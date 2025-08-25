import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/server/database/prisma';
import { apiUseCases } from '@/server';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Vérifier l'authentification du client
    const customerToken = await apiUseCases.verifyCustomerToken({ req, res });
    if (!customerToken) {
        return res.status(401).json({ error: 'Token client invalide' });
    }
    const customerId = customerToken.id;
    
    if (!customerId) {
      return res.status(401).json({ error: 'Non autorisé' });
    }

    switch (req.method) {
      case 'POST':
        return await createAttendance(req, res, customerId);
      case 'DELETE':
        return await cancelAttendance(req, res, customerId);
      case 'GET':
        return await getAttendance(req, res, customerId);
      default:
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }
  } catch (error) {
    console.error('Erreur dans l\'API market-attendance:', error);
    return res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}

// Créer un signalement de présence
async function createAttendance(
  req: NextApiRequest,
  res: NextApiResponse,
  customerId: string
) {
  const { marketSessionId } = req.body;

  if (!marketSessionId) {
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

    // Vérifier si le client a déjà signalé sa présence
    const existingAttendance = await prisma.clientMarketAttendance.findUnique({
      where: {
        customerId_marketSessionId: {
          customerId,
          marketSessionId
        }
      }
    });

    if (existingAttendance) {
      if (existingAttendance.status === 'PLANNED') {
        return res.status(400).json({ error: 'Vous avez déjà signalé votre présence pour ce marché' });
      }
      
      // Si c'était annulé, on peut le réactiver
      const updatedAttendance = await prisma.clientMarketAttendance.update({
        where: { id: existingAttendance.id },
        data: {
          status: 'PLANNED',
          cancelledAt: null,
          updatedAt: new Date()
        }
      });
      
      return res.status(200).json({
        message: 'Présence signalée avec succès',
        attendance: updatedAttendance
      });
    }

    // Créer un nouveau signalement
    const attendance = await prisma.clientMarketAttendance.create({
      data: {
        customerId,
        marketSessionId,
        status: 'PLANNED'
      }
    });

    return res.status(201).json({
      message: 'Présence signalée avec succès',
      attendance
    });
  } catch (error) {
    console.error('Erreur lors de la création du signalement:', error);
    return res.status(500).json({ error: 'Erreur lors du signalement de présence' });
  }
}

// Annuler un signalement de présence
async function cancelAttendance(
  req: NextApiRequest,
  res: NextApiResponse,
  customerId: string
) {
  const { marketSessionId } = req.body;

  if (!marketSessionId) {
    return res.status(400).json({ error: 'ID de session de marché requis' });
  }

  try {
    const attendance = await prisma.clientMarketAttendance.findUnique({
      where: {
        customerId_marketSessionId: {
          customerId,
          marketSessionId
        }
      }
    });

    if (!attendance) {
      return res.status(404).json({ error: 'Aucun signalement de présence trouvé' });
    }

    if (attendance.status === 'CANCELLED') {
      return res.status(400).json({ error: 'Signalement déjà annulé' });
    }

    const updatedAttendance = await prisma.clientMarketAttendance.update({
      where: { id: attendance.id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        updatedAt: new Date()
      }
    });

    return res.status(200).json({
      message: 'Signalement de présence annulé',
      attendance: updatedAttendance
    });
  } catch (error) {
    console.error('Erreur lors de l\'annulation:', error);
    return res.status(500).json({ error: 'Erreur lors de l\'annulation du signalement' });
  }
}

// Récupérer le statut de présence pour une session
async function getAttendance(
  req: NextApiRequest,
  res: NextApiResponse,
  customerId: string
) {
  const { marketSessionId } = req.query;

  if (!marketSessionId || typeof marketSessionId !== 'string') {
    return res.status(400).json({ error: 'ID de session de marché requis' });
  }

  try {
    const attendance = await prisma.clientMarketAttendance.findUnique({
      where: {
        customerId_marketSessionId: {
          customerId,
          marketSessionId
        }
      }
    });

    return res.status(200).json({ attendance });
  } catch (error) {
    console.error('Erreur lors de la récupération:', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération du signalement' });
  }
}