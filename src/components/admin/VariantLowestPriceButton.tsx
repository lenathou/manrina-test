import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { IGrowerPriceInfo } from '@/server/grower/GrowerPricingService';

interface VariantLowestPriceButtonProps {
    variantId: string;
    productId: string;
    productName: string;
    onOpenPricesModal: () => void;
}

export const VariantLowestPriceButton: React.FC<VariantLowestPriceButtonProps> = ({
    variantId,
    onOpenPricesModal,
}) => {
    const { data: lowestPrice, isLoading } = useQuery({
        queryKey: ['variant-lowest-price', variantId],
        queryFn: async () => {
            const response = await fetch(`/api/admin/grower-prices/${variantId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch grower prices');
            }
            const growerPrices = await response.json();
            
            if (growerPrices.length === 0) {
                return null;
            }
            
            // Trouver le prix le plus bas
            const prices = growerPrices.map((gp: IGrowerPriceInfo) => parseFloat(gp.price.toString()));
            return Math.min(...prices);
        },
    });

    if (isLoading) {
        return (
            <div className="animate-pulse bg-gray-200 h-6 w-16 rounded"></div>
        );
    }

    if (lowestPrice === null || lowestPrice === undefined) {
        return (
            <Button
                onClick={onOpenPricesModal}
                variant="secondary"
                className="px-2 py-1 text-xs text-gray-500"
            >
                Aucun prix
            </Button>
        );
    }

    return (
        <Button
            onClick={onOpenPricesModal}
            variant="secondary"
            className="px-2 py-1 text-xs font-medium text-green-600 hover:text-green-700 hover:bg-green-50"
        >
            {lowestPrice.toFixed(2)}€
        </Button>
    );
};