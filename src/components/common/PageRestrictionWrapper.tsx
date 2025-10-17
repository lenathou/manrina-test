import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useFeatureToggle } from '@/contexts/FeatureToggleContext';
import { getPageRestriction, getRedirectPath } from '@/config/restrictedPages';

interface PageRestrictionWrapperProps {
  children: React.ReactNode;
}

/**
 * Wrapper intelligent qui vérifie automatiquement les restrictions de page
 * basé sur la configuration centralisée dans restrictedPages.ts
 */
export const PageRestrictionWrapper: React.FC<PageRestrictionWrapperProps> = ({ children }) => {
  const router = useRouter();
  const { isFeatureEnabled, canBypassRestrictions } = useFeatureToggle();
  const [isChecking, setIsChecking] = useState(true);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const checkRestrictions = async () => {
      const currentPath = router.asPath;
      
      // Vérifier si la page a des restrictions
      const restriction = getPageRestriction(currentPath);
      
      if (!restriction) {
        // Pas de restriction, afficher la page
        setShouldRender(true);
        setIsChecking(false);
        return;
      }

      // Si l'utilisateur peut contourner les restrictions (admin)
      if (canBypassRestrictions()) {
        setShouldRender(true);
        setIsChecking(false);
        return;
      }

      // Vérifier les restrictions spécifiques
      switch (restriction.restriction) {
        case 'delivery':
          if (!isFeatureEnabled('deliveryEnabled')) {
            // Rediriger vers la page d'indisponibilité
            const redirectPath = getRedirectPath(currentPath);
            if (redirectPath && currentPath !== redirectPath) {
              await router.replace(redirectPath);
              return;
            }
          }
          break;
        
        case 'auth':
          // Logique pour les restrictions d'authentification
          // À implémenter selon vos besoins
          break;
          
        case 'admin':
          // Logique pour les restrictions admin
          // À implémenter selon vos besoins
          break;
      }

      setShouldRender(true);
      setIsChecking(false);
    };

    // Attendre que le contexte soit initialisé
    if (typeof isFeatureEnabled('deliveryEnabled') !== 'undefined') {
      checkRestrictions();
    }
  }, [router.asPath, isFeatureEnabled, canBypassRestrictions, router]);

  // Afficher un loader pendant la vérification
  if (isChecking) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)] mx-auto mb-4"></div>
          <p className="text-[var(--muted-foreground)]">Vérification des accès...</p>
        </div>
      </div>
    );
  }

  // Afficher la page si autorisée
  return shouldRender ? <>{children}</> : null;
};