import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { IGrowerStockUpdateWithRelations } from '@/hooks/useGrowerStockValidation';
import { GrowerStockValidationStatus } from '@/server/grower/IGrowerStockValidation';
import { useUnitById } from '@/hooks/useUnits';
import { useQuery } from '@tanstack/react-query';
import { backendFetchService } from '@/service/BackendFetchService';

interface StockRequestGridCardProps {
    request: IGrowerStockUpdateWithRelations;
    isSelected: boolean;
    onToggleSelection: () => void;
    onApprove: () => void;
    onReject: () => void;
    isProcessing: boolean;
    formatDistanceToNow: (date: Date) => string;
}

const StockRequestGridCard: React.FC<StockRequestGridCardProps> = ({
    request,
    isSelected,
    onToggleSelection,
    onApprove,
    onReject,
    isProcessing,
    formatDistanceToNow
}) => {
    // Récupérer les prix producteurs pour ce produit
    const { data: productPriceInfo, isLoading: isLoadingPrices } = useQuery({
        queryKey: ['product-grower-prices', request.productId],
        queryFn: () => backendFetchService.getProductPriceInfo(request.productId),
        staleTime: 120000,
    });

    const getStatusText = (status: GrowerStockValidationStatus) => {
        switch (status) {
            case GrowerStockValidationStatus.PENDING:
                return 'En attente';
            case GrowerStockValidationStatus.APPROVED:
                return 'Approuvé';
            case GrowerStockValidationStatus.REJECTED:
                return 'Rejeté';
            default:
                return '';
        }
    };

    const formatRange = (min?: number, max?: number) => {
        if (min == null || max == null) return '—';
        if (min === max) return `${min.toFixed(2)} €`;
        return `${min.toFixed(2)} € - ${max.toFixed(2)} €`;
    };

    const getVariantDisplayName = (variantOptionValue: string, quantity?: number, unitSymbol?: string) => {
        if (quantity && unitSymbol) {
            return `${quantity} ${unitSymbol}`;
        }
        if (variantOptionValue && variantOptionValue !== 'Default') {
            return variantOptionValue;
        }
        return 'Variante par défaut';
    };

    const unit = useUnitById(request.product.baseUnitId || null);

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                        <input
                            type="checkbox"
                            id={`select-request-${request.id}`}
                            checked={isSelected}
                            onChange={onToggleSelection}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div>
                            <Text
                                variant="body"
                                className="font-medium text-gray-900"
                            >
                                {request.product.name}
                            </Text>
                            <Text
                                variant="small"
                                className="text-gray-500"
                            >
                                Demandé {formatDistanceToNow(new Date(request.requestDate))}
                            </Text>
                        </div>
                    </div>
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                        {getStatusText(request.status)}
                    </Badge>
                </div>

                <div className="space-y-3 mb-4">
                    <div className="bg-gray-50 border border-gray-200 rounded p-3">
                        <Text
                            variant="small"
                            className="text-gray-600 mb-1"
                        >
                            Nouveau stock demandé:
                        </Text>
                        <Text
                            variant="body"
                            className="font-semibold text-gray-900"
                        >
                            {request.newStock} {unit?.name || 'unité'}
                        </Text>
                    </div>

                    {/* Affichage des nouveaux prix demandés par le producteur */}
                    {request.variantPrices && request.variantPrices.length > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded p-3">
                            <Text
                                variant="small"
                                className="text-green-700 font-medium mb-2"
                            >
                                Nouveaux prix demandés:
                            </Text>
                            <div className="space-y-1">
                                {request.variantPrices.map((variantPrice) => {
                                    // Trouver les informations du variant dans productPriceInfo
                                    const variantInfo = productPriceInfo?.variants.find(v => v.variantId === variantPrice.variantId);
                                    return (
                                        <div key={variantPrice.variantId} className="flex justify-between items-center">
                                            <Text
                                                variant="small"
                                                className="text-gray-700"
                                            >
                                                {variantInfo ? 
                                                    getVariantDisplayName(variantInfo.variantOptionValue, variantInfo.variantQuantity, variantInfo.variantUnitSymbol) :
                                                    'Variant'
                                                }
                                            </Text>
                                            <Text
                                                variant="small"
                                                className="font-semibold text-green-700"
                                            >
                                                {variantPrice.newPrice.toFixed(2)} €
                                            </Text>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Affichage des plages de prix par variant */}
                    {productPriceInfo && productPriceInfo.variants.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded p-3">
                            <Text
                                variant="small"
                                className="text-blue-700 font-medium mb-2"
                            >
                                Prix variants actuels (min - max):
                            </Text>
                            <div className="space-y-1">
                                {productPriceInfo.variants.map((variant) => {
                                    const prices = (variant.growerPrices || []).map((gp) => gp.price);
                                    const min = prices.length ? Math.min(...prices) : undefined;
                                    const max = prices.length ? Math.max(...prices) : undefined;
                                    return (
                                        <div key={variant.variantId} className="flex justify-between items-center">
                                            <Text
                                                variant="small"
                                                className="text-gray-700"
                                            >
                                                {getVariantDisplayName(variant.variantOptionValue, variant.variantQuantity, variant.variantUnitSymbol)}
                                            </Text>
                                            <Text
                                                variant="small"
                                                className="font-semibold text-blue-700"
                                            >
                                                {formatRange(min, max)}
                                            </Text>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {isLoadingPrices && (
                        <div className="bg-gray-50 border border-gray-200 rounded p-3">
                            <Text
                                variant="small"
                                className="text-gray-500"
                            >
                                Chargement des prix...
                            </Text>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <Button
                        onClick={onApprove}
                        disabled={isProcessing}
                        variant="secondary"
                        size="sm"
                        className="w-full"
                    >
                        {isProcessing ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Traitement...
                            </>
                        ) : (
                            'Approuver'
                        )}
                    </Button>
                    <Button
                        onClick={onReject}
                        disabled={isProcessing}
                        variant="danger"
                        size="sm"
                        className="w-full"
                    >
                        {isProcessing ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Traitement...
                            </>
                        ) : (
                            'Rejeter'
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default StockRequestGridCard;