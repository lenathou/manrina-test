import { cn } from '@/lib/utils';
import { FC, ButtonHTMLAttributes } from 'react';

// On utilise ButtonHTMLAttributes qui inclut par défaut tous les attributs standards d'un bouton,
// y compris `type` et `disabled`.
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
}

export const Button: FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    disabled = false,
    className,
    children,
    ...rest
}) => {
    const sizeClasses = {
        sm: 'px-2 py-1 text-sm',
        md: 'px-4 py-2',
        lg: 'px-6 py-3 text-lg'
    };

    const variantClasses = {
        primary: 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] hover:shadow-lg active:scale-95 focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-50',
        secondary: 'bg-[var(--color-secondary)] text-white hover:bg-[#0a4f4e] hover:shadow-lg active:scale-95 focus:ring-2 focus:ring-[var(--color-secondary)] focus:ring-opacity-50',
        danger: 'bg-[var(--color-danger)] text-white hover:bg-[#d63031] hover:shadow-lg active:scale-95 focus:ring-2 focus:ring-[var(--color-danger)] focus:ring-opacity-50',
        outline: 'border-2 border-[var(--color-primary)] bg-transparent text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white hover:shadow-md active:scale-95 focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-30',
        ghost: 'bg-transparent text-[var(--foreground)] hover:bg-[var(--muted)] hover:text-[var(--color-primary)] active:scale-95 focus:ring-2 focus:ring-[var(--muted)] focus:ring-opacity-50'
    };

    return (
        <button
            {...rest}
            className={cn(
                'rounded-md font-[600] transition-all duration-200 ease-in-out transform',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none',
                'focus:outline-none focus:ring-offset-2',
                variantClasses[variant],
                sizeClasses[size],
                className,
            )}
            disabled={disabled}
            aria-disabled={disabled ? 'true' : 'false'}
        >
            {children}
        </button>
    );
};
