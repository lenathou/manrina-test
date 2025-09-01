import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/server/prisma';
import { PublicExhibitor, PublicMarketProduct } from '@/types/market';

/**
 * API pour récupérer un exposant spécifique par son ID
 * GET /api/market/exhibitors/[id]
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PublicExhibitor | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID exposant requis' });
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
      return res.status(404).json({ error: 'Aucune session de marché trouvée' });
    }

    // Récupérer l'exposant avec ses produits
    const exhibitor = await prisma.grower.findFirst({
      where: {
        id: id,
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

    if (!exhibitor) {
      return res.status(404).json({ error: 'Exposant non trouvé' });
    }

    // Transformer les données pour l'affichage public
    const categories = exhibitor.marketProducts.map(p => p.category).filter(Boolean);
    const uniqueCategories = Array.from(new Set(categories)) as string[];
    
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

    const publicExhibitor: PublicExhibitor = {
      id: exhibitor.id,
      name: exhibitor.name,
      profilePhoto: exhibitor.profilePhoto,
      description: exhibitor.bio || undefined, // Bio du producteur
      specialties: uniqueCategories,
      email: exhibitor.email,
      phone: exhibitor.phone || undefined,
      zone: exhibitor.assignment?.name || undefined,
      products,
      nextMarketDate: nextMarketSession?.date?.toISOString() || null
    };

    res.status(200).json(publicExhibitor);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'exposant:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}