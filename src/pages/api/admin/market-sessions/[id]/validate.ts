import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/server/prisma';
import { ParticipationStatus, MarketStatus } from '@prisma/client';

interface RequestBody {
  forceValidation?: boolean; // Pour forcer la validation même si tous les producteurs n'ont pas de chiffre d'affaires
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const { id: sessionId } = req.query;
  const { forceValidation = false }: RequestBody = req.body;

  if (!sessionId || typeof sessionId !== 'string') {
    return res.status(400).json({ message: 'ID de session invalide' });
  }

  try {
    // Vérifier que la session existe et est active
    const session = await prisma.marketSession.findUnique({
      where: { id: sessionId },
      include: {
        participations: {
          where: { status: 'CONFIRMED' },
          include: { grower: true }
        },
        growerCommissions: true
      }
    });

    if (!session) {
      return res.status(404).json({ message: 'Session non trouvée' });
    }

    // Permettre la validation des sessions ACTIVE et UPCOMING (pour les tests)
    if (session.status !== 'ACTIVE' && session.status !== 'UPCOMING') {
      return res.status(400).json({ message: 'Seules les sessions actives ou à venir peuvent être validées' });
    }

    // Vérifier les producteurs avec et sans chiffre d'affaires
    const confirmedParticipations = session.participations;
    const commissionsMap = new Map(session.growerCommissions.map(c => [c.growerId, c]));
    
    const growersWithTurnover = confirmedParticipations.filter(p => {
      const commission = commissionsMap.get(p.growerId);
      return commission && parseFloat(commission.turnover.toString()) > 0;
    });
    
    const growersWithoutTurnover = confirmedParticipations.filter(p => {
      const commission = commissionsMap.get(p.growerId);
      return !commission || parseFloat(commission.turnover.toString()) <= 0;
    });

    // Si il y a des producteurs sans chiffre d'affaires et que la validation n'est pas forcée
    if (growersWithoutTurnover.length > 0 && !forceValidation) {
      return res.status(400).json({
        message: 'Validation incomplète',
        growersWithoutTurnover: growersWithoutTurnover.map(p => ({
          id: p.growerId,
          name: p.grower.name,
          email: p.grower.email
        })),
        requiresConfirmation: true
      });
    }

    // Si tous les producteurs ont un chiffre d'affaires et que la validation n'est pas forcée
    if (growersWithoutTurnover.length === 0 && !forceValidation) {
      return res.status(200).json({
        message: 'Tous les producteurs ont un chiffre d\'affaires',
        allGrowersHaveTurnover: true,
        requiresConfirmation: true,
        growersWithTurnover: growersWithTurnover.map(p => ({
          id: p.growerId,
          name: p.grower.name,
          email: p.grower.email
        }))
      });
    }

    // Procéder à la validation
    await prisma.$transaction(async (tx) => {
      // Marquer les producteurs avec chiffre d'affaires comme VALIDATED
      if (growersWithTurnover.length > 0) {
        await tx.marketParticipation.updateMany({
          where: {
            sessionId: sessionId,
            growerId: { in: growersWithTurnover.map(p => p.growerId) }
          },
          data: {
            status: ParticipationStatus.VALIDATED
          }
        });
      }

      // Marquer les producteurs sans chiffre d'affaires comme DECLINED (considérés comme absents)
      if (growersWithoutTurnover.length > 0) {
        await tx.marketParticipation.updateMany({
          where: {
            sessionId: sessionId,
            growerId: { in: growersWithoutTurnover.map(p => p.growerId) }
          },
          data: {
            status: ParticipationStatus.DECLINED
          }
        });
      }

      // Clôturer la session
      await tx.marketSession.update({
        where: { id: sessionId },
        data: {
          status: MarketStatus.COMPLETED
        }
      });
    });

    return res.status(200).json({
      message: 'Session validée et clôturée avec succès',
      validatedGrowers: growersWithTurnover.length,
      declinedGrowers: growersWithoutTurnover.length,
      sessionStatus: 'COMPLETED'
    });

  } catch (error) {
    console.error('Erreur lors de la validation de la session:', error);
    return res.status(500).json({ 
      message: 'Erreur interne du serveur',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}