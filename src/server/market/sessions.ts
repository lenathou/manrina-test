import { prisma } from '@/server/prisma';
import { MarketStatus } from '@prisma/client';

interface MarketSession {
  id: string;
  date: Date;
  title?: string;
  description?: string;
  name?: string;
  location?: string;
  status: MarketStatus;
}

/**
 * Récupère une session de marché par son ID
 */
export async function getMarketSessionById(sessionId: string): Promise<MarketSession | null> {
  try {
    const session = await prisma.marketSession.findUnique({
      where: {
        id: sessionId
      },
      select: {
        id: true,
        date: true,
        name: true,
        description: true,
        location: true,
        status: true
      }
    });

    if (!session) {
      return null;
    }

    return {
        id: session.id,
        date: session.date,
        title: session.name || '',
        description: session.description || undefined,
        name: session.name || '',
        location: session.location || undefined,
        status: session.status
      };
  } catch (error) {
    console.error('Erreur lors de la récupération de la session:', error);
    return null;
  }
}