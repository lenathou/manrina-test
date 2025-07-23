import { FC, HTMLAttributes } from 'react';

interface ProductTableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {}

export const ProductTableBody: FC<ProductTableBodyProps> = ({ className, children, ...rest }) => (
    <tbody {...rest}>{children}</tbody>
);
