import { useState, useEffect } from 'react';
import { backendFetchService } from '@/service/BackendFetchService';
import { ICustomerTokenPayload } from '@/server/customer/ICustomer';

export const useClientAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [authenticatedClient, setAuthenticatedClient] = useState<ICustomerTokenPayload | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        // Vérifier que nous sommes côté client pour éviter les erreurs d'hydratation
        if (typeof window === 'undefined') {
            setIsLoading(false);
            return;
        }

        const checkAuth = async () => {
            try {
                const clientData = await backendFetchService.verifyCustomerToken();
                if (clientData) {
                    setIsAuthenticated(true);
                    setAuthenticatedClient(clientData);
                } else {
                    setIsAuthenticated(false);
                    setAuthenticatedClient(null);
                }
            } catch {
                setIsAuthenticated(false);
                setAuthenticatedClient(null);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    return {
        isAuthenticated,
        authenticatedClient,
        isLoading
    };
};