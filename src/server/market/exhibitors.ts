import { prisma } from '@/server/prisma';
import type { MarketProducer } from '@/types/market';

/**
 * Récupère les exposants confirmés pour une session de marché spécifique
 */
export async function getSessionExhibitors(sessionId: string): Promise<MarketProducer[]> {
  try {
    // Vérifier que la session existe
    const marketSession = await prisma.marketSession.findUnique({
      where: { id: sessionId },
      select: { id: true }
    });

    if (!marketSession) {
      console.error('Session de marché non trouvée:', sessionId);
      return [];
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

    // Transformer les données pour correspondre au type MarketProducer
    return exhibitors.map(exhibitor => ({
      id: exhibitor.id,
      name: exhibitor.name,
      email: exhibitor.email,
      phone: exhibitor.phone || undefined,
      description: undefined, // Le modèle Grower n'a pas de description
      specialties: [], // Le modèle Grower n'a pas de specialties
      marketProducts: exhibitor.marketProducts.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description || undefined,
        imageUrl: product.imageUrl || undefined,
        price: Number(product.price),
        unit: product.unit || '',
        category: product.category || '',
        stock: product.stock
      }))
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des exposants:', error);
    return [];
  }
}