import { useEffect, useState } from 'react';

type PasswordStrengthProps = {
    password?: string;
    showRequirements?: boolean;
};

type PasswordConfirmationProps = {
    password: string;
    confirmPassword: string;
    showValidation?: boolean;
};

type Strength = {
    level: 'none' | 'weak' | 'medium' | 'strong';
    label: string;
    color: string;
    percentage: number;
};

type PasswordRequirement = {
    id: string;
    label: string;
    test: (password: string) => boolean;
    met: boolean;
};

const STRENGTH_LEVELS: Record<string, Strength> = {
    none: { level: 'none', label: '', color: 'bg-gray-200', percentage: 0 },
    weak: { level: 'weak', label: 'Faible', color: 'bg-red-500', percentage: 25 },
    medium: { level: 'medium', label: 'Moyen', color: 'bg-yellow-500', percentage: 60 },
    strong: { level: 'strong', label: 'Fort', color: 'bg-green-500', percentage: 100 },
};

const PASSWORD_REQUIREMENTS = [
    {
        id: 'length',
        label: 'Au moins 8 caractères',
        test: (password: string) => password.length >= 8,
        met: false
    },
    {
        id: 'number',
        label: 'Au moins 1 chiffre',
        test: (password: string) => /\d/.test(password),
        met: false
    },
    {
        id: 'uppercase',
        label: 'Au moins 1 majuscule',
        test: (password: string) => /[A-Z]/.test(password),
        met: false
    },
    {
        id: 'symbol',
        label: 'Au moins 1 symbole (!@#$%^&*)',
        test: (password: string) => /[!@#$%^&*]/.test(password),
        met: false
    }
];

const checkPasswordStrength = (password: string): { strength: Strength; requirements: PasswordRequirement[] } => {
    if (!password) {
        return {
            strength: STRENGTH_LEVELS.none,
            requirements: PASSWORD_REQUIREMENTS.map(req => ({ ...req, met: false }))
        };
    }

    const requirements = PASSWORD_REQUIREMENTS.map(req => ({
        ...req,
        met: req.test(password)
    }));

    const metRequirements = requirements.filter(req => req.met).length;
    const hasLowerCase = /[a-z]/.test(password);
    const isLongEnough = password.length >= 12;

    let strength: Strength;
    
    // Toutes les exigences de base sont remplies
    if (metRequirements === 4) {
        // Bonus pour la longueur et la casse mixte
        if (isLongEnough && hasLowerCase) {
            strength = STRENGTH_LEVELS.strong;
        } else {
            strength = STRENGTH_LEVELS.medium;
        }
    } else if (metRequirements >= 2) {
        strength = STRENGTH_LEVELS.weak;
    } else {
        strength = STRENGTH_LEVELS.none;
    }

    return { strength, requirements };
};

export const PasswordStrength = ({ password, showRequirements = true }: PasswordStrengthProps) => {
    const [result, setResult] = useState<{ strength: Strength; requirements: PasswordRequirement[] }>({
        strength: STRENGTH_LEVELS.none,
        requirements: PASSWORD_REQUIREMENTS.map(req => ({ ...req, met: false }))
    });

    useEffect(() => {
        setResult(checkPasswordStrength(password || ''));
    }, [password]);

    if (!password) return null;

    const { strength, requirements } = result;

    return (
        <div className="mt-2 space-y-2">
            {/* Barre de progression */}
            <div className="space-y-1">
                <div className="flex h-2 overflow-hidden rounded-full bg-gray-200">
                    <div
                        style={{ width: `${strength.percentage}%` }}
                        className={`transition-all duration-500 ease-out ${strength.color}`}
                    />
                </div>
                {strength.label && (
                    <p className={`text-sm font-medium ${strength.color.replace('bg-', 'text-')}`}>
                        Mot de passe {strength.label.toLowerCase()}
                    </p>
                )}
            </div>

            {/* Liste des exigences */}
            {showRequirements && (
                <div className="space-y-1">
                    <p className="text-xs text-gray-600 font-medium">Exigences :</p>
                    <ul className="space-y-1">
                        {requirements.map((req) => (
                            <li key={req.id} className="flex items-center space-x-2 text-xs">
                                <span className={`w-4 h-4 rounded-full flex items-center justify-center ${
                                    req.met ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-500'
                                }`}>
                                    {req.met ? '✓' : '○'}
                                </span>
                                <span className={req.met ? 'text-green-700' : 'text-gray-600'}>
                                    {req.label}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

// Fonction utilitaire pour valider si un mot de passe respecte les exigences minimales
export const isPasswordValid = (password: string): boolean => {
    const { requirements } = checkPasswordStrength(password);
    return requirements.every(req => req.met);
};

// Composant pour la validation de confirmation de mot de passe
export const PasswordConfirmation = ({ password, confirmPassword, showValidation = true }: PasswordConfirmationProps) => {
    if (!showValidation || !confirmPassword) return null;

    const isMatching = password === confirmPassword;
    const isEmpty = confirmPassword.length === 0;

    if (isEmpty) return null;

    return (
        <div className="mt-1">
            <div className={`flex items-center space-x-2 text-xs ${
                isMatching ? 'text-green-700' : 'text-red-600'
            }`}>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    isMatching ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}>
                    {isMatching ? '✓' : '✗'}
                </span>
                <span>
                    {isMatching ? 'Les mots de passe correspondent' : 'Les mots de passe ne correspondent pas'}
                </span>
            </div>
        </div>
     );
 };
