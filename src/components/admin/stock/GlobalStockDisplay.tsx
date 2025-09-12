import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { backendFetchService } from '@/service/BackendFetchService';
import { IProduct, IProductVariant } from '@/server/product/IProduct';

interface GlobalStockDisplayProps {
    product: IProduct;
    variant: IProductVariant;
    globalStock?: number; // Stock global partagé pour tous les variants
}

export function GlobalStockDisplay({ product, variant, globalStock }: GlobalStockDisplayProps) {
    // Toujours appeler le hook useQuery (règle des hooks React)
    const { data: productStocks } = useQuery({
        queryKey: ['product-global-stock', product.id],
        queryFn: async () => {
            try {
                // Récupérer le stock total du produit directement
                const response = await backendFetchService.getGrowerStocksForProduct(product.id);
                return response.reduce((total, growerStock) => total + (growerStock.stock || 0), 0);
            } catch (error) {
                console.error('Erreur lors de la récupération du stock global du produit:', error);
                return 0;
            }
        },
        staleTime: 30000, // Cache pendant 30 secondes
        refetchOnWindowFocus: false, // Ne pas refetch au focus
        refetchOnMount: false, // Ne pas refetch au mount si les données sont fraîches
        enabled: globalStock === undefined, // Désactiver la requête si globalStock est fourni
    });

    // Déterminer le stock à afficher
    const displayStock = globalStock !== undefined ? globalStock : (productStocks || 0);
    const unitSymbol = variant.unit?.symbol || product.baseUnit?.symbol;

    return (
        <div className="text-sm">
            <div className="font-medium text-gray-900">
                {displayStock}
                {unitSymbol && (
                    <span className="text-sm text-gray-500 ml-1">
                        {unitSymbol}
                    </span>
                )}
            </div>
        </div>
    );
}