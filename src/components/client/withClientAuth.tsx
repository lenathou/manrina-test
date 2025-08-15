/* eslint-disable @typescript-eslint/no-unused-vars */
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { ROUTES } from '@/router/routes';
import { useAppRouter } from '@/router/useAppRouter';
import { ICustomerTokenPayload } from '@/server/customer/ICustomer';
import { backendFetchService } from '@/service/BackendFetchService';
import { ComponentType, useEffect, useState } from 'react';

export function withClientAuth<P extends object>(WrappedComponent: ComponentType<P>) {
    return function WithClientAuthComponent(props: P) {
        const { navigate, currentRoute } = useAppRouter();
        const [isLoading, setIsLoading] = useState(true);
        const [authenticatedClient, setAuthenticatedClient] = useState<ICustomerTokenPayload | null>(null);

        useEffect(() => {
            // Vérifier que nous sommes côté client pour éviter les erreurs d'hydratation
            if (typeof window === 'undefined') {
                setIsLoading(false);
                return;
            }

            let didRedirect = false;
            const checkAuth = async () => {
                try {
                    const isValid = await backendFetchService.verifyCustomerToken();
                    if (!isValid) {
                        throw new Error('Not authenticated');
                    }
                    setAuthenticatedClient(isValid);
                    setIsLoading(false);
                } catch (error) {
                    if (!didRedirect && currentRoute !== ROUTES.CUSTOMER.LOGIN) {
                        didRedirect = true;
                        navigate.to(ROUTES.CUSTOMER.LOGIN);
                    }
                }
            };

            if (currentRoute !== ROUTES.CUSTOMER.LOGIN) {
                checkAuth();
            } else {
                setIsLoading(false);
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [currentRoute]);

        if (isLoading && currentRoute !== ROUTES.CUSTOMER.LOGIN) {
            return <LoadingScreen />;
        }

        return (
            <WrappedComponent
                authenticatedClient={authenticatedClient}
                {...props}
            />
        );
    };
}