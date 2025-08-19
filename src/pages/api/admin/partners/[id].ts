import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/server/prisma';
import { apiUseCases } from '@/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Vérifier l'authentification admin
    const adminToken = await apiUseCases.verifyAdminToken({ req, res });
    if (!adminToken) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'ID du partenaire requis' });
    }

    switch (req.method) {
      case 'GET':
        return await getPartner(req, res, id);
      case 'PUT':
        return await updatePartner(req, res, id);
      case 'DELETE':
        return await deletePartner(req, res, id);
      default:
        return res.status(405).json({ message: 'Méthode non autorisée' });
    }
  } catch (error) {
    console.error('Erreur API partner:', error);
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  }
}

async function getPartner(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const partner = await prisma.partner.findUnique({
      where: { id },
      include: {
        sessions: {
          include: {
            marketSession: {
              select: {
                id: true,
                name: true,
                date: true,
                status: true
              }
            }
          }
        }
      }
    });

    if (!partner) {
      return res.status(404).json({ message: 'Partenaire non trouvé' });
    }

    return res.status(200).json(partner);
  } catch (error) {
    console.error('Erreur lors de la récupération du partenaire:', error);
    return res.status(500).json({ message: 'Erreur lors de la récupération du partenaire' });
  }
}

async function updatePartner(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const { name, description, imageUrl, website, email, phone, isActive } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Le nom du partenaire est requis' });
    }

    // Vérifier si le partenaire existe
    const existingPartner = await prisma.partner.findUnique({
      where: { id }
    });

    if (!existingPartner) {
      return res.status(404).json({ message: 'Partenaire non trouvé' });
    }

    // Vérifier si un autre partenaire avec ce nom existe déjà
    const duplicatePartner = await prisma.partner.findFirst({
      where: {
        name: name.trim(),
        id: { not: id }
      }
    });

    if (duplicatePartner) {
      return res.status(400).json({ message: 'Un partenaire avec ce nom existe déjà' });
    }

    const partner = await prisma.partner.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        imageUrl: imageUrl?.trim() || null,
        website: website?.trim() || null,
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        isActive: isActive !== undefined ? isActive : existingPartner.isActive
      }
    });

    return res.status(200).json(partner);
  } catch (error) {
    console.error('Erreur lors de la modification du partenaire:', error);
    return res.status(500).json({ message: 'Erreur lors de la modification du partenaire' });
  }
}

async function deletePartner(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    // Vérifier si le partenaire existe
    const existingPartner = await prisma.partner.findUnique({
      where: { id },
      include: {
        sessions: true
      }
    });

    if (!existingPartner) {
      return res.status(404).json({ message: 'Partenaire non trouvé' });
    }

    // Vérifier si le partenaire est associé à des sessions
    if (existingPartner.sessions.length > 0) {
      return res.status(400).json({ 
        message: 'Impossible de supprimer ce partenaire car il est associé à des sessions de marché' 
      });
    }

    await prisma.partner.delete({
      where: { id }
    });

    return res.status(200).json({ message: 'Partenaire supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du partenaire:', error);
    return res.status(500).json({ message: 'Erreur lors de la suppression du partenaire' });
  }
}