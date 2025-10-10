import { IProduct, IProductVariant, IUnit } from '@/server/product/IProduct';
import { useState } from 'react';

interface VariantSelectorProps {
    product: IProduct;
    selectedVariantId: string;
    onVariantSelect: (variantId: string) => void;
    units: IUnit[];
    disabled?: boolean;
}

// Fonction utilitaire pour l'affichage du variant
function getDisplayVariantValue(variant: IProductVariant, units: IUnit[]) {
    if (variant.quantity && variant.unitId) {
        const unit = units.find((u) => u.id === variant.unitId);
        return `${variant.quantity} ${unit?.symbol || 'unité'}`;
    }
    return variant.optionValue;
}

export function VariantSelector({
    product,
    selectedVariantId,
    onVariantSelect,
    units,
    disabled = false,
}: VariantSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const selectedVariant = product.variants.find((v) => v.id === selectedVariantId) || product.variants[0];

    if (product.variants.length <= 1) {
        return <span className="text-sm text-gray-700">{getDisplayVariantValue(selectedVariant, units)}</span>;
    }

    return (
        <div className="relative">
            <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">{getDisplayVariantValue(selectedVariant, units)}</span>
                <div className="text-xs text-gray-400">+ {product.variants.length - 1} autre(s)</div>
                <button
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    disabled={disabled}
                    className={`p-1 rounded-lg transition-all duration-200 transform ${
                        disabled
                            ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                            : 'bg-gray-100 hover:bg-gray-200 active:bg-gray-300 active:scale-95'
                    }`}
                    aria-label="Afficher/masquer les variants"
                >
                    <svg
                        className={`w-4 h-4 transition-all duration-300 ease-in-out ${isOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                </button>
            </div>

            {isOpen && !disabled && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48">
                    {product.variants.map((variant) => (
                        <button
                            key={variant.id}
                            onClick={() => {
                                onVariantSelect(variant.id);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                                variant.id === selectedVariantId ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                            }`}
                        >
                            <div className="font-medium">{getDisplayVariantValue(variant, units)}</div>
                            <div className="text-xs text-gray-500">{variant.price}€</div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
