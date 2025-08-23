import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/server/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

interface ErrorResponse {
  message: string;
  field?: string;
  code?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    // Vérifier l'authentification
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Token d\'authentification manquant' });
    }

    let growerId: string;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { growerId: string };
      growerId = decoded.growerId;
    } catch (error) {
      return res.status(401).json({ message: 'Token invalide' });
    }

    // Validation des données
    const { currentPassword, newPassword }: ChangePasswordRequest = req.body;
    
    // Validation des champs requis
    if (!currentPassword) {
      return res.status(400).json({ 
        message: 'Le mot de passe actuel est requis',
        field: 'currentPassword',
        code: 'MISSING_CURRENT_PASSWORD'
      } as ErrorResponse);
    }

    if (!newPassword) {
      return res.status(400).json({ 
        message: 'Le nouveau mot de passe est requis',
        field: 'newPassword',
        code: 'MISSING_NEW_PASSWORD'
      } as ErrorResponse);
    }

    // Validation de la longueur du mot de passe
    if (newPassword.length < 8) {
      return res.status(400).json({ 
        message: 'Le nouveau mot de passe doit contenir au moins 8 caractères',
        field: 'newPassword',
        code: 'PASSWORD_TOO_SHORT'
      } as ErrorResponse);
    }

    // Validation de la complexité du mot de passe
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ 
        message: 'Le nouveau mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial',
        field: 'newPassword',
        code: 'PASSWORD_TOO_WEAK'
      } as ErrorResponse);
    }

    // Vérifier que le nouveau mot de passe est différent de l'ancien
    if (currentPassword === newPassword) {
      return res.status(400).json({ 
        message: 'Le nouveau mot de passe doit être différent du mot de passe actuel',
        field: 'newPassword',
        code: 'SAME_PASSWORD'
      } as ErrorResponse);
    }

    // Récupérer le producteur
    const grower = await prisma.grower.findUnique({
      where: { id: growerId },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });

    if (!grower) {
      return res.status(404).json({ 
        message: 'Producteur non trouvé',
        code: 'GROWER_NOT_FOUND'
      } as ErrorResponse);
    }

    // Vérifier le mot de passe actuel
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, grower.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ 
        message: 'Le mot de passe actuel est incorrect',
        field: 'currentPassword',
        code: 'INVALID_CURRENT_PASSWORD'
      } as ErrorResponse);
    }

    // Hasher le nouveau mot de passe
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Mettre à jour le mot de passe
    await prisma.grower.update({
      where: { id: growerId },
      data: {
        password: hashedNewPassword,
        updatedAt: new Date(),
      },
    });

    return res.status(200).json({
      message: 'Mot de passe modifié avec succès',
    });
  } catch (err: unknown) {
    console.error('Erreur lors de la modification du mot de passe:', err);
    
    // Gestion spécifique des erreurs Prisma
    if (err instanceof Error) {
      if (err.message.includes('P2002')) {
        return res.status(409).json({ 
          message: 'Conflit de données',
          code: 'DATA_CONFLICT'
        } as ErrorResponse);
      }
      
      if (err.message.includes('P2025')) {
        return res.status(404).json({ 
          message: 'Producteur non trouvé',
          code: 'GROWER_NOT_FOUND'
        } as ErrorResponse);
      }
    }
    
    return res.status(500).json({ 
      message: 'Une erreur inattendue s\'est produite. Veuillez réessayer plus tard.',
      code: 'INTERNAL_SERVER_ERROR',
      ...(process.env.NODE_ENV === 'development' && { error: err instanceof Error ? err.message : 'Unknown error' })
    } as ErrorResponse);
  }
}