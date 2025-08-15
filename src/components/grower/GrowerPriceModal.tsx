import { useState } from 'react';
import { IProduct, IProductVariant } from '@/server/product/IProduct';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { createPortal } from 'react-dom';

interface GrowerPriceModalProps {
    product: IProduct;
    isOpen: boolean;
    onClose: () => void;
    onSave: (variantPrices: Record<string, number>) => void;
    currentPrices?: Record<string, number>;
    isLoading?: boolean;
}

export function GrowerPriceModal({ 
    product, 
    isOpen, 
    onClose, 
    onSave, 
    currentPrices = {},
    isLoading = false
}: GrowerPriceModalProps) {
    const [variantPrices, setVariantPrices] = useState<Record<string, string>>(() => {
        const initialPrices: Record<string, string> = {};
        product.variants?.forEach(variant => {
            initialPrices[variant.id] = (currentPrices[variant.id] || 0).toString();
        });
        return initialPrices;
    });
    
    const handlePriceChange = (variantId: string, value: string) => {
        setVariantPrices(prev => ({
            ...prev,
            [variantId]: value
        }));
    };
    
    const handleSave = () => {
        const numericPrices: Record<string, number> = {};
        let isValid = true;
        
        Object.entries(variantPrices).forEach(([variantId, priceStr]) => {
            const numValue = parseFloat(priceStr);
            if (isNaN(numValue) || numValue < 0) {
                isValid = false;
                return;
            }
            numericPrices[variantId] = numValue;
        });
        
        if (isValid) {
            onSave(numericPrices);
            onClose();
        }
    };
    
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            onClose();
        }
    };
    
    const isFormValid = () => {
        return Object.values(variantPrices).every(price => {
            const numValue = parseFloat(price);
            return !isNaN(numValue) && numValue >= 0;
        });
    };
    
    if (!isOpen) return null;
    
    const modalContent = (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4 max-h-[80vh] overflow-y-auto">
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Définir les prix des variants
                    </h3>
                    <Text className="text-sm text-gray-600" variant={'small'}>
                        {product.name}
                    </Text>
                </div>
                
                <div className="mb-6 space-y-4">
                    {product.variants?.map((variant: IProductVariant) => (
                        <div key={variant.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="mb-2">
                                <Text className="text-sm font-medium text-gray-700" variant={'small'}>
                                    {variant.optionValue || `Variant ${variant.id.slice(0, 8)}`}
                                </Text>
                                {variant.quantity && variant.unitId && (
                                    <Text className="text-xs text-gray-500" variant={'small'}>
                                        {variant.quantity} unité(s)
                                    </Text>
                                )}
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="number"
                                    value={variantPrices[variant.id] || ''}
                                    onChange={(e) => handlePriceChange(variant.id, e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tertiary focus:border-transparent"
                                    placeholder="Prix"
                                    min="0"
                                    step="0.01"
                                    disabled={isLoading}
                                />
                                <span className="text-sm text-gray-500">€</span>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="flex justify-end space-x-3">
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Annuler
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isLoading || !isFormValid()}
                    >
                        {isLoading ? 'Enregistrement...' : 'Enregistrer'}
                    </Button>
                </div>
            </div>
        </div>
    );
    
    return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}