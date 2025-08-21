import type { NextApiRequest, NextApiResponse } from 'next';
import { apiUseCases } from '@/server';
import { IGrower } from '@/server/grower/IGrower';

type Data = {
  success: boolean;
  message: string;
  grower?: IGrower;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Vérifier l'authentification admin
    const adminResult = apiUseCases.verifyAdminToken({ req, res });
    if (!adminResult) {
      return res.status(401).json({ success: false, message: 'Non autorisé' });
    }

    const { id } = req.query;
    const { approved } = req.body;

    if (typeof id !== 'string') {
      return res.status(400).json({ success: false, message: 'ID producteur invalide' });
    }

    if (typeof approved !== 'boolean') {
      return res.status(400).json({ success: false, message: 'Statut d\'approbation invalide' });
    }

    // Mettre à jour le statut d'approbation du producteur
    const result = await apiUseCases.updateGrowerApproval(id, approved);
    
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message || 'Erreur lors de la mise à jour' });
    }

    return res.status(200).json({
      success: true,
      message: approved ? 'Producteur approuvé avec succès' : 'Approbation du producteur révoquée',
      grower: result.data
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'approbation:', error);
    return res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
  }
}