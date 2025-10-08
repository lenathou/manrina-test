import { NextApiRequest, NextApiResponse } from 'next';

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked: boolean;
  blockUntil?: number;
}

interface RateLimitConfig {
  windowMs: number; // Fenêtre de temps en millisecondes
  maxAttempts: number; // Nombre maximum de tentatives
  blockDurationMs: number; // Durée de blocage en millisecondes
  skipSuccessfulRequests?: boolean; // Ne pas compter les requêtes réussies
}

// Store en mémoire pour le rate limiting (en production, utiliser Redis)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Configuration par défaut pour les changements de mot de passe
const DEFAULT_PASSWORD_CHANGE_CONFIG: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxAttempts: 5, // 5 tentatives max
  blockDurationMs: 30 * 60 * 1000, // Blocage de 30 minutes
  skipSuccessfulRequests: true
};

// Configuration pour les tentatives de connexion
const DEFAULT_LOGIN_CONFIG: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxAttempts: 10, // 10 tentatives max
  blockDurationMs: 15 * 60 * 1000, // Blocage de 15 minutes
  skipSuccessfulRequests: true
};

/**
 * Génère une clé unique pour identifier l'utilisateur
 */
const generateKey = (req: NextApiRequest, prefix: string): string => {
  // Utiliser l'IP comme identifiant principal
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0]) : req.socket.remoteAddress;
  
  // Ajouter l'User-Agent pour plus de spécificité
  const userAgent = req.headers['user-agent'] || 'unknown';
  const userAgentHash = Buffer.from(userAgent).toString('base64').slice(0, 10);
  
  return `${prefix}:${ip}:${userAgentHash}`;
};

/**
 * Nettoie les entrées expirées du store
 */
const cleanupExpiredEntries = (): void => {
  const now = Date.now();
  for (const [key, entry] of Array.from(rateLimitStore.entries())) {
    if (now > entry.resetTime && (!entry.blocked || (entry.blockUntil && now > entry.blockUntil))) {
      rateLimitStore.delete(key);
    }
  }
};

/**
 * Middleware de rate limiting
 */
export const createRateLimiter = (config: RateLimitConfig = DEFAULT_PASSWORD_CHANGE_CONFIG) => {
  return (prefix: string) => {
    return async (
      req: NextApiRequest,
      res: NextApiResponse,
      next: () => Promise<void> | void
    ): Promise<void> => {
      // Nettoyer les entrées expirées périodiquement
      if (Math.random() < 0.1) { // 10% de chance à chaque requête
        cleanupExpiredEntries();
      }

      const key = generateKey(req, prefix);
      const now = Date.now();
      
      let entry = rateLimitStore.get(key);
      
      // Initialiser l'entrée si elle n'existe pas
      if (!entry) {
        entry = {
          count: 0,
          resetTime: now + config.windowMs,
          blocked: false
        };
        rateLimitStore.set(key, entry);
      }
      
      // Vérifier si l'utilisateur est bloqué
      if (entry.blocked && entry.blockUntil && now < entry.blockUntil) {
        const remainingTime = Math.ceil((entry.blockUntil - now) / 1000 / 60);
        return res.status(429).json({
          message: `Trop de tentatives. Réessayez dans ${remainingTime} minute(s).`,
          code: 'RATE_LIMITED',
          retryAfter: Math.ceil((entry.blockUntil - now) / 1000)
        });
      }
      
      // Réinitialiser le compteur si la fenêtre est expirée
      if (now > entry.resetTime) {
        entry.count = 0;
        entry.resetTime = now + config.windowMs;
        entry.blocked = false;
        entry.blockUntil = undefined;
      }
      
      // Incrémenter le compteur avant de traiter la requête
      entry.count++;
      
      // Vérifier si la limite est atteinte
      if (entry.count > config.maxAttempts) {
        entry.blocked = true;
        entry.blockUntil = now + config.blockDurationMs;
        
        const remainingTime = Math.ceil(config.blockDurationMs / 1000 / 60);
        return res.status(429).json({
          message: `Limite de tentatives dépassée. Compte bloqué pour ${remainingTime} minute(s).`,
          code: 'RATE_LIMITED_BLOCKED',
          retryAfter: Math.ceil(config.blockDurationMs / 1000)
        });
      }
      
      // Ajouter des headers informatifs
      res.setHeader('X-RateLimit-Limit', config.maxAttempts);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, config.maxAttempts - entry.count));
      res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetTime / 1000));
      
      try {
        await next();
        
        // Si la requête est réussie et qu'on doit ignorer les succès
        if (config.skipSuccessfulRequests && res.statusCode < 400) {
          entry.count = Math.max(0, entry.count - 1);
        }
      } catch (error) {
        // En cas d'erreur, le compteur reste incrémenté
        throw error;
      }
    };
  };
};

// Instances pré-configurées
export const passwordChangeRateLimit = createRateLimiter(DEFAULT_PASSWORD_CHANGE_CONFIG);
export const loginRateLimit = createRateLimiter(DEFAULT_LOGIN_CONFIG);

// Fonction utilitaire pour réinitialiser le rate limit d'un utilisateur (pour les admins)
export const resetRateLimit = (req: NextApiRequest, prefix: string): boolean => {
  const key = generateKey(req, prefix);
  return rateLimitStore.delete(key);
};

// Fonction pour obtenir les statistiques de rate limiting
export const getRateLimitStats = (req: NextApiRequest, prefix: string): RateLimitEntry | null => {
  const key = generateKey(req, prefix);
  return rateLimitStore.get(key) || null;
};

export default createRateLimiter;