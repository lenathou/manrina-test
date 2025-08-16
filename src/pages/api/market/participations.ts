import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case 'GET':
        return await getParticipations(req, res);
      case 'POST':
        return await createOrUpdateParticipation(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  } finally {
    await prisma.$disconnect();
  }
}

async function getParticipations(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { growerId, sessionId } = req.query;

  if (!growerId && !sessionId) {
    return res.status(400).json({ 
      message: 'growerId ou sessionId requis' 
    });
  }

  const where: { growerId?: string; sessionId?: string } = {};
  if (growerId) where.growerId = growerId as string;
  if (sessionId) where.sessionId = sessionId as string;

  const participations = await prisma.marketParticipation.findMany({
    where,
    include: {
      session: {
        select: {
          id: true,
          name: true,
          date: true,
          status: true,
          location: true
        }
      },
      grower: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return res.status(200).json(participations);
}

async function createOrUpdateParticipation(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { sessionId, growerId, status } = req.body;

  if (!sessionId || !growerId || !status) {
    return res.status(400).json({ 
      message: 'sessionId, growerId et status sont requis' 
    });
  }

  if (!['PENDING', 'CONFIRMED', 'DECLINED'].includes(status)) {
    return res.status(400).json({ 
      message: 'Status doit être PENDING, CONFIRMED ou DECLINED' 
    });
  }

  // Vérifier que la session existe
  const session = await prisma.marketSession.findUnique({
    where: { id: sessionId }
  });

  if (!session) {
    return res.status(404).json({ 
      message: 'Session de marché non trouvée' 
    });
  }

  // Vérifier que le producteur existe
  const grower = await prisma.grower.findUnique({
    where: { id: growerId }
  });

  if (!grower) {
    return res.status(404).json({ 
      message: 'Producteur non trouvé' 
    });
  }

  // Créer ou mettre à jour la participation
  const participation = await prisma.marketParticipation.upsert({
    where: {
      sessionId_growerId: {
        sessionId,
        growerId
      }
    },
    update: {
      status,
      confirmedAt: status === 'CONFIRMED' ? new Date() : null,
      updatedAt: new Date()
    },
    create: {
      sessionId,
      growerId,
      status,
      confirmedAt: status === 'CONFIRMED' ? new Date() : null
    },
    include: {
      session: {
        select: {
          id: true,
          name: true,
          date: true,
          status: true,
          location: true
        }
      },
      grower: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  return res.status(200).json(participation);
}