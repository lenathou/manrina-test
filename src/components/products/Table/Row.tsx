import { cn } from '@/lib/utils';
import { FC, HTMLAttributes } from 'react';

export interface ProductTableRowProps extends HTMLAttributes<HTMLTableRowElement> {}

export const ProductTableRow: FC<ProductTableRowProps> = ({ children, className, ...rest }) => (
    <tr
        {...rest}
        className={cn("border-b border-gray-100 hover:bg-gray-50 transition-colors", className)}
    >
        {children}
    </tr>
);
