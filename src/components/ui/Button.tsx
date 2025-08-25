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

    return (
        <button
            {...rest}
            // Le `type` est maintenant passé via `...rest`
            style={{ opacity: disabled ? 0.5 : 1 }}
            className={cn(
                { 
                    'bg-primary text-white': variant === 'primary', 
                    'bg-secondary text-white': variant === 'secondary',
                    'bg-red-500 hover:bg-red-600 text-white': variant === 'danger',
                    'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50': variant === 'outline',
                    'bg-transparent text-gray-700 hover:bg-gray-100': variant === 'ghost'
                },
                sizeClasses[size],
                'rounded-md cursor-pointer disabled:cursor-not-allowed inter font-[600]',
                className,
            )}
            disabled={disabled}
            aria-disabled={disabled ? 'true' : 'false'}
        >
            {children}
        </button>
    );
};
