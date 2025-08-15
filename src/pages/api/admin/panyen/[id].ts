import type { NextApiRequest, NextApiResponse } from 'next';
import { IPanyenUpdateInput } from '@/server/panyen/IPanyen';
import { apiUseCases } from '@/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Vérification de l'authentification admin
    const adminPayload = await apiUseCases.verifyAdminToken({ req, res });
    if (!adminPayload) {
      return res.status(401).json({ error: 'Non autorisé' });
    }

    const { id } = req.query;
    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'ID invalide' });
    }

    switch (req.method) {
      case 'GET':
        return handleGet(req, res, id);
      case 'PUT':
        return handlePut(req, res, id);
      case 'DELETE':
        return handleDelete(req, res, id);
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

async function handleGet(req: NextApiRequest, res: NextApiResponse, id: string) {
  const panyen = await apiUseCases.getPanyenById(id, true);
  
  if (!panyen) {
    return res.status(404).json({ error: 'Panyen non trouvé' });
  }
  
  return res.status(200).json({ data: panyen });
}

async function handlePut(req: NextApiRequest, res: NextApiResponse, id: string) {
  const updateData: IPanyenUpdateInput = req.body;

  const updatedPanyen = await apiUseCases.updatePanyen(id, updateData);
  
  return res.status(200).json({ data: updatedPanyen });
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse, id: string) {
  await apiUseCases.deletePanyen(id);
  
  return res.status(200).json({ message: 'Panyen supprimé avec succès' });
}