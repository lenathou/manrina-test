import { NextApiRequest, NextApiResponse } from 'next';
import { apiUseCases } from '@/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const adminToken = apiUseCases.verifyAdminToken({ req, res });
    
    if (!adminToken) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.query;

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Invalid suggestion ID' });
    }

    switch (req.method) {
        case 'PATCH':
            try {
                const { status, adminComment } = req.body;

                if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
                    return res.status(400).json({ error: 'Invalid status. Must be APPROVED or REJECTED' });
                }


                const updatedSuggestion = await apiUseCases.updateMarketProductSuggestionStatus(
                    id as string,
                    status,
                    adminComment
                );
                return res.status(200).json({ data: updatedSuggestion });
            } catch (error) {
                console.error('Error updating market product suggestion status:', error);
                return res.status(500).json({ error: 'Internal server error' });
            }

        default:
            res.setHeader('Allow', ['PATCH']);
            return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
}