// Cette API est maintenant dépréciée.
// Utilisez l'API générique /api/getActiveMarketAnnouncements à la place.
// Cette route sera supprimée dans une version future.

import { NextApiRequest, NextApiResponse } from 'next';
import { apiUseCases } from '@/server';
import { MarketAnnouncement } from '@/server/market/IMarketAnnouncement';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MarketAnnouncement[] | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const announcements = await apiUseCases.getActiveMarketAnnouncements();
    res.status(200).json(announcements);
  } catch (error) {
    console.error('Erreur lors de la récupération des annonces:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}