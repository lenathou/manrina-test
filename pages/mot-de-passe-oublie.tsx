/* eslint-disable react/no-unescaped-entities */
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
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
                body: JSON.stringify({ email }),
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
                            onClick={() => router.push('/')}
                            className="mt-4 w-full"
                        >
                            Retour à l'accueil
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
                    </form>
                )}
            </div>
        </div>
    );
}
