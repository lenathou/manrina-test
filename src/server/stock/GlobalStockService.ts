import { IProduct, IProductVariant, IUnit } from '../product/IProduct';

export interface GlobalStockCalculation {
    productId: string;
    globalStock: number;
    variantStocks: Array<{
        variantId: string;
        calculatedStock: number;
        quantity: number;
        unitSymbol: string;
    }>;
}

export class GlobalStockService {
    /**
     * Calcule le stock disponible pour chaque variant basé sur le stock global
     * et les quantités de chaque variant
     */
    public calculateVariantStocks(
        product: IProduct
    ): GlobalStockCalculation {
        const { globalStock, baseQuantity, baseUnit } = product;
        
        // Si le produit n'a pas d'unité de base définie, on ne peut pas calculer les stocks des variants
        // Dans ce cas, on retourne un calcul vide
        if (!baseUnit || !baseQuantity) {
            return {
                productId: product.id,
                globalStock,
                variantStocks: product.variants.map(variant => ({
                    variantId: variant.id,
                    calculatedStock: 0,
                    quantity: variant.quantity || 0,
                    unitSymbol: variant.unit?.symbol || ''
                }))
            };
        }

        // Vérifier que tous les variants utilisent des unités compatibles
        this.validateVariantUnitsCompatibility(product);

        const variantStocks = product.variants
            .filter((variant): variant is IProductVariant & { quantity: number; unit: IUnit } => 
                variant.quantity != null && variant.unit != null
            )
            .map(variant => {

            // Calculer combien d'unités de ce variant on peut faire avec le stock global
            let calculatedStock: number;
            
            if (baseUnit.id === variant.unit.id) {
                // Même unité : diviser le stock global par la quantité du variant
                calculatedStock = Math.floor(globalStock / variant.quantity);
            } else {
                // Unités différentes : convertir d'abord puis diviser
                const stockInVariantUnit = this.convertStock(
                    globalStock,
                    baseUnit,
                    variant.unit
                );
                calculatedStock = Math.floor(stockInVariantUnit / variant.quantity);
            }

            return {
                variantId: variant.id,
                calculatedStock,
                quantity: variant.quantity,
                unitSymbol: variant.unit.symbol
            };
        });

        // Ajouter les variants invalides avec un stock de 0
        const invalidVariantStocks = product.variants
            .filter(variant => !variant.quantity || !variant.unit)
            .map(variant => ({
                variantId: variant.id,
                calculatedStock: 0,
                quantity: variant.quantity || 0,
                unitSymbol: variant.unit?.symbol || 'N/A'
            }));

        return {
            productId: product.id,
            globalStock,
            variantStocks: [...variantStocks, ...invalidVariantStocks]
        };
    }

    /**
     * Met à jour le stock global après une vente et recalcule les stocks des variants
     */
    public updateGlobalStockAfterSale(
        product: IProduct,
        soldVariant: IProductVariant,
        quantitySold: number
    ): number {
        // Si le produit n'a pas d'unité de base définie, on ne peut pas calculer la déduction
        // On retourne le stock global actuel sans modification
        if (!product.baseUnit || !soldVariant.unit || !soldVariant.quantity) {
            return product.globalStock;
        }

        // Calculer combien d'unités de base ont été vendues
        const conversionFactor = this.getConversionFactor(
            product.baseUnit,
            soldVariant.unit,
            product.baseQuantity,
            soldVariant.quantity
        );

        const baseUnitsConsumed = quantitySold * conversionFactor;
        const newGlobalStock = Math.max(0, product.globalStock - baseUnitsConsumed);

        return newGlobalStock;
    }

    /**
     * Valide que tous les variants d'un produit utilisent des unités compatibles
     */
    private validateVariantUnitsCompatibility(product: IProduct): void {
        if (!product.baseUnit) {
            throw new Error('Product must have a base unit defined');
        }

        const baseUnitCategory = product.baseUnit.category;
        
        // Vérifier seulement les variants qui ont une unité définie
        const validVariants = product.variants.filter((variant): variant is IProductVariant & { unit: IUnit } => 
            variant.unit != null
        );
        
        for (const variant of validVariants) {

            if (variant.unit.category !== baseUnitCategory) {
                throw new Error(
                    `Variant ${variant.id} unit category (${variant.unit.category}) ` +
                    `does not match product base unit category (${baseUnitCategory})`
                );
            }
        }
    }

    /**
     * Calcule le facteur de conversion entre l'unité de base et l'unité du variant
     */
    private getConversionFactor(
        baseUnit: IUnit,
        variantUnit: IUnit,
        baseQuantity: number,
        variantQuantity: number
    ): number {
        // Si les unités sont identiques, le facteur est simplement le ratio des quantités
        if (baseUnit.id === variantUnit.id) {
            return variantQuantity / baseQuantity;
        }

        // Si les unités ont des facteurs de conversion définis
        if (baseUnit.conversionFactor && variantUnit.conversionFactor) {
            const baseToStandard = baseQuantity * baseUnit.conversionFactor;
            const variantToStandard = variantQuantity * variantUnit.conversionFactor;
            return variantToStandard / baseToStandard;
        }

        // Pour les unités de la même catégorie sans facteur de conversion explicite
        // (par exemple, grammes vers kilogrammes)
        if (baseUnit.category === variantUnit.category) {
            return this.getStandardConversionFactor(baseUnit, variantUnit, baseQuantity, variantQuantity);
        }

        throw new Error(
            `Cannot convert between ${baseUnit.symbol} and ${variantUnit.symbol}`
        );
    }

    /**
     * Convertit une quantité de stock d'une unité vers une autre
     */
    private convertStock(
        stockAmount: number,
        fromUnit: IUnit,
        toUnit: IUnit
    ): number {
        // Si les unités sont identiques, pas de conversion nécessaire
        if (fromUnit.id === toUnit.id) {
            return stockAmount;
        }

        // Si les unités ont des facteurs de conversion définis
        if (fromUnit.conversionFactor && toUnit.conversionFactor) {
            // Convertir vers l'unité standard puis vers l'unité cible
            const stockInStandardUnit = stockAmount * fromUnit.conversionFactor;
            return stockInStandardUnit / toUnit.conversionFactor;
        }

        // Pour les unités de la même catégorie sans facteur de conversion explicite
        if (fromUnit.category === toUnit.category) {
            return this.convertWithStandardFactors(stockAmount, fromUnit, toUnit);
        }

        throw new Error(
            `Cannot convert stock from ${fromUnit.symbol} to ${toUnit.symbol}`
        );
    }

    /**
     * Conversion avec facteurs standards pour unités communes
     */
    private convertWithStandardFactors(
        stockAmount: number,
        fromUnit: IUnit,
        toUnit: IUnit
    ): number {
        const weightConversions: Record<string, number> = {
            'g': 1,
            'kg': 1000,
            'mg': 0.001,
            'lb': 453.592,
        };

        const fromFactor = weightConversions[fromUnit.symbol];
        const toFactor = weightConversions[toUnit.symbol];

        if (fromFactor && toFactor) {
            // Convertir vers grammes puis vers l'unité cible
            const stockInGrams = stockAmount * fromFactor;
            return stockInGrams / toFactor;
        }

        throw new Error(
            `No standard conversion available from ${fromUnit.symbol} to ${toUnit.symbol}`
        );
    }

    /**
     * Facteurs de conversion standards pour les unités communes
     */
    private getStandardConversionFactor(
        baseUnit: IUnit,
        variantUnit: IUnit,
        baseQuantity: number,
        variantQuantity: number
    ): number {
        const weightConversions: Record<string, number> = {
            'g': 1,
            'kg': 1000,
            'mg': 0.001,
            'lb': 453.592,
            'oz': 28.3495
        };

        const volumeConversions: Record<string, number> = {
            'ml': 1,
            'l': 1000,
            'cl': 10,
            'dl': 100
        };

        const lengthConversions: Record<string, number> = {
            'mm': 1,
            'cm': 10,
            'm': 1000,
            'km': 1000000
        };

        let conversions: Record<string, number> = {};
        
        if (baseUnit.category === 'weight') {
            conversions = weightConversions;
        } else if (baseUnit.category === 'volume') {
            conversions = volumeConversions;
        } else if (baseUnit.category === 'length') {
            conversions = lengthConversions;
        }

        const baseInStandardUnit = (conversions[baseUnit.symbol] || 1) * baseQuantity;
        const variantInStandardUnit = (conversions[variantUnit.symbol] || 1) * variantQuantity;

        if (baseInStandardUnit === 0) {
            throw new Error('Base quantity cannot be zero');
        }

        return variantInStandardUnit / baseInStandardUnit;
    }

    /**
     * Vérifie si un variant peut être vendu avec la quantité demandée
     */
    public canSellVariant(
        product: IProduct,
        variant: IProductVariant,
        requestedQuantity: number
    ): boolean {
        const calculation = this.calculateVariantStocks(product);
        const variantStock = calculation.variantStocks.find(vs => vs.variantId === variant.id);
        
        return variantStock ? variantStock.calculatedStock >= requestedQuantity : false;
    }
}