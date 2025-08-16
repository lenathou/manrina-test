import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { GrowerPricingService } from '@/server/grower/GrowerPricingService';

const prisma = new PrismaClient();

const growerPricingService = new GrowerPricingService(prisma);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { productId } = req.query;

    if (typeof productId !== 'string') {
        return res.status(400).json({ error: 'Invalid product ID' });
    }

    if (req.method === 'GET') {
        try {
            const productPriceInfo = await growerPricingService.getProductPriceInfo(productId);
            return res.status(200).json(productPriceInfo);
        } catch (error) {
            console.error('Error fetching product grower prices:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}