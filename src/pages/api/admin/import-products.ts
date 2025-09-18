import { NextApiRequest, NextApiResponse } from 'next';
import { apiUseCases } from '@/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        console.log('Starting product import from products.json...');
        
        // Appeler la méthode pour créer les produits depuis le fichier JSON
        const result = await apiUseCases.createProductsFromTesting();
        
        console.log(`Successfully imported ${result.length} products`);
        
        return res.status(200).json({ 
            success: true,
            message: `Successfully imported ${result.length} products from products.json`,
            data: result
        });
    } catch (error) {
        console.error('Error importing products:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}