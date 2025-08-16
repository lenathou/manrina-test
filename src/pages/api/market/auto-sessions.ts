import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, MarketStatus } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case 'GET':
        return await getAutoMarketConfig(req, res);
      case 'POST':
        return await createAutoMarket(req, res);
      case 'PUT':
        return await updateAutoMarketConfig(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Auto market sessions API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /api/market/auto-sessions - Récupérer la configuration du marché automatique
async function getAutoMarketConfig(req: NextApiRequest, res: NextApiResponse) {
  const autoConfig = await prisma.marketSession.findFirst({
    where: {
      isAutomatic: true,
      status: MarketStatus.UPCOMING
    },
    orderBy: {
      date: 'desc'
    }
  });

  return res.status(200).json(autoConfig);
}

// POST /api/market/auto-sessions - Créer le prochain marché automatique
async function createAutoMarket(req: NextApiRequest, res: NextApiResponse) {
  const defaultConfig = {
    name: 'Marché hebdomadaire',
    description: 'Marché hebdomadaire automatique',
    location: 'Domaine Diam-Arlet, quartier palmiste, LES ANSES D\'ARLET, 97217, Martinique',
    recurringDay: 6, // Samedi
    timezone: 'America/Martinique',
    autoCreateTime: '20:00'
  };

  // Calculer la date du prochain samedi
  const nextSaturday = getNextSaturday();
  const startTime = new Date(nextSaturday);
  startTime.setHours(10, 0, 0, 0); // 10h00
  
  const endTime = new Date(nextSaturday);
  endTime.setHours(18, 0, 0, 0); // 18h00

  const session = await prisma.marketSession.create({
    data: {
      name: `${defaultConfig.name} - ${nextSaturday.toLocaleDateString('fr-FR')}`,
      date: nextSaturday,
      description: defaultConfig.description,
      location: defaultConfig.location,
      startTime,
      endTime,
      status: MarketStatus.UPCOMING,
      isAutomatic: true,
      recurringDay: defaultConfig.recurringDay,
      timezone: defaultConfig.timezone,
      autoCreateTime: defaultConfig.autoCreateTime
    }
  });

  return res.status(201).json(session);
}

// PUT /api/market/auto-sessions - Mettre à jour la configuration du marché automatique
async function updateAutoMarketConfig(req: NextApiRequest, res: NextApiResponse) {
  const { id, name, description, location, startTime, endTime, recurringDay, autoCreateTime } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Session ID is required' });
  }

  const updateData: any = {};
  
  if (name) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (location !== undefined) updateData.location = location;
  if (startTime !== undefined) updateData.startTime = startTime ? new Date(startTime) : null;
  if (endTime !== undefined) updateData.endTime = endTime ? new Date(endTime) : null;
  if (recurringDay !== undefined) updateData.recurringDay = recurringDay;
  if (autoCreateTime !== undefined) updateData.autoCreateTime = autoCreateTime;

  const session = await prisma.marketSession.update({
    where: { id },
    data: updateData
  });

  return res.status(200).json(session);
}

// Fonction utilitaire pour calculer le prochain samedi
function getNextSaturday(): Date {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = dimanche, 6 = samedi
  const daysUntilSaturday = (6 - dayOfWeek + 7) % 7;
  
  // Si on est samedi, prendre le samedi suivant
  const daysToAdd = daysUntilSaturday === 0 ? 7 : daysUntilSaturday;
  
  const nextSaturday = new Date(today);
  nextSaturday.setDate(today.getDate() + daysToAdd);
  nextSaturday.setHours(0, 0, 0, 0);
  
  return nextSaturday;
}