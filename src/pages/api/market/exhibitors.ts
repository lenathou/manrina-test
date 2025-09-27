import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/server/prisma';
import { PublicExhibitor, PublicMarketProduct } from '@/types/market';

/**
 * API pour récupérer les exposants du prochain marché
 * GET /api/market/exhibitors
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PublicExhibitor[] | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    // Récupérer la prochaine session de marché active ou à venir
    const nextMarketSession = await prisma.marketSession.findFirst({
      where: {
        status: {
          in: ['UPCOMING', 'ACTIVE']
        },
        date: {
          gte: new Date()
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    if (!nextMarketSession) {
      return res.status(200).json([]);
    }

    // Récupérer les producteurs confirmés pour cette session avec leurs produits
    const exhibitors = await prisma.grower.findMany({
      where: {
        participations: {
          some: {
            sessionId: nextMarketSession.id,
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
            marketSessionId: nextMarketSession.id,
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

    // Transformer les données pour l'affichage public
    const publicExhibitors: PublicExhibitor[] = exhibitors.map(exhibitor => {
      // Utiliser la zone d'affectation comme spécialité
      const specialties = exhibitor.assignment?.name ? [exhibitor.assignment.name] : [];
      
      const products: PublicMarketProduct[] = exhibitor.marketProducts.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description || undefined,
        imageUrl: product.imageUrl || undefined,
        price: Number(product.price),
        unit: product.unit || undefined,
        category: product.category || undefined,
        stock: product.stock
      }));

      return {
        id: exhibitor.id,
        name: exhibitor.name,
        profilePhoto: exhibitor.profilePhoto,
        description: exhibitor.bio || undefined,
        specialties: specialties,
        email: exhibitor.email,
        phone: exhibitor.phone || undefined,
        zone: exhibitor.assignment?.name || undefined,
        products,
        nextMarketDate: nextMarketSession?.date?.toISOString() || null
      };
    });

    res.status(200).json(publicExhibitors);
  } catch (error) {
    console.error('Erreur lors de la récupération des exposants:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}