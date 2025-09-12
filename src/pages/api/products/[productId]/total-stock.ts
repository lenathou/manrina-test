import { NextApiRequest, NextApiResponse } from 'next';
import { apiUseCases } from '@/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { productId } = req.query as { productId?: string };
        const { params } = req.body;
        const [paramProductId] = params || [];

        // Utiliser le productId de l'URL ou des paramètres
        const finalProductId = productId || paramProductId;

        if (!finalProductId || typeof finalProductId !== 'string') {
            return res.status(400).json({ message: 'Product ID is required' });
        }

        const totalStock = await apiUseCases.getTotalStockForProduct(finalProductId);

        res.status(200).json({ data: totalStock });
    } catch (error) {
        console.error('Error fetching total stock for product:', error);
        res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
    }
}
