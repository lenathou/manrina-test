import { IUnit } from '../server/product/IProduct';

/**
 * Convertit une quantité d'une unité vers une autre unité de la même catégorie
 * @param quantity - La quantité à convertir
 * @param fromUnit - L'unité source
 * @param toUnit - L'unité de destination
 * @returns La quantité convertie
 */
export function convertUnits(quantity: number, fromUnit: IUnit, toUnit: IUnit): number {
    // Si les unités sont identiques, pas de conversion nécessaire
    if (fromUnit.id === toUnit.id) {
        return quantity;
    }

    // Vérifier que les unités sont de la même catégorie
    if (fromUnit.category !== toUnit.category) {
        throw new Error(`Cannot convert between different categories: ${fromUnit.category} and ${toUnit.category}`);
    }

    // Conversion via l'unité de base
    // 1. Convertir vers l'unité de base (multiplier par le facteur de conversion)
    const baseQuantity = quantity * (fromUnit.conversionFactor || 1);

    // 2. Convertir de l'unité de base vers l'unité cible (diviser par le facteur de conversion)
    const convertedQuantity = baseQuantity / (toUnit.conversionFactor || 1);

    return convertedQuantity;
}

/**
 * Calcule combien d'unités d'un variant peuvent être produites à partir du stock global
 * @param globalStock - Le stock global du produit
 * @param globalUnit - L'unité du stock global
 * @param variantQuantity - La quantité du variant
 * @param variantUnit - L'unité du variant
 * @returns Le nombre d'unités du variant qui peuvent être produites
 */
export function calculateVariantUnitsFromGlobalStock(
    globalStock: number,
    globalUnit: IUnit,
    variantQuantity: number,
    variantUnit: IUnit,
): number {
    try {
        // Convertir la quantité du variant vers l'unité du stock global
        const variantQuantityInGlobalUnit = convertUnits(variantQuantity, variantUnit, globalUnit);

        // Calculer combien d'unités peuvent être produites
        const calculatedUnits = Math.floor(globalStock / variantQuantityInGlobalUnit);

        return calculatedUnits;
    } catch (error) {
        console.error('Error calculating variant units:', error);
        return 0;
    }
}

/**
 * Facteurs de conversion standards pour les unités courantes
 * Basés sur les unités définies dans seed-units.ts
 */
export const CONVERSION_FACTORS = {
    weight: {
        g: 0.001, // 1g = 0.001kg
        kg: 1, // 1kg = 1kg (unité de base)
        t: 1000, // 1t = 1000kg
    },
    volume: {
        ml: 0.001, // 1ml = 0.001L
        cl: 0.01, // 1cl = 0.01L
        L: 1, // 1L = 1L (unité de base)
    },
    quantity: {
        pièce: 1,
        unité: 1,
        paquet: 1,
        botte: 1,
        barquette: 1,
    },
} as const;
