import { useState, useEffect } from 'react';
import { backendFetchService } from '@/service/BackendFetchService';
import { IAdminTokenPayload } from '@/server/admin/IAdmin';
import { ICustomerTokenPayload } from '@/server/customer/ICustomer';
import { IGrowerTokenPayload } from '@/server/grower/IGrower';
import { IDelivererTokenPayload } from '@/server/deliverer/IDeliverer';

type UserRole = 'admin' | 'client' | 'producteur' | 'livreur' | 'public';

interface AuthState {
    role: UserRole;
    user: IAdminTokenPayload | ICustomerTokenPayload | IGrowerTokenPayload | IDelivererTokenPayload | null;
    isLoading: boolean;
    error: string | null;
}

export const useAuth = () => {
    const [authState, setAuthState] = useState<AuthState>({
        role: 'public',
        user: null,
        isLoading: true,
        error: null,
    });

    useEffect(() => {
        const checkAuthentication = async () => {
            try {
                // Vérifier l'authentification admin
                try {
                    const adminUser = await backendFetchService.verifyAdminToken();
                    if (adminUser) {
                        setAuthState({ role: 'admin', user: adminUser, isLoading: false, error: null });
                        return;
                    }
                } catch (error) {
                    console.warn('Vérification admin échouée:', error);
                }

                // Vérifier l'authentification client
                try {
                    const clientUser = await backendFetchService.verifyCustomerToken();
                    if (clientUser) {
                        setAuthState({ role: 'client', user: clientUser, isLoading: false, error: null });
                        return;
                    }
                } catch (error) {
                    console.warn('Vérification client échouée:', error);
                }

                // Vérifier l'authentification producteur
                try {
                    const growerUser = await backendFetchService.verifyGrowerToken();
                    if (growerUser) {
                        setAuthState({ role: 'producteur', user: growerUser, isLoading: false, error: null });
                        return;
                    }
                } catch (error) {
                    console.warn('Vérification producteur échouée:', error);
                }

                // Vérifier l'authentification livreur
                try {
                    const delivererUser = await backendFetchService.verifyDelivererToken();
                    if (delivererUser) {
                        setAuthState({ role: 'livreur', user: delivererUser, isLoading: false, error: null });
                        return;
                    }
                } catch (error) {
                    console.warn('Vérification livreur échouée:', error);
                }

                // Aucun utilisateur connecté
                setAuthState({ role: 'public', user: null, isLoading: false, error: null });
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Erreur de connexion';
                console.error("Erreur critique lors de la vérification de l'authentification:", error);
                setAuthState({
                    role: 'public',
                    user: null,
                    isLoading: false,
                    error: `Erreur d'authentification: ${errorMessage}`,
                });
            }
        };

        checkAuthentication();
    }, []);

    return authState;
};