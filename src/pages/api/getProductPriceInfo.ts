import { NextApiRequest, NextApiResponse } from 'next';
import { apiUseCases } from '@/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { params } = req.body;
        const [productId] = params;

        if (!productId) {
            return res.status(400).json({ error: 'Product ID is required' });
        }

        const data = await apiUseCases.getProductPriceInfo(productId);
        res.status(200).json({ data });
    } catch (error) {
        console.error('Error in getProductPriceInfo:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}