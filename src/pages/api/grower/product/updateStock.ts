import { NextApiRequest, NextApiResponse } from 'next';
import { apiUseCases } from '@/server';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<{ success: boolean } | { error: string }>,
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { growerId, productId, stock } = req.body;

        if (!growerId || !productId || typeof stock !== 'number') {
            return res.status(400).json({ error: 'Missing required fields: growerId, productId, stock' });
        }

        await apiUseCases.updateGrowerProductStock({
            growerId,
            productId,
            stock,
        });

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error updating grower product stock:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
