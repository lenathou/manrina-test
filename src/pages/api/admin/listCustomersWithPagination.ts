import { NextApiRequest, NextApiResponse } from 'next';
import { apiUseCases } from '@/server';

interface ClientsApiResponse {
    customers: {
        id: string;
        name: string;
        email: string;
        phone?: string;
        registrationDate: string;
        totalOrders: number;
        totalSpent: string;
    }[];
    total: number;
    totalPages: number;
    currentPage: number;
}

interface ErrorResponse {
    error: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ClientsApiResponse | ErrorResponse>
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Vérification du token admin
        const adminData = await apiUseCases.verifyAdminToken({ req, res });
        
        if (!adminData) {
            return res.status(401).json({ error: 'Token admin invalide' });
        }

        // Extraction des paramètres de requête
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string || '';

        // Appel à la méthode ApiUseCases
        const result = await apiUseCases.listCustomersWithPagination({
            page,
            limit,
            search
        });

        res.status(200).json(result);
    } catch (error) {
        console.error('Erreur lors de la récupération des clients:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
}