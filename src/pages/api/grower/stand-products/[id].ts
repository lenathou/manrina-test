import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/server/database/prisma';
import { Prisma } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'PATCH') {
        return handlePatch(req, res);
    } else if (req.method === 'DELETE') {
        return handleDelete(req, res);
    } else {
        res.setHeader('Allow', ['PATCH', 'DELETE']);
        return res.status(405).json({ message: 'Method not allowed' });
    }
}

// PATCH /api/grower/stand-products/[id]
async function handlePatch(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { id } = req.query;
        const { price, quantity, isActive } = req.body;

        if (!id || typeof id !== 'string') {
            return res.status(400).json({ message: 'Invalid stand product ID' });
        }

        // Vérifier que le produit du stand existe
        const existingStandProduct = await prisma.marketProduct.findUnique({
            where: { id }
        });

        if (!existingStandProduct) {
            return res.status(404).json({ message: 'Stand product not found' });
        }

        // Préparer les données de mise à jour
        const updateData: Prisma.MarketProductUncheckedUpdateInput = {};

        if (price !== undefined) {
            const numPrice = parseFloat(price.toString());
            if (numPrice < 0) {
                return res.status(400).json({ message: 'Price must be positive' });
            }
            updateData.price = Number(numPrice) || 0;
        }

        if (quantity !== undefined) {
            const numQuantity = parseFloat(quantity.toString());
            if (numQuantity < 0) {
                return res.status(400).json({ message: 'Stock must be positive' });
            }
            updateData.stock = numQuantity;
        }

        if (isActive !== undefined) {
            updateData.isActive = Boolean(isActive);
        }

        // Mettre à jour le produit du stand
        const updatedStandProduct = await prisma.marketProduct.update({
            where: { id },
            data: updateData,
            include: {
                grower: true,
                marketSession: true
            }
        });

        return res.status(200).json(updatedStandProduct);
    } catch (error) {
        console.error('Error updating stand product:', error);
        
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                return res.status(404).json({ message: 'Stand product not found' });
            }
        }
        
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// DELETE /api/grower/stand-products/[id]
async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { id } = req.query;

        if (!id || typeof id !== 'string') {
            return res.status(400).json({ message: 'Invalid stand product ID' });
        }

        // Vérifier que le produit du stand existe
        const existingStandProduct = await prisma.marketProduct.findUnique({
            where: { id }
        });

        if (!existingStandProduct) {
            return res.status(404).json({ message: 'Stand product not found' });
        }

        // Supprimer le produit du stand
        await prisma.marketProduct.delete({
            where: { id }
        });

        return res.status(200).json({ message: 'Stand product deleted successfully' });
    } catch (error) {
        console.error('Error deleting stand product:', error);
        
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                return res.status(404).json({ message: 'Stand product not found' });
            }
        }
        
        return res.status(500).json({ message: 'Internal server error' });
    }
}