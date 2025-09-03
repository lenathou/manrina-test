import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/server/database/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        return handleGet(req, res);
    } else {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ message: 'Method not allowed' });
    }
}

// GET /api/grower/approved-suggestions?growerId=xxx
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { growerId } = req.query;

        if (!growerId || typeof growerId !== 'string') {
            return res.status(400).json({ message: 'growerId is required' });
        }

        // Verify that the grower exists
        const grower = await prisma.grower.findUnique({
            where: { id: growerId }
        });

        if (!grower) {
            return res.status(404).json({ message: 'Grower not found' });
        }

        // Récupérer les produits créés à partir de suggestions approuvées
        const approvedSuggestionProducts = await prisma.marketProduct.findMany({
            where: {
                growerId,
                sourceType: 'SUGGESTION' // Ne récupérer que les produits créés à partir de suggestions
            },
            include: {
                grower: true,
                marketSession: true,
                suggestion: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        pricing: true,
                        unit: true,
                        category: true,
                        status: true,
                        processedAt: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return res.status(200).json(approvedSuggestionProducts);
    } catch (error) {
        console.error('Error fetching approved suggestion products:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}