import type { NextApiRequest, NextApiResponse } from 'next';
import { apiUseCases } from '@/server';
import { ICustomerCreateParams, ICustomer } from '@/server/customer/ICustomer';

interface CreateCustomerRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
}

interface UpdateCustomerRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface CustomerResponse {
  success: boolean;
  message: string;
  customer?: ICustomer;
}

interface ErrorResponse {
  error: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CustomerResponse | ErrorResponse>
) {
  try {
    // Vérification de l'authentification admin
    const adminPayload = await apiUseCases.verifyAdminToken({ req, res });
    if (!adminPayload) {
      return res.status(401).json({ error: 'Non autorisé' });
    }

    switch (req.method) {
      case 'POST':
        return handleCreate(req, res);
      case 'PUT':
        return handleUpdate(req, res);
      case 'DELETE':
        return handleDelete(req, res);
      default:
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }
  } catch (error) {
    console.error('Erreur dans l\'API customers:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Erreur interne du serveur' 
    });
  }
}

async function handleCreate(req: NextApiRequest, res: NextApiResponse) {
  const { name, email, password, phone }: CreateCustomerRequest = req.body;

  // Validation des données
  if (!name || !email || !password || !phone) {
    return res.status(400).json({ 
      error: 'Les champs name, email, password et phone sont requis' 
    });
  }

  // Validation de l'email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Format d\'email invalide' });
  }

  try {
    const customerData: ICustomerCreateParams = {
      name,
      email,
      password,
      phone
    };

    const newCustomer = await apiUseCases.createCustomer(customerData);

    return res.status(201).json({
      success: true,
      message: `Client ${name} créé avec succès`,
      customer: newCustomer
    });
  } catch (error) {
    console.error('Erreur lors de la création du client:', error);
    if (error instanceof Error && error.message.includes('email')) {
      return res.status(400).json({ error: 'Un client avec cet email existe déjà' });
    }
    return res.status(500).json({ error: 'Erreur lors de la création du client' });
  }
}

async function handleUpdate(req: NextApiRequest, res: NextApiResponse) {
  const { id, name, email, phone }: UpdateCustomerRequest = req.body;

  // Validation des données
  if (!id || !name || !email || !phone) {
    return res.status(400).json({ 
      error: 'Les champs id, name, email et phone sont requis' 
    });
  }

  // Validation de l'email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Format d\'email invalide' });
  }

  try {
    const updateData = {
      id,
      name,
      email,
      phone
    };

    const updatedCustomer = await apiUseCases.updateCustomer(updateData);

    return res.status(200).json({
      success: true,
      message: `Client ${name} modifié avec succès`,
      customer: updatedCustomer
    });
  } catch (error) {
    console.error('Erreur lors de la modification du client:', error);
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }
    if (error instanceof Error && error.message.includes('email')) {
      return res.status(400).json({ error: 'Un client avec cet email existe déjà' });
    }
    return res.status(500).json({ error: 'Erreur lors de la modification du client' });
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'L\'ID du client est requis' });
  }

  try {
    await apiUseCases.deleteCustomer(id);

    return res.status(200).json({
      success: true,
      message: 'Client supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du client:', error);
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }
    return res.status(500).json({ error: 'Erreur lors de la suppression du client' });
  }
}