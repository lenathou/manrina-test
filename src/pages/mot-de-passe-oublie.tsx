/* eslint-disable react/no-unescaped-entities */
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [userType, setUserType] = useState<'customer' | 'grower'>('customer');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const response = await fetch('/api/auth/request-password-reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, userType }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message);
            } else {
                setError(data.message || 'An error occurred.');
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 bg-white p-8 rounded shadow">
                <Text
                    variant="h2"
                    className="text-center text-gray-900"
                >
                    Mot de passe oublié
                </Text>

                {message ? (
                    <div className="text-center">
                        <p className="text-green-600">{message}</p>
                        <Button
                            variant="primary"
                            onClick={() => router.push('/login')}
                            className="mt-4 w-full"
                        >
                            Retour à la connexion
                        </Button>
                    </div>
                ) : (
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >
                        <p className="text-center text-gray-600">
                            Saisissez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de
                            passe.
                        </p>
                        
                        {/* Sélecteur de type d'utilisateur */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Type de compte
                            </label>
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                <button
                                    type="button"
                                    onClick={() => setUserType('customer')}
                                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                                        userType === 'customer'
                                            ? 'bg-white text-green-600 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-800'
                                    }`}
                                >
                                    Client
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setUserType('grower')}
                                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                                        userType === 'grower'
                                            ? 'bg-white text-green-600 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-800'
                                    }`}
                                >
                                    Producteur
                                </button>
                            </div>
                        </div>
                        
                        <div>
                            <label
                                htmlFor="email"
                                className="sr-only"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                placeholder="votre.email@exemple.com"
                            />
                        </div>

                        {error && <p className="text-red-600 text-center">{error}</p>}

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
                        </Button>
                        
                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => router.push('/login')}
                                className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
                            >
                                Retour à la connexion
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
