import { NextApiRequest, NextApiResponse } from 'next';
import { apiUseCases } from '@/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const result = await apiUseCases.getAllProductsWithStock();
        
        res.status(200).json({ data: result });
    } catch (error) {
        console.error('Error in getAllProductsWithStock:', error);
        res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
    }
}