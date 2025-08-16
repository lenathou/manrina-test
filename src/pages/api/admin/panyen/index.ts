import type { NextApiRequest, NextApiResponse } from 'next';
import { IPanyenCreateInput } from '@/server/panyen/IPanyen';
import { apiUseCases } from '@/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Vérification de l'authentification admin
    const adminPayload = await apiUseCases.verifyAdminToken({ req, res });
    if (!adminPayload) {
      return res.status(401).json({ error: 'Non autorisé' });
    }

    switch (req.method) {
      case 'GET':
        return handleGet(req, res);
      case 'POST':
        return handlePost(req, res);
      default:
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }
  } catch (error) {
    console.error('Erreur dans l\'API panyen:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Erreur interne du serveur' 
    });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { withStock } = req.query;

  const includeStock = withStock === 'true';
  const panyen = await apiUseCases.getAllPanyen(includeStock);
  return res.status(200).json({ data: panyen });
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const { name, description, imageUrl, price, showInStore, components }: IPanyenCreateInput = req.body;

  if (!name || !imageUrl || !components || price === undefined || price <= 0) {
    return res.status(400).json({ 
      error: 'Les champs name, imageUrl, price (> 0) et components sont requis' 
    });
  }

  const newPanyen = await apiUseCases.createPanyen({
    name,
    description,
    imageUrl,
    price,
    showInStore,
    components
  });

  return res.status(201).json({ data: newPanyen });
}