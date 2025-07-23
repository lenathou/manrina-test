import { cn } from '@/lib/utils';
import { FC, HTMLAttributes } from 'react';

interface ProductTableHeaderRowProps extends HTMLAttributes<HTMLTableRowElement> {}

export const ProductTableHeaderRow: FC<ProductTableHeaderRowProps> = ({ className, children, ...rest }) => (
    <tr
        {...rest}
        className={cn('border-b border-gray-200', className)}
    >
        {children}
    </tr>
);
