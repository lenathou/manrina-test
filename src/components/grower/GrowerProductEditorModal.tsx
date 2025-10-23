import React, { useState, useEffect } from 'react';
import Image from 'next/image';

import { IUnit } from '@/server/product/IProduct';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { useToast } from '@/components/ui/Toast';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { usePendingVariantChanges } from '@/hooks/usePendingVariantChanges';

// Interface pour les données de variant avec activation
interface VariantPriceData {
    price: number | null;
    isActive: boolean;
    lastPrice?: number; // Pour garder l'historique du dernier prix saisi
}

interface GrowerPriceModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: {
        id: string;
        name: string;
        totalStock: number;
        baseUnitId: string | null;
        variants: Array<{
            id: string;
            optionValue: string | null;
            price: number;
            quantity: number | null;
            unitId: string | null;
        }>;
    };
    units: IUnit[];
    growerId: string;
}


export default function GrowerPriceModal({ isOpen, onClose, product, units, growerId }: GrowerPriceModalProps) {
    const { success, error: toastError } = useToast();
    const { pendingChanges, savePendingProductAndStockChanges } = usePendingVariantChanges(growerId);
    const [variantData, setVariantData] = useState<Record<string, VariantPriceData>>({});
    const [currentStock, setCurrentStock] = useState<string>('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [hasChanges, setHasChanges] = useState(false);

    // Initialiser les données des variants
    useEffect(() => {
        if (isOpen && product) {
            const initialData: Record<string, VariantPriceData> = {};
            const pendingProductChanges = pendingChanges[product.id];
            
            product.variants.forEach((variant) => {
                // Vérifier s'il y a des modifications en attente pour ce variant
                const pendingVariantData = pendingProductChanges?.variantData?.[variant.id];
                
                initialData[variant.id] = {
                    price: pendingVariantData?.price ?? variant.price ?? null,
                    isActive: pendingVariantData?.isActive ?? true,
                    lastPrice: pendingVariantData?.lastPrice ?? variant.price ?? undefined
                };
            });
            
            setVariantData(initialData);
            
            // Pour le stock, aussi vérifier s'il y a des modifications en attente
            const pendingStock = pendingProductChanges?.stockData?.newStock;
            setCurrentStock((pendingStock ?? product.totalStock).toString());
            
            setErrors({});
            setHasChanges(false);
        }
    }, [isOpen, product, pendingChanges]);

    // Détecter les changements quand variantData ou currentStock change
    useEffect(() => {
        if (product && Object.keys(variantData).length > 0) {
            console.log('🔍 Détection des changements:', {
                productVariants: product.variants,
                variantData: variantData,
                originalStock: product.totalStock,
                currentStock: currentStock
            });
            
            // Vérifier les changements de prix
            const priceChanges = product.variants.some((variant) => {
                const currentData = variantData[variant.id];
                const hasChange = currentData && (
                    currentData.price !== variant.price || 
                    !currentData.isActive
                );
                
                console.log(`📊 Variant ${variant.id}:`, {
                    originalPrice: variant.price,
                    currentPrice: currentData?.price,
                    isActive: currentData?.isActive,
                    priceChanged: currentData?.price !== variant.price,
                    hasChange: hasChange
                });
                
                return hasChange;
            });
            
            // Vérifier les changements de stock
            const stockChanged = parseFloat(currentStock) !== product.totalStock;
            
            console.log('📦 Stock changes:', {
                originalStock: product.totalStock,
                currentStock: parseFloat(currentStock),
                stockChanged: stockChanged
            });
            
            const hasAnyChanges = priceChanges || stockChanged;
            
            console.log('✅ Résultat détection changements:', {
                priceChanges,
                stockChanged,
                hasAnyChanges
            });
            setHasChanges(hasAnyChanges);
        }
    }, [variantData, product, currentStock]);

    // Fonction pour obtenir le nom d'affichage d'une variante
    const getVariantDisplayName = (variant: (typeof product.variants)[0]): string => {
        // Si on a quantity et unitId, afficher "quantity unit"
        if (variant.quantity && variant.unitId) {
            const unit = units.find((u) => u.id === variant.unitId);
            if (unit) {
                return `${variant.quantity} ${unit.symbol}`;
            }
        }

        // Sinon utiliser variantOptionValue
        if (variant.optionValue && variant.optionValue.trim() !== '' && variant.optionValue !== 'Default') {
            return variant.optionValue;
        }

        // Pour les variantes par défaut, afficher le nom du produit
        return product.name;
    };

    const handlePriceChange = (variantId: string, value: string) => {
        const numericValue = value === '' ? null : parseFloat(value);
        
        setVariantData(prev => ({
            ...prev,
            [variantId]: {
                ...prev[variantId],
                price: numericValue,
                lastPrice: numericValue || prev[variantId]?.lastPrice
            }
        }));

        // Supprimer l'erreur pour ce variant si elle existe
        if (errors[variantId]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[variantId];
                return newErrors;
            });
        }
    };

    const handleVariantToggle = (variantId: string, isActive: boolean) => {
        setVariantData(prev => ({
            ...prev,
            [variantId]: {
                ...prev[variantId],
                isActive,
                // Si on désactive, on met le prix à null, sinon on garde le dernier prix
                price: isActive ? (prev[variantId]?.lastPrice || null) : null
            }
        }));
        
        // Supprimer l'erreur pour ce variant si elle existe
        if (errors[variantId]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[variantId];
                return newErrors;
            });
        }
    };

    const handleStockChange = (value: string) => {
        setCurrentStock(value);

        // Supprimer l'erreur de stock si elle existe
        if (errors.stock) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors.stock;
                return newErrors;
            });
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        let hasActiveVariant = false;

        // Validation des prix et variants actifs
        Object.entries(variantData).forEach(([variantId, data]) => {
            if (data.isActive) {
                hasActiveVariant = true;
                
                if (data.price === null || data.price < 0) {
                    newErrors[variantId] = 'Le prix doit être un nombre positif pour les variants actifs';
                }
            }
        });

        // Vérifier qu'au moins un variant est actif
        if (!hasActiveVariant) {
            newErrors.general = 'Au moins un variant doit être actif';
        }

        // Validation du stock
        const stock = parseFloat(currentStock);
        if (isNaN(stock) || stock < 0) {
            newErrors.stock = 'Le stock doit être un nombre positif';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            // Vérifier s'il y a des changements de prix
            const priceChanges = product.variants.some((variant) => {
                const currentData = variantData[variant.id];
                return currentData && (
                    currentData.price !== variant.price || 
                    !currentData.isActive
                );
            });

            // Vérifier s'il y a des changements de stock
            const stockChanged = parseFloat(currentStock) !== product.totalStock;

            // Si il y a des changements de prix ou de stock
            if (priceChanges || stockChanged) {
                // Utiliser la fonction unifiée pour éviter les race conditions
                savePendingProductAndStockChanges(
                    product.id,
                    product.name,
                    priceChanges ? variantData : undefined,
                    stockChanged ? { newStock: parseFloat(currentStock), originalStock: product.totalStock } : undefined
                );
                success('Modifications sauvegardées localement. Utilisez "Valider tous les stocks" pour les envoyer à l\'admin.');
            } else {
                success('Aucune modification détectée.');
            }

            onClose();
        } catch (error) {
            console.error('Erreur lors de la sauvegarde locale:', error);
            toastError('Erreur lors de la sauvegarde des modifications');
        }
    };

    const handleCancel = () => {
        setErrors({});
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <Card className="mx-4 w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-xl p-0">
                <CardHeader className="bg-secondary text-white p-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-semibold">
                            Gérer les prix et stock
                        </CardTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="text-white hover:bg-white/20 h-8 w-8 p-0"
                        >
                            ×
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="bg-background p-6">
                    {/* Header avec image et nom du produit - inspiré de la carte */}
                    <div className="flex items-start gap-4 mb-6 pb-4 border-b border-gray-200">
                        <div className="relative">
                            <Image
                                src="/placeholder-product.svg"
                                alt={product.name}
                                width={80}
                                height={80}
                                className="w-20 h-20 rounded-lg object-cover border border-secondary/10"
                                priority={false}
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg text-secondary leading-tight mb-1">
                                {product.name}
                            </h3>
                            <p className="text-sm text-tertiary">
                                {product.variants.length} variant{product.variants.length > 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>

                    {/* Erreur générale */}
                    {errors.general && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-700">{errors.general}</p>
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Section Stock - inspirée de la carte */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-secondary">Stock total du produit</span>
                                <span className="text-sm text-tertiary">
                                    Exprimé en {units.find(u => u.id === product.baseUnitId)?.name || 'unités'}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={currentStock}
                                    onChange={(event) => handleStockChange(event.target.value)}
                                    placeholder="Quantité en stock"
                                    className={`flex-1 text-lg font-bold ${errors.stock ? 'border-red-400 focus-visible:ring-red-500' : ''}`}
                                    disabled={false}
                                />
                                <span className="text-lg font-bold text-primary">
                                    {units.find(u => u.id === product.baseUnitId)?.symbol || 'unités'}
                                </span>
                            </div>
                            {errors.stock && <p className="text-sm text-red-600">{errors.stock}</p>}
                        </div>

                        {/* Section Prix - inspirée de la carte */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-medium text-secondary">Prix par variant</h4>
                            <div className="space-y-3 max-h-[40vh] overflow-y-auto">
                                {product.variants.map((variant) => {
                                    const priceError = errors[variant.id];
                                    const variantInfo = variantData[variant.id];
                                    const isActive = variantInfo?.isActive ?? true;
                                    
                                    return (
                                        <div key={variant.id} className={`flex justify-between items-center p-3 rounded-lg border transition-all ${
                                            isActive ? 'bg-gray-50' : 'bg-gray-100 opacity-60'
                                        }`}>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3">
                                                    <Switch
                                                        checked={isActive}
                                                        onCheckedChange={(checked) => handleVariantToggle(variant.id, checked)}
                                                        disabled={false}
                                                        className="flex-shrink-0"
                                                    />
                                                    <div>
                                                        <span className={`text-sm ${isActive ? 'text-tertiary' : 'text-gray-400'}`}>
                                                            {getVariantDisplayName(variant)}
                                                        </span>
                                                        {!isActive && (
                                                            <span className="ml-2 text-xs text-gray-400 italic">
                                                                Non proposé
                                                            </span>
                                                        )}
                                                        {variant.quantity && variant.unitId && (
                                                            <div className={`text-xs mt-1 ${isActive ? 'text-gray-500' : 'text-gray-400'}`}>
                                                                {variant.quantity} {units.find(u => u.id === variant.unitId)?.symbol || 'unité'}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={isActive ? (variantInfo?.price ?? '') : (variantInfo?.lastPrice ?? '')}
                                                    onChange={(event) => handlePriceChange(variant.id, event.target.value)}
                                                    placeholder="Prix"
                                                    className={`w-20 text-right font-medium ${
                                                        priceError ? 'border-red-400 focus-visible:ring-red-500' : ''
                                                    } ${!isActive ? 'bg-gray-100 text-gray-400' : ''}`}
                                                    disabled={!isActive}
                                                />
                                                <span className={`text-sm font-medium ${isActive ? 'text-primary' : 'text-gray-400'}`}>€</span>
                                            </div>
                                            {priceError && <p className="text-sm text-red-600 mt-1">{priceError}</p>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="bg-background p-6 border-t border-gray-200">
                    
                    <div className="flex justify-end space-x-3">
                        <Button
                            onClick={handleCancel}
                            variant="secondary"
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={handleSubmit}
                        >
                            Sauvegarder
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
