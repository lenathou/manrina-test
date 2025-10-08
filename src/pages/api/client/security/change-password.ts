import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/server/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { passwordChangeRateLimit } from '@/middleware/rateLimiter';
import { emailService } from '@/services/emailService';

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

interface ErrorResponse {
  message: string;
  field?: string;
  code?: string;
}

// Validation renforcée des mots de passe
const validatePasswordSecurity = (password: string): string | null => {
  if (password.length < 8) {
    return 'Le mot de passe doit contenir au moins 8 caractères';
  }
  
  if (password.length > 128) {
    return 'Le mot de passe ne peut pas dépasser 128 caractères';
  }
  
  // Vérification de la complexité
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[@$!%*?&]/.test(password);
  
  if (!hasLowerCase || !hasUpperCase || !hasNumbers || !hasSpecialChar) {
    return 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*?&)';
  }
  
  // Vérification contre les mots de passe communs
  const commonPasswords = [
    'password', 'password123', '123456789', 'qwerty123',
    'admin123', 'welcome123', 'password1', 'letmein123'
  ];
  
  if (commonPasswords.some(common => password.toLowerCase().includes(common.toLowerCase()))) {
    return 'Ce mot de passe est trop commun. Veuillez en choisir un autre';
  }
  
  return null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  // Appliquer le rate limiting
  let rateLimitPassed = false;
  await passwordChangeRateLimit('client-password-change')(req, res, () => {
    rateLimitPassed = true;
  });
  
  if (!rateLimitPassed) {
    // Le rate limiter a déjà envoyé la réponse
    return;
  }

  try {
    // Vérifier l'authentification
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Token d\'authentification manquant' });
    }

    let customerId: string;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { customerId: string };
      customerId = decoded.customerId;
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

    // Validation renforcée de la sécurité du mot de passe
    const passwordValidationError = validatePasswordSecurity(newPassword);
    if (passwordValidationError) {
      return res.status(400).json({ 
        message: passwordValidationError,
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

    // Récupérer le client
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });

    if (!customer) {
      return res.status(404).json({ 
        message: 'Client non trouvé',
        code: 'CUSTOMER_NOT_FOUND'
      } as ErrorResponse);
    }

    // Vérifier le mot de passe actuel
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, customer.password);
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
    await prisma.customer.update({
      where: { id: customerId },
      data: {
        password: hashedNewPassword,
        updatedAt: new Date(),
      },
    });

    // Envoyer un email de confirmation (en arrière-plan, ne pas bloquer la réponse)
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    emailService.sendPasswordChangeConfirmation({
      userEmail: customer.email,
      userName: customer.email, // Utiliser l'email comme nom si pas de nom disponible
      changeTime: new Date().toLocaleString('fr-FR', { 
        timeZone: 'Europe/Paris',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      ipAddress: Array.isArray(clientIp) ? clientIp[0] : clientIp,
      userAgent: userAgent
    }).catch(error => {
      console.error('Erreur lors de l\'envoi de l\'email de confirmation:', error);
      // Ne pas faire échouer la requête si l'email échoue
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
          message: 'Client non trouvé',
          code: 'CLIENT_NOT_FOUND'
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