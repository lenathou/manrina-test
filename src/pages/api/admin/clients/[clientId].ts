import { NextApiRequest, NextApiResponse } from 'next';
import { ICustomerUpdateParams } from '@/server/customer/ICustomer';
import { apiUseCases } from '@/server';

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
        return await getClientDetails(req, res, clientId);
      case 'PUT':
        return await updateClient(req, res, clientId);
      default:
        res.setHeader('Allow', ['GET', 'PUT']);
        return res.status(405).json({ message: `Méthode ${req.method} non autorisée` });
    }
  } catch (error) {
    console.error('Erreur dans l\'API client:', error);
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  }
}

async function getClientDetails(req: NextApiRequest, res: NextApiResponse, clientId: string) {
  try {
    const customer = await apiUseCases.getCustomer(clientId);
    
    if (!customer) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }

    // Récupérer des statistiques supplémentaires si nécessaire
    // TODO: Implémenter la récupération des commandes et statistiques
    const clientWithDetails = {
      ...customer,
      totalOrders: 0, // À implémenter
      totalSpent: '0,00 €', // À implémenter
      registrationDate: customer.createdAt.toISOString(),
      lastOrderDate: null, // À implémenter
    };

    return res.status(200).json(clientWithDetails);
  } catch (error) {
    console.error('Erreur lors de la récupération du client:', error);
    return res.status(500).json({ message: 'Erreur lors de la récupération du client' });
  }
}

async function updateClient(req: NextApiRequest, res: NextApiResponse, clientId: string) {
  try {
    const { name, email, phone } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Le nom et l\'email sont requis' });
    }

    const updateParams: ICustomerUpdateParams = {
      id: clientId,
      name,
      email,
      phone,
    };

    const updatedCustomer = await apiUseCases.updateCustomer(updateParams);
    
    if (!updatedCustomer) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }

    return res.status(200).json(updatedCustomer);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du client:', error);
    
    // Gestion des erreurs spécifiques
    if (error instanceof Error) {
      if (error.message.includes('email')) {
        return res.status(400).json({ message: 'Cette adresse email est déjà utilisée' });
      }
    }
    
    return res.status(500).json({ message: 'Erreur lors de la mise à jour du client' });
  }
}