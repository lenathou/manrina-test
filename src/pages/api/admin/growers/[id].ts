import { NextApiRequest, NextApiResponse } from 'next';
import { IGrowerUpdateParams } from '@/server/grower/IGrowerRepository';
import { apiUseCases } from '@/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Vérification de l'authentification admin
    const adminToken = await apiUseCases.verifyAdminToken({ req, res });
    if (!adminToken) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'ID producteur requis' });
    }

    switch (req.method) {
      case 'GET':
        return await getGrowerDetails(req, res, id);
      case 'PUT':
        return await updateGrower(req, res, id);
      default:
        res.setHeader('Allow', ['GET', 'PUT']);
        return res.status(405).json({ message: `Méthode ${req.method} non autorisée` });
    }
  } catch (error) {
    console.error('Erreur dans l\'API producteur:', error);
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  }
}

async function getGrowerDetails(req: NextApiRequest, res: NextApiResponse, growerId: string) {
  try {
    const grower = await apiUseCases.findGrowerById(growerId);
    
    if (!grower) {
      return res.status(404).json({ message: 'Producteur non trouvé' });
    }

    return res.status(200).json({ data: grower });
  } catch (error) {
    console.error('Erreur lors de la récupération du producteur:', error);
    return res.status(500).json({ message: 'Erreur lors de la récupération du producteur' });
  }
}

async function updateGrower(req: NextApiRequest, res: NextApiResponse, growerId: string) {
  try {
    const updateData: Partial<IGrowerUpdateParams> = req.body;
    
    // Validation des données requises
    if (!updateData.name && !updateData.email && !updateData.phone && !updateData.siret && !updateData.bio && !updateData.profilePhoto && updateData.assignmentId === undefined) {
      return res.status(400).json({ message: 'Aucune donnée à mettre à jour' });
    }

    // Vérifier que le producteur existe
    const existingGrower = await apiUseCases.findGrowerById(growerId);
    if (!existingGrower) {
      return res.status(404).json({ message: 'Producteur non trouvé' });
    }

    // Préparer les données de mise à jour en filtrant les valeurs undefined
    const filteredUpdateData = Object.fromEntries(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );
    
    const growerUpdateParams: IGrowerUpdateParams = {
      id: growerId,
      ...filteredUpdateData,
      updatedAt: new Date(),
    } as IGrowerUpdateParams;

    // Mettre à jour le producteur
    const updatedGrower = await apiUseCases.updateGrower(growerUpdateParams);

    return res.status(200).json({
      message: 'Producteur mis à jour avec succès',
      data: updatedGrower,
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du producteur:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('email') && error.message.includes('unique')) {
        return res.status(400).json({ message: 'Cette adresse email est déjà utilisée' });
      }
      if (error.message.includes('siret') && error.message.includes('unique')) {
        return res.status(400).json({ message: 'Ce numéro SIRET est déjà utilisé' });
      }
    }
    
    return res.status(500).json({ message: 'Erreur lors de la mise à jour du producteur' });
  }
}