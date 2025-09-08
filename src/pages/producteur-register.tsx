/* eslint-disable react/no-unescaped-entities */
import { useState } from 'react';
import { useRouter } from 'next/router';
import { GrowerRegisterForm } from '@/components/Form/GrowerRegisterForm';

type GlobalError = {
  type: 'network' | 'server' | 'validation' | 'conflict' | 'unknown';
  message: string;
  details?: string;
};

export default function ProducteurRegisterPage() {
  const [globalError, setGlobalError] = useState<GlobalError | null>(null);
  const router = useRouter();

  // Types pour la gestion d'erreurs
  type ApiError = {
    message: string;
    status?: number;
    name?: string;
  };

  type NetworkError = {
    name: 'TypeError' | 'NetworkError';
    message: string;
  };

  type ValidationError = {
    type: string;
    message: string;
    details: string;
  };

  type RegistrationError = ApiError | NetworkError | ValidationError | string | null;

  const handleRegistrationError = (error: RegistrationError) => {
    // Analyser le type d'erreur et fournir un feedback approprié
    if (!error) {
      setGlobalError(null);
      return;
    }

    let globalErrorData: GlobalError;

    // Gestion des erreurs d'objet avec type spécifique (ex: validation SIRET)
    if (error && typeof error === 'object' && 'type' in error && typeof error.type === 'string') {
      const validationError = error as ValidationError;
      if (validationError.type === 'siret_validation') {
        globalErrorData = {
          type: 'network',
          message: validationError.message,
          details: validationError.details + ' Si le problème persiste, vous pouvez continuer sans validation automatique.'
        };
      } else {
        globalErrorData = {
          type: 'validation',
          message: validationError.message,
          details: validationError.details
        };
      }
    } else if (typeof error === 'string') {
      // Erreur simple sous forme de chaîne
      if (error.includes('email') && error.includes('utilisé')) {
        globalErrorData = {
          type: 'conflict',
          message: 'Adresse email déjà utilisée',
          details: 'Cette adresse email est déjà associée à un compte existant. Essayez de vous connecter ou utilisez une autre adresse email.'
        };
      } else if (error.includes('SIRET') && error.includes('utilisé')) {
        globalErrorData = {
          type: 'conflict',
          message: 'Numéro SIRET déjà utilisé',
          details: 'Ce numéro SIRET est déjà associé à un autre compte producteur. Vérifiez votre saisie ou contactez le support si vous pensez qu\'il y a une erreur.'
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
      globalErrorData = {
        type: errorObj.status === 409 ? 'conflict' : 'validation',
        message: errorObj.status === 409 ? 'Données en conflit' : 'Données invalides',
        details: (errorObj.message || 'Veuillez vérifier les informations saisies.') + (errorObj.status === 409 ? ' Contactez le support si vous pensez qu\'il y a une erreur.' : ' Assurez-vous que tous les champs sont correctement remplis.')
      };
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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header avec logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Manrina</h1>
          <p className="text-gray-600">Candidature Producteur</p>
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

        {/* Formulaire d'inscription producteur */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <GrowerRegisterForm 
            onSwitchMode={() => router.push('/client-register')} 
            onError={handleRegistrationError}
          />
        </div>

        {/* Lien de connexion */}
        <div className="text-center">
          <p className="text-gray-600">
            Vous avez déjà un compte ?{' '}
            <button
              onClick={() => router.push('/login')}
              className="text-green-600 hover:text-green-700 font-medium transition-colors"
            >
              Se connecter
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}