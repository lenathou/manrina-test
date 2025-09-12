import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { backendFetchService } from '@/service/BackendFetchService';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { IProductPriceInfo, IVariantPriceInfo, IGrowerPriceInfo } from '@/server/grower/GrowerPricingService';

interface GrowerPricesPageContentProps {
    growerId: string;
    productId: string;
}

export default function GrowerPricesPageContent({ growerId, productId }: GrowerPricesPageContentProps) {
    const queryClient = useQueryClient();
    const [variantPrices, setVariantPrices] = useState<Record<string, string>>({});
    const [isEditing, setIsEditing] = useState(false);

    // Query pour récupérer les informations du produit avec les prix
    const { data: productPriceInfo, isLoading, error } = useQuery<IProductPriceInfo>({
        queryKey: ['product-price-info', productId],
        queryFn: () => backendFetchService.getProductPriceInfo(productId),
        enabled: !!productId
    });

    // Extraire le produit et les prix actuels du producteur
    const product = productPriceInfo?.product;
    const currentPrices = productPriceInfo?.variants?.reduce((acc: Record<string, number>, variant: IVariantPriceInfo) => {
        const growerPrice = variant.growerPrices?.find((gp: IGrowerPriceInfo) => gp.growerId === growerId);
        if (growerPrice) {
            acc[variant.variantId] = growerPrice.price;
        }
        return acc;
    }, {});

    // Mutation pour mettre à jour les prix
    const updatePriceMutation = useMutation({
        mutationFn: (params: { growerId: string; variantId: string; price: number }) =>
            backendFetchService.updateGrowerProductPrice(params),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product-price-info', productId] });
            setIsEditing(false);
            setVariantPrices({});
        },
        onError: (error) => {
            console.error('Erreur lors de la mise à jour des prix:', error);
        }
    });

    const handlePriceChange = (variantId: string, value: string) => {
        setVariantPrices(prev => ({
            ...prev,
            [variantId]: value
        }));
    };

    const handleSave = () => {
        Object.entries(variantPrices).forEach(([variantId, priceStr]) => {
            const price = parseFloat(priceStr);
            if (!isNaN(price) && price >= 0) {
                updatePriceMutation.mutate({
                    growerId,
                    variantId,
                    price
                });
            }
        });
    };

    const startEditing = () => {
        setIsEditing(true);
        // Initialiser les prix d'édition avec les prix actuels
        const initialPrices: Record<string, string> = {};
        product?.variants?.forEach((variant: { id: string; optionValue: string; quantity?: number | null; unit?: { symbol: string } | null }) => {
            initialPrices[variant.id] = (currentPrices?.[variant.id] || 0).toString();
        });
        setVariantPrices(initialPrices);
    };

    const cancelEditing = () => {
        setIsEditing(false);
        setVariantPrices({});
    };

    const isFormValid = () => {
        return Object.values(variantPrices).every(price => {
            const numValue = parseFloat(price);
            return !isNaN(numValue) && numValue >= 0;
        });
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Text variant="body">Chargement du produit...</Text>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-64">
                <Text variant="body" className="text-red-600">
                    Erreur lors du chargement du produit
                </Text>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex justify-center items-center h-64">
                <Text variant="body" className="text-gray-500">
                    Produit non trouvé
                </Text>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="mb-6">
                <Text variant="h2" className="text-2xl font-bold mb-2">
                    Définir les prix des variants
                </Text>
                <Text variant="body" className="text-gray-600">
                    {product.name}
                </Text>
            </div>
            
            <div className="mb-6 space-y-4">
                {product.variants?.map((variant: { id: string; optionValue: string; quantity?: number | null; unit?: { symbol: string } | null }) => {
                    const currentPrice = currentPrices?.[variant.id] || 0;
                    const editingPrice = variantPrices[variant.id] || currentPrice.toString();
                    
                    return (
                        <div key={variant.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                            <div className="mb-3">
                                <Text variant="body" className="font-medium text-gray-700">
                                    {variant.optionValue || `Variant ${variant.id.slice(0, 8)}`}
                                </Text>
                                {variant.quantity && variant.unit && (
                                    <Text variant="small" className="text-gray-500">
                                        {variant.quantity} {variant.unit.symbol}
                                    </Text>
                                )}
                            </div>
                            
                            <div className="flex items-center space-x-3">
                                {isEditing ? (
                                    <>
                                        <input
                                            type="number"
                                            value={editingPrice || ''}
                                            onChange={(e) => handlePriceChange(variant.id, e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Prix"
                                            min="0"
                                            step="0.01"
                                            disabled={updatePriceMutation.isPending}
                                        />
                                        <span className="text-gray-500">€</span>
                                    </>
                                ) : (
                                    <div className="flex items-center space-x-2">
                                        <Text variant="body" className="font-semibold text-lg">
                                            {currentPrice.toFixed(2)} €
                                        </Text>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            
            <div className="flex justify-end space-x-3">
                {!isEditing ? (
                    <Button onClick={startEditing}>
                        Modifier les prix
                    </Button>
                ) : (
                    <>
                        <Button
                            variant="secondary"
                            onClick={cancelEditing}
                            disabled={updatePriceMutation.isPending}
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={updatePriceMutation.isPending || !isFormValid()}
                        >
                            {updatePriceMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}