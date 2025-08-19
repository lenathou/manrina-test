import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case 'GET':
        return await getPartners(req, res);
      case 'POST':
        return await createPartner(req, res);
      case 'PUT':
        return await updatePartner(req, res);
      case 'DELETE':
        return await deletePartner(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Partners API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /api/admin/partners - Récupérer tous les partenaires
async function getPartners(req: NextApiRequest, res: NextApiResponse) {
  const partners = await prisma.partner.findMany({
    orderBy: {
      name: 'asc'
    },
    include: {
      _count: {
        select: {
          sessions: true
        }
      }
    }
  });

  return res.status(200).json(partners);
}

// POST /api/admin/partners - Créer un nouveau partenaire
async function createPartner(req: NextApiRequest, res: NextApiResponse) {
  const { name, description, imageUrl, website, email, phone } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  // Vérifier si un partenaire avec ce nom existe déjà
  const existingPartner = await prisma.partner.findFirst({
    where: {
      name: name.trim()
    }
  });

  if (existingPartner) {
    return res.status(409).json({ 
      error: 'Un partenaire avec ce nom existe déjà' 
    });
  }

  const partner = await prisma.partner.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      imageUrl: imageUrl?.trim() || null,
      website: website?.trim() || null,
      email: email?.trim() || null,
      phone: phone?.trim() || null,
      isActive: true
    },
    include: {
      _count: {
        select: {
          sessions: true
        }
      }
    }
  });

  return res.status(201).json(partner);
}

// PUT /api/admin/partners - Mettre à jour un partenaire
async function updatePartner(req: NextApiRequest, res: NextApiResponse) {
  const { id, name, description, imageUrl, website, email, phone, isActive } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Partner ID is required' });
  }

  // Vérifier si le partenaire existe
  const existingPartner = await prisma.partner.findUnique({
    where: { id }
  });

  if (!existingPartner) {
    return res.status(404).json({ error: 'Partner not found' });
  }

  // Si le nom change, vérifier qu'il n'existe pas déjà
  if (name && name.trim() !== existingPartner.name) {
    const duplicatePartner = await prisma.partner.findFirst({
      where: {
        name: name.trim(),
        id: { not: id }
      }
    });

    if (duplicatePartner) {
      return res.status(409).json({ 
        error: 'Un partenaire avec ce nom existe déjà' 
      });
    }
  }

  const updateData: Prisma.PartnerUpdateInput = {};
  if (name !== undefined) updateData.name = name.trim();
  if (description !== undefined) updateData.description = description?.trim() || null;
  if (imageUrl !== undefined) updateData.imageUrl = imageUrl?.trim() || null;
  if (website !== undefined) updateData.website = website?.trim() || null;
  if (email !== undefined) updateData.email = email?.trim() || null;
  if (phone !== undefined) updateData.phone = phone?.trim() || null;
  if (isActive !== undefined) updateData.isActive = isActive;

  const partner = await prisma.partner.update({
    where: { id },
    data: updateData,
    include: {
      _count: {
        select: {
          sessions: true
        }
      }
    }
  });

  return res.status(200).json(partner);
}

// DELETE /api/admin/partners - Supprimer un partenaire
async function deletePartner(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Partner ID is required' });
  }

  // Vérifier si le partenaire existe
  const partner = await prisma.partner.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          sessions: true
        }
      }
    }
  });

  if (!partner) {
    return res.status(404).json({ error: 'Partner not found' });
  }

  // Empêcher la suppression si le partenaire est associé à des sessions
  if (partner._count.sessions > 0) {
    return res.status(400).json({ 
      error: 'Cannot delete a partner that is associated with market sessions. Remove the partner from all sessions first.' 
    });
  }

  await prisma.partner.delete({
    where: { id }
  });

  return res.status(200).json({ 
    message: 'Partner deleted successfully' 
  });
}