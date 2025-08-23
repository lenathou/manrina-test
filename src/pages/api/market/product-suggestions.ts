import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/server/database/prisma';
import { Prisma } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        return handleGet(req, res);
    } else if (req.method === 'POST') {
        return handlePost(req, res);
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ message: 'Method not allowed' });
    }
}

// GET /api/market/product-suggestions
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
    try {
        const suggestions = await prisma.marketProductSuggestion.findMany({
            include: {
                grower: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return res.status(200).json(suggestions);
    } catch (error) {
        console.error('Error fetching market product suggestions:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// POST /api/market/product-suggestions
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { name, description, growerId, category, unit, pricing } = req.body;

        // Validate required fields
        if (!name || !growerId || !pricing) {
            return res.status(400).json({ 
                message: 'Missing required fields: name, growerId, pricing' 
            });
        }

        // Verify that the grower exists
        const grower = await prisma.grower.findUnique({
            where: { id: growerId }
        });

        if (!grower) {
            return res.status(404).json({ message: 'Grower not found' });
        }

        // Check if suggestion already exists for this grower
        const existingSuggestion = await prisma.marketProductSuggestion.findFirst({
            where: {
                name,
                growerId
            }
        });

        if (existingSuggestion) {
            return res.status(409).json({ 
                message: 'Product suggestion already exists for this grower' 
            });
        }

        // Create the suggestion data object
        const createData: Prisma.MarketProductSuggestionCreateInput = {
            name,
            pricing,
            grower: {
                connect: { id: growerId }
            }
        };

        // Add optional fields if they are not undefined
        if (description !== undefined) {
            createData.description = description;
        }
        if (category !== undefined) {
            createData.category = category;
        }
        if (unit !== undefined) {
            createData.unit = unit;
        }

        const suggestion = await prisma.marketProductSuggestion.create({
            data: createData,
            include: {
                grower: true
            }
        });

        return res.status(201).json(suggestion);
    } catch (error) {
        console.error('Error creating market product suggestion:', error);
        
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return res.status(409).json({ message: 'Product suggestion already exists' });
            }
        }
        
        return res.status(500).json({ message: 'Internal server error' });
    }
}