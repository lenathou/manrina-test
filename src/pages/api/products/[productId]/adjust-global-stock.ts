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
        const { productId } = req.query as { productId: string };
        const { adjustment, type } = req.body as { adjustment: number; type: 'add' | 'subtract' };

        if (!productId || typeof adjustment !== 'number' || !type) {
            return res.status(400).json({ error: 'Missing required fields: productId, adjustment, type' });
        }

        await apiUseCases.adjustGlobalStock({
            productId,
            adjustment,
            type,
        });

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error adjusting global stock:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
