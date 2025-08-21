import { NextApiRequest, NextApiResponse } from 'next';
import { apiUseCases } from '@/server';
import { IMarketProductSuggestionCreateParams } from '@/server/grower/IGrowerRepository';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const growerToken = apiUseCases.verifyGrowerToken({ req, res });
    
    if (!growerToken) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const growerId = growerToken.id;

    switch (req.method) {
        case 'GET':
            try {
                const { growerId: queryGrowerId } = req.query;
                const targetGrowerId = queryGrowerId as string || growerId;
                
                // Only allow growers to see their own suggestions
                if (targetGrowerId !== growerId) {
                    return res.status(403).json({ error: 'Forbidden' });
                }

                const suggestions = await apiUseCases.listGrowerProductSuggestions(targetGrowerId);
                return res.status(200).json({ data: suggestions });
            } catch (error) {
                console.error('Error fetching market product suggestions:', error);
                return res.status(500).json({ error: 'Internal server error' });
            }

        case 'POST':
            try {
                const suggestionData: IMarketProductSuggestionCreateParams = {
                    ...req.body,
                    growerId,
                };

                const suggestion = await apiUseCases.createGrowerProductSuggestion(suggestionData);
                return res.status(201).json({ data: suggestion });
            } catch (error) {
                console.error('Error creating market product suggestion:', error);
                return res.status(500).json({ error: 'Internal server error' });
            }

        default:
            res.setHeader('Allow', ['GET', 'POST']);
            return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
}