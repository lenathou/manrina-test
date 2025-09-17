import { NextApiRequest, NextApiResponse } from 'next';
import { apiUseCases } from '@/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const [{ growerId, variantPrices }] = req.body.params;
        const result = await apiUseCases.updateMultipleVariantPrices({ growerId, variantPrices });
        res.status(200).json({ data: result });
    } catch (error) {
        console.error('Error updating multiple variant prices:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}