import { useEffect, useState } from 'react';

type PasswordStrengthProps = {
    password?: string;
};

type Strength = {
    level: 'none' | 'weak' | 'medium' | 'strong';
    label: string;
    color: string;
};

const STRENGTH_LEVELS: Record<string, Strength> = {
    none: { level: 'none', label: '', color: 'bg-gray-200' },
    weak: { level: 'weak', label: 'Faible', color: 'bg-red-500' },
    medium: { level: 'medium', label: 'Moyen', color: 'bg-yellow-500' },
    strong: { level: 'strong', label: 'Fort', color: 'bg-green-500' },
};

const checkPasswordStrength = (password: string): Strength => {
    if (!password) return STRENGTH_LEVELS.none;

    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (hasNumber) score++;
    if (hasSpecialChar) score++;
    if (hasUpperCase && hasLowerCase) score++;

    if (score >= 4) return STRENGTH_LEVELS.strong;
    if (score >= 2) return STRENGTH_LEVELS.medium;
    return STRENGTH_LEVELS.weak;
};

export const PasswordStrength = ({ password }: PasswordStrengthProps) => {
    const [strength, setStrength] = useState<Strength>(STRENGTH_LEVELS.none);

    useEffect(() => {
        setStrength(checkPasswordStrength(password || ''));
    }, [password]);

    if (!password) return null;

    return (
        <div className="mt-2">
            <div className="flex h-2 overflow-hidden rounded text-xs">
                <div
                    style={{ width: strength.level === 'strong' ? '100%' : strength.level === 'medium' ? '66%' : '33%' }}
                    className={`flex flex-col justify-center whitespace-nowrap text-white shadow-none transition-all duration-500 ${strength.color}`}
                />
            </div>
            <p className={`mt-1 text-sm ${strength.color.replace('bg-', 'text-')}`}>
                {strength.label}
            </p>
        </div>
    );
};
