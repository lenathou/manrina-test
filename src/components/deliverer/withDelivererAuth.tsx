import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { ROUTES } from '@/router/routes';
import { useAppRouter } from '@/router/useAppRouter';
import { IDelivererTokenPayload } from '@/server/deliverer/IDeliverer';
import { backendFetchService } from '@/service/BackendFetchService';
import { ComponentType, useEffect, useState, useRef, useCallback } from 'react';

export function withDelivererAuth<P extends object>(WrappedComponent: ComponentType<P>) {
  return function WithDelivererAuthComponent(props: P) {
    const { navigate, currentRoute } = useAppRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [authenticatedDeliverer, setAuthenticatedDeliverer] = useState<IDelivererTokenPayload | null>(null);
    const hasCheckedAuth = useRef(false);
    const currentRouteRef = useRef(currentRoute);
    
    // Mettre à jour la ref à chaque changement de route
    currentRouteRef.current = currentRoute;

    const checkAuth = useCallback(async () => {
      try {
        const delivererData = await backendFetchService.verifyDelivererToken();
        // Handle the case where delivererData could be false
        setAuthenticatedDeliverer(delivererData === false ? null : delivererData);
        setIsLoading(false);
        hasCheckedAuth.current = true;
      } catch (error) {
        console.error('Erreur lors de la vérification du token deliverer:', error);
        setAuthenticatedDeliverer(null);
        setIsLoading(false);
        hasCheckedAuth.current = true;
        navigate.deliverer.toLogin();
      }
    }, [navigate]);

    useEffect(() => {
      // Éviter les appels répétés si l'authentification a déjà été vérifiée
      if (hasCheckedAuth.current && authenticatedDeliverer !== null) {
        return;
      }

      if (currentRouteRef.current !== ROUTES.DELIVERER.LOGIN) {
        checkAuth();
      } else {
        setIsLoading(false);
        hasCheckedAuth.current = true;
      }
    }, [checkAuth, authenticatedDeliverer]);

    if (isLoading) {
      return <LoadingScreen />;
    }

    return <WrappedComponent {...props} authenticatedDeliverer={authenticatedDeliverer} />;
  };
}