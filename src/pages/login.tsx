/* eslint-disable react/no-unescaped-entities */
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ClientLoginForm } from '@/components/Form/ClientLoginForm';
import { GrowerLoginForm } from '@/components/Form/GrowerLoginForm';
import { backendFetchService } from '@/service/BackendFetchService';
import { ROUTES } from '@/router/routes';

type LoginMode = 'client' | 'grower';

type GlobalError = {
  type: 'network' | 'server' | 'validation' | 'conflict' | 'unknown';
  message: string;
  details?: string;
};

type ApiError = {
  message: string;
  status?: number;
  name?: string;
};

type NetworkError = {
  name: 'TypeError' | 'NetworkError';
  message: string;
};

type LoginError = ApiError | NetworkError | string | null;

export default function LoginPage() {
  const [mode, setMode] = useState<LoginMode>('client');
  const [globalError, setGlobalError] = useState<GlobalError | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        if (mode === 'client') {
          const isValid = await backendFetchService.verifyCustomerToken();
          if (isValid) {
            router.replace(ROUTES.PRODUITS);
          }
        } else {
          const isValid = await backendFetchService.verifyGrowerToken();
          if (isValid) {
            router.replace(ROUTES.GROWER.STOCKS);
          }
        }
      } catch {
        // Not authenticated, stay on login page
      }
    };
    checkAuthStatus();
  }, [router, mode]);

  const handleModeSwitch = (newMode: LoginMode) => {
    setMode(newMode);
    // Réinitialiser l'erreur globale lors du changement de mode
    setGlobalError(null);
  };

  const handleLoginError = (error: LoginError) => {
    // Analyser le type d'erreur et fournir un feedback approprié
    if (!error) {
      setGlobalError(null);
      return;
    }

    let globalErrorData: GlobalError;

    if (typeof error === 'string') {
      // Erreur simple sous forme de chaîne
      if (error.includes('email') || error.includes('mot de passe') || error.includes('password')) {
        globalErrorData = {
          type: 'validation',
          message: 'Identifiants incorrects',
          details: 'Vérifiez votre adresse email et votre mot de passe, puis réessayez.'
        };
      } else if (error.includes('réseau') || error.includes('connexion') || error.includes('serveur')) {
        globalErrorData = {
          type: 'network',
          message: 'Problème de connexion',
          details: 'Vérifiez votre connexion internet et réessayez. Si le problème persiste, attendez quelques minutes avant de réessayer.'
        };
      } else {
        globalErrorData = {
          type: 'unknown',
          message: 'Erreur inattendue',
          details: error + ' Si cette erreur persiste, contactez le support technique.'
        };
      }
    } else if (error && typeof error === 'object' && 'name' in error && (error.name === 'TypeError' || error.name === 'NetworkError')) {
      // Erreur réseau
      globalErrorData = {
        type: 'network',
        message: 'Problème de connexion',
        details: 'Impossible de contacter le serveur. Vérifiez votre connexion internet et réessayez dans quelques instants.'
      };
    } else if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' && error.message.includes('fetch')) {
      // Erreur réseau (fetch)
      globalErrorData = {
        type: 'network',
        message: 'Problème de connexion',
        details: 'Impossible de contacter le serveur. Vérifiez votre connexion internet et réessayez dans quelques instants.'
      };
    } else if (error && typeof error === 'object' && 'status' in error && typeof error.status === 'number' && error.status >= 400 && error.status < 500) {
      // Erreur client (validation, conflit, etc.)
      const errorObj = error as ApiError;
      if (errorObj.status === 401 || errorObj.status === 403) {
        globalErrorData = {
          type: 'validation',
          message: 'Identifiants incorrects',
          details: 'Vérifiez votre adresse email et votre mot de passe, puis réessayez.'
        };
      } else {
        globalErrorData = {
          type: 'validation',
          message: 'Données invalides',
          details: (errorObj.message || 'Veuillez vérifier les informations saisies.') + ' Assurez-vous que tous les champs sont correctement remplis.'
        };
      }
    } else if (error && typeof error === 'object' && 'status' in error && typeof error.status === 'number' && error.status >= 500) {
      // Erreur serveur
      globalErrorData = {
        type: 'server',
        message: 'Erreur du serveur',
        details: 'Un problème technique est survenu côté serveur. Veuillez réessayer dans quelques instants. Si le problème persiste, contactez le support.'
      };
    } else {
      // Erreur inconnue
      const errorMessage = (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') 
        ? error.message 
        : 'Une erreur inattendue est survenue.';
      globalErrorData = {
        type: 'unknown',
        message: 'Erreur inattendue',
        details: errorMessage + ' Veuillez réessayer ou contactez le support si le problème persiste.'
      };
    }

    setGlobalError(globalErrorData);
  };

  const getErrorIcon = (type: GlobalError['type']) => {
    switch (type) {
      case 'network':
        return '🌐';
      case 'server':
        return '⚠️';
      case 'validation':
        return '📝';
      case 'conflict':
        return '⚡';
      default:
        return '❌';
    }
  };

  const getErrorColor = (type: GlobalError['type']) => {
    switch (type) {
      case 'network':
        return 'border-blue-500 bg-blue-50 text-blue-800';
      case 'server':
        return 'border-orange-500 bg-orange-50 text-orange-800';
      case 'validation':
        return 'border-yellow-500 bg-yellow-50 text-yellow-800';
      case 'conflict':
        return 'border-purple-500 bg-purple-50 text-purple-800';
      default:
        return 'border-red-500 bg-red-50 text-red-800';
    }
  };

  return (
    <div className="min-h-screen flex mt-10 justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header avec logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Manrina</h1>
          <p className="text-gray-600">Connectez-vous à votre compte</p>
        </div>

        {/* Affichage de l'erreur globale */}
        {globalError && (
          <div className={`mb-6 p-4 rounded-lg border-2 ${getErrorColor(globalError.type)} transition-all duration-300`}>
            <div className="flex items-start space-x-3">
              <span className="text-2xl flex-shrink-0 mt-0.5">{getErrorIcon(globalError.type)}</span>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">{globalError.message}</h3>
                {globalError.details && (
                  <p className="text-sm opacity-90 leading-relaxed">{globalError.details}</p>
                )}
                <button
                  onClick={() => setGlobalError(null)}
                  className="mt-3 text-sm underline hover:no-underline transition-all duration-200 opacity-75 hover:opacity-100"
                >
                  Fermer ce message
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sélecteur de mode */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => handleModeSwitch('client')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                mode === 'client'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Client
            </button>
            <button
              onClick={() => handleModeSwitch('grower')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                mode === 'grower'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Producteur
            </button>
          </div>

          {/* Formulaires dynamiques */}
          <div className="transition-all duration-300 ease-in-out">
            {mode === 'client' ? (
              <ClientLoginForm 
                onError={handleLoginError}
              />
            ) : (
              <GrowerLoginForm 
                onError={handleLoginError}
              />
            )}
          </div>
        </div>

        {/* Lien vers l'inscription */}
        <div className="text-center">
          <p className="text-gray-600">
            Vous n'avez pas encore de compte ?{' '}
            <button
              onClick={() => router.push('/register')}
              className="text-green-600 hover:text-green-700 font-medium transition-colors"
            >
              S'inscrire
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}