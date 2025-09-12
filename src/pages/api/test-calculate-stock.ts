import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { StockRepositoryPrismaImplementation } from '../../server/stock/StockRepositoryPrismaImplementation';

const prisma = new PrismaClient();
const stockRepo = new StockRepositoryPrismaImplementation(prisma);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { productId } = req.body;
        
        if (!productId) {
            return res.status(400).json({ error: 'Product ID is required' });
        }

        console.log('Testing calculateGlobalStock for product:', productId);
        
        const result = await stockRepo.calculateGlobalStock(productId);
        
        console.log('Result:', result);
        
        return res.status(200).json({ data: result });
    } catch (error) {
        console.error('Error in test endpoint:', error);
        return res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
}