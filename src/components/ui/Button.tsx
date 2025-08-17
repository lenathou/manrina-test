import { cn } from '@/lib/utils';
import { FC, ButtonHTMLAttributes } from 'react';

// On utilise ButtonHTMLAttributes qui inclut par défaut tous les attributs standards d'un bouton,
// y compris `type` et `disabled`.
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
}

export const Button: FC<ButtonProps> = ({
    variant = 'primary',
    disabled = false,
    className,
    children,
    ...rest
}) => {
    return (
        <button
            {...rest}
            // Le `type` est maintenant passé via `...rest`
            style={{ opacity: disabled ? 0.5 : 1 }}
            className={cn(
                { 
                    'bg-primary': variant === 'primary', 
                    'bg-secondary': variant === 'secondary',
                    'bg-red-500 hover:bg-red-600': variant === 'danger'
                },
                'px-4 py-2 rounded-md text-white cursor-pointer disabled:cursor-not-allowed inter font-[600]',
                className,
            )}
            disabled={disabled}
            aria-disabled={disabled ? 'true' : 'false'}
        >
            {children}
        </button>
    );
};
