/**
 * Utilitaires pour la gestion des cookies côté client
 */

/**
 * Récupère la valeur d'un cookie par son nom
 * @param name - Le nom du cookie
 * @returns La valeur du cookie ou null si non trouvé
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null; // SSR safety
  }

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

/**
 * Récupère le token d'authentification admin
 * @returns Le token admin ou null si non trouvé
 */
export function getAdminToken(): string | null {
  return getCookie('adminToken');
}

/**
 * Récupère le token d'authentification client
 * @returns Le token client ou null si non trouvé
 */
export function getCustomerToken(): string | null {
  return getCookie('customerToken');
}

/**
 * Récupère le token d'authentification producteur
 * @returns Le token producteur ou null si non trouvé
 */
export function getGrowerToken(): string | null {
  return getCookie('growerToken');
}

/**
 * Récupère le token d'authentification livreur
 * @returns Le token livreur ou null si non trouvé
 */
export function getDelivererToken(): string | null {
  return getCookie('delivererToken');
}

/**
 * Récupère le token approprié selon le rôle de l'utilisateur
 * @param role - Le rôle de l'utilisateur
 * @returns Le token correspondant ou null si non trouvé
 */
export function getTokenByRole(role: 'admin' | 'customer' | 'grower' | 'deliverer'): string | null {
  switch (role) {
    case 'admin':
      return getAdminToken();
    case 'customer':
      return getCustomerToken();
    case 'grower':
      return getGrowerToken();
    case 'deliverer':
      return getDelivererToken();
    default:
      return null;
  }
}

/**
 * Vérifie si un utilisateur est authentifié (a un token valide)
 * @returns true si l'utilisateur a un token, false sinon
 */
export function isAuthenticated(): boolean {
  return !!(getAdminToken() || getCustomerToken() || getGrowerToken() || getDelivererToken());
}