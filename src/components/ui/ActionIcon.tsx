import { cn } from '@/lib/utils';
import { FC, HTMLAttributes } from 'react';

interface ActionIconProps extends HTMLAttributes<HTMLButtonElement> {
    label?: string;
}

export const ActionIcon: FC<ActionIconProps> = ({ className, children, label, ...rest }) => {
    return (
        <button
            {...rest}
            title={label}
            aria-label={label}
            className={cn('cursor-pointer', className)}
        >
            {children}
        </button>
    );
};
