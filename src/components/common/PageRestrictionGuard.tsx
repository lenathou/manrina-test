import React, { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { useFeatureToggle } from '../../contexts/FeatureToggleContext';
import { 
  pageRestrictionsManager, 
  getRedirectPage 
} from '../../config/pageRestrictions';

interface PageRestrictionGuardProps {
  children: ReactNode;
}

export const PageRestrictionGuard: React.FC<PageRestrictionGuardProps> = ({ children }) => {
  const router = useRouter();
  const { isFeatureEnabled, canBypassRestrictions } = useFeatureToggle();
  
  console.log('🚀 PageRestrictionGuard - Component mounted');

  useEffect(() => {
    const checkPageRestrictions = () => {
      const currentPath = router.asPath;
      
      console.log('PageRestrictionGuard - Vérification pour:', currentPath);
      console.log('PageRestrictionGuard - deliveryEnabled:', isFeatureEnabled('deliveryEnabled'));
      console.log('PageRestrictionGuard - canBypass:', canBypassRestrictions());
      
      // Ignorer les pages exclues
      if (pageRestrictionsManager.isExcluded(currentPath)) {
        console.log('PageRestrictionGuard - Page exclue, pas de restriction');
        return;
      }

      // Si l'utilisateur est admin, il peut contourner les restrictions
      if (canBypassRestrictions()) {
        console.log('PageRestrictionGuard - Admin peut contourner les restrictions');
        return;
      }

      // Vérifier si la page nécessite la livraison
      if (pageRestrictionsManager.isDeliveryRequired(currentPath)) {
        console.log('PageRestrictionGuard - Page nécessite la livraison');
        // Si la livraison n'est pas activée, rediriger
        if (!isFeatureEnabled('deliveryEnabled')) {
          const redirectPage = getRedirectPage();
          
          // Éviter les boucles de redirection
          if (currentPath !== redirectPage) {
            console.log(`PageRestrictionGuard - Redirection de ${currentPath} vers ${redirectPage} - Livraison désactivée`);
            router.replace(redirectPage);
          }
        } else {
          console.log('PageRestrictionGuard - Livraison activée, accès autorisé');
        }
      } else {
        console.log('PageRestrictionGuard - Page ne nécessite pas la livraison');
      }
    };

    // Vérifier lors du changement de route
    checkPageRestrictions();

    // Écouter les changements de route
    router.events.on('routeChangeComplete', checkPageRestrictions);

    // Nettoyer l'écouteur
    return () => {
      router.events.off('routeChangeComplete', checkPageRestrictions);
    };
  }, [router, isFeatureEnabled, canBypassRestrictions]);

  return <>{children}</>;
};

// HOC pour wrapper automatiquement les pages
export function withPageRestrictions<P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.FC<P> {
  const WithPageRestrictionsComponent: React.FC<P> = (props) => {
    return (
      <PageRestrictionGuard>
        <WrappedComponent {...props} />
      </PageRestrictionGuard>
    );
  };

  WithPageRestrictionsComponent.displayName = `withPageRestrictions(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithPageRestrictionsComponent;
}