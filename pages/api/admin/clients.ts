import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, Prisma } from '@prisma/client';
import { Client } from '@/components/admin/clients/ClientTable';

const prisma = new PrismaClient();

interface ClientsApiResponse {
    clients: Client[];
    total: number;
    totalPages: number;
    currentPage: number;
}

interface ErrorResponse {
    error: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ClientsApiResponse | ErrorResponse>) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { page = '1', limit = '7', search = '' } = req.query;

        const pageNumber = parseInt(page as string);
        const limitNumber = parseInt(limit as string);
        const offset = (pageNumber - 1) * limitNumber;

        // Construire les conditions de filtrage
        const whereConditions: Prisma.CustomerWhereInput = {};

        // Filtrage par recherche (nom ou email)
        if (search) {
            whereConditions.OR = [
                {
                    name: {
                        contains: search as string,
                        mode: 'insensitive',
                    },
                },
                {
                    email: {
                        contains: search as string,
                        mode: 'insensitive',
                    },
                },
            ];
        }

        // Récupérer les clients avec leurs commandes pour calculer les statistiques
        const customers = await prisma.customer.findMany({
            where: whereConditions,
            include: {
                basketSession: {
                    where: {
                        paymentStatus: 'paid',
                    },
                    select: {
                        total: true,
                        createdAt: true,
                    },
                },
            },
            skip: offset,
            take: limitNumber,
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Compter le total des clients
        const totalCustomers = await prisma.customer.count({
            where: whereConditions,
        });

        // Transformer les données pour correspondre à l'interface Client
        const clients: Client[] = customers.map((customer) => {
            const totalOrders = customer.basketSession.length;
            const totalSpent = customer.basketSession.reduce((sum, basket) => sum + basket.total, 0);

            return {
                id: customer.id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone || undefined,
                registrationDate: customer.createdAt.toLocaleDateString('fr-FR'),
                totalOrders,
                totalSpent: `${totalSpent.toFixed(2)} €`,
            };
        });

        const totalPages = Math.ceil(totalCustomers / limitNumber);

        res.status(200).json({
            clients,
            total: totalCustomers,
            totalPages,
            currentPage: pageNumber,
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des clients:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    } finally {
        await prisma.$disconnect();
    }
}
