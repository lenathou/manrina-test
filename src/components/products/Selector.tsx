import { cn } from '@/lib/utils';
import { IProduct } from '@/server/product/IProduct';
import { FC, HTMLAttributes, useState, useMemo } from 'react';
import Select from 'react-select';
import Image from 'next/image';

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
            className={cn('flex items-center min-w-[200px] w-full max-w-[368px] mx-auto my-0', className)}
        >
            <Select
                onChange={handleChange}
                options={options}
                placeholder="Rechercher un produit dans le catalogue..."
                value={currentValue}
                isClearable
                isSearchable
                components={{
                    DropdownIndicator: () => (
                        <div className="px-2">
                            <Image
                                src="/icon-search.svg"
                                alt="search icon"
                                width={24}
                                height={24}
                                className="flex-shrink-0"
                            />
                        </div>
                    ),
                }}
                styles={{
                    container: (baseStyles) => ({ 
                        ...baseStyles, 
                        width: '100%' 
                    }),
                    control: (baseStyles, state) => ({
                        ...baseStyles,
                        minHeight: 'auto',
                        height: 'auto',
                        border: '1px solid #A0A6A7',
                        borderRadius: '8px',
                        backgroundColor: 'white',
                        padding: '8px 12px',
                        boxShadow: 'none',
                        '&:hover': {
                            border: '1px solid #A0A6A7',
                        },
                        ...(state.isFocused && {
                            border: '1px solid #A0A6A7',
                            boxShadow: 'none',
                        }),
                    }),
                    valueContainer: (baseStyles) => ({
                        ...baseStyles,
                        padding: '0',
                        minHeight: '24px',
                    }),
                    input: (baseStyles) => ({
                        ...baseStyles,
                        margin: '0',
                        padding: '0',
                        color: '#042424',
                    }),
                    placeholder: (baseStyles) => ({
                        ...baseStyles,
                        color: '#A0A6A7',
                        margin: '0',
                    }),
                    singleValue: (baseStyles) => ({
                        ...baseStyles,
                        color: '#042424',
                        margin: '0',
                    }),
                    indicatorSeparator: () => ({
                        display: 'none',
                    }),
                    clearIndicator: (baseStyles) => ({
                        ...baseStyles,
                        padding: '0 4px',
                        color: '#A0A6A7',
                        '&:hover': {
                            color: '#042424',
                        },
                    }),
                    menu: (baseStyles) => ({ 
                        ...baseStyles, 
                        width: '100%', 
                        zIndex: 9999,
                        border: '1px solid #A0A6A7',
                        borderRadius: '8px',
                        marginTop: '4px',
                    }),
                    option: (baseStyles, state) => ({
                        ...baseStyles,
                        backgroundColor: state.isSelected 
                            ? '#f3f4f6' 
                            : state.isFocused 
                                ? '#f9fafb' 
                                : 'white',
                        color: '#042424',
                        padding: '12px 16px',
                        '&:hover': {
                            backgroundColor: '#f9fafb',
                        },
                    }),
                }}
            />
        </div>
    );
};
