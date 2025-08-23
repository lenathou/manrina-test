import { useState, useEffect } from 'react';
import { backendFetchService } from '@/service/BackendFetchService';
import { IAdminTokenPayload } from '@/server/admin/IAdmin';
import { ICustomerTokenPayload } from '@/server/customer/ICustomer';
import { IGrowerTokenPayload } from '@/server/grower/IGrower';
import { IDelivererTokenPayload } from '@/server/deliverer/IDeliverer';

type UserRole = 'admin' | 'client' | 'producteur' | 'livreur' | null;

interface GlobalAuthState {
  role: UserRole;
  user: IAdminTokenPayload | ICustomerTokenPayload | IGrowerTokenPayload | IDelivererTokenPayload | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const useGlobalAuth = (): GlobalAuthState => {
  const [authState, setAuthState] = useState<GlobalAuthState>({
    role: null,
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  useEffect(() => {
    // Vérifier que nous sommes côté client pour éviter les erreurs d'hydratation
    if (typeof window === 'undefined') {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    const checkAuth = async () => {
      try {
        // Vérifier l'authentification admin
        try {
          const adminUser = await backendFetchService.verifyAdminToken();
          if (adminUser) {
            setAuthState({
              role: 'admin',
              user: adminUser,
              isAuthenticated: true,
              isLoading: false
            });
            return;
          }
        } catch {
          // Ignorer l'erreur et continuer avec les autres vérifications
        }

        // Vérifier l'authentification client
        try {
          const clientUser = await backendFetchService.verifyCustomerToken();
          if (clientUser) {
            setAuthState({
              role: 'client',
              user: clientUser,
              isAuthenticated: true,
              isLoading: false
            });
            return;
          }
        } catch {
          // Ignorer l'erreur et continuer avec les autres vérifications
        }

        // Vérifier l'authentification producteur
        try {
          const growerUser = await backendFetchService.verifyGrowerToken();
          if (growerUser) {
            setAuthState({
              role: 'producteur',
              user: growerUser,
              isAuthenticated: true,
              isLoading: false
            });
            return;
          }
        } catch {
          // Ignorer l'erreur et continuer avec les autres vérifications
        }

        // Vérifier l'authentification livreur
        try {
          const delivererUser = await backendFetchService.verifyDelivererToken();
          if (delivererUser) {
            setAuthState({
              role: 'livreur',
              user: delivererUser,
              isAuthenticated: true,
              isLoading: false
            });
            return;
          }
        } catch {
          // Ignorer l'erreur et continuer
        }

        // Aucun utilisateur connecté
        setAuthState({
          role: null,
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
        setAuthState({
          role: null,
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    };

    checkAuth();
  }, []);

  return authState;
};