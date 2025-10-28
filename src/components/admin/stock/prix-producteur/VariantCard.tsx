import { ReactNode } from 'react';
import { IVariantPriceInfo } from '@/server/grower/GrowerPricingService';

interface VariantCardProps {
  variant: IVariantPriceInfo;
  isSelected: boolean;
  onSelect: () => void;
  children?: ReactNode;
}

export default function VariantCard({ variant, isSelected, onSelect, children }: VariantCardProps) {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect();
    }
  };

  return (
    <div 
      className={`border rounded-lg p-6 cursor-pointer transition-all ${
        isSelected 
          ? 'border-secondary bg-secondary/10 shadow-md' 
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }`} 
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Sélectionner la variante ${variant.variantOptionValue}`}
      aria-pressed={isSelected}
    >
      <div className="mb-4">
        <h3 className={`text-lg font-semibold ${
          isSelected ? 'text-blue-900' : 'text-gray-900'
        }`}>
          {variant.variantOptionValue}
        </h3>
        {variant.variantQuantity && variant.variantUnitSymbol && (
          <p className="text-gray-600 mt-1">
            {variant.variantQuantity} {variant.variantUnitSymbol}
          </p>
        )}
        {!!variant.lowestPrice && (
          <p className="text-green-600 mt-1 font-medium">
            Prix le plus bas: {variant.lowestPrice.toFixed(2)} €
          </p>
        )}
      </div>
      {children}
    </div>
  );
}