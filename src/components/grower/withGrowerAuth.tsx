import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { ROUTES } from '@/router/routes';
import { useAppRouter } from '@/router/useAppRouter';
import { IGrowerTokenPayload } from '@/server/grower/IGrower';
import { backendFetchService } from '@/service/BackendFetchService';
import { ComponentType, useEffect, useState } from 'react';

export function withGrowerAuth<P extends object>(WrappedComponent: ComponentType<P>) {
    return function WithGrowerAuthComponent(props: P) {
        const { navigate, currentRoute } = useAppRouter();
        const [isLoading, setIsLoading] = useState(true);
        const [authenticatedGrower, setAuthenticatedGrower] = useState<IGrowerTokenPayload | null>(null);

        useEffect(() => {
            // Vérifier que nous sommes côté client pour éviter les erreurs d'hydratation
            if (typeof window === 'undefined') {
                setIsLoading(false);
                return;
            }

            let didRedirect = false;
            const checkAuth = async () => {
                try {
                    const isValid = await backendFetchService.verifyGrowerToken();
                    if (!isValid) {
                        throw new Error('Not authenticated');
                    }
                    setAuthenticatedGrower(isValid);
                    setIsLoading(false);
                } catch {
                    // Erreur d'authentification - redirection vers la page de connexion
                    if (!didRedirect && currentRoute !== ROUTES.GROWER.LOGIN) {
                        didRedirect = true;
                        navigate.to(ROUTES.GROWER.LOGIN);
                    }
                }
            };

            if (currentRoute !== ROUTES.GROWER.LOGIN) {
                checkAuth();
            } else {
                setIsLoading(false);
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [currentRoute]);

        if (isLoading && currentRoute !== ROUTES.GROWER.LOGIN) {
            return <LoadingScreen />;
        }

        return (
            <WrappedComponent
                authenticatedGrower={authenticatedGrower}
                {...props}
            />
        );
    };
}
