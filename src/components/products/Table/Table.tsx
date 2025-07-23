import { cn } from '@/lib/utils';
import { FC, HTMLAttributes } from 'react';

interface ProductTableProps extends HTMLAttributes<HTMLTableElement> {}

export const ProductTable: FC<ProductTableProps> = ({ children, className, ...rest }) => (
    <table
        {...rest}
        className={cn('w-full border-collapse', className)}
    >
        {children}
    </table>
);
