import { NextApiRequest, NextApiResponse } from 'next';
import { apiUseCases } from '@/server';
import { passwordChangeRateLimit } from '@/middleware/rateLimiter';

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
  await passwordChangeRateLimit('admin-password-change')(req, res, () => {
    rateLimitPassed = true;
  });
  
  if (!rateLimitPassed) {
    // Le rate limiter a déjà envoyé la réponse
    return;
  }

  try {
    // Vérifier l'authentification
    const adminToken = await apiUseCases.verifyAdminToken({ req, res });
    if (!adminToken) {
      return res.status(401).json({ message: 'Non autorisé' });
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

    // Utiliser apiUseCases pour changer le mot de passe
    const result = await apiUseCases.changeAdminPassword(currentPassword, newPassword, { req, res });
    
    if (!result.success) {
      // Mapper les erreurs pour maintenir la compatibilité
      if (result.message?.includes('mot de passe actuel')) {
        return res.status(400).json({ 
          message: result.message,
          field: 'currentPassword',
          code: 'INVALID_CURRENT_PASSWORD'
        } as ErrorResponse);
      }
      
      return res.status(400).json({ 
        message: result.message || 'Erreur lors du changement de mot de passe',
        code: 'CHANGE_PASSWORD_ERROR'
      } as ErrorResponse);
    }

    // Note: Pas d'email de confirmation pour les admins car ils n'ont pas d'adresse email dans le schéma
    // Les admins sont des comptes système internes qui utilisent un username au lieu d'un email
    
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
          message: 'Administrateur non trouvé',
          code: 'ADMIN_NOT_FOUND'
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