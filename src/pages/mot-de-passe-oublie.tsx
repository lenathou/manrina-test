/* eslint-disable react/no-unescaped-entities */
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';

interface EmailCheckResult {
    exists: boolean;
    accounts: Array<{
        type: 'customer' | 'grower';
        name: string;
    }>;
    hasMultiple: boolean;
}

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailCheckResult, setEmailCheckResult] = useState<EmailCheckResult | null>(null);
    const [step, setStep] = useState<'email' | 'account-selection' | 'success'>('email');
    const router = useRouter();

    const handleEmailCheck = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/check-email-exists', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setEmailCheckResult(data);
                if (!data.exists) {
                    setError("Aucun compte n'est associé à cette adresse email.");
                } else if (data.hasMultiple) {
                    setStep('account-selection');
                } else {
                    // Un seul compte trouvé, procéder directement
                    await sendPasswordReset(data.accounts[0].type);
                }
            } else {
                setError(data.message || 'Une erreur est survenue.');
            }
        } catch (error) {
            console.error("Erreur lors de la vérification de l'email:", error);
            setError('Une erreur inattendue est survenue. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    const sendPasswordReset = async (accountType: 'customer' | 'grower') => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/request-password-reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, userType: accountType }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(
                    `Un lien de réinitialisation a été envoyé à ${email} pour votre compte ${accountType === 'customer' ? 'client' : 'producteur'}.`,
                );
                setStep('success');
            } else {
                setError(data.message || 'Une erreur est survenue.');
            }
        } catch (error) {
            console.error("Erreur lors de l'envoi de la réinitialisation:", error);
            setError('Une erreur inattendue est survenue. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    const handleAccountSelection = async (accountType: 'customer' | 'grower') => {
        await sendPasswordReset(accountType);
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

                {step === 'success' ? (
                    <div className="text-center">
                        <div className="mb-4">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                                <svg
                                    className="h-6 w-6 text-green-600"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                        </div>
                        <p className="text-green-600 mb-4">{message}</p>
                        <p className="text-sm text-gray-600 mb-6">
                            Vérifiez votre boîte de réception et suivez les instructions dans l'email.
                        </p>
                        <Button
                            variant="primary"
                            onClick={() => router.push('/login')}
                            className="w-full"
                        >
                            Retour à la connexion
                        </Button>
                    </div>
                ) : step === 'account-selection' ? (
                    <div className="space-y-6">
                        <div className="text-center">
                            <p className="text-gray-900 font-medium mb-2">Plusieurs comptes trouvés</p>
                            <p className="text-sm text-gray-600">
                                Nous avons trouvé plusieurs comptes associés à <strong>{email}</strong>. Choisissez le
                                type de compte pour lequel vous souhaitez réinitialiser le mot de passe :
                            </p>
                        </div>

                        <div className="space-y-3">
                            {emailCheckResult?.accounts.map((account, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleAccountSelection(account.type)}
                                    disabled={loading}
                                    className="w-full p-4 border border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-200 text-left disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                Compte {account.type === 'customer' ? 'Client' : 'Producteur'}
                                            </p>
                                            <p className="text-sm text-gray-600">{account.name}</p>
                                        </div>
                                        <svg
                                            className="h-5 w-5 text-gray-400"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 5l7 7-7 7"
                                            />
                                        </svg>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {error && <p className="text-red-600 text-center text-sm">{error}</p>}

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => {
                                    setStep('email');
                                    setEmailCheckResult(null);
                                    setError('');
                                }}
                                className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
                            >
                                ← Changer d'adresse email
                            </button>
                        </div>
                    </div>
                ) : (
                    <form
                        onSubmit={handleEmailCheck}
                        className="space-y-6"
                    >
                        <p className="text-center text-gray-600">
                            Saisissez votre adresse email pour vérifier vos comptes et recevoir un lien de
                            réinitialisation.
                        </p>

                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Adresse email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                                placeholder="votre.email@exemple.com"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-md p-3">
                                <p className="text-red-600 text-sm">{error}</p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? 'Vérification en cours...' : "Vérifier l'adresse email"}
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
