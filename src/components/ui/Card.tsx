import { cn } from '@/lib/utils';
import { FC, HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'outlined' | 'elevated';
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}

export const Card: FC<CardProps> = ({
    variant = 'default',
    padding = 'md',
    className,
    children,
    ...rest
}) => {
    const paddingClasses = {
        none: '',
        sm: 'p-2',
        md: 'p-4',
        lg: 'p-6'
    };

    const variantClasses = {
        default: 'bg-white border border-gray-200',
        outlined: 'bg-transparent border-2 border-gray-300',
        elevated: 'bg-white shadow-lg border border-gray-100'
    };

    return (
        <div
            {...rest}
            className={cn(
                'rounded-lg',
                variantClasses[variant],
                paddingClasses[padding],
                className
            )}
        >
            {children}
        </div>
    );
};

export const CardHeader: FC<CardHeaderProps> = ({
    className,
    children,
    ...rest
}) => {
    return (
        <div
            {...rest}
            className={cn(
                'flex flex-col space-y-1.5 pb-4',
                className
            )}
        >
            {children}
        </div>
    );
};

export const CardContent: FC<CardContentProps> = ({
    className,
    children,
    ...rest
}) => {
    return (
        <div
            {...rest}
            className={cn('pt-0', className)}
        >
            {children}
        </div>
    );
};

export const CardFooter: FC<CardFooterProps> = ({
    className,
    children,
    ...rest
}) => {
    return (
        <div
            {...rest}
            className={cn(
                'flex items-center pt-4',
                className
            )}
        >
            {children}
        </div>
    );
};

export const CardTitle: FC<HTMLAttributes<HTMLHeadingElement>> = ({
    className,
    children,
    ...rest
}) => {
    return (
        <h3
            {...rest}
            className={cn(
                'text-lg font-semibold leading-none tracking-tight',
                className
            )}
        >
            {children}
        </h3>
    );
};

export const CardDescription: FC<HTMLAttributes<HTMLParagraphElement>> = ({
    className,
    children,
    ...rest
}) => {
    return (
        <p
            {...rest}
            className={cn(
                'text-sm text-gray-600',
                className
            )}
        >
            {children}
        </p>
    );
};