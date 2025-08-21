import { NextApiRequest, NextApiResponse } from 'next';
import { apiUseCases } from '@/server';
import { IMarketProductSuggestion } from '@/server/grower/IGrower';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const growerToken = apiUseCases.verifyGrowerToken({ req, res });
    
    if (!growerToken) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.query;
    const growerId = growerToken.id;

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Invalid suggestion ID' });
    }

    switch (req.method) {
        case 'DELETE':
            try {
                // First, verify that the suggestion belongs to the current grower
                const suggestions = await apiUseCases.getAllMarketProductSuggestions();
                const suggestion = suggestions.find((s: IMarketProductSuggestion) => s.id === id && s.growerId === growerId);

                if (!suggestion) {
                    return res.status(404).json({ error: 'Suggestion not found or access denied' });
                }

                // Only allow deletion of pending suggestions
                if (suggestion.status !== 'PENDING') {
                    return res.status(400).json({ error: 'Cannot delete processed suggestions' });
                }

                await apiUseCases.deleteGrowerProductSuggestion(id);
                return res.status(200).json({ message: 'Suggestion deleted successfully' });
            } catch (error) {
                console.error('Error deleting market product suggestion:', error);
                return res.status(500).json({ error: 'Internal server error' });
            }

        default:
            res.setHeader('Allow', ['DELETE']);
            return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
}