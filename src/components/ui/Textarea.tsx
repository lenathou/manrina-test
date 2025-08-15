import { cn } from '@/lib/utils';
import {  TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    variant?: 'default' | 'outlined' | 'filled';
    error?: boolean;
    helperText?: string;
    label?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>((
    {
        variant = 'default',
        error = false,
        helperText,
        label,
        className,
        ...rest
    },
    ref
) => {
    const variantClasses = {
        default: 'border border-gray-300 bg-white focus:border-primary focus:ring-1 focus:ring-primary',
        outlined: 'border-2 border-gray-300 bg-transparent focus:border-primary',
        filled: 'border-0 bg-gray-100 focus:bg-white focus:ring-2 focus:ring-primary'
    };

    const errorClasses = error
        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
        : '';

    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}
            <textarea
                ref={ref}
                {...rest}
                className={cn(
                    'w-full px-3 py-2 rounded-md text-sm placeholder-gray-400',
                    'transition-colors duration-200 ease-in-out',
                    'resize-vertical min-h-[80px]',
                    'focus:outline-none focus:ring-offset-0',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    variantClasses[variant],
                    error && errorClasses,
                    className
                )}
            />
            {helperText && (
                <p className={cn(
                    'mt-1 text-xs',
                    error ? 'text-red-500' : 'text-gray-500'
                )}>
                    {helperText}
                </p>
            )}
        </div>
    );
});

Textarea.displayName = 'Textarea';