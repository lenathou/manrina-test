import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/server/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Vérifier l'authentification admin
    const session = await getServerSession(req, res, authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    switch (req.method) {
      case 'GET':
        return await getPartners(req, res);
      case 'POST':
        return await createPartner(req, res);
      default:
        return res.status(405).json({ message: 'Méthode non autorisée' });
    }
  } catch (error) {
    console.error('Erreur API partners:', error);
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  }
}

async function getPartners(req: NextApiRequest, res: NextApiResponse) {
  try {
    const partners = await prisma.partner.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    return res.status(200).json(partners);
  } catch (error) {
    console.error('Erreur lors de la récupération des partenaires:', error);
    return res.status(500).json({ message: 'Erreur lors de la récupération des partenaires' });
  }
}

async function createPartner(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { name, description, imageUrl, website, email, phone } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Le nom du partenaire est requis' });
    }

    // Vérifier si un partenaire avec ce nom existe déjà
    const existingPartner = await prisma.partner.findFirst({
      where: {
        name: name.trim()
      }
    });

    if (existingPartner) {
      return res.status(400).json({ message: 'Un partenaire avec ce nom existe déjà' });
    }

    const partner = await prisma.partner.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        imageUrl: imageUrl?.trim() || null,
        website: website?.trim() || null,
        email: email?.trim() || null,
        phone: phone?.trim() || null
      }
    });

    return res.status(201).json(partner);
  } catch (error) {
    console.error('Erreur lors de la création du partenaire:', error);
    return res.status(500).json({ message: 'Erreur lors de la création du partenaire' });
  }
}