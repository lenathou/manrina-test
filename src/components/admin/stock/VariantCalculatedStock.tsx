import React from 'react';
import { IProduct, IProductVariant, IUnit } from '@/server/product/IProduct';
import { useQuery } from '@tanstack/react-query';
import { backendFetchService } from '@/service/BackendFetchService';
import { calculateVariantUnitsFromGlobalStock } from '@/utils/unitConversion';

interface VariantCalculatedStockProps {
    variant: IProductVariant;
    product: IProduct;
    globalStock?: number;
    units: IUnit[];
}

export function VariantCalculatedStock({ variant, product, globalStock, units }: VariantCalculatedStockProps) {
    // Récupérer le stock total du produit basé sur la somme des stocks producteurs
    const { data: totalProductStock, isLoading: stockLoading } = useQuery({
        queryKey: ['totalProductStock', product.id],
        queryFn: () => {
            if (!product.id) throw new Error('Product ID is required');
            return backendFetchService.getTotalStockForProduct(product.id);
        },
        enabled: globalStock === undefined && !!product.id, // Désactiver la requête si globalStock est fourni
    });

    // Note: Les informations du produit sont déjà disponibles via les props
    // Pas besoin d'appeler getProductStockInfo ici

    const calculatedUnits = React.useMemo(() => {
        // Vérifier que toutes les données nécessaires sont disponibles
        if (!units || units.length === 0) {
            return 0;
        }

        if (!variant.unit || !variant.quantity) {
            return 0;
        }

        // Déterminer le stock à utiliser
        const stockToUse = globalStock !== undefined ? globalStock : totalProductStock;
        if (stockToUse === undefined || stockToUse === null) {
            return 0;
        }

        // Trouver l'unité de base du produit
        const baseUnit = units.find((u) => u.id === product.baseUnitId);
        if (!baseUnit) {
            return 0;
        }

        try {
            const result = calculateVariantUnitsFromGlobalStock(stockToUse, baseUnit, variant.quantity, variant.unit);
            return result;
        } catch (error) {
            console.error('Erreur lors du calcul des unités:', error);
            return 0;
        }
    }, [globalStock, totalProductStock, variant.unit, variant.quantity, product.baseUnitId, units]);

    if (stockLoading && globalStock === undefined) {
        return <div className="text-gray-500">Chargement...</div>;
    }

    return (
        <div className="text-sm">
            <div className="font-medium text-gray-900">{calculatedUnits}</div>
            <div className="text-xs text-gray-500">unités possibles</div>
        </div>
    );
}
