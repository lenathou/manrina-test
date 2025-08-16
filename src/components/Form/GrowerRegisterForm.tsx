/* eslint-disable react/no-unescaped-entities */
import { useRouter } from 'next/router';
import { useState, FormEvent, FocusEvent, ChangeEvent, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { backendFetchService } from '@/service/BackendFetchService';
import { ROUTES } from '@/router/routes';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';

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

interface GrowerRegisterFormProps {
    onSwitchMode?: () => void;
    onError?: (error: RegistrationError) => void;
}

type FormErrors = {
    siret?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
};

type FormData = {
    siret: string;
    email: string;
    password: string;
    confirmPassword: string;
};

type SiretValidationState = {
    isValidating: boolean;
    isValid: boolean | null;
    companyName?: string;
    message?: string;
};

export function GrowerRegisterForm({ onSwitchMode, onError }: GrowerRegisterFormProps) {
    const router = useRouter();

    const [formData, setFormData] = useState<FormData>({
        siret: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [apiError, setApiError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [siretValidation, setSiretValidation] = useState<SiretValidationState>({
        isValidating: false,
        isValid: null,
    });

    const validateSiret = useCallback(async (siret: string) => {
        setSiretValidation({ isValidating: true, isValid: null });
        try {
            const response = await fetch('/api/validate-siret', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ siret }),
            });
            const result = await response.json();
            setSiretValidation({
                isValidating: false,
                isValid: result.success,
                companyName: result.companyName,
                message: result.message,
            });
        } catch {
            const errorMessage = 'Erreur lors de la validation du SIRET';
            setSiretValidation({
                isValidating: false,
                isValid: false,
                message: errorMessage,
            });
            // Signaler l'erreur de validation SIRET au parent
            const validationError: ValidationError = {
                type: 'siret_validation',
                message: errorMessage,
                details: 'Impossible de vérifier le numéro SIRET. Vérifiez votre connexion internet et réessayez.'
            };
            onError?.(validationError);
        }
    }, [onError]);

    // Effect to validate SIRET when it reaches 14 digits
    useEffect(() => {
        const siret = formData.siret.replace(/\D/g, '');
        if (siret.length === 14) {
            validateSiret(siret);
        } else {
            setSiretValidation({ isValidating: false, isValid: null });
        }
    }, [formData.siret, validateSiret]);

    

    const validateField = (name: keyof FormData, value: string, currentFormData: FormData): string => {
        switch (name) {
            case 'siret':
                if (!value) return 'Le numéro SIRET est requis.';
                if (value.replace(/\D/g, '').length !== 14) return 'Le SIRET doit contenir 14 chiffres.';
                return '';
            case 'email':
                if (!value) return "L'email est requis.";
                if (!/\S+@\S+\.\S+/.test(value)) return "L'adresse email est invalide.";
                return '';
            case 'password':
                if (!value) return 'Le mot de passe est requis.';
                if (value.length < 8) return 'Le mot de passe doit contenir au moins 8 caractères.';
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
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target as { name: keyof FormData; value: string };
        // For SIRET, only allow digits
        const finalValue = name === 'siret' ? value.replace(/\D/g, '') : value;
        setFormData((prev) => ({ ...prev, [name]: finalValue }));
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

        if (!siretValidation.isValid || !siretValidation.companyName) {
            setErrors((prev) => ({ ...prev, siret: 'Veuillez utiliser un SIRET valide.' }));
            isValid = false;
        }

        if (!isValid) return;

        setLoading(true);
        // Réinitialiser les erreurs précédentes
        setApiError('');
        onError?.(null);
        
        try {
            const response = await backendFetchService.createGrowerAccount({
                name: siretValidation.companyName!,
                email: formData.email,
                password: formData.password,
                siret: formData.siret,
            });
            if (response.success) {
                setSuccess('Compte producteur créé avec succès !');
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
                    {success} Vous pouvez maintenant vous connecter.
                </Text>
                <Button
                    variant="primary"
                    onClick={() => router.push(ROUTES.GROWER.LOGIN)}
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
                    Créer un compte producteur
                </Text>
                <Text
                    variant="body"
                    className="text-gray-600"
                >
                    Rejoignez notre réseau de producteurs locaux
                </Text>
            </div>

            <form
                onSubmit={handleSubmit}
                className="space-y-4"
                noValidate
            >
                <div>
                    <label
                        htmlFor="siret"
                        className="sr-only"
                    >
                        Numéro SIRET
                    </label>
                    <input
                        id="siret"
                        name="siret"
                        type="text"
                        placeholder="Numéro SIRET (14 chiffres)"
                        value={formData.siret}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        maxLength={14}
                        className={`w-full px-4 py-2 border rounded-md ${errors.siret ? 'border-red-500' : 'border-gray-300'}`}
                        required
                    />
                    {errors.siret && <p className="text-red-600 text-sm mt-1">{errors.siret}</p>}
                    {siretValidation.isValidating && (
                        <p className="text-blue-600 text-sm mt-1">Vérification du SIRET...</p>
                    )}
                    {siretValidation.isValid === true && siretValidation.companyName && (
                        <p className="text-green-600 text-sm mt-1">
                            Entreprise validée : {siretValidation.companyName}
                        </p>
                    )}
                    {siretValidation.isValid === false && siretValidation.message && (
                        <p className="text-red-600 text-sm mt-1">{siretValidation.message}</p>
                    )}
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
                        placeholder="Email professionnel"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-4 py-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                        required
                    />
                    {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                </div>

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
                        placeholder="Mot de passe (8 caractères min.)"
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
                {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}

                <div>
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
                    {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>

                <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    disabled={loading || siretValidation.isValidating || !siretValidation.isValid}
                >
                    {loading ? 'Création en cours...' : 'Créer le compte producteur'}
                </Button>
            </form>

            {apiError && <div className="mt-4 text-center text-red-600">{apiError}</div>}

            {onSwitchMode && (
                <div className="text-center pt-4 border-t border-gray-200">
                    <Text
                        variant="body"
                        className="text-gray-600 mb-2"
                    >
                        Vous n'êtes pas un producteur ?
                    </Text>
                    <Button
                        variant="secondary"
                        onClick={onSwitchMode}
                        className="w-full"
                    >
                        S'inscrire comme client
                    </Button>
                </div>
            )}
        </div>
    );
}
