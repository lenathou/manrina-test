import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, MarketStatus } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Vérifier que c'est bien une requête POST (pour les cron jobs)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Vérifier l'autorisation (optionnel: ajouter une clé API)
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Vérifier si on est samedi et qu'il est 20h (heure de Martinique)
    const now = new Date();
    const martiniqueTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Martinique"}));
    
    console.log('Cron job executed at:', martiniqueTime.toISOString());

    // Vérifier s'il y a déjà un marché automatique pour le samedi suivant
    const nextSaturday = getNextSaturday();
    const existingSession = await prisma.marketSession.findFirst({
      where: {
        date: {
          gte: nextSaturday,
          lt: new Date(nextSaturday.getTime() + 24 * 60 * 60 * 1000) // Même jour
        },
        isAutomatic: true
      }
    });

    if (existingSession) {
      console.log('Auto market session already exists for next Saturday');
      return res.status(200).json({ 
        message: 'Auto market session already exists',
        session: existingSession 
      });
    }

    // Créer le nouveau marché automatique
    const startTime = new Date(nextSaturday);
    startTime.setHours(10, 0, 0, 0); // 10h00
    
    const endTime = new Date(nextSaturday);
    endTime.setHours(18, 0, 0, 0); // 18h00

    const newSession = await prisma.marketSession.create({
      data: {
        name: `Marché hebdomadaire - ${nextSaturday.toLocaleDateString('fr-FR')}`,
        date: nextSaturday,
        description: 'Marché hebdomadaire automatique',
        location: 'Domaine Diam-Arlet, quartier palmiste, LES ANSES D\'ARLET, 97217, Martinique',
        startTime,
        endTime,
        status: MarketStatus.UPCOMING,
        isAutomatic: true,
        recurringDay: 6, // Samedi
        timezone: 'America/Martinique',
        autoCreateTime: '20:00'
      }
    });

    console.log('New auto market session created:', newSession.id);

    return res.status(201).json({
      message: 'Auto market session created successfully',
      session: newSession
    });

  } catch (error) {
    console.error('Error in auto market cron job:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
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