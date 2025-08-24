/* eslint-disable react/no-unescaped-entities */
import { useRouter } from 'next/router';
import { useState, FormEvent, FocusEvent, ChangeEvent } from 'react';
import Image from 'next/image';
import { backendFetchService } from '@/service/BackendFetchService';
import { ROUTES } from '@/router/routes';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { PasswordStrength, PasswordConfirmation, isPasswordValid } from '@/components/Form/PasswordStrength';

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

interface ClientRegisterFormProps {
    onSwitchMode?: () => void;
    onError?: (error: RegistrationError) => void;
}

type FormErrors = {
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    confirmPassword?: string;
};

type FormData = {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
};

export function ClientRegisterForm({ onSwitchMode, onError }: ClientRegisterFormProps) {
    const router = useRouter();

    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);

    const [errors, setErrors] = useState<FormErrors>({});
    const [apiError, setApiError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const validateField = (name: keyof FormData, value: string, currentFormData: FormData): string => {
        switch (name) {
            case 'name':
                return value.trim() ? '' : 'Le nom est requis.';
            case 'email':
                if (!value) return "L'email est requis.";
                if (!/\S+@\S+\.\S+/.test(value)) return "L'adresse email est invalide.";
                return '';
            case 'phone':
                return value.trim() ? '' : 'Le numéro de téléphone est requis.';
            case 'password':
                if (!value) return 'Le mot de passe est requis.';
                if (!isPasswordValid(value)) {
                    return 'Le mot de passe doit contenir au moins 8 caractères, 1 chiffre, 1 majuscule et 1 symbole (!@#$%^&*).';
                }
                return '';
            case 'confirmPassword':
                if (!value) return 'Veuillez confirmer le mot de passe.';
                if (value !== currentFormData.password) return 'Les mots de passe ne correspondent pas.';
                return '';
            default:
                return '';
        }
    };

    const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target as { name: keyof FormData; value: string };
        const error = validateField(name, value, formData);
        setErrors((prev) => ({ ...prev, [name]: error }));

        // Si on modifie le mot de passe, on re-valide la confirmation
        if (name === 'password' && formData.confirmPassword) {
            const confirmError = validateField('confirmPassword', formData.confirmPassword, formData);
            setErrors((prev) => ({ ...prev, confirmPassword: confirmError }));
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target as { name: keyof FormData; value: string };
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setApiError('');
        setSuccess('');

        const newErrors: FormErrors = {};
        let isValid = true;
        for (const key in formData) {
            const fieldName = key as keyof FormData;
            const error = validateField(fieldName, formData[fieldName], formData);
            if (error) {
                newErrors[fieldName] = error;
                isValid = false;
            }
        }
        setErrors(newErrors);

        if (!isValid) return;

        setLoading(true);
        // Réinitialiser les erreurs précédentes
        setApiError('');
        onError?.(null);
        
        try {
            // On ne garde que les champs nécessaires pour l'API, d'où l'avertissement sur la variable non utilisée.
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { confirmPassword, ...apiData } = formData;
            const response = await backendFetchService.createClientAccount(apiData);
            if (response.success) {
                setSuccess('Compte client créé avec succès !');
                onError?.(null); // Réinitialiser les erreurs globales en cas de succès
            } else {
                const errorMessage = response.message || 'Erreur lors de la création du compte.';
                setApiError(errorMessage);
                onError?.(errorMessage);
            }
        } catch (error: unknown) {
            let errorMessage = 'Une erreur inattendue est survenue.';
            let typedError: RegistrationError = null;
            
            // Analyser le type d'erreur pour un meilleur feedback
            if (error instanceof Error) {
                if (error.name === 'TypeError' || error.message?.includes('fetch')) {
                    errorMessage = 'Problème de connexion au serveur.';
                    typedError = {
                        name: error.name as 'TypeError' | 'NetworkError',
                        message: error.message
                    } as NetworkError;
                } else {
                    errorMessage = error.message;
                    typedError = {
                        message: error.message,
                        name: error.name
                    } as ApiError;
                }
            } else if (typeof error === 'string') {
                errorMessage = error;
                typedError = error;
            } else {
                typedError = errorMessage;
            }
            
            setApiError(errorMessage);
            onError?.(typedError);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="text-center space-y-4">
                <Text
                    variant="h2"
                    className="text-green-600"
                >
                    Inscription réussie !
                </Text>
                <Text
                    variant="body"
                    className="text-gray-700"
                >
                    {success} Vous pouvez maintenant vous connecter à votre compte.
                </Text>
                <Button
                    variant="primary"
                    onClick={() => router.push(ROUTES.CUSTOMER.LOGIN)}
                    className="w-full"
                >
                    Se connecter
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <Text
                    variant="h2"
                    className="text-gray-900 mb-2"
                >
                    Créer un compte client
                </Text>
                <Text
                    variant="body"
                    className="text-gray-600"
                >
                    Rejoignez Manrina pour commander vos produits locaux
                </Text>
            </div>

            <form
                onSubmit={handleSubmit}
                className="space-y-4"
                noValidate
            >
                {/* Champs existants... */}
                <div>
                    <label
                        htmlFor="name"
                        className="sr-only"
                    >
                        Nom complet
                    </label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Nom complet"
                        value={formData.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-4 py-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                        required
                    />
                    {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
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
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-4 py-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                        required
                    />
                    {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                </div>
                <div>
                    <label
                        htmlFor="phone"
                        className="sr-only"
                    >
                        Téléphone
                    </label>
                    <input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="Téléphone"
                        value={formData.phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-4 py-2 border rounded-md ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                        required
                    />
                    {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
                </div>

                {/* Champ Mot de passe */}
                <div className="space-y-2">
                    <div className="relative">
                        <label
                            htmlFor="password"
                            className="sr-only"
                        >
                            Mot de passe
                        </label>
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Mot de passe"
                            value={formData.password}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full px-4 py-2 border rounded-md ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 px-3 flex items-center"
                            aria-label={showPassword ? 'Cacher le mot de passe' : 'Afficher le mot de passe'}
                        >
                            <Image
                                src={showPassword ? '/icons/eye-off.svg' : '/icons/eye.svg'}
                                alt="Afficher/Cacher le mot de passe"
                                width={20}
                                height={20}
                            />
                        </button>
                    </div>
                    <PasswordStrength password={formData.password} />
                    {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
                </div>

                {/* Champ Confirmer le mot de passe */}
                <div className="space-y-2">
                    <label
                        htmlFor="confirmPassword"
                        className="sr-only"
                    >
                        Confirmer le mot de passe
                    </label>
                    <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Confirmer le mot de passe"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-4 py-2 border rounded-md ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                        required
                    />
                    <PasswordConfirmation 
                        password={formData.password} 
                        confirmPassword={formData.confirmPassword} 
                    />
                    {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>

                <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    disabled={loading}
                >
                    {loading ? 'Création en cours...' : 'Créer le compte client'}
                </Button>
            </form>

            {apiError && <div className="mt-4 text-center text-red-600">{apiError}</div>}

            {onSwitchMode && (
                <div className="text-center pt-4 border-t border-gray-200">
                    <Text
                        variant="body"
                        className="text-gray-600 mb-2"
                    >
                        Vous êtes un producteur ?
                    </Text>
                    <Button
                        variant="secondary"
                        onClick={onSwitchMode}
                        className="w-full"
                    >
                        S'inscrire comme producteur
                    </Button>
                </div>
            )}
        </div>
    );
}
