import { NextApiRequest, NextApiResponse } from 'next';
import { apiUseCases } from '@/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { params } = req.body;
        const [variantId] = params;

        if (!variantId) {
            return res.status(400).json({ error: 'Variant ID is required' });
        }

        const data = await apiUseCases.getGrowerPricesForVariant(variantId);
        res.status(200).json({ data });
    } catch (error) {
        console.error('Error in getGrowerPricesForVariant:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}