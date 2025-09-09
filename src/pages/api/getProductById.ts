import { NextApiRequest, NextApiResponse } from 'next';
import { apiUseCases } from '@/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { params } = req.body;
        const [productId] = params;

        if (!productId) {
            return res.status(400).json({ error: 'productId is required' });
        }

        const result = await apiUseCases.getProductPriceInfo(productId);
        return res.status(200).json({ data: result });
    } catch (error) {
        console.error('Error in getProductById:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}