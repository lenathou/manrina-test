import { NextApiRequest, NextApiResponse } from 'next';
import { apiUseCases } from '@/server';
import { prisma } from '@/server/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    // Vérifier l'authentification admin
    const adminResult = apiUseCases.verifyAdminToken({ req, res });
    if (!adminResult) {
      return res.status(401).json({ error: 'Non autorisé' });
    }

    const { id } = req.query;
    const { amount, operation } = req.body;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'ID client requis' });
    }

    if (!amount || typeof amount !== 'number') {
      return res.status(400).json({ error: 'Montant requis' });
    }

    if (!operation || !['add', 'reduce'].includes(operation)) {
      return res.status(400).json({ error: 'Opération invalide (add ou reduce)' });
    }

    // Vérifier que le client existe
    const customer = await prisma.customer.findUnique({
      where: { id }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }

    // Pour l'ajout de crédit, on utilise l'API existante
    if (operation === 'add') {
      const allocateResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3059'}/api/admin/allocate-credit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': req.headers.authorization || ''
        },
        body: JSON.stringify({
          customerId: id,
          amount: Math.abs(amount)
        })
      });

      if (!allocateResponse.ok) {
        const errorData = await allocateResponse.json();
        return res.status(allocateResponse.status).json({ error: errorData.error || 'Erreur lors de l\'allocation de crédit' });
      }

      const result = await allocateResponse.json();
      return res.status(200).json({ success: true, result });
    }

    // Pour la réduction de crédit, on crée une entrée négative dans les remboursements
    if (operation === 'reduce') {
      const reductionAmount = Math.abs(amount);
      
      // Vérifier que le client a suffisamment de crédit
      const currentBalance = await apiUseCases.getCustomerWalletBalanceById(id);
      
      if (currentBalance < reductionAmount) {
        return res.status(400).json({ 
          error: `Solde insuffisant. Solde actuel: ${currentBalance}€, Réduction demandée: ${reductionAmount}€` 
        });
      }

      // Créer une commande fictive pour enregistrer la réduction de crédit
      const basketSession = await prisma.basketSession.create({
        data: {
          customerId: id,
          total: reductionAmount,
          paymentStatus: 'paid',
          walletAmountUsed: reductionAmount, // Montant réduit du portefeuille
          deliveryCost: 0,
          deliveryMessage: `Réduction de crédit administrateur`,
        }
      });

      // Créer une session de checkout fictive pour marquer comme "payée"
      await prisma.checkoutSession.create({
        data: {
          id: `credit_reduction_${Date.now()}`,
          basketSessionId: basketSession.id,
          paymentStatus: 'paid',
          paymentAmount: reductionAmount,
          successPayload: {
            wallet_amount_used: reductionAmount.toString(),
            admin_credit_reduction: 'true'
          }
        }
      });

      return res.status(200).json({ 
        success: true, 
        message: `Crédit réduit de ${reductionAmount}€`,
        newBalance: currentBalance - reductionAmount
      });
    }

  } catch (error) {
    console.error('Erreur lors de la gestion du crédit client:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur interne du serveur';
    return res.status(500).json({ error: errorMessage });
  }
}