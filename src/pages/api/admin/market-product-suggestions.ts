import { NextApiRequest, NextApiResponse } from 'next';
import { apiUseCases } from '@/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const adminToken = apiUseCases.verifyAdminToken({ req, res });
    
    if (!adminToken) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    switch (req.method) {
        case 'GET':
            try {
                const suggestions = await apiUseCases.getAllMarketProductSuggestions();
                return res.status(200).json({ data: suggestions });
            } catch (error) {
                console.error('Error fetching all market product suggestions:', error);
                return res.status(500).json({ error: 'Internal server error' });
            }

        default:
            res.setHeader('Allow', ['GET']);
            return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
}