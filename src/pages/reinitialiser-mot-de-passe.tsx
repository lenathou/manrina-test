/* eslint-disable react/no-unescaped-entities */
import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { PasswordStrength, PasswordConfirmation, isPasswordValid } from '@/components/Form/PasswordStrength';

export default function ResetPasswordPage() {
    const router = useRouter();
    const { token, type } = router.query;

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (router.isReady && (!token || !type)) {
            setError(
                "Lien de réinitialisation invalide. Veuillez vérifier le lien ou refaire une demande.",
            );
        }
    }, [router.isReady, token, type]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }
        if (!isPasswordValid(password)) {
            setError('Le mot de passe doit contenir au moins 8 caractères, 1 chiffre, 1 majuscule et 1 symbole (!@#$%^&*).');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password, userType: type }),
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
                    Réinitialiser le mot de passe
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
                        <div className="space-y-2">
                            <label htmlFor="password">Nouveau mot de passe</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                placeholder="********"
                            />
                            <PasswordStrength password={password} />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                placeholder="********"
                            />
                            <PasswordConfirmation 
                                password={password} 
                                confirmPassword={confirmPassword} 
                            />
                        </div>

                        {error && <p className="text-red-600 text-center">{error}</p>}

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full"
                            disabled={loading || !token || !type}
                        >
                            {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
}
