import { IProductVariant, IUnit } from '@/server/product/IProduct';

/**
 * Génère un nom de variante combinant la quantité et l'unité
 * @param variant - La variante du produit
 * @param unit - L'unité (optionnelle, peut être incluse dans la variante)
 * @returns Le nom formaté de la variante avec unité
 */
export function getVariantUnitName(variant: IProductVariant, unit?: IUnit): string {
    const unitToUse = unit || variant.unit;
    const quantity = variant.quantity;
    
    // Si pas de quantité ou d'unité, retourner juste la valeur de l'option
    if (!quantity || !unitToUse) {
        return variant.optionValue;
    }
    
    // Formater la quantité (enlever les décimales inutiles)
    const formattedQuantity = quantity % 1 === 0 ? quantity.toString() : quantity.toFixed(2).replace(/\.?0+$/, '');
    
    // Utiliser le symbole de l'unité si disponible, sinon le nom
    const unitDisplay = unitToUse.symbol || unitToUse.name;
    
    // Combiner quantité + unité + valeur d'option si elle est différente
    if (variant.optionValue && variant.optionValue !== `${formattedQuantity} ${unitDisplay}`) {
        return `${formattedQuantity} ${unitDisplay} - ${variant.optionValue}`;
    }
    
    return `${formattedQuantity} ${unitDisplay}`;
}

/**
 * Génère un nom de variante court pour l'affichage dans les listes
 * @param variant - La variante du produit
 * @param unit - L'unité (optionnelle, peut être incluse dans la variante)
 * @returns Le nom court formaté
 */
export function getVariantUnitNameShort(variant: IProductVariant, unit?: IUnit): string {
    const unitToUse = unit || variant.unit;
    const quantity = variant.quantity;
    
    if (!quantity || !unitToUse) {
        return variant.optionValue;
    }
    
    const formattedQuantity = quantity % 1 === 0 ? quantity.toString() : quantity.toFixed(2).replace(/\.?0+$/, '');
    const unitDisplay = unitToUse.symbol || unitToUse.name;
    
    return `${formattedQuantity} ${unitDisplay}`;
}

/**
 * Obtient l'unité d'une variante en cherchant dans la liste des unités si nécessaire
 * @param variant - La variante du produit
 * @param allUnits - Liste de toutes les unités disponibles
 * @returns L'unité trouvée ou undefined
 */
export function getVariantUnit(variant: IProductVariant, allUnits?: IUnit[]): IUnit | undefined {
    // Si l'unité est déjà incluse dans la variante
    if (variant.unit) {
        return variant.unit;
    }
    
    // Sinon, chercher dans la liste des unités
    if (variant.unitId && allUnits) {
        return allUnits.find(unit => unit.id === variant.unitId);
    }
    
    return undefined;
}