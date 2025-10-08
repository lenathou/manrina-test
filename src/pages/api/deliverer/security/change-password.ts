import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/server/prisma';
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

// Validation renforcée de la sécurité du mot de passe
function validatePasswordSecurity(password: string): string | null {
  // Longueur minimale
  if (password.length < 12) {
    return 'Le mot de passe doit contenir au moins 12 caractères';
  }

  // Longueur maximale pour éviter les attaques DoS
  if (password.length > 128) {
    return 'Le mot de passe ne peut pas dépasser 128 caractères';
  }

  // Complexité renforcée
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const complexityCount = [hasLowercase, hasUppercase, hasNumbers, hasSpecialChars].filter(Boolean).length;
  
  if (complexityCount < 3) {
    return 'Le mot de passe doit contenir au moins 3 des 4 types de caractères suivants : minuscules, majuscules, chiffres, caractères spéciaux';
  }

  // Vérification contre les mots de passe communs
  const commonPasswords = [
    'password', 'password123', '123456', '123456789', 'qwerty', 'abc123',
    'password1', 'admin', 'letmein', 'welcome', 'monkey', '1234567890',
    'azerty', 'motdepasse', 'admin123', 'root', 'toor', 'pass'
  ];
  
  if (commonPasswords.some(common => password.toLowerCase().includes(common.toLowerCase()))) {
    return 'Le mot de passe ne doit pas contenir de mots de passe communs';
  }

  // Vérification des séquences répétitives
  if (/(.)\1{2,}/.test(password)) {
    return 'Le mot de passe ne doit pas contenir plus de 2 caractères identiques consécutifs';
  }

  // Vérification des séquences clavier
  const keyboardSequences = ['qwerty', 'azerty', '123456', 'abcdef'];
  if (keyboardSequences.some(seq => password.toLowerCase().includes(seq))) {
    return 'Le mot de passe ne doit pas contenir de séquences clavier évidentes';
  }

  return null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  // Appliquer le rate limiting
  let rateLimitPassed = false;
  await passwordChangeRateLimit('deliverer-password-change')(req, res, () => {
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

    let delivererId: string;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { delivererId: string };
      delivererId = decoded.delivererId;
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

    // Récupérer le livreur
    const deliverer = await prisma.deliverer.findUnique({
      where: { id: delivererId },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });

    if (!deliverer) {
      return res.status(404).json({ 
        message: 'Livreur non trouvé',
        code: 'DELIVERER_NOT_FOUND'
      } as ErrorResponse);
    }

    // Vérifier le mot de passe actuel
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, deliverer.password);
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
    await prisma.deliverer.update({
      where: { id: delivererId },
      data: {
        password: hashedNewPassword,
        updatedAt: new Date(),
      },
    });

    // Envoyer un email de confirmation (en arrière-plan, ne pas bloquer la réponse)
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    emailService.sendPasswordChangeConfirmation({
      userEmail: deliverer.email,
      userName: deliverer.email,
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
          message: 'Livreur non trouvé',
          code: 'DELIVERER_NOT_FOUND'
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