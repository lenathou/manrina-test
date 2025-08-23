import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Form } from '@/components/Form/Form';
import { ROUTES } from '@/router/routes';
import { backendFetchService } from '@/service/BackendFetchService';

type ErrorType = 'network' | 'credentials' | 'server' | 'validation' | 'unknown';

interface ErrorState {
  message: string;
  type: ErrorType;
  details?: string;
}

export default function AdminLogin() {
    const router = useRouter();
    const [error, setError] = useState<ErrorState | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const isValid = await backendFetchService.verifyAdminToken();
                if (isValid) {
                    router.replace(ROUTES.ADMIN.DASHBOARD);
                }
            } catch {
                // Not authenticated, stay on login page
                console.log('Non authentifié, reste sur la page de connexion');
            }
        };

        checkAuthStatus();
    }, [router]);

    const getErrorMessage = (error: unknown): ErrorState => {
        if (error instanceof Error) {
            // Erreur réseau
            if (error.message.includes('fetch') || error.message.includes('network')) {
                return {
                    type: 'network',
                    message: 'Problème de connexion réseau',
                    details: 'Vérifiez votre connexion internet et réessayez.'
                };
            }
            
            // Erreur de validation
            if (error.message.includes('validation') || error.message.includes('required')) {
                return {
                    type: 'validation',
                    message: 'Données invalides',
                    details: 'Veuillez vérifier vos informations de connexion.'
                };
            }
            
            return {
                type: 'unknown',
                message: 'Erreur inattendue',
                details: error.message
            };
        }
        
        return {
            type: 'unknown',
            message: 'Une erreur inconnue s\'est produite',
            details: 'Veuillez réessayer plus tard.'
        };
    };

    const handleSubmit = async (data: { username: string; password: string }) => {
        setError(null);
        setIsLoading(true);

        try {
            // Validation côté client
            if (!data.username?.trim() || !data.password?.trim()) {
                setError({
                    type: 'validation',
                    message: 'Champs requis manquants',
                    details: 'Veuillez remplir tous les champs.'
                });
                setIsLoading(false);
                return;
            }

            const response = await backendFetchService.adminLogin(data);

            if (response.success) {
                // Réinitialiser le compteur de tentatives en cas de succès
                setRetryCount(0);
                // Redirection vers le dashboard admin
                router.push(ROUTES.ADMIN.DASHBOARD);
            } else {
                // Incrémenter le compteur de tentatives
                setRetryCount(prev => prev + 1);
                
                // Gestion des erreurs spécifiques du serveur
                if (response.message?.includes('Invalid credentials') || response.message?.includes('Unauthorized')) {
                    setError({
                        type: 'credentials',
                        message: 'Identifiants incorrects',
                        details: retryCount >= 2 ? 'Trop de tentatives échouées. Contactez l\'administrateur si le problème persiste.' : 'Vérifiez votre nom d\'utilisateur et mot de passe.'
                    });
                } else if (response.message?.includes('Server error') || response.message?.includes('500')) {
                    setError({
                        type: 'server',
                        message: 'Erreur du serveur',
                        details: 'Le serveur rencontre des difficultés. Réessayez dans quelques instants.'
                    });
                } else {
                    setError({
                        type: 'unknown',
                        message: 'Échec de la connexion',
                        details: response.message || 'Une erreur inattendue s\'est produite.'
                    });
                }
            }
        } catch (err) {
            setRetryCount(prev => prev + 1);
            setError(getErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    const handleRetry = () => {
        setError(null);
        setRetryCount(0);
    };

    const getErrorIcon = (type: ErrorType): string => {
        switch (type) {
            case 'network': return '🌐';
            case 'credentials': return '🔐';
            case 'server': return '⚠️';
            case 'validation': return '📝';
            default: return '❌';
        }
    };

    const getErrorColorClass = (type: ErrorType): string => {
        switch (type) {
            case 'network': return 'border-blue-500 text-blue-600';
            case 'credentials': return 'border-red-500 text-red-600';
            case 'server': return 'border-yellow-500 text-yellow-600';
            case 'validation': return 'border-purple-500 text-purple-600';
            default: return 'border-red-500 text-red-600';
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-8">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg relative">
                {/* Bouton retour */}
                <button 
                    onClick={() => router.push(ROUTES.PRODUITS)}
                    className="absolute top-8 left-8 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <svg
                        viewBox="0 0 21 14"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-3"
                    >
                        <path
                            d="M21 6.58824C21 6.03922 21 6.03922 21 5.76471C20.4 5.76471 19.5 5.76471 18.6 5.76471C17.7 5.76471 17.1 5.76471 16.2 5.76471C15.3 5.76471 14.7 5.76471 13.8 5.76471C12.9 5.76471 12.3 5.76471 11.7 5.76471C11.4 5.76471 10.8 5.76471 10.5 5.4902C10.2 5.21569 9.6 5.4902 9.3 5.4902C9 5.4902 9 5.4902 8.7 5.76471C8.4 5.76471 8.4 5.76471 8.1 5.76471C7.8 5.76471 7.5 5.76471 7.2 5.76471C6.9 5.76471 6.6 5.76471 6.3 5.76471H6C6.3 5.76471 6.3 5.4902 6.6 5.4902C7.2 5.4902 7.5 5.21569 7.8 4.94118C7.8 4.94118 7.8 4.94118 8.1 4.94118C8.1 4.94118 8.1 4.94118 8.4 4.94118C8.4 4.94118 8.4 4.94118 8.7 4.94118C8.7 4.94118 8.7 4.94118 9 4.94118C9 4.66667 9 4.66667 9.3 4.66667C9.6 4.66667 9.6 4.66667 9.6 4.66667L9.9 4.39216C10.2 4.39216 10.2 4.11765 10.2 4.11765C10.2 4.11765 10.5 3.84314 10.8 3.84314C11.1 3.84314 11.1 3.84314 11.1 3.56863C11.1 3.29412 11.1 3.01961 11.1 2.7451C11.1 2.47059 11.1 1.92157 11.1 1.64706C11.1 1.37255 11.1 1.09804 11.4 0.823529C11.4 0.54902 11.4 0.27451 11.1 0C10.2 0 10.2 0 9.9 0C9.6 0 9.6 0.27451 9.3 0.27451C9.3 0.54902 9 0.54902 9 0.823529C8.7 0.823529 8.7 1.09804 8.4 1.09804V1.37255V1.64706V1.92157C8.4 1.92157 8.4 2.19608 8.1 2.19608C8.1 2.19608 8.1 2.19608 7.8 2.19608V1.92157V1.64706C7.8 1.64706 7.8 1.64706 7.8 1.37255C7.8 1.37255 7.8 1.64706 7.8 1.92157C7.8 2.19608 7.8 2.19608 7.5 2.47059V2.19608C7.5 1.92157 7.5 1.92157 7.5 1.92157C7.2 1.92157 6.6 2.19608 6.6 2.19608C6.3 1.92157 6 2.19608 5.7 2.47059C5.1 2.19608 4.8 2.47059 4.2 2.7451C3.6 3.01961 3 3.56863 2.4 3.84314H2.1H1.8C1.8 3.84314 1.5 3.84314 1.5 4.11765L1.2 4.39216C0.9 4.39216 0.6 4.66667 0.6 4.94118C0.3 5.21569 0 5.4902 0 5.76471C0 6.03922 0 6.58824 0 6.86275C0 7.41177 0 7.68627 0 8.23529C0 8.5098 0.3 8.78431 0.3 8.78431C0.3 9.05882 0.6 9.05882 0.9 9.33333C0.9 9.33333 0.9 9.33333 1.2 9.33333H1.5C1.5 9.33333 1.5 9.33333 1.8 9.33333C1.8 9.33333 1.8 9.33333 1.8 9.60784L2.1 9.33333H2.4C2.4 9.60784 2.7 9.60784 2.7 9.88235H3C3 9.88235 3 9.88235 3.3 9.88235C3.9 10.7059 4.8 11.2549 6 11.5294C6 12.0784 6.6 12.3529 6.9 12.6275C7.2 12.902 7.8 13.1765 8.4 13.451C8.4 13.7255 8.4 13.7255 8.4 13.7255C8.4 13.7255 8.4 13.7255 8.4 14C8.7 14 8.7 14 9 14C9 14 9.3 14 9.6 14C9.6 13.7255 9.6 13.451 9.6 12.902C9.6 12.6275 9.6 12.0784 9.6 11.8039C9.6 11.5294 9.6 10.9804 9.6 10.7059C9.6 10.4314 9.6 9.88235 9.3 9.60784C9 9.60784 8.1 9.33333 7.5 9.05882C7.2 8.78431 6.6 8.5098 6.3 8.23529C6.9 8.23529 7.5 8.23529 8.1 8.23529C9 8.5098 9.6 8.23529 10.5 8.23529C11.4 8.23529 12 8.23529 12.6 8.23529C12.6 8.23529 12.6 8.23529 12.9 8.23529C12.9 8.23529 12.9 8.23529 13.2 8.23529C13.5 8.23529 14.1 8.23529 14.4 8.23529C14.7 8.23529 15.3 8.23529 15.6 8.23529C15.9 8.23529 16.2 8.23529 16.5 8.23529C16.8 8.23529 17.1 8.23529 17.4 8.23529C17.7 8.23529 18.3 8.23529 18.6 8.23529C18.9 8.23529 19.5 8.23529 19.8 8.23529C20.1 8.23529 20.1 8.23529 20.4 8.23529C20.7 8.23529 20.7 8.23529 21 8.23529C21 8.23529 21 8.23529 21 7.68627C21 7.41176 21 7.13726 20.7 6.86275C21 7.13726 21 6.86275 21 6.58824ZM9.3 1.37255C9.3 1.37255 9.3 1.64706 9.3 1.37255C9.6 1.64706 9.9 1.64706 9.9 1.64706V1.92157C9.9 1.92157 9.9 1.92157 9.9 2.19608C9.9 2.19608 9.6 2.19608 9.6 1.92157C9.6 1.92157 9.6 1.92157 9.3 1.92157C9 1.64706 9.3 1.37255 9.3 1.37255ZM1.2 6.58824C1.2 6.31373 1.2 6.31373 1.2 6.58824C1.2 6.31373 1.2 6.31373 1.2 6.58824ZM2.1 7.96078V8.23529V7.96078ZM6.6 6.58824C6.3 6.86275 6.3 6.86275 6.6 6.58824C6 6.58824 6 6.58824 6 6.58824C6 6.58824 6 6.86275 5.7 6.58824C5.7 6.58824 5.7 6.58824 5.7 6.31373C5.7 6.31373 5.7 6.31373 5.7 6.03922C6 6.58824 6 6.58824 6.6 6.58824C6.3 6.31373 6.6 6.31373 6.6 6.58824ZM18.3 7.13725C18 7.13725 17.7 7.13725 17.4 7.13725C17.1 7.13725 16.8 7.13725 16.2 7.13725C15.9 7.13725 15.6 7.13725 15.3 7.13725C15.9 7.13725 16.5 6.86274 17.1 7.13725C17.7 7.41176 18.3 7.13725 18.9 7.13725C18.9 7.13725 18.6 7.13725 18.3 7.13725Z"
                            fill="#073E3D"
                        />
                    </svg>
                </button>
                
                <h1 className="text-3xl font-bold text-center mb-8 mt-12 text-gray-800">Admin Login</h1>
                
                {/* Affichage des erreurs */}
                {error && (
                    <div className={`mb-6 p-4 border rounded-lg bg-gray-50 ${getErrorColorClass(error.type)}`}>
                        <div className="flex items-center mb-2">
                            <span className="text-xl mr-2">{getErrorIcon(error.type)}</span>
                            <h3 className="font-bold flex-1">
                                {error.message}
                            </h3>
                        </div>
                        {error.details && (
                            <p className="text-sm text-gray-600 mb-2 leading-relaxed">{error.details}</p>
                        )}
                        {retryCount >= 2 && (
                            <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                                <span className="text-sm text-gray-500">
                                    Tentatives échouées: {retryCount}
                                </span>
                                <button 
                                    onClick={handleRetry}
                                    className="text-sm text-blue-600 font-bold underline hover:text-blue-800 transition-colors"
                                >
                                    Réinitialiser
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <Form
                    formFields={[
                        {
                            type: 'text',
                            placeholder: 'Nom d\'utilisateur',
                            name: 'username',
                            required: true,
                        },
                        {
                            type: 'password',
                            placeholder: 'Mot de passe',
                            name: 'password',
                            required: true,
                        },
                    ]}
                    onSubmit={handleSubmit}
                    submitLabel={isLoading ? 'Connexion...' : 'Se connecter'}
                    isDisabled={isLoading}
                />

                {/* Indicateur de chargement */}
                {isLoading && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg text-center">
                        <p className="text-blue-600">🔄 Connexion en cours...</p>
                    </div>
                )}
            </div>
        </div>
    );
}
