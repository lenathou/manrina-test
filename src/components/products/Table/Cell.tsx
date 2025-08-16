import { cn } from '@/lib/utils';
import { FC, HTMLAttributes } from 'react';

interface ProductTableCellProps extends HTMLAttributes<HTMLTableCellElement> {}

export const ProductTableCell: FC<ProductTableCellProps> = ({ children, className, ...rest }) => (
    <td
        {...rest}
        className={cn('py-4 px-4', className)}
    >
        {children}
    </td>
);
