import { NextApiRequest, NextApiResponse } from 'next';
import { apiUseCases } from '@/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { productIds } = req.body;
        
        if (!Array.isArray(productIds)) {
            return res.status(400).json({ error: 'productIds must be an array' });
        }

        const result = await apiUseCases.getAllProductsGlobalStock(productIds);
        
        res.status(200).json({ data: result });
    } catch (error) {
        console.error('Error in getAllProductsGlobalStock:', error);
        res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
    }
}