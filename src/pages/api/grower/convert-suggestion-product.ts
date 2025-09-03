import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/server/database/prisma';
import { Prisma } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        return handlePost(req, res);
    } else {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ message: 'Method not allowed' });
    }
}

// POST /api/grower/convert-suggestion-product
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { productId, growerId } = req.body;

        // Validation des données
        if (!productId || !growerId) {
            return res.status(400).json({ 
                message: 'productId and growerId are required' 
            });
        }

        // Vérifier que le produit existe et appartient au producteur
        const product = await prisma.marketProduct.findFirst({
            where: {
                id: productId,
                growerId,
                sourceType: 'SUGGESTION'
            },
            include: {
                suggestion: true
            }
        });

        if (!product) {
            return res.status(404).json({ 
                message: 'Product not found or not a suggestion product' 
            });
        }

        // Convertir le produit de SUGGESTION à MANUAL
        const updatedProduct = await prisma.marketProduct.update({
            where: {
                id: productId
            },
            data: {
                sourceType: 'MANUAL'
                // On garde la référence à la suggestion pour traçabilité
            },
            include: {
                grower: true,
                marketSession: true,
                suggestion: true
            }
        });

        return res.status(200).json(updatedProduct);
    } catch (error) {
        console.error('Error converting suggestion product:', error);
        
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                return res.status(404).json({ 
                    message: 'Product not found' 
                });
            }
        }
        
        return res.status(500).json({ message: 'Internal server error' });
    }
}