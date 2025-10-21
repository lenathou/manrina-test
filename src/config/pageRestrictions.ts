import { ROUTES } from '../router/routes';

// Configuration des restrictions de pages
export interface PageRestrictionConfig {
  // Pages qui nécessitent que la livraison soit activée
  deliveryRequiredPages: string[];
  // Page de redirection quand la livraison est désactivée
  redirectPage: string;
  // Pages exclues de toute vérification (même pour les admins)
  excludedPages: string[];
}

// Configuration par défaut
export const DEFAULT_PAGE_RESTRICTIONS: PageRestrictionConfig = {
  deliveryRequiredPages: [
    ROUTES.PANIER,
    ROUTES.PAIEMENT,
    // Pages configurées directement dans le code
    '/panier',
    '/payment',
    // '/suivi-commande',
  ],
  redirectPage: '/service-indisponible',
  excludedPages: [
    '/admin',
    '/login',
    '/register',
    '/',
    '/service-indisponible',
    // Pages d'administration et d'authentification
    ...Object.values(ROUTES.ADMIN || {}),
  ],
};

// Fonction utilitaire pour vérifier si une page nécessite la livraison
export const isDeliveryRequiredPage = (pathname: string): boolean => {
  const result = DEFAULT_PAGE_RESTRICTIONS.deliveryRequiredPages.some(page => 
    pathname === page || pathname.startsWith(page + '/')
  );
  console.log(`🔍 pageRestrictions - isDeliveryRequiredPage(${pathname}):`, result);
  console.log('🔍 pageRestrictions - deliveryRequiredPages:', DEFAULT_PAGE_RESTRICTIONS.deliveryRequiredPages);
  return result;
};

// Fonction utilitaire pour vérifier si une page est exclue
export const isExcludedPage = (pathname: string): boolean => {
  const result = DEFAULT_PAGE_RESTRICTIONS.excludedPages.some(page => 
    pathname === page || pathname.startsWith(page + '/')
  );
  console.log(`🔍 pageRestrictions - isExcludedPage(${pathname}):`, result);
  console.log('🔍 pageRestrictions - excludedPages:', DEFAULT_PAGE_RESTRICTIONS.excludedPages);
  return result;
};

// Fonction pour obtenir la page de redirection
export const getRedirectPage = (): string => {
  return DEFAULT_PAGE_RESTRICTIONS.redirectPage;
};

// Interface pour permettre la modification dynamique de la configuration
export class PageRestrictionsManager {
  private config: PageRestrictionConfig;

  constructor(initialConfig: PageRestrictionConfig = DEFAULT_PAGE_RESTRICTIONS) {
    this.config = { ...initialConfig };
  }

  // Ajouter une page aux restrictions
  addRestrictedPage(page: string): void {
    if (!this.config.deliveryRequiredPages.includes(page)) {
      this.config.deliveryRequiredPages.push(page);
    }
  }

  // Retirer une page des restrictions
  removeRestrictedPage(page: string): void {
    this.config.deliveryRequiredPages = this.config.deliveryRequiredPages.filter(p => p !== page);
  }

  // Obtenir la configuration actuelle
  getConfig(): PageRestrictionConfig {
    return { ...this.config };
  }

  // Mettre à jour la configuration complète
  updateConfig(newConfig: Partial<PageRestrictionConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Vérifier si une page nécessite la livraison
  isDeliveryRequired(pathname: string): boolean {
    const result = this.config.deliveryRequiredPages.some(page => 
      pathname === page || pathname.startsWith(page + '/')
    );
    console.log(`🔍 PageRestrictionsManager - isDeliveryRequired(${pathname}):`, result);
    console.log('🔍 PageRestrictionsManager - deliveryRequiredPages:', this.config.deliveryRequiredPages);
    return result;
  }

  // Vérifier si une page est exclue
  isExcluded(pathname: string): boolean {
    const result = this.config.excludedPages.some(page => 
      pathname === page || pathname.startsWith(page + '/')
    );
    console.log(`🔍 PageRestrictionsManager - isExcluded(${pathname}):`, result);
    console.log('🔍 PageRestrictionsManager - excludedPages:', this.config.excludedPages);
    return result;
  }
}

// Instance globale du gestionnaire
export const pageRestrictionsManager = new PageRestrictionsManager();