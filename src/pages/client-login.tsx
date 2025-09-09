/* eslint-disable react/no-unescaped-entities */
import { useState } from 'react';
import { ClientLoginForm } from '@/components/Form/ClientLoginForm';
import Link from 'next/link';

type GlobalError = {
  type: 'network' | 'server' | 'validation' | 'conflict' | 'unknown';
  message: string;
  details?: string;
};

export default function ClientLoginPage() {
  const [globalError, setGlobalError] = useState<GlobalError | null>(null);

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

  type LoginError = ApiError | NetworkError | string | null;

  const handleLoginError = (error: LoginError) => {
    // Analyser le type d'erreur et fournir un feedback approprié
    if (!error) {
      setGlobalError(null);
      return;
    }

    let globalErrorData: GlobalError;

    if (typeof error === 'string') {
      // Erreur simple sous forme de chaîne
      if (error.includes('email') || error.includes('mot de passe')) {
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
      globalErrorData = {
        type: errorObj.status === 401 ? 'validation' : 'unknown',
        message: errorObj.status === 401 ? 'Identifiants incorrects' : 'Erreur de connexion',
        details: errorObj.message || 'Une erreur est survenue lors de la connexion.'
      };
    } else {
      // Erreur générique
      globalErrorData = {
        type: 'unknown',
        message: 'Erreur inattendue',
        details: 'Une erreur inattendue est survenue. Veuillez réessayer ou contacter le support si le problème persiste.'
      };
    }

    setGlobalError(globalErrorData);
  };

  const getErrorIcon = (type: GlobalError['type']) => {
    switch (type) {
      case 'network':
        return (
          <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'validation':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'server':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="p-6 border-b bg-tertiary/60 border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-800 text-center">
            Connexion Client
          </h1>
          <p className="text-gray-600 mt-2 text-center">
            Connectez-vous à votre compte client
          </p>
        </div>

        {/* Global Error Display */}
        {globalError && (
          <div className="p-4 border-b border-gray-200">
            <div className={`p-4 rounded-lg ${
              globalError.type === 'network' ? 'bg-orange-50 border border-orange-200' :
              globalError.type === 'validation' ? 'bg-red-50 border border-red-200' :
              globalError.type === 'conflict' ? 'bg-yellow-50 border border-yellow-200' :
              'bg-gray-50 border border-gray-200'
            }`}>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getErrorIcon(globalError.type)}
                </div>
                <div className="flex-1">
                  <h3 className={`text-sm font-medium ${
                    globalError.type === 'network' ? 'text-orange-800' :
                    globalError.type === 'validation' ? 'text-red-800' :
                    globalError.type === 'conflict' ? 'text-yellow-800' :
                    'text-gray-800'
                  }`}>
                    {globalError.message}
                  </h3>
                  {globalError.details && (
                    <p className={`mt-1 text-sm ${
                      globalError.type === 'network' ? 'text-orange-700' :
                      globalError.type === 'validation' ? 'text-red-700' :
                      globalError.type === 'conflict' ? 'text-yellow-700' :
                      'text-gray-700'
                    }`}>
                      {globalError.details}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="p-6">
          <ClientLoginForm onError={handleLoginError} />
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Pas encore de compte client ?{' '}
              <Link href="/client-register" className="text-primary hover:text-primary-dark font-medium">
                Créer un compte
              </Link>
            </p>
            <p className="text-sm text-gray-600">
              <Link href="/login" className="text-gray-500 hover:text-gray-700">
                ← Retour au choix du type de compte
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}