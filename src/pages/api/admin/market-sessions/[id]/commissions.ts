import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/server/prisma';
import { Prisma } from '@prisma/client';

interface CommissionData {
  growerId: string;
  turnover: number;
  commissionAmount: number;
  customCommissionRate?: number | null;
}

interface RequestBody {
  commissions: CommissionData[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const { id: sessionId } = req.query;
  const { commissions }: RequestBody = req.body;

  if (!sessionId || typeof sessionId !== 'string') {
    return res.status(400).json({ message: 'ID de session invalide' });
  }

  if (!commissions || !Array.isArray(commissions)) {
    return res.status(400).json({ message: 'Données de commission invalides' });
  }

  try {
    // Vérifier que la session existe et est active ou à venir
    const session = await prisma.marketSession.findUnique({
      where: { id: sessionId },
      select: { id: true, status: true }
    });

    if (!session) {
      return res.status(404).json({ message: 'Session non trouvée' });
    }

    if (session.status !== 'ACTIVE' && session.status !== 'UPCOMING') {
      return res.status(400).json({ message: 'La session doit être active ou à venir pour gérer les commissions' });
    }

    // Vérifier que tous les producteurs existent et participent à la session
    const growerIds = commissions.map(c => c.growerId);
    const participations = await prisma.marketParticipation.findMany({
      where: {
        sessionId: sessionId,
        growerId: { in: growerIds }
      },
      select: { growerId: true }
    });

    const validGrowerIds = new Set(participations.map(p => p.growerId));
    const invalidGrowers = growerIds.filter(id => !validGrowerIds.has(id));

    if (invalidGrowers.length > 0) {
      return res.status(400).json({ 
        message: 'Certains producteurs ne participent pas à cette session',
        invalidGrowers 
      });
    }

    // Créer ou mettre à jour les enregistrements de commission
    const commissionRecords = await Promise.all(
      commissions.map(async (commission) => {
        if (commission.turnover <= 0) {
          // Si le chiffre d'affaires est 0, supprimer l'enregistrement s'il existe
          await prisma.growerCommission.deleteMany({
            where: {
              marketSessionId: sessionId,
              growerId: commission.growerId
            }
          });
          return null;
        }

        // Créer ou mettre à jour l'enregistrement
        return await prisma.growerCommission.upsert({
          where: {
            marketSessionId_growerId: {
              marketSessionId: sessionId,
              growerId: commission.growerId
            }
          },
          update: {
            turnover: new Prisma.Decimal(commission.turnover),
            commissionAmount: new Prisma.Decimal(commission.commissionAmount),
            customCommissionRate: commission.customCommissionRate ? new Prisma.Decimal(commission.customCommissionRate) : null,
            updatedAt: new Date()
          },
          create: {
            marketSessionId: sessionId,
            growerId: commission.growerId,
            turnover: new Prisma.Decimal(commission.turnover),
            commissionAmount: new Prisma.Decimal(commission.commissionAmount),
            customCommissionRate: commission.customCommissionRate ? new Prisma.Decimal(commission.customCommissionRate) : null
          }
        });
      })
    );

    const savedCommissions = commissionRecords.filter(record => record !== null);

    return res.status(200).json({
      message: 'Commissions sauvegardées avec succès',
      count: savedCommissions.length,
      commissions: savedCommissions
    });

  } catch (error) {
    console.error('Erreur lors de la sauvegarde des commissions:', error);
    return res.status(500).json({ 
      message: 'Erreur interne du serveur',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}