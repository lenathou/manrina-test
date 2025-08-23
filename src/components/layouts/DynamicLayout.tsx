/* eslint-disable react/no-unescaped-entities */
import React, { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { AdminLayout } from './AdminLayout';
import { ClientLayout } from './ClientLayout';
import { ProducteurLayout } from './ProducteurLayout';
import { LivreurLayout } from './LivreurLayout';
import { Header } from '@/components/Header/Header';
import { backendFetchService } from '@/service/BackendFetchService';
import { IAdminTokenPayload } from '@/server/admin/IAdmin';
import { ICustomerTokenPayload } from '@/server/customer/ICustomer';
import { IGrowerTokenPayload } from '@/server/grower/IGrower';
import { IDelivererTokenPayload } from '@/server/deliverer/IDeliverer';

interface DynamicLayoutProps {
    children: ReactNode;
}

type UserRole = 'admin' | 'client' | 'producteur' | 'livreur' | 'public';

interface AuthState {
    role: UserRole;
    user: IAdminTokenPayload | ICustomerTokenPayload | IGrowerTokenPayload | IDelivererTokenPayload | null;
    isLoading: boolean;
    error: string | null;
}

export const DynamicLayout: React.FC<DynamicLayoutProps> = ({ children }) => {
    const router = useRouter();
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
    }, [router.pathname]);

    // Affichage de chargement
    if (authState.isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[var(--color-background)]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Vérification de l'authentification...</p>
                </div>
            </div>
        );
    }

    // Affichage d'erreur critique
    if (authState.error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[var(--color-background)]">
                <div className="text-center max-w-md mx-auto p-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <div className="text-red-600 text-6xl mb-4">⚠️</div>
                        <h2 className="text-xl font-bold text-red-800 mb-2">Erreur d'authentification</h2>
                        <p className="text-red-700 mb-4">{authState.error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                        >
                            Réessayer
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Déterminer si on est sur une page spécifique à un rôle
    // Exclure les pages de connexion qui ne nécessitent pas d'authentification
    const isAdminPage = router.pathname.startsWith('/admin') && !router.pathname.includes('login');
    const isClientPage = router.pathname.startsWith('/client') && !router.pathname.includes('login');
    const isProducteurPage = router.pathname.startsWith('/producteur') && !router.pathname.includes('login');
    const isLivreurPage = router.pathname.startsWith('/livreur') && !router.pathname.includes('login');

    // Si on est sur une page spécifique à un rôle, vérifier l'autorisation
    if (isAdminPage) {
        if (authState.role !== 'admin') {
            return (
                <div className="flex items-center justify-center min-h-screen bg-[var(--color-background)]">
                    <div className="text-center max-w-md mx-auto p-6">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                            <div className="text-yellow-600 text-6xl mb-4">🔒</div>
                            <h2 className="text-xl font-bold text-yellow-800 mb-2">Accès non autorisé</h2>
                            <p className="text-yellow-700 mb-4">
                                Vous devez être connecté en tant qu'administrateur pour accéder à cette page.
                            </p>
                            <button
                                onClick={() => router.push('/admin-login')}
                                className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition-colors"
                            >
                                Se connecter
                            </button>
                        </div>
                    </div>
                </div>
            );
        }
        return <AdminLayout authenticatedAdmin={authState.user as IAdminTokenPayload}>{children}</AdminLayout>;
    }

    if (isClientPage) {
        if (authState.role !== 'client') {
            return (
                <div className="flex items-center justify-center min-h-screen bg-[var(--color-background)]">
                    <div className="text-center max-w-md mx-auto p-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                            <div className="text-blue-600 text-6xl mb-4">👤</div>
                            <h2 className="text-xl font-bold text-blue-800 mb-2">Connexion requise</h2>
                            <p className="text-blue-700 mb-4">
                                Vous devez être connecté en tant que client pour accéder à cette page.
                            </p>
                            <button
                                onClick={() => router.push('/login')}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                            >
                                Se connecter
                            </button>
                        </div>
                    </div>
                </div>
            );
        }
        return <ClientLayout authenticatedClient={authState.user as ICustomerTokenPayload}>{children}</ClientLayout>;
    }

    if (isProducteurPage) {
        if (authState.role !== 'producteur') {
            return (
                <div className="flex items-center justify-center min-h-screen bg-[var(--color-background)]">
                    <div className="text-center max-w-md mx-auto p-6">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                            <div className="text-green-600 text-6xl mb-4">🌱</div>
                            <h2 className="text-xl font-bold text-green-800 mb-2">Accès producteur requis</h2>
                            <p className="text-green-700 mb-4">
                                Vous devez être connecté en tant que producteur pour accéder à cette page.
                            </p>
                            <button
                                onClick={() => router.push('/producteur/login')}
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                            >
                                Se connecter
                            </button>
                        </div>
                    </div>
                </div>
            );
        }
        return (
            <ProducteurLayout authenticatedGrower={authState.user as IGrowerTokenPayload}>{children}</ProducteurLayout>
        );
    }

    if (isLivreurPage) {
        if (authState.role !== 'livreur') {
            return (
                <div className="flex items-center justify-center min-h-screen bg-[var(--color-background)]">
                    <div className="text-center max-w-md mx-auto p-6">
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                            <div className="text-purple-600 text-6xl mb-4">🚚</div>
                            <h2 className="text-xl font-bold text-purple-800 mb-2">Accès livreur requis</h2>
                            <p className="text-purple-700 mb-4">
                                Vous devez être connecté en tant que livreur pour accéder à cette page.
                            </p>
                            <button
                                onClick={() => router.push('/livreur/login')}
                                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
                            >
                                Se connecter
                            </button>
                        </div>
                    </div>
                </div>
            );
        }
        return (
            <LivreurLayout authenticatedDeliverer={authState.user as IDelivererTokenPayload}>{children}</LivreurLayout>
        );
    }

    // Pour les pages publiques, utiliser le layout correspondant au rôle de l'utilisateur connecté
    // ou le header global si aucun utilisateur n'est connecté
    switch (authState.role) {
        case 'admin':
            return <AdminLayout authenticatedAdmin={authState.user as IAdminTokenPayload}>{children}</AdminLayout>;
        case 'client':
            return <ClientLayout authenticatedClient={authState.user as ICustomerTokenPayload}>{children}</ClientLayout>;
        case 'producteur':
            return <ProducteurLayout authenticatedGrower={authState.user as IGrowerTokenPayload}>{children}</ProducteurLayout>;
        case 'livreur':
            return <LivreurLayout authenticatedDeliverer={authState.user as IDelivererTokenPayload}>{children}</LivreurLayout>;
        default:
            // Utilisateur non connecté - utiliser le header global
            return (
                <div className="min-h-screen bg-[var(--color-background)]">
                    <Header />
                    <main className="pt-4">{children}</main>
                </div>
            );
    }
};
