import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { backendFetchService } from '@/service/BackendFetchService';
import { IUnit, IProductVariant } from '@/server/product/IProduct';
import { IGrowerProductWithRelations } from '@/server/grower/IGrowerRepository';
import { IGrowerStockPageData } from '@/hooks/useGrowerStockPageData';
import { useGrowerStockValidation } from '@/hooks/useGrowerStockValidation';
import { GrowerStockValidationStatus } from '@/server/grower/IGrowerStockValidation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';

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

type GrowerProductWithVariantCache = IGrowerProductWithRelations & {
    product: IGrowerProductWithRelations['product'] & {
        variants?: IProductVariant[];
    };
};

export default function GrowerPriceModal({ isOpen, onClose, product, units, growerId }: GrowerPriceModalProps) {
    const queryClient = useQueryClient();
    const { success, error: toastError } = useToast();
    const { createStockUpdateRequest } = useGrowerStockValidation(growerId);

    const [variantPrices, setVariantPrices] = useState<Record<string, string>>({});
    const [currentStock, setCurrentStock] = useState<string>('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [hasChanges, setHasChanges] = useState(false);
    const [isValidating, setIsValidating] = useState(false);

    // Initialiser les prix et le stock avec les valeurs actuelles du produit
    useEffect(() => {
        if (isOpen && product) {
            console.log('GrowerPriceModal - Product data:', product);
            console.log('GrowerPriceModal - Variants:', product.variants);
            product.variants.forEach((variant) => {
                console.log(`Variant ${variant.id}:`, {
                    optionValue: variant.optionValue,
                    quantity: variant.quantity,
                    unitId: variant.unitId,
                    price: variant.price,
                });
            });

            const initialPrices: Record<string, string> = {};
            product.variants.forEach((variant) => {
                initialPrices[variant.id] = variant.price.toString();
            });
            setVariantPrices(initialPrices);
            setCurrentStock(product.totalStock.toString());
            setErrors({});
            setHasChanges(false);
        }
    }, [isOpen, product]);

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

    // Fonction pour détecter les changements
    const detectChanges = () => {
        // Vérifier les changements de prix
        const priceChanges = product.variants.some((variant) => {
            const currentPrice = variantPrices[variant.id];
            return currentPrice && parseFloat(currentPrice) !== variant.price;
        });

        // Vérifier les changements de stock
        const stockChanges = currentStock !== product.totalStock.toString();

        const hasAnyChanges = priceChanges || stockChanges;
        setHasChanges(hasAnyChanges);
        return hasAnyChanges;
    };

    // Mutation pour mettre à jour le stock du produit
    const updateStockMutation = useMutation({
        mutationFn: async (newStock: number) => {
            return backendFetchService.updateGrowerProductStock({
                growerId,
                productId: product.id,
                stock: newStock,
            });
        },
        onSuccess: () => {
            success('Stock mis à jour avec succès');
        },
        onError: (error) => {
            console.error('Erreur lors de la mise à jour du stock:', error);
            toastError('Erreur lors de la mise à jour du stock');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['growerStockPageData', growerId] });
            queryClient.invalidateQueries({ queryKey: ['grower-stock', growerId] });
        },
    });

    // Mutation pour mettre à jour les prix
    const updatePricesMutation = useMutation({
        mutationFn: async () => {
            const toUpdate = product.variants
                .map((v) => ({
                    variantId: v.id,
                    oldPrice: typeof v.price === 'number' ? v.price : parseFloat(String(v.price)),
                    newPriceStr: variantPrices[v.id],
                }))
                .filter((e) => {
                    if (e.newPriceStr === undefined || e.newPriceStr === null) return false;
                    const newPrice = parseFloat(e.newPriceStr);
                    if (isNaN(newPrice)) return false;
                    return newPrice !== e.oldPrice;
                })
                .map(({ variantId, newPriceStr }) => ({ variantId, price: parseFloat(newPriceStr!) }));

            if (toUpdate.length === 0) return [] as unknown[];

            return backendFetchService.updateMultipleVariantPrices({
                growerId,
                variantPrices: toUpdate,
            });
        },
        onMutate: async () => {
            // Cancel outgoing refetches so we don't overwrite our optimistic update
            await queryClient.cancelQueries({ queryKey: ['growerStockPageData', growerId] });

            // Snapshot previous value
            const previous = queryClient.getQueryData<IGrowerStockPageData>(['growerStockPageData', growerId]);

            try {
                // Compute changes
                const changes: Record<string, number> = {};
                product.variants.forEach((variant) => {
                    const value = variantPrices[variant.id];
                    if (value != null && value !== '') {
                        const nextPrice = parseFloat(value);
                        if (
                            !Number.isNaN(nextPrice) &&
                            nextPrice !==
                                (typeof variant.price === 'number' ? variant.price : parseFloat(String(variant.price)))
                        ) {
                            changes[variant.id] = nextPrice;
                        }
                    }
                });

                // Apply optimistic update to cached page data
                if (previous && Array.isArray(previous.growerProducts) && Array.isArray(previous.allProducts)) {
                    const growerProductsWithVariants = previous.growerProducts as GrowerProductWithVariantCache[];

                    const updated = {
                        ...previous,
                        growerProducts: growerProductsWithVariants.map((growerProduct) => {
                            if (
                                growerProduct.product?.id !== product.id ||
                                !Array.isArray(growerProduct.product?.variants)
                            ) {
                                return growerProduct;
                            }

                            const updatedVariants = growerProduct.product.variants.map((variant) =>
                                changes[variant.id] != null ? { ...variant, price: changes[variant.id]! } : variant,
                            );

                            return {
                                ...growerProduct,
                                product: {
                                    ...growerProduct.product,
                                    variants: updatedVariants,
                                },
                            };
                        }),
                        allProducts: previous.allProducts.map((storeProduct) => {
                            if (storeProduct.id !== product.id) {
                                return storeProduct;
                            }

                            return {
                                ...storeProduct,
                                variants: storeProduct.variants.map((storeVariant) =>
                                    changes[storeVariant.id] != null
                                        ? { ...storeVariant, price: changes[storeVariant.id]! }
                                        : storeVariant,
                                ),
                            };
                        }),
                    };

                    queryClient.setQueryData<IGrowerStockPageData>(['growerStockPageData', growerId], updated);
                }
            } catch {}

            return { previous };
        },
        onSuccess: () => {
            success('Prix mis à jour avec succès');
            onClose();
        },
        onError: (error, _vars, context) => {
            // Rollback optimistic update on error
            if (context?.previous) {
                queryClient.setQueryData(['growerStockPageData', growerId], context.previous);
            }
            console.error('Erreur lors de la mise à  jour des prix:', error);
            setErrors({ general: 'Erreur lors de la mise à  jour des prix' });
            toastError('Erreur lors de la mise à  jour des prix');
        },
        onSettled: () => {
            // Ensure server truth
            queryClient.invalidateQueries({ queryKey: ['growerStockPageData', growerId] });
            queryClient.invalidateQueries({ queryKey: ['grower-stock', growerId] });
            queryClient.invalidateQueries({ queryKey: ['calculateGlobalStock', product.id] });
        },
    });

    const handlePriceChange = (variantId: string, value: string) => {
        setVariantPrices((prev) => ({
            ...prev,
            [variantId]: value,
        }));

        // Supprimer l'erreur pour ce variant si elle existe
        if (errors[variantId]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[variantId];
                return newErrors;
            });
        }

        // Détecter les changements après la mise à jour
        setTimeout(() => detectChanges(), 0);
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

        // Détecter les changements après la mise à jour
        setTimeout(() => detectChanges(), 0);
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Validation des prix
        Object.entries(variantPrices).forEach(([variantId, priceStr]) => {
            const price = parseFloat(priceStr);
            if (isNaN(price) || price < 0) {
                newErrors[variantId] = 'Le prix doit être un nombre positif';
            }
        });

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
            const promises = [];

            // Vérifier s'il y a des changements de prix
            const priceChanges = product.variants.some((variant) => {
                const currentPrice = variantPrices[variant.id];
                return currentPrice && parseFloat(currentPrice) !== variant.price;
            });

            // Vérifier s'il y a des changements de stock
            const stockChanges = currentStock !== product.totalStock.toString();

            // Mettre à jour les prix si nécessaire
            if (priceChanges) {
                promises.push(updatePricesMutation.mutateAsync());
            }

            // Mettre à jour le stock si nécessaire
            if (stockChanges) {
                const newStock = parseFloat(currentStock);
                promises.push(updateStockMutation.mutateAsync(newStock));
            }

            // Attendre que toutes les mises à jour soient terminées
            await Promise.all(promises);

            // Si des changements ont été effectués, déclencher la validation admin
            if (hasChanges && createStockUpdateRequest) {
                setIsValidating(true);
                try {
                    await createStockUpdateRequest.mutateAsync({
                        growerId,
                        productId: product.id,
                        newStock: parseFloat(currentStock),
                        reason: 'Modification via modal de gestion des prix et stock',
                        status: GrowerStockValidationStatus.PENDING,
                        requestDate: new Date().toISOString()
                    });
                    success('Modifications envoyées pour validation admin');
                } catch (error) {
                    console.error('Erreur lors de l\'envoi pour validation:', error);
                    toastError('Erreur lors de l\'envoi pour validation admin');
                } finally {
                    setIsValidating(false);
                }
            }

            onClose();
        } catch (error) {
            console.error('Erreur lors de la soumission:', error);
            toastError('Erreur lors de la mise à jour');
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

                    {errors.general && (
                        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 mb-6">
                            {errors.general}
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
                                    disabled={updateStockMutation.isPending || isValidating}
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
                                    return (
                                        <div key={variant.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
                                            <div className="flex-1">
                                                <span className="text-sm text-tertiary">
                                                    {getVariantDisplayName(variant)}
                                                </span>
                                                {variant.quantity && variant.unitId && (
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {variant.quantity} {units.find(u => u.id === variant.unitId)?.symbol || 'unité'}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={variantPrices[variant.id] ?? ''}
                                                    onChange={(event) => handlePriceChange(variant.id, event.target.value)}
                                                    placeholder="Prix"
                                                    className={`w-20 text-right font-medium ${priceError ? 'border-red-400 focus-visible:ring-red-500' : ''}`}
                                                    disabled={updatePricesMutation.isPending}
                                                />
                                                <span className="text-sm font-medium text-primary">€</span>
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
                    {/* Indicateur de validation admin */}
                    {hasChanges && (
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                            <p className="text-sm text-blue-700">
                                {isValidating 
                                    ? 'Envoi pour validation admin en cours...'
                                    : 'Les modifications seront envoyées pour validation admin'
                                }
                            </p>
                        </div>
                    )}
                    
                    <div className="flex justify-end space-x-3">
                        <Button
                            onClick={handleCancel}
                            variant="secondary"
                            disabled={updatePricesMutation.isPending || updateStockMutation.isPending || isValidating}
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={updatePricesMutation.isPending || updateStockMutation.isPending || isValidating}
                        >
                            {(updatePricesMutation.isPending || updateStockMutation.isPending || isValidating) 
                                ? 'Sauvegarde...' 
                                : 'Sauvegarder'
                            }
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
