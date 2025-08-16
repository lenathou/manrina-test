import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { apiUseCases } from '@/server';

const prisma = new PrismaClient();

interface AllocateCreditRequest {
  customerId: string;
  amount: number;
  reason?: string;
}

interface AllocateCreditResponse {
  success: boolean;
  message: string;
  transactionId?: string;
}

interface ErrorResponse {
  error: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AllocateCreditResponse | ErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Vérifier l'authentification admin
    const adminPayload = apiUseCases.verifyAdminToken({ req, res });
    if (!adminPayload) {
        return res.status(401).json({ error: 'Token d\'authentification invalide' });
    }

    const { customerId, amount, reason }: AllocateCreditRequest = req.body;

    // Validation des données
    if (!customerId || typeof customerId !== 'string') {
      return res.status(400).json({ error: 'ID client requis' });
    }

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Montant invalide' });
    }

    // Vérifier que le client existe
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }

    // Récupérer le premier produit et sa première variante pour créer l'item
    const firstProduct = await prisma.product.findFirst({
      include: {
        variants: true
      }
    });

    if (!firstProduct || !firstProduct.variants.length) {
      return res.status(500).json({ error: 'Aucun produit disponible dans la base de données' });
    }

    const firstVariant = firstProduct.variants[0];

    // Créer une "commande fictive" avec un item remboursé pour simuler l'allocation de crédit
    // Cette approche s'intègre parfaitement avec le système d'avoir existant qui est
    // basé sur les remboursements dans les commandes
    const creditAllocation = await prisma.basketSession.create({
      data: {
        customerId: customerId,
        total: 0, // Commande gratuite
        paymentStatus: 'paid',
        walletAmountUsed: 0,
        deliveryCost: 0, // Pas de frais de livraison pour l'allocation de crédit
        deliveryMessage: 'Allocation de crédit administrateur',
        items: {
          create: [
            {
              productId: firstProduct.id,
              productVariantId: firstVariant.id,
              name: `Crédit alloué par l'administration${reason ? ` - ${reason}` : ''}`,
              description: `Allocation de crédit de ${amount}€`,
              quantity: 1,
              price: amount,
              refundStatus: 'refunded' // Marquer comme remboursé pour qu'il apparaisse comme crédit
            }
          ]
        }
      },
      include: {
        items: true
      }
    });

    return res.status(200).json({
      success: true,
      message: `Crédit de ${amount}€ alloué avec succès au client ${customer.name}`,
      transactionId: creditAllocation.id
    });

  } catch (error) {
    console.error('Erreur lors de l\'allocation de crédit:', error);
    return res.status(500).json({ error: 'Erreur interne du serveur' });
  } finally {
    await prisma.$disconnect();
  }
}