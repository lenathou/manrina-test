import { useEffect, useState } from 'react';
import { AuthState, useOptionalAuthContext } from '@/contexts/AuthContext';
import { backendFetchService } from '@/service/BackendFetchService';

export const useAuth = () => {
    const context = useOptionalAuthContext();
    const [fallbackState, setFallbackState] = useState<AuthState>({
        role: 'public',
        user: null,
        isLoading: true,
        error: null,
    });

    useEffect(() => {
        if (context) {
            return;
        }

        const checkAuthentication = async () => {
            try {
                try {
                    const adminUser = await backendFetchService.verifyAdminToken();
                    if (adminUser) {
                        setFallbackState({ role: 'admin', user: adminUser, isLoading: false, error: null });
                        return;
                    }
                } catch (error) {
                    console.warn('Admin verification failed:', error);
                }

                try {
                    const clientUser = await backendFetchService.verifyCustomerToken();
                    if (clientUser) {
                        setFallbackState({ role: 'client', user: clientUser, isLoading: false, error: null });
                        return;
                    }
                } catch (error) {
                    console.warn('Client verification failed:', error);
                }

                try {
                    const growerUser = await backendFetchService.verifyGrowerToken();
                    if (growerUser) {
                        setFallbackState({ role: 'producteur', user: growerUser, isLoading: false, error: null });
                        return;
                    }
                } catch (error) {
                    console.warn('Grower verification failed:', error);
                }

                try {
                    const delivererUser = await backendFetchService.verifyDelivererToken();
                    if (delivererUser) {
                        setFallbackState({ role: 'livreur', user: delivererUser, isLoading: false, error: null });
                        return;
                    }
                } catch (error) {
                    console.warn('Deliverer verification failed:', error);
                }

                setFallbackState({ role: 'public', user: null, isLoading: false, error: null });
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Erreur de connexion';
                console.error('Authentication check failed critically:', error);
                setFallbackState({
                    role: 'public',
                    user: null,
                    isLoading: false,
                    error: `Erreur d\'authentification: ${errorMessage}`,
                });
            }
        };

        checkAuthentication();
    }, [context]);

    if (context) {
        return context;
    }

    return fallbackState;
};
