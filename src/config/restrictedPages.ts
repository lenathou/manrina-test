/**
 * Configuration centralisée des pages avec restrictions
 * Ce fichier permet de gérer toutes les restrictions sans modifier les pages individuelles
 */

export interface PageRestriction {
  /** Chemin de la page (exact ou pattern) */
  path: string;
  /** Type de restriction */
  restriction: 'delivery' | 'auth' | 'admin';
  /** Page de redirection en cas de restriction */
  redirectTo: string;
  /** Description de la restriction (optionnel) */
  description?: string;
}

/**
 * Index des pages restreintes
 * Ajoutez simplement une nouvelle entrée ici pour restreindre une page
 */
export const RESTRICTED_PAGES: PageRestriction[] = [
  {
    path: '/panier',
    restriction: 'delivery',
    redirectTo: '/service-indisponible',
    description: 'Page panier - nécessite la livraison activée'
  },
  {
    path: '/payment',
    restriction: 'delivery', 
    redirectTo: '/service-indisponible',
    description: 'Page paiement - nécessite la livraison activée'
  },
  {
    path: '/client/validation-commande',
    restriction: 'delivery',
    redirectTo: '/service-indisponible',
    description: 'Pages de validation de commande - nécessitent la livraison activée'
  }
];

/**
 * Vérifie si une page est restreinte
 */
export const getPageRestriction = (pathname: string): PageRestriction | null => {
  return RESTRICTED_PAGES.find(restriction => {
    // Correspondance exacte ou pattern (commence par)
    return pathname === restriction.path || pathname.startsWith(restriction.path + '/');
  }) || null;
};

/**
 * Vérifie si une page nécessite la livraison
 */
export const requiresDelivery = (pathname: string): boolean => {
  const restriction = getPageRestriction(pathname);
  return restriction?.restriction === 'delivery';
};

/**
 * Obtient la page de redirection pour un chemin donné
 */
export const getRedirectPath = (pathname: string): string | null => {
  const restriction = getPageRestriction(pathname);
  return restriction?.redirectTo || null;
};