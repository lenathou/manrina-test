import { useState, useCallback } from 'react';
import { PasswordChangeData } from '@/components/common/PasswordChangeForm';

interface UsePasswordChangeOptions {
  userType: 'client' | 'admin' | 'grower' | 'deliverer';
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface PasswordChangeResponse {
  message: string;
  field?: string;
  code?: string;
}

interface UsePasswordChangeReturn {
  changePassword: (data: PasswordChangeData) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  success: string | null;
  clearMessages: () => void;
}

// Validation côté client renforcée (synchronisée avec la validation serveur)
const validatePassword = (password: string): string | null => {
  // Longueur minimale renforcée
  if (password.length < 12) {
    return 'Le mot de passe doit contenir au moins 12 caractères';
  }

  if (password.length > 128) {
    return 'Le mot de passe ne peut pas dépasser 128 caractères';
  }

  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const complexityCount = [hasLowercase, hasUppercase, hasNumbers, hasSpecialChars].filter(Boolean).length;
  
  if (complexityCount < 3) {
    return 'Le mot de passe doit contenir au moins 3 des 4 types de caractères suivants : minuscules, majuscules, chiffres, caractères spéciaux';
  }

  // Vérification contre les mots de passe communs (étendue)
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
};

const getApiEndpoint = (userType: string): string => {
  const endpoints = {
    client: '/api/client/security/change-password',
    admin: '/api/admin/security/change-password',
    grower: '/api/grower/security/change-password',
    deliverer: '/api/deliverer/security/change-password'
  };
  
  return endpoints[userType as keyof typeof endpoints] || endpoints.client;
};

export const usePasswordChange = ({
  userType,
  onSuccess,
  onError
}: UsePasswordChangeOptions): UsePasswordChangeReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  const changePassword = useCallback(async (data: PasswordChangeData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validation côté client renforcée
      if (!data.currentPassword) {
        throw new Error('Le mot de passe actuel est requis');
      }

      if (!data.newPassword) {
        throw new Error('Le nouveau mot de passe est requis');
      }

      if (!data.confirmPassword) {
        throw new Error('La confirmation du mot de passe est requise');
      }

      if (data.newPassword !== data.confirmPassword) {
        throw new Error('Les mots de passe ne correspondent pas');
      }

      if (data.currentPassword === data.newPassword) {
        throw new Error('Le nouveau mot de passe doit être différent de l\'ancien');
      }

      // Validation de la force du mot de passe
      const passwordError = validatePassword(data.newPassword);
      if (passwordError) {
        throw new Error(passwordError);
      }

      // Préparer les données pour l'API (sans confirmPassword)
      const apiData = {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      };

      // Appel à l'API
      const response = await fetch(getApiEndpoint(userType), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // Les cookies d'authentification seront automatiquement inclus
        },
        credentials: 'include', // Important pour inclure les cookies
        body: JSON.stringify(apiData),
      });

      const result: PasswordChangeResponse = await response.json();

      if (!response.ok) {
        // Gestion spécifique des erreurs de l'API
        if (result.code === 'INVALID_CURRENT_PASSWORD') {
          throw new Error('Le mot de passe actuel est incorrect');
        } else if (result.code === 'PASSWORD_TOO_WEAK') {
          throw new Error(result.message || 'Le mot de passe est trop faible');
        } else if (result.code === 'SAME_PASSWORD') {
          throw new Error('Le nouveau mot de passe doit être différent de l\'ancien');
        } else if (response.status === 401) {
          throw new Error('Session expirée. Veuillez vous reconnecter');
        } else if (response.status === 429) {
          throw new Error('Trop de tentatives. Veuillez patienter avant de réessayer');
        } else {
          throw new Error(result.message || 'Une erreur est survenue lors du changement de mot de passe');
        }
      }

      setSuccess(result.message || 'Mot de passe modifié avec succès');
      onSuccess?.();

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur inattendue est survenue';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [userType, onSuccess, onError]);

  return {
    changePassword,
    isLoading,
    error,
    success,
    clearMessages
  };
};

export default usePasswordChange;