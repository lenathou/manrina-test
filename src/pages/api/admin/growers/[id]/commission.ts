import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/server/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'ID du producteur manquant' });
    }

    // Validation des données
    const { commissionRate } = req.body;
    
    if (typeof commissionRate !== 'number' || commissionRate < 0 || commissionRate > 100) {
      return res.status(400).json({ 
        message: 'Le taux de commission doit être un nombre entre 0 et 100'
      });
    }

    // Vérifier que le producteur existe
    const existingGrower = await prisma.grower.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        commissionRate: true,
      },
    });

    if (!existingGrower) {
      return res.status(404).json({ message: 'Producteur non trouvé' });
    }

    // Mettre à jour la commission du producteur
    const updatedGrower = await prisma.grower.update({
      where: { id },
      data: {
        commissionRate,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        commissionRate: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      message: 'Commission mise à jour avec succès',
      grower: updatedGrower,
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la commission:', error);
    return res.status(500).json({ 
      message: 'Erreur interne du serveur',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
}