import type { NextApiRequest, NextApiResponse } from 'next';
import { apiUseCases } from '../../../server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const { productId } = req.query;
            console.log(productId);
            
            if (!productId || typeof productId !== 'string') {
                return res.status(400).json({ error: 'Product ID is required' });
            }
            
            // Utiliser la vraie base de données via apiUseCases
            const product = await apiUseCases.getProductById({ productId }, { req, res });
            
            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }
            
            return res.status(200).json({ data: product });
        } catch (error) {
            console.error('Error fetching product:', error);
            return res.status(500).json({ error: 'Failed to fetch product' });
        }
    }
    // 405 means "Method Not Allowed"
    return res.status(405).end();
}
