import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/server/prisma';
import { PublicExhibitor, PublicMarketProduct } from '@/types/market';

/**
 * API pour récupérer les exposants d'une session de marché spécifique
 * GET /api/market/sessions/[id]/exhibitors
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PublicExhibitor[] | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { id: sessionId } = req.query;

  if (!sessionId || typeof sessionId !== 'string') {
    return res.status(400).json({ error: 'ID de session requis' });
  }

  try {
    // Vérifier que la session existe
    const marketSession = await prisma.marketSession.findUnique({
      where: { id: sessionId },
      select: { id: true, status: true }
    });

    if (!marketSession) {
      return res.status(404).json({ error: 'Session de marché non trouvée' });
    }

    // Récupérer les producteurs confirmés pour cette session avec leurs produits
    const exhibitors = await prisma.grower.findMany({
      where: {
        participations: {
          some: {
            sessionId: sessionId,
            status: 'CONFIRMED'
          }
        }
      },
      include: {
        assignment: {
          select: {
            name: true
          }
        },
        marketProducts: {
          where: {
            marketSessionId: sessionId,
            isActive: true
          },
          select: {
            id: true,
            name: true,
            description: true,
            imageUrl: true,
            price: true,
            unit: true,
            category: true,
            stock: true
          }
        }
      }
    });

    // Transformer les données pour correspondre au type PublicExhibitor
    const publicExhibitors: PublicExhibitor[] = exhibitors.map(exhibitor => ({
      id: exhibitor.id,
      name: exhibitor.name,
      profilePhoto: exhibitor.profilePhoto,
      description: undefined, // Le modèle Grower n'a pas de description
      specialties: [], // Le modèle Grower n'a pas de specialties
      email: exhibitor.email,
      phone: exhibitor.phone || undefined,
      zone: exhibitor.assignment?.name || undefined,
      products: exhibitor.marketProducts.map((product): PublicMarketProduct => ({
        id: product.id,
        name: product.name,
        description: product.description || undefined,
        imageUrl: product.imageUrl || undefined,
        price: Number(product.price),
        unit: product.unit || undefined,
        category: product.category || undefined,
        stock: product.stock
      })),
      nextMarketDate: marketSession.status === 'UPCOMING' ? new Date().toISOString() : undefined
    }));

    return res.status(200).json(publicExhibitors);
  } catch (error) {
    console.error('Erreur lors de la récupération des exposants:', error);
    return res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}