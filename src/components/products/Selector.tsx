import { cn } from '@/lib/utils';
import { IProduct } from '@/server/product/IProduct';
import { FC, HTMLAttributes, useState, useMemo } from 'react';
import Select from 'react-select';

interface ProductSelectorProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onSelect'> {
    items: Array<IProduct>;
    onSelect?: (product: IProduct) => void;
    value?: IProduct | null;
    clearAfterSelect?: boolean;
}

export const ProductSelector: FC<ProductSelectorProps> = ({ 
    items, 
    onSelect, 
    className, 
    value = null,
    clearAfterSelect = true,
    ...rest 
}) => {
    const [selectedValue, setSelectedValue] = useState<{ label: string; value: IProduct } | null>(null);

    // Mémoriser les options pour éviter les re-renders
    const options = useMemo(() => 
        items.map((product) => ({ label: product.name, value: product })),
        [items]
    );

    // Déterminer la valeur actuelle
    const currentValue = useMemo(() => {
        if (value) {
            return { label: value.name, value };
        }
        return clearAfterSelect ? null : selectedValue;
    }, [value, selectedValue, clearAfterSelect]);

    const handleChange = (option: { label: string; value: IProduct } | null) => {
        if (option) {
            setSelectedValue(option);
            onSelect?.(option.value);
            
            // Réinitialiser la sélection après un délai si clearAfterSelect est true
            if (clearAfterSelect) {
                setTimeout(() => setSelectedValue(null), 100);
            }
        }
    };

    return (
        <div
            {...rest}
            className={cn('flex items-center', className)}
        >
            <Select
                onChange={handleChange}
                options={options}
                placeholder="Rechercher un produit dans le catalogue..."
                value={currentValue}
                isClearable
                isSearchable
                styles={{
                    container: (baseStyles) => ({ ...baseStyles, width: '100%' }),
                    menu: (baseStyles) => ({ ...baseStyles, width: '100%', zIndex: 9999 }),
                    control: (baseStyles) => ({ ...baseStyles, minHeight: '40px' }),
                }}
            />
        </div>
    );
};
