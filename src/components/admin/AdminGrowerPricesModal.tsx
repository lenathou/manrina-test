/* eslint-disable react/no-unescaped-entities */
import React, { useState} from 'react';
import { createPortal } from 'react-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {  IProductPriceInfo } from '@/server/grower/GrowerPricingService';
import { Button } from '@/components/ui/Button';
import { AppImage } from '@/components/Image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui';

interface GrowerPricesModalProps {
    isOpen: boolean;
    onClose: () => void;
    productId: string;
    productName: string;
    isAdminMode?: boolean; // true pour l'admin, false pour la vue client
}

export const GrowerPricesModal: React.FC<GrowerPricesModalProps> = ({
    isOpen,
    onClose,
    productId,
    productName,
    isAdminMode = false,
}) => {
    const [editingPrices, setEditingPrices] = useState<Record<string, string>>({});
    const queryClient = useQueryClient();

    const { data: productPriceInfo, isLoading } = useQuery({
        queryKey: ['product-grower-prices', productId],
        queryFn: () => fetch(`/api/products/${productId}/grower-prices`).then(res => res.json()) as Promise<IProductPriceInfo>,
        enabled: isOpen,
    });

    const updatePriceMutation = useMutation({
        mutationFn: async ({ variantId, growerId, price }: { variantId: string; growerId: string; price: number }) => {
            const response = await fetch(`/api/admin/grower-prices/${variantId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ growerId, price }),
            });
            
            if (!response.ok) {
                throw new Error('Failed to update price');
            }
            
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product-grower-prices', productId] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });

    const handlePriceChange = (growerId: string, variantId: string, value: string) => {
        const key = `${growerId}-${variantId}`;
        setEditingPrices(prev => ({ ...prev, [key]: value }));
    };

    const handleSavePrice = async (growerId: string, variantId: string) => {
        const key = `${growerId}-${variantId}`;
        const priceStr = editingPrices[key];
        
        if (!priceStr) return;
        
        const price = parseFloat(priceStr);
        if (isNaN(price) || price < 0) {
            alert('Veuillez entrer un prix valide');
            return;
        }

        try {
            await updatePriceMutation.mutateAsync({ variantId, growerId, price });
            setEditingPrices(prev => {
                const newState = { ...prev };
                delete newState[key];
                return newState;
            });
        } catch (error) {
            console.error('Error updating price:', error);
            alert('Erreur lors de la mise à jour du prix');
        }
    };

    const handleCancelEdit = (growerId: string, variantId: string) => {
        const key = `${growerId}-${variantId}`;
        setEditingPrices(prev => {
            const newState = { ...prev };
            delete newState[key];
            return newState;
        });
    };

    const startEditing = (growerId: string, variantId: string, currentPrice: number) => {
        const key = `${growerId}-${variantId}`;
        setEditingPrices(prev => ({ ...prev, [key]: currentPrice.toString() }));
    };

    if (!isOpen) return null;

    const modalContent = (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="bg-background max-w-4xl w-full max-h-[90vh] overflow-hidden">
                <CardHeader className="bg-secondary text-white">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-xl font-semibold">
                            {isAdminMode ? 'Gestion des prix - ' : 'Prix des producteurs - '}{productName}
                        </CardTitle>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-gray-300 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </CardHeader>

                <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {productPriceInfo?.variants.map((variant) => {
                                // Construire le nom d'affichage du variant
                                const getVariantDisplayName = () => {
                                    if (variant.variantQuantity && variant.variantUnitSymbol) {
                                        return `${variant.variantOptionValue} - ${variant.variantQuantity} ${variant.variantUnitSymbol}`;
                                    }
                                    return variant.variantOptionValue || `Variant ${variant.variantId.slice(0, 8)}`;
                                };
                                
                                return (
                                    <div key={variant.variantId} className="border border-gray-200 rounded-lg p-4">
                                        <div className="mb-4">
                                            <h3 className="text-lg font-medium text-gray-900">
                                                {getVariantDisplayName()}
                                            </h3>
                                            {variant.lowestPrice && (
                                                <p className="text-sm text-gray-600">
                                                    Prix le plus bas: <span className="font-semibold text-green-600">{variant.lowestPrice.toString()}€</span>
                                                </p>
                                            )}
                                        </div>

                                        {variant.growerPrices.length === 0 ? (
                                            <p className="text-gray-500 italic">Aucun producteur n'a défini de prix pour ce variant</p>
                                        ) : (
                                            <div className="space-y-3">
                                                {variant.growerPrices.map((growerPrice) => {
                                                    const editKey = `${growerPrice.growerId}-${variant.variantId}`;
                                                    const isEditing = editKey in editingPrices;

                                                    return (
                                                        <div key={growerPrice.growerId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                            <div className="flex items-center space-x-3">
                                                                {growerPrice.growerAvatar ? (
                                                                    <AppImage
                                                                        source={growerPrice.growerAvatar}
                                                                        style={{ width: 40, height: 40, borderRadius: 20 }}
                                                                        alt={growerPrice.growerName}
                                                                    />
                                                                ) : (
                                                                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                                                        <span className="text-gray-600 font-medium">
                                                                            {growerPrice.growerName.charAt(0).toUpperCase()}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <p className="font-medium text-gray-900">{growerPrice.growerName}</p>
                                                                    <p className="text-sm text-gray-500">Stock: {growerPrice.stock}</p>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center space-x-2">
                                                                {isEditing ? (
                                                                    <>
                                                                        <input
                                                                            type="number"
                                                                            step="0.01"
                                                                            min="0"
                                                                            value={editingPrices[editKey]}
                                                                            onChange={(e) => handlePriceChange(growerPrice.growerId, variant.variantId, e.target.value)}
                                                                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                                                            autoFocus
                                                                        />
                                                                        <span className="text-sm text-gray-600">€</span>
                                                                        <Button
                                                                            onClick={() => handleSavePrice(growerPrice.growerId, variant.variantId)}
                                                                            variant="primary"
                                                                            className="px-2 py-1 text-xs"
                                                                            disabled={updatePriceMutation.isPending}
                                                                        >
                                                                            ✓
                                                                        </Button>
                                                                        <Button
                                                                            onClick={() => handleCancelEdit(growerPrice.growerId, variant.variantId)}
                                                                            variant="secondary"
                                                                            className="px-2 py-1 text-xs"
                                                                        >
                                                                            ✕
                                                                        </Button>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <span className="font-semibold text-lg text-gray-900">
                                                                            {growerPrice.price.toString()}€
                                                                        </span>
                                                                        {isAdminMode && (
                                                                            <Button
                                                                                onClick={() => startEditing(growerPrice.growerId, variant.variantId, parseFloat(growerPrice.price.toString()))}
                                                                                variant="secondary"
                                                                                className="px-2 py-1 text-xs"
                                                                            >
                                                                                Modifier
                                                                            </Button>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>

                <CardFooter className="p-6 border-t border-gray-200">
                    <div className="flex justify-end">
                        <Button onClick={onClose} variant="secondary">
                            Fermer
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );

    return createPortal(modalContent, document.body);
};