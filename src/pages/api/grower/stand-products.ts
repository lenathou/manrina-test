import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/server/database/prisma';
import { Prisma } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        return handleGet(req, res);
    } else if (req.method === 'POST') {
        return handlePost(req, res);
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ message: 'Method not allowed' });
    }
}

// GET /api/grower/stand-products?growerId=xxx
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { growerId } = req.query;

        if (!growerId || typeof growerId !== 'string') {
            return res.status(400).json({ message: 'growerId is required' });
        }

        // Verify that the grower exists
        const grower = await prisma.grower.findUnique({
            where: { id: growerId },
        });

        if (!grower) {
            return res.status(404).json({ message: 'Grower not found' });
        }

        const standProducts = await prisma.marketProduct.findMany({
            where: {
                growerId,
            },
            include: {
                grower: true,
                marketSession: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return res.status(200).json(standProducts);
    } catch (error) {
        console.error('Error fetching stand products:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// POST /api/grower/stand-products
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { growerId, name, description, imageUrl, price, stock, unit, category, marketSessionId } = req.body;

        // Validation des données
        if (!growerId || !name || price === undefined || !marketSessionId) {
            return res.status(400).json({
                message: 'growerId, name, price, and marketSessionId are required',
            });
        }

        if (price < 0) {
            return res.status(400).json({ message: 'Price must be positive' });
        }

        // Vérifier si le produit existe déjà dans le stand pour cette session
        const existingStandProduct = await prisma.marketProduct.findFirst({
            where: {
                growerId,
                name,
                marketSessionId,
            },
        });

        if (existingStandProduct) {
            return res.status(409).json({
                message: 'Ce produit est déjà dans votre stand',
            });
        }

        // Vérifier que le producteur et la session de marché existent
        const [grower, marketSession] = await Promise.all([
            prisma.grower.findUnique({ where: { id: growerId } }),
            prisma.marketSession.findUnique({ where: { id: marketSessionId } }),
        ]);

        if (!grower) {
            return res.status(404).json({ message: 'Grower not found' });
        }
        if (!marketSession) {
            return res.status(404).json({ message: 'Market session not found' });
        }

        // Créer le produit du stand
        const createData: Prisma.MarketProductCreateInput = {
            name,
            price: parseFloat(price.toString() || 0),
            stock: stock || 0,
            grower: {
                connect: { id: growerId },
            },
            marketSession: {
                connect: { id: marketSessionId },
            },
            isActive: true,
            sourceType: 'MANUAL', // Marquer comme ajouté manuellement
        };

        // Ajouter les champs optionnels seulement s'ils ne sont pas undefined
        if (description !== undefined) createData.description = description;
        if (imageUrl !== undefined) createData.imageUrl = imageUrl;
        if (unit !== undefined) createData.unit = unit;
        if (category !== undefined) createData.category = category;

        const standProduct = await prisma.marketProduct.create({
            data: createData,
            include: {
                grower: true,
                marketSession: true,
            },
        });

        return res.status(201).json(standProduct);
    } catch (error) {
        console.error('Error creating stand product:', error);

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return res.status(409).json({
                    message: 'Un produit avec ce nom existe déjà pour ce marché. Veuillez choisir un nom différent ou modifier le produit existant.',
                });
            }
        }

        return res.status(500).json({ message: 'Internal server error' });
    }
}
