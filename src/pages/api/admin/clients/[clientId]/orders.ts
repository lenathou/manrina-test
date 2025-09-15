import { NextApiRequest, NextApiResponse } from 'next';
import { apiUseCases } from '@/server';
import { prisma } from '@/server/prisma';
import { BasketSession, BasketSessionItem } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Vérification de l'authentification admin
    const adminToken = await apiUseCases.verifyAdminToken({ req, res });
    if (!adminToken) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    const { clientId } = req.query;
    
    if (!clientId || typeof clientId !== 'string') {
      return res.status(400).json({ message: 'ID client requis' });
    }

    switch (req.method) {
      case 'GET':
        return await getClientOrders(req, res, clientId);
      default:
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ message: `Méthode ${req.method} non autorisée` });
    }
  } catch (error) {
    console.error('Erreur dans l\'API commandes client:', error);
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  }
}

async function getClientOrders(req: NextApiRequest, res: NextApiResponse, clientId: string) {
  try {
    // Vérifier que le client existe
    const customer = await prisma.customer.findUnique({
      where: { id: clientId }
    });

    if (!customer) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }

    const { page = '1', limit = '10' } = req.query;
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * limitNumber;

    // Récupérer les commandes avec pagination
    const [orders, totalOrders] = await Promise.all([
      prisma.basketSession.findMany({
        where: { customerId: clientId },
        include: {
          items: {
            include: {
              Product: {
                select: {
                  name: true,
                  imageUrl: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNumber
      }),
      prisma.basketSession.count({
        where: { customerId: clientId }
      })
    ]);

    // Calculer les statistiques
    const orderStats = await prisma.basketSession.aggregate({
      where: { customerId: clientId },
      _sum: {
        total: true
      },
      _count: {
        id: true
      }
    });

    // Récupérer la dernière commande
    const lastOrder = await prisma.basketSession.findFirst({
      where: { customerId: clientId },
      orderBy: { createdAt: 'desc' },
      select: {
        createdAt: true,
        paymentStatus: true
      }
    });

    const response = {
      orders: orders.map((order: BasketSession & { items: (BasketSessionItem & { Product: { name: string; imageUrl: string } })[] }) => ({
        id: order.id,
        orderNumber: `ORDER-${order.orderIndex}`,
        status: order.paymentStatus,
        totalAmount: order.total,
        createdAt: order.createdAt,
        itemsCount: order.items.length,
        items: order.items.map((item: BasketSessionItem & { Product: { name: string; imageUrl: string } }) => ({
          productName: item.Product.name,
          quantity: item.quantity,
          price: item.price
        })),
        shippingAddress: null // BasketSession n'a pas d'adresse de livraison
      })),
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalOrders / limitNumber),
        totalOrders,
        hasNextPage: pageNumber < Math.ceil(totalOrders / limitNumber),
        hasPreviousPage: pageNumber > 1
      },
      statistics: {
        totalOrders: orderStats._count.id || 0,
        totalSpent: orderStats._sum.total || 0,
        lastOrderDate: lastOrder?.createdAt || null,
        lastOrderStatus: lastOrder?.paymentStatus || null
      }
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
    return res.status(500).json({ message: 'Erreur lors de la récupération des commandes' });
  }
}