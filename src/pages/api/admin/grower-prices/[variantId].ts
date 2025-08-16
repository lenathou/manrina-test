import { NextApiRequest, NextApiResponse } from 'next';
import { GrowerPricingService } from '@/server/grower/GrowerPricingService';
import { withAdminAuth } from '@/middleware/withAdminAuth';
import { prisma } from '@/server/database/prisma';

const growerPricingService = new GrowerPricingService(prisma);

async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { variantId } = req.query;

    if (typeof variantId !== 'string') {
        return res.status(400).json({ error: 'Invalid variant ID' });
    }

    if (req.method === 'GET') {
        try {
            const growerPrices = await growerPricingService.getGrowerPricesForVariant(variantId);
            return res.status(200).json(growerPrices);
        } catch (error) {
            console.error('Error fetching grower prices:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    if (req.method === 'PUT') {
        try {
            const { growerId, price } = req.body;

            if (!growerId || typeof price !== 'number') {
                return res.status(400).json({ error: 'Missing or invalid growerId or price' });
            }

            await growerPricingService.updateGrowerPrice({
                growerId,
                variantId,
                price,
            });

            return res.status(200).json({ success: true });
        } catch (error) {
            console.error('Error updating grower price:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}

export default withAdminAuth(handler);