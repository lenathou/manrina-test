import React from 'react';
import { ProductSelector } from '@/components/products/Selector';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { IProduct } from '@/server/product/IProduct';
import { MarketSessionWithProducts } from '@/types/market';

// Composant Info simple sans dépendance externe
const InfoIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
);

type FormState = {
    selectedProduct: IProduct | null;
    variantId: string;
    unitId: string;
    price: string;
    quantity: string;
    errors: {
        activeSession?: string;
        product?: string;
        variantId?: string;
        unitId?: string;
        price?: string;
        quantity?: string;
    };
};

type Unit = {
    id: string;
    name: string;
    symbol: string;
};

interface AddProductFormProps {
    activeSession: MarketSessionWithProducts | null;
    availableProducts: IProduct[];
    formState: FormState;
    units: Unit[];
    isSubmitting: boolean;
    handleFormFieldChange: (field: string, value: string | IProduct | null) => void;
    onAddProduct: () => void;
    onCancel: () => void;
}

export function AddProductForm({
    activeSession,
    availableProducts,
    formState,
    units,
    isSubmitting,
    handleFormFieldChange,
    onAddProduct,
    onCancel
}: AddProductFormProps) {
    return (
        <Card className="mb-4 sm:mb-6">
            <div className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Ajouter un produit au stand</h3>
                <div className="space-y-4">
                    {!activeSession && (
                        <div className="p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                            <p className="text-yellow-800 text-xs sm:text-sm">
                                ℹ️ Aucune session de marché active. Vous pouvez composer votre liste de produits librement.
                            </p>
                        </div>
                    )}
                    
                    <div className="space-y-3 sm:space-y-4">
                        <div>
                            <Label className="text-xs sm:text-sm">Produit</Label>
                            <ProductSelector
                                items={availableProducts}
                                value={formState.selectedProduct}
                                onSelect={(product) => handleFormFieldChange('selectedProduct', product)}
                                clearAfterSelect={false}
                                className="mt-1"
                            />
                            {formState.errors.product && (
                                <p className="text-red-500 text-xs sm:text-sm mt-1">{formState.errors.product}</p>
                            )}
                        </div>
                        
                        {formState.selectedProduct && formState.selectedProduct.variants.length > 0 && (
                            <div>
                                <Label htmlFor="variantId" className="text-xs sm:text-sm">Variante (optionnel pour le marché)</Label>
                                <Select value={formState.variantId} onValueChange={(value) => handleFormFieldChange('variantId', value)}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Sélectionner une variante (optionnel)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Aucune variante spécifique</SelectItem>
                                        {formState.selectedProduct.variants.map((variant) => (
                                            <SelectItem key={variant.id} value={variant.id}>
                                                {variant.optionValue}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-gray-500 mt-1">
                                    Pour le marché, vous pouvez choisir librement vos variants ou ne pas en spécifier
                                </p>
                            </div>
                        )}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                        <div>
                            <Label htmlFor="unitId" className="flex items-center gap-2 text-xs sm:text-sm">
                                Unité
                                <span title="Choisissez l'unité de mesure pour ce produit" className="cursor-help">
                                     <InfoIcon className="w-3 h-3 text-gray-400" />
                                 </span>
                            </Label>
                            <Select value={formState.unitId} onValueChange={(value) => handleFormFieldChange('unitId', value)}>
                                <SelectTrigger className="text-sm">
                                    <SelectValue placeholder="Sélectionner une unité" />
                                </SelectTrigger>
                                <SelectContent>
                                    {units.map((unit) => (
                                        <SelectItem key={unit.id} value={unit.id}>
                                            {unit.name} ({unit.symbol})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {formState.errors.unitId && (
                                <p className="text-red-500 text-xs sm:text-sm mt-1">{formState.errors.unitId}</p>
                            )}
                        </div>
                        
                        <div>
                            <Label htmlFor="price" className="flex items-center gap-2 text-xs sm:text-sm">
                                Prix (€)
                                <span title="Prix de vente par unité (ex: 2.50€ par kg)" className="cursor-help">
                                     <InfoIcon className="w-3 h-3 text-gray-400" />
                                 </span>
                            </Label>
                            <Input
                                id="price"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formState.price}
                                onChange={(e) => handleFormFieldChange('price', e.target.value)}
                                placeholder="0.00"
                                className="text-sm"
                            />
                            {formState.errors.price && (
                                <p className="text-red-500 text-xs sm:text-sm mt-1">{formState.errors.price}</p>
                            )}
                        </div>
                        
                        <div>
                            <Label htmlFor="quantity" className="flex items-center gap-2 text-xs sm:text-sm">
                                Quantité
                                <span title="Quantité disponible à la vente" className="cursor-help">
                                     <InfoIcon className="w-3 h-3 text-gray-400" />
                                 </span>
                            </Label>
                            <Input
                                id="quantity"
                                type="number"
                                step="0.001"
                                min="0"
                                value={formState.quantity}
                                onChange={(e) => handleFormFieldChange('quantity', e.target.value)}
                                placeholder="1"
                                className="text-sm"
                            />
                            {formState.errors.quantity && (
                                <p className="text-red-500 text-xs sm:text-sm mt-1">{formState.errors.quantity}</p>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Button 
                            onClick={onAddProduct}
                            disabled={!formState.selectedProduct || !formState.unitId || !formState.price || !formState.quantity || isSubmitting}
                            className="flex items-center gap-2 w-full sm:w-auto justify-center text-sm"
                        >
                            <span>💾</span>
                            {isSubmitting ? 'Ajout en cours...' : 'Ajouter au stand'}
                        </Button>
                        <Button 
                            variant="secondary" 
                            onClick={onCancel}
                            className="flex items-center gap-2 w-full sm:w-auto justify-center text-sm"
                        >
                            <span>❌</span>
                            Annuler
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
}