import React, { useState } from 'react';
import { IProductVariant, IUnit } from '@/server/product/IProduct';

// Fonction utilitaire pour l'affichage du variant
function getDisplayVariantValue(variant: IProductVariant, units: IUnit[]) {
    if (variant.quantity && variant.unitId) {
        const unit = units.find((u) => u.id === variant.unitId);
        return `${variant.quantity} ${unit?.symbol || 'unité'}`;
    }
    return variant.optionValue;
}

interface VariantSwitcherProps {
    variants: IProductVariant[];
    units: IUnit[];
    showVariantName?: boolean;
    showPrice?: boolean;
    renderCustom?: (variant: IProductVariant) => React.ReactNode;
}

export const VariantSwitcher: React.FC<VariantSwitcherProps> = ({
    variants,
    units,
    showVariantName = false,
    showPrice = false,
    renderCustom,
}) => {
    const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
    const selectedVariant = variants[selectedVariantIndex];

    if (!selectedVariant) return null;

    const hasMultipleVariants = variants.length > 1;

    const renderContent = () => {
        if (renderCustom) {
            return renderCustom(selectedVariant);
        }

        if (showPrice) {
            return <span className="font-medium text-gray-900">{selectedVariant.price}€</span>;
        }

        if (showVariantName) {
            return <span className="text-sm text-gray-700">{getDisplayVariantValue(selectedVariant, units)}</span>;
        }

        return null;
    };

    if (!hasMultipleVariants) {
        return <div>{renderContent()}</div>;
    }

    return (
        <div className="relative">
            <div className="flex items-center space-x-2">
                {renderContent()}
                <div className="relative">
                    <select
                        value={selectedVariantIndex}
                        onChange={(e) => setSelectedVariantIndex(parseInt(e.target.value))}
                        className="text-xs bg-gray-100 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                        {variants.map((variant, index) => (
                            <option
                                key={variant.id}
                                value={index}
                            >
                                {getDisplayVariantValue(variant, units)} - {variant.price}€
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};
