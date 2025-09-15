import { NextApiRequest, NextApiResponse } from 'next';
import { apiUseCases } from '@/server';
import { prisma } from '@/server/prisma';

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
        return await getClientAddresses(req, res, clientId);
      case 'POST':
        return await createClientAddress(req, res, clientId);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ message: `Méthode ${req.method} non autorisée` });
    }
  } catch (error) {
    console.error('Erreur dans l\'API adresses client:', error);
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  }
}

async function getClientAddresses(req: NextApiRequest, res: NextApiResponse, clientId: string) {
  try {
    // Vérifier que le client existe
    const customer = await prisma.customer.findUnique({
      where: { id: clientId }
    });

    if (!customer) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }

    const addresses = await prisma.address.findMany({
      where: { customerId: clientId },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json(addresses);
  } catch (error) {
    console.error('Erreur lors de la récupération des adresses:', error);
    return res.status(500).json({ message: 'Erreur lors de la récupération des adresses' });
  }
}

async function createClientAddress(req: NextApiRequest, res: NextApiResponse, clientId: string) {
  try {
    const { address, city, postalCode, country, type } = req.body;

    if (!address || !city || !postalCode || !country) {
      return res.status(400).json({ 
        message: 'Tous les champs d\'adresse sont requis (adresse, ville, code postal, pays)' 
      });
    }

    // Vérifier que le client existe
    const customer = await prisma.customer.findUnique({
      where: { id: clientId }
    });

    if (!customer) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }

    const newAddress = await prisma.address.create({
      data: {
        address,
        city,
        postalCode,
        country,
        type: type || 'home',
        customerId: clientId
      }
    });

    return res.status(201).json(newAddress);
  } catch (error) {
    console.error('Erreur lors de la création de l\'adresse:', error);
    return res.status(500).json({ message: 'Erreur lors de la création de l\'adresse' });
  }
}