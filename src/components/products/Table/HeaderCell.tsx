import { cn } from '@/lib/utils';
import { FC, HTMLAttributes } from 'react';

interface ProductTableHeaderCellProps extends HTMLAttributes<HTMLTableCellElement> {}

export const ProductTableHeaderCell: FC<ProductTableHeaderCellProps> = ({ children, className, ...rest }) => (
    <th
        {...rest}
        className={cn('text-left py-3 px-4 font-semibold text-gray-700', className)}
    >
        {children}
    </th>
);
