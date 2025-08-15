// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { apiUseCases } from '../../../server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            // Utiliser la vraie base de données via apiUseCases
            const products = await apiUseCases.getAllProductsWithStock({ req, res });
            return res.status(200).json({ data: products });
        } catch (error) {
            console.error('Error fetching products:', error);
            return res.status(500).json({ error: 'Failed to fetch products' });
        }
    }
    // 405 means "Method Not Allowed"
    return res.status(405).end();
}
