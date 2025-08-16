// DEPRECATED: Cette API utilise une architecture obsolète.
// TODO: Migrer vers l'architecture recommandée avec MarketUseCases et le système [functionToRun].
// Cette route devrait être refactorisée pour utiliser apiUseCases au lieu d'accéder directement à PrismaClient.

import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import {
  MarketProductWhereInput,
  MarketProductUpdateData,
  CreateMarketProductBody,
  UpdateMarketProductBody
} from '../../../types/api';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case 'GET':
        return await getMarketProducts(req, res);
      case 'POST':
        return await createMarketProduct(req, res);
      case 'PUT':
        return await updateMarketProduct(req, res);
      case 'DELETE':
        return await deleteMarketProduct(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Market products API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /api/market/products - Récupérer les produits du marché
async function getMarketProducts(req: NextApiRequest, res: NextApiResponse) {
  const { sessionId, growerId, category, isActive, search } = req.query;

  const where: MarketProductWhereInput = {};
  
  if (sessionId && typeof sessionId === 'string') {
    where.marketSessionId = sessionId;
  }
  
  if (growerId && typeof growerId === 'string') {
    where.growerId = growerId;
  }
  
  if (category && typeof category === 'string') {
    where.category = category;
  }
  
  if (isActive !== undefined) {
    where.isActive = isActive === 'true';
  }
  
  if (search && typeof search === 'string') {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } }
    ];
  }

  const products = await prisma.marketProduct.findMany({
    where,
    include: {
      grower: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true
        }
      },
      marketSession: {
        select: {
          id: true,
          name: true,
          date: true,
          status: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return res.status(200).json(products);
}

// POST /api/market/products - Créer un nouveau produit du marché
async function createMarketProduct(req: NextApiRequest, res: NextApiResponse) {
  const {
    name,
    description,
    imageUrl,
    price,
    stock,
    unit,
    category,
    marketSessionId,
    growerId,
    isActive = true
  }: CreateMarketProductBody = req.body;

  if (!name || !price || !marketSessionId || !growerId) {
    return res.status(400).json({ 
      error: 'Name, price, market session ID, and grower ID are required' 
    });
  }

  // Vérifier que la session de marché existe
  const session = await prisma.marketSession.findUnique({
    where: { id: marketSessionId }
  });

  if (!session) {
    return res.status(404).json({ error: 'Market session not found' });
  }

  // Vérifier que le producteur existe
  const grower = await prisma.grower.findUnique({
    where: { id: growerId }
  });

  if (!grower) {
    return res.status(404).json({ error: 'Grower not found' });
  }

  const product = await prisma.marketProduct.create({
    data: {
      name,
      description,
      imageUrl,
      price: new Decimal(price),
      stock: stock || 0,
      unit,
      category,
      marketSessionId,
      growerId,
      isActive
    },
    include: {
      grower: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      marketSession: {
        select: {
          id: true,
          name: true,
          date: true,
          status: true
        }
      }
    }
  });

  return res.status(201).json(product);
}

// PUT /api/market/products - Mettre à jour un produit du marché
async function updateMarketProduct(req: NextApiRequest, res: NextApiResponse) {
  const {
    id,
    name,
    description,
    imageUrl,
    price,
    stock,
    unit,
    category,
    isActive
  }: UpdateMarketProductBody = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Product ID is required' });
  }

  const updateData: MarketProductUpdateData = {};
  
  if (name) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
  if (price !== undefined) updateData.price = new Decimal(price);
  if (stock !== undefined) updateData.stock = stock;
  if (unit !== undefined) updateData.unit = unit;
  if (category !== undefined) updateData.category = category;
  if (isActive !== undefined) updateData.isActive = isActive;

  const product = await prisma.marketProduct.update({
    where: { id },
    data: updateData,
    include: {
      grower: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      marketSession: {
        select: {
          id: true,
          name: true,
          date: true,
          status: true
        }
      }
    }
  });

  return res.status(200).json(product);
}

// DELETE /api/market/products - Supprimer un produit du marché
async function deleteMarketProduct(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Product ID is required' });
  }

  const product = await prisma.marketProduct.findUnique({
    where: { id }
  });

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  await prisma.marketProduct.delete({
    where: { id }
  });

  return res.status(200).json({ message: 'Product deleted successfully' });
}