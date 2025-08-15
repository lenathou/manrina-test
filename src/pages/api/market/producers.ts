import { NextApiRequest, NextApiResponse } from 'next';
import { apiUseCases } from '@/server';
import { IGrower } from '@/server/grower/IGrower';

interface MarketProducer {
    id: string;
    name: string;
    profilePhoto: string;
    description?: string;
    specialties: string[];
}

// Fonction pour transformer un Grower en MarketProducer
const transformGrowerToMarketProducer = (grower: IGrower): MarketProducer => {
    // Pour l'instant, on utilise des spécialités par défaut
    // Dans une vraie implémentation, ces données pourraient venir d'une table séparée
    const defaultSpecialties = ['Produits locaux', 'Agriculture responsable'];

    return {
        id: grower.id,
        name: grower.name,
        profilePhoto: grower.profilePhoto,
        description: `Producteur local passionné depuis ${new Date().getFullYear() - 2010} ans`,
        specialties: defaultSpecialties,
    };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<MarketProducer[] | { error: string }>) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Récupérer tous les producteurs actifs
        const growers = await apiUseCases.listGrowers();

        // Transformer les données pour l'affichage du marché
        const marketGrowers: MarketProducer[] = growers.map(transformGrowerToMarketProducer);

        res.status(200).json(marketGrowers);
    } catch (error) {
        console.error('Erreur lors de la récupération des producteurs:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
}
