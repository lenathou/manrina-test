import type { NextApiRequest, NextApiResponse } from 'next';
import { ProductRepositoryPrismaImplementation } from '../../../../../server/product/ProductRepositoryPrismaImplementation';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const productRepository = new ProductRepositoryPrismaImplementation(prisma);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'PUT') {
        try {
            const { productId } = req.query;
            const { globalStock, baseUnitId } = req.body;

            if (!productId || typeof productId !== 'string') {
                return res.status(400).json({ error: 'Product ID is required' });
            }

            if (typeof globalStock !== 'number' || globalStock < 0) {
                return res.status(400).json({ error: 'Valid global stock is required' });
            }

            if (!baseUnitId || typeof baseUnitId !== 'string') {
                return res.status(400).json({ error: 'Base unit ID is required' });
            }

            // Mettre à jour le produit avec le nouveau stock global et l'unité de base
            const updatedProduct = await productRepository.updateProduct(productId, {
                globalStock,
                baseUnitId
            });

            if (!updatedProduct) {
                return res.status(404).json({ error: 'Product not found' });
            }

            return res.status(200).json({ 
                success: true, 
                product: updatedProduct 
            });
        } catch (error) {
            console.error('Error updating global stock:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}