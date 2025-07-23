import { cn } from '@/lib/utils';
import { FC, HTMLAttributes } from 'react';

interface ButtonProps extends HTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary';
    disabled?: boolean;
}

export const Button: FC<ButtonProps> = ({
    variant = 'primary',
    disabled = false,
    className,
    children,
    ...rest
}: ButtonProps) => {
    return (
        <button
            {...rest}
            style={{ opacity: disabled ? 0.5 : 1 }}
            className={cn(
                { 'bg-primary': variant === 'primary', 'bg-secondary': variant === 'secondary' },
                'px-4 py-2 rounded-md text-white cursor-pointer disabled:cursor-not-allowed',
                className,
            )}
            disabled={disabled}
            aria-disabled={disabled ? 'true' : 'false'}
        >
            {children}
        </button>
    );
};
