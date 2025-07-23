import { cn } from '@/lib/utils';
import { IProduct } from '@/server/product/IProduct';
import { FC, HTMLAttributes, useState } from 'react';
import Select from 'react-select';

interface ProductSelectorProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onSelect'> {
    items: Array<IProduct>;
    onSelect?: (product: IProduct) => void;
}

export const ProductSelector: FC<ProductSelectorProps> = ({ items, onSelect, className, ...rest }) => {
    const handleChange = (option: { label: string; value: IProduct } | null) => {
        if (option) onSelect?.(option.value);
    };

    return (
        <div
            {...rest}
            className={cn('flex items-center', className)}
        >
            <Select
                onChange={handleChange}
                options={items.map((product) => ({ label: product.name, value: product }))}
                placeholder="Rechercher un produit dans le catalogue..."
                value={null}
                styles={{
                    container: (baseStyles) => ({ ...baseStyles, width: 'max-content' }),
                    menu: (baseStyles) => ({ ...baseStyles, width: 'max-content' }),
                }}
            />
        </div>
    );
};
