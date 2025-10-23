import { NextApiRequest, NextApiResponse } from 'next';
import { Prisma } from '@prisma/client';
import { prisma } from '@/server/prisma';

/**
 * API pour marquer les réponses de validation de stock comme consultées
 * POST /api/grower/mark-stock-responses-viewed
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    const { growerId, responseIds } = req.body;

    if (!growerId || typeof growerId !== 'string') {
      return res.status(400).json({ message: 'ID du producteur requis' });
    }

    // Si responseIds est fourni, marquer seulement ces réponses spécifiques
    // Sinon, marquer toutes les réponses non consultées du producteur
    const whereCondition: Prisma.GrowerStockUpdateWhereInput = {
      growerId: growerId,
      status: {
        in: ['APPROVED', 'REJECTED']
      },
      processedDate: {
        not: null
      },
      viewedAt: null
    };

    if (responseIds && Array.isArray(responseIds) && responseIds.length > 0) {
      whereCondition.id = {
        in: responseIds
      };
    }

    // Marquer les réponses comme consultées
    const updatedCount = await prisma.growerStockUpdate.updateMany({
      where: whereCondition,
      data: {
        viewedAt: new Date()
      }
    });

    return res.status(200).json({ 
      message: 'Réponses marquées comme consultées',
      updatedCount: updatedCount.count
    });
  } catch (error) {
    console.error('Erreur lors du marquage des réponses comme consultées:', error);
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  }
}