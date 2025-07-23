import { cn } from '@/lib/utils';
import { FC, HTMLAttributes } from 'react';

interface ProductTableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {}

export const ProductTableHeader: FC<ProductTableHeaderProps> = ({ className, children, ...rest }) => (
    <thead
        {...rest}
        className={cn('bg-gray-50', className)}
    >
        {children}
    </thead>
);
