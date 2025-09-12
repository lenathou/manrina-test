import { NextApiRequest, NextApiResponse } from 'next';
import { verifyAdminToken } from '@/server/admin/AdminAuthService';
import { prisma } from '@/server/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Vérification de l'authentification admin
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token d\'authentification requis' });
    }

    const token = authHeader.substring(7);
    const adminPayload = verifyAdminToken(token);
    
    if (!adminPayload) {
      return res.status(401).json({ message: 'Token d\'authentification invalide' });
    }

    const { clientId, addressId } = req.query;
    
    if (!clientId || typeof clientId !== 'string' || !addressId || typeof addressId !== 'string') {
      return res.status(400).json({ message: 'ID client et ID adresse requis' });
    }

    switch (req.method) {
      case 'PUT':
        return await updateClientAddress(req, res, clientId, addressId);
      case 'DELETE':
        return await deleteClientAddress(req, res, clientId, addressId);
      default:
        res.setHeader('Allow', ['PUT', 'DELETE']);
        return res.status(405).json({ message: `Méthode ${req.method} non autorisée` });
    }
  } catch (error) {
    console.error('Erreur dans l\'API adresse client:', error);
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  }
}

async function updateClientAddress(req: NextApiRequest, res: NextApiResponse, clientId: string, addressId: string) {
  try {
    const { address, city, postalCode, country, type } = req.body;

    if (!address || !city || !postalCode || !country) {
      return res.status(400).json({ 
        message: 'Tous les champs d\'adresse sont requis (adresse, ville, code postal, pays)' 
      });
    }

    // Vérifier que l'adresse appartient au client
    const existingAddress = await prisma.address.findFirst({
      where: { 
        id: addressId,
        customerId: clientId 
      }
    });

    if (!existingAddress) {
      return res.status(404).json({ message: 'Adresse non trouvée pour ce client' });
    }

    const updatedAddress = await prisma.address.update({
      where: { id: addressId },
      data: {
        address,
        city,
        postalCode,
        country,
        type: type || 'home'
      }
    });

    return res.status(200).json(updatedAddress);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'adresse:', error);
    return res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'adresse' });
  }
}

async function deleteClientAddress(req: NextApiRequest, res: NextApiResponse, clientId: string, addressId: string) {
  try {
    // Vérifier que l'adresse appartient au client
    const existingAddress = await prisma.address.findFirst({
      where: { 
        id: addressId,
        customerId: clientId 
      }
    });

    if (!existingAddress) {
      return res.status(404).json({ message: 'Adresse non trouvée pour ce client' });
    }

    // Vérifier qu'il ne s'agit pas de la seule adresse du client
    const addressCount = await prisma.address.count({
      where: { customerId: clientId }
    });

    if (addressCount === 1) {
      return res.status(400).json({ 
        message: 'Impossible de supprimer la dernière adresse du client' 
      });
    }

    await prisma.address.delete({
      where: { id: addressId }
    });

    return res.status(200).json({ message: 'Adresse supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'adresse:', error);
    return res.status(500).json({ message: 'Erreur lors de la suppression de l\'adresse' });
  }
}