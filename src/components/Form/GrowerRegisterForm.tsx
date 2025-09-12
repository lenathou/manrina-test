/* eslint-disable react/no-unescaped-entities */
import { useRouter } from 'next/router';
import { useState, FormEvent, FocusEvent, ChangeEvent, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { backendFetchService } from '@/service/BackendFetchService';
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
                if (!isPasswordValid(value)) {
                    return 'Le mot de passe doit contenir au moins 8 caractères.';
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
                    Candidature envoyée !
                </Text>
                <Text
                    variant="body"
                    className="text-gray-700"
                >
                    Votre candidature a été soumise avec succès. Notre équipe va l'examiner et vous recevrez une confirmation par email une fois votre profil approuvé.
                </Text>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <Text variant="body" className="text-yellow-800 text-sm">
                            En attente d'approbation - Vous ne pouvez pas encore vous connecter
                        </Text>
                    </div>
                </div>
                <Button
                    variant="secondary"
                    onClick={() => router.push('/')}
                    className="w-full"
                >
                    Retour à l'accueil
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="text-center space-y-3">
                <Text
                    variant="h2"
                    className="text-gray-900 mb-2"
                >
                    Candidature producteur
                </Text>
                <Text
                    variant="body"
                    className="text-gray-600"
                >
                    Rejoignez notre réseau de producteurs locaux
                </Text>
                
                {/* Information sur le processus d'approbation */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-medium text-blue-900 mb-1">
                                Processus d'approbation
                            </h4>
                            <p className="text-sm text-blue-700">
                                Votre candidature sera examinée par notre équipe. Vous recevrez une confirmation par email une fois votre profil approuvé.
                            </p>
                        </div>
                    </div>
                </div>
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
                    disabled={loading || siretValidation.isValidating || !siretValidation.isValid}
                >
                    {loading ? 'Envoi en cours...' : 'Soumettre ma candidature'}
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
