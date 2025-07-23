import React, { ElementType, FC, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

/**
 * Variant
 */
export type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'description' | 'body' | 'small';

/**
 * Props
 */
export interface TextProps extends HTMLAttributes<HTMLElement> {
    variant: TextVariant;
    tag?: ElementType;
}

/**
 * Different text tags.
 */
const tags: Record<TextVariant, ElementType> = {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h5',
    description: 'p',
    body: 'p',
    small: 'p',
};

/**
 * Different text sizes.
 */
const sizes: Record<TextVariant, string> = {
    h1: `font-secondary font-bold text-3xl sm:text-[1.95rem]`,
    h2: `font-secondary font-bold text-2xl sm:text-3xl`,
    h3: `font-secondary font-bold text-xl sm:text-2xl`,
    h4: `font-secondary font-bold text-lg sm:text-xl`,
    h5: `font-secondary font-bold text-base sm:text-lg`,
    description: 'text-base sm:text-lg',
    body: 'text-base',
    small: 'text-sm',
};

export const Text: FC<TextProps> = ({ variant, children, className, tag, ...rest }) => {
    const sizeClasses = sizes[variant];
    const Tag: ElementType = tag || tags[variant];

    return (
        <Tag
            {...rest}
            className={cn(sizeClasses, className)}
        >
            {children}
        </Tag>
    );
};
