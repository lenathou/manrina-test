import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Interface pour les fonctionnalités toggleables
export interface FeatureFlags {
  deliveryEnabled: boolean;
  // Ajoutez d'autres fonctionnalités ici facilement
  // paymentEnabled: boolean;
  // promotionsEnabled: boolean;
}

// Interface pour l'état d'administration
export interface AdminState {
  isAdmin: boolean;
  adminPassword: string;
}

// Interface du contexte
interface FeatureToggleContextType {
  // États des fonctionnalités
  features: FeatureFlags;
  
  // État d'administration
  admin: AdminState;
  
  // Actions pour les fonctionnalités
  toggleFeature: (feature: keyof FeatureFlags) => void;
  setFeature: (feature: keyof FeatureFlags, enabled: boolean) => void;
  
  // Actions pour l'administration
  loginAdmin: (password: string) => boolean;
  logoutAdmin: () => void;
  
  // Utilitaires
  isFeatureEnabled: (feature: keyof FeatureFlags) => boolean;
  canBypassRestrictions: () => boolean;
}

// Valeurs par défaut
const DEFAULT_FEATURES: FeatureFlags = {
  deliveryEnabled: false, // Par défaut désactivé - panier inaccessible
};

const DEFAULT_ADMIN: AdminState = {
  isAdmin: false,
  adminPassword: 'admin123', // À changer en production
};

// Clés pour le localStorage
const STORAGE_KEYS = {
  FEATURES: 'manrina_feature_flags',
  ADMIN: 'manrina_admin_state',
};

// Création du contexte
const FeatureToggleContext = createContext<FeatureToggleContextType | undefined>(undefined);

// Provider du contexte
interface FeatureToggleProviderProps {
  children: ReactNode;
}

export const FeatureToggleProvider: React.FC<FeatureToggleProviderProps> = ({ children }) => {
  const [features, setFeatures] = useState<FeatureFlags>(DEFAULT_FEATURES);
  const [admin, setAdmin] = useState<AdminState>(DEFAULT_ADMIN);

  // Charger les données depuis le localStorage et l'API centrale au montage
  useEffect(() => {
    const init = async () => {
      console.log('🔄 FeatureToggleContext - Initialisation du contexte');
      try {
        // Charger les fonctionnalités depuis localStorage (fallback)
        const savedFeatures = localStorage.getItem(STORAGE_KEYS.FEATURES);
        console.log('📦 FeatureToggleContext - savedFeatures from localStorage:', savedFeatures);
        if (savedFeatures) {
          const parsedFeatures = JSON.parse(savedFeatures);
          console.log('📦 FeatureToggleContext - parsedFeatures:', parsedFeatures);
          setFeatures(prev => {
            const newFeatures = { ...prev, ...parsedFeatures };
            console.log('📦 FeatureToggleContext - Setting features to (local):', newFeatures);
            return newFeatures;
          });
        } else {
          console.log('📦 FeatureToggleContext - No saved features, using defaults:', DEFAULT_FEATURES);
        }

        // Charger l'état admin (sans le mot de passe)
        const savedAdmin = localStorage.getItem(STORAGE_KEYS.ADMIN);
        console.log('👤 FeatureToggleContext - savedAdmin from localStorage:', savedAdmin);
        if (savedAdmin) {
          const parsedAdmin = JSON.parse(savedAdmin);
          console.log('👤 FeatureToggleContext - parsedAdmin:', parsedAdmin);
          setAdmin(prev => {
            const newAdmin = { 
              ...prev, 
              isAdmin: parsedAdmin.isAdmin || false 
            };
            console.log('👤 FeatureToggleContext - Setting admin to:', newAdmin);
            return newAdmin;
          });
        } else {
          console.log('👤 FeatureToggleContext - No saved admin, using defaults:', DEFAULT_ADMIN);
        }

        // Essayer de charger les fonctionnalités globales depuis l'API centrale
        try {
          const res = await fetch('/api/features', { cache: 'no-store' });
          if (res.ok) {
            const serverFeatures = await res.json();
            console.log('🌍 FeatureToggleContext - Synced features from API:', serverFeatures);
            setFeatures(prev => ({ ...prev, ...serverFeatures }));
            // Miroir localStorage pour garder la cohérence
            localStorage.setItem(STORAGE_KEYS.FEATURES, JSON.stringify(serverFeatures));
          } else {
            console.warn('🌍 FeatureToggleContext - API features GET failed, using localStorage/defaults');
          }
        } catch (err) {
          console.warn('🌍 FeatureToggleContext - Unable to load features from API, using localStorage/defaults');
        }
      } catch (error) {
        console.error('❌ FeatureToggleContext - Erreur lors du chargement des préférences:', error);
      }
    };

    init();
  }, []);

  // Sauvegarder les fonctionnalités dans le localStorage ET l'API centrale
  const saveFeatures = async (newFeatures: FeatureFlags) => {
    try {
      localStorage.setItem(STORAGE_KEYS.FEATURES, JSON.stringify(newFeatures));
      try {
        await fetch('/api/features', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newFeatures),
        });
        console.log('🌍 FeatureToggleContext - Features persisted to API:', newFeatures);
      } catch (err) {
        console.warn('🌍 FeatureToggleContext - API features POST failed, localStorage only');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des fonctionnalités:', error);
    }
  };

  // Sauvegarder l'état admin dans le localStorage
  const saveAdminState = (newAdmin: AdminState) => {
    try {
      // Ne sauvegarder que l'état isAdmin, pas le mot de passe
      localStorage.setItem(STORAGE_KEYS.ADMIN, JSON.stringify({ 
        isAdmin: newAdmin.isAdmin 
      }));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'état admin:', error);
    }
  };

  // Toggle d'une fonctionnalité
  const toggleFeature = (feature: keyof FeatureFlags) => {
    console.log('🔄 FeatureToggleContext - toggleFeature called for:', feature);
    console.log('🔄 FeatureToggleContext - Current admin state:', admin);
    console.log('🔄 FeatureToggleContext - Current features:', features);
    
    if (!admin.isAdmin) {
      console.warn('⚠️ FeatureToggleContext - Seuls les administrateurs peuvent modifier les fonctionnalités');
      return;
    }

    const newFeatures = {
      ...features,
      [feature]: !features[feature],
    };
    console.log('🔄 FeatureToggleContext - New features after toggle:', newFeatures);
    setFeatures(newFeatures);
    // Persister globalement
    saveFeatures(newFeatures);
  };

  // Définir l'état d'une fonctionnalité
  const setFeature = (feature: keyof FeatureFlags, enabled: boolean) => {
    if (!admin.isAdmin) {
      console.warn('Seuls les administrateurs peuvent modifier les fonctionnalités');
      return;
    }

    const newFeatures = {
      ...features,
      [feature]: enabled,
    };
    setFeatures(newFeatures);
    saveFeatures(newFeatures);
  };

  // Connexion admin
  const loginAdmin = (password: string): boolean => {
    if (password === admin.adminPassword) {
      const newAdmin = { ...admin, isAdmin: true };
      setAdmin(newAdmin);
      saveAdminState(newAdmin);
      // Définir un cookie pour le bypass middleware (1 semaine)
      try {
        document.cookie = 'manrina_admin=1; Path=/; Max-Age=604800; SameSite=Lax';
      } catch {}
      return true;
    }
    return false;
  };

  // Déconnexion admin
  const logoutAdmin = () => {
    const newAdmin = { ...admin, isAdmin: false };
    setAdmin(newAdmin);
    saveAdminState(newAdmin);
    // Supprimer le cookie de bypass
    try {
      document.cookie = 'manrina_admin=; Path=/; Max-Age=0; SameSite=Lax';
    } catch {}
  };

  // Vérifier si une fonctionnalité est activée
  const isFeatureEnabled = (feature: keyof FeatureFlags): boolean => {
    const result = features[feature];
    console.log(`🔍 FeatureToggleContext - isFeatureEnabled(${feature}):`, result);
    console.log('🔍 FeatureToggleContext - Current features state:', features);
    return result;
  };

  // Vérifier si l'utilisateur peut contourner les restrictions
  const canBypassRestrictions = (): boolean => {
    const result = admin.isAdmin;
    console.log('🔍 FeatureToggleContext - canBypassRestrictions():', result);
    console.log('🔍 FeatureToggleContext - Current admin state:', admin);
    return result;
  };

  const contextValue: FeatureToggleContextType = {
    features,
    admin,
    toggleFeature,
    setFeature,
    loginAdmin,
    logoutAdmin,
    isFeatureEnabled,
    canBypassRestrictions,
  };

  return (
    <FeatureToggleContext.Provider value={contextValue}>
      {children}
    </FeatureToggleContext.Provider>
  );
};

// Hook pour utiliser le contexte
export const useFeatureToggle = (): FeatureToggleContextType => {
  const context = useContext(FeatureToggleContext);
  if (!context) {
    throw new Error('useFeatureToggle doit être utilisé dans un FeatureToggleProvider');
  }
  return context;
};