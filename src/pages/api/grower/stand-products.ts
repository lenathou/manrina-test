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

        const standProducts = await prisma.growerStandProduct.findMany({
            where: {
                growerId,
                isActive: true
            },
            include: {
                product: true,
                variant: true,
                unit: true
            },
            orderBy: {
                createdAt: 'desc'
            }
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
        const { growerId, productId, variantId, unitId, price, quantity } = req.body;

        // Validation des données
        if (!growerId || !productId || !variantId || !unitId || price === undefined) {
            return res.status(400).json({ 
                message: 'growerId, productId, variantId, unitId, and price are required' 
            });
        }

        if (price < 0) {
            return res.status(400).json({ message: 'Price must be positive' });
        }

        // Vérifier si le produit existe déjà dans le stand
        const existingStandProduct = await prisma.growerStandProduct.findUnique({
            where: {
                growerId_variantId: {
                    growerId,
                    variantId
                }
            }
        });

        if (existingStandProduct) {
            return res.status(409).json({ 
                message: 'Ce produit est déjà dans votre stand' 
            });
        }

        // Vérifier que le producteur, le produit, la variante et l'unité existent
        const [grower, product, variant, unit] = await Promise.all([
            prisma.grower.findUnique({ where: { id: growerId } }),
            prisma.product.findUnique({ where: { id: productId } }),
            prisma.productVariant.findUnique({ where: { id: variantId } }),
            prisma.unit.findUnique({ where: { id: unitId } })
        ]);

        if (!grower) {
            return res.status(404).json({ message: 'Grower not found' });
        }
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        if (!variant) {
            return res.status(404).json({ message: 'Product variant not found' });
        }
        if (!unit) {
            return res.status(404).json({ message: 'Unit not found' });
        }

        // Créer le produit du stand
        const standProduct = await prisma.growerStandProduct.create({
            data: {
                growerId,
                productId,
                variantId,
                unitId,
                price: parseFloat(price.toString()),
                quantity: quantity ? parseFloat(quantity.toString()) : 1,
                isActive: true
            },
            include: {
                product: true,
                variant: true,
                unit: true
            }
        });

        return res.status(201).json(standProduct);
    } catch (error) {
        console.error('Error creating stand product:', error);
        
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return res.status(409).json({ 
                    message: 'Ce produit est déjà dans votre stand' 
                });
            }
        }
        
        return res.status(500).json({ message: 'Internal server error' });
    }
}