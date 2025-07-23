/* eslint-disable @typescript-eslint/no-unused-vars */
import { ROUTES } from '@/router/routes';
import { useAppRouter } from '@/router/useAppRouter';
import { backendFetchService } from '@/service/BackendFetchService';
import { ComponentType, useEffect, useState, useRef, useCallback } from 'react';
import { LoadingScreen } from '../ui/LoadingScreen';
import { IAdminTokenPayload } from '@/server/admin/IAdmin';

export function withAdminAuth<P extends object>(WrappedComponent: ComponentType<P>) {
    return function WithAdminAuthComponent(props: P) {
        const { navigate, currentRoute } = useAppRouter();
        const [isLoading, setIsLoading] = useState(true);
        const [authenticatedAdmin, setAuthenticatedAdmin] = useState<IAdminTokenPayload | null>(null);
        const hasCheckedAuth = useRef(false);
        const currentRouteRef = useRef(currentRoute);
        
        // Mettre à jour la ref à chaque changement de route
        currentRouteRef.current = currentRoute;

        const checkAuth = useCallback(async () => {
            try {
                const adminData = await backendFetchService.verifyAdminToken();

                if (!adminData) {
                    throw new Error('Not authenticated');
                }

                setAuthenticatedAdmin(adminData);
                setIsLoading(false);
                hasCheckedAuth.current = true;
            } catch (error) {
                setAuthenticatedAdmin(null);
                setIsLoading(false);
                hasCheckedAuth.current = true;
                navigate.admin.toLogin();
            }
        }, [navigate]);

        useEffect(() => {
            // Éviter les appels répétés si l'authentification a déjà été vérifiée
            if (hasCheckedAuth.current && authenticatedAdmin) {
                return;
            }

            // Skip auth check on login page
            if (currentRouteRef.current !== ROUTES.ADMIN.LOGIN) {
                checkAuth();
            } else {
                setIsLoading(false);
                hasCheckedAuth.current = true;
            }
        }, [checkAuth, authenticatedAdmin]); 

        if (isLoading && currentRoute !== ROUTES.ADMIN.LOGIN) {
            return <LoadingScreen />;
        }

        return <WrappedComponent {...props} authenticatedAdmin={authenticatedAdmin} />;
    };
}
