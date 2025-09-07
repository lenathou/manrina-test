import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/server/prisma';
import { MarketProductSource } from '@prisma/client';

interface SendProductsRequest {
  growerId: string;
  sessionId: string;
  products: {
    name: string;
    price: number;
    quantity: number;
    unitId?: string;
    unit?: string;
    sourceType?: MarketProductSource;
  }[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { growerId, sessionId, products }: SendProductsRequest = req.body;

    // TODO: Implémenter l'authentification du grower
    // Pour l'instant, on procède sans vérification d'authentification

    // Valider les données requises
    if (!growerId || !sessionId || !products || !Array.isArray(products)) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Vérifier que le grower existe
    const grower = await prisma.grower.findUnique({
      where: { id: growerId }
    });

    if (!grower) {
      return res.status(404).json({ error: 'Grower not found' });
    }

    // Vérifier que la session existe et est à venir
    const session = await prisma.marketSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      return res.status(404).json({ error: 'Market session not found' });
    }

    if (session.date < new Date()) {
      return res.status(400).json({ error: 'Cannot send products to past sessions' });
    }

    // Supprimer les produits existants pour ce grower et cette session
    await prisma.marketProduct.deleteMany({
      where: {
        growerId,
        marketSessionId: sessionId
      }
    });

    // Utiliser une transaction pour créer les produits et confirmer la participation
    const result = await prisma.$transaction(async (tx) => {
      // Créer les nouveaux produits
      const createdProducts = await Promise.all(
        products.map(async (product) => {
          let unitSymbol = null;
          
          // Récupérer le symbole de l'unité si unitId est fourni
          if (product.unitId) {
            const unit = await tx.unit.findUnique({
              where: { id: product.unitId }
            });

            if (!unit) {
              throw new Error(`Unit with id ${product.unitId} not found`);
            }
            unitSymbol = unit.symbol;
          } else if (product.unit) {
            // Utiliser directement le symbole de l'unité si fourni
            unitSymbol = product.unit;
          }

          // Vérifier si le produit existe déjà pour ce producteur et cette session
          const existingProduct = await tx.marketProduct.findFirst({
            where: {
              name: product.name,
              growerId,
              marketSessionId: sessionId
            }
          });

          if (existingProduct) {
            // Mettre à jour le produit existant
            return tx.marketProduct.update({
              where: { id: existingProduct.id },
              data: {
                price: product.price,
                stock: product.quantity,
                unit: unitSymbol,
                sourceType: product.sourceType || MarketProductSource.MANUAL,
                isActive: true // Réactiver le produit lors de l'envoi
              },
              include: {
                grower: true,
                marketSession: true
              }
            });
          } else {
            // Créer un nouveau produit
            return tx.marketProduct.create({
              data: {
                name: product.name,
                price: product.price,
                stock: product.quantity,
                growerId,
                marketSessionId: sessionId,
                unit: unitSymbol,
                sourceType: product.sourceType || MarketProductSource.MANUAL
              },
              include: {
                grower: true,
                marketSession: true
              }
            });
          }
        })
      );

      // Confirmer automatiquement la participation du producteur
      const participation = await tx.marketParticipation.upsert({
        where: {
          sessionId_growerId: {
            sessionId,
            growerId
          }
        },
        update: {
          status: 'CONFIRMED'
        },
        create: {
          growerId,
          sessionId,
          status: 'CONFIRMED'
        }
      });

      return { products: createdProducts, participation };
    });

    return res.status(200).json({
      message: 'Products sent successfully and participation confirmed',
      products: result.products,
      participation: result.participation
    });

  } catch (error) {
    console.error('Error sending products to session:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}