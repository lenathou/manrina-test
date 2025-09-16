import { IProductVariant, IUnit } from '../server/product/IProduct';
import { getVariantUnitName } from './variantUtils';

export function getDisplayVariantValue(variant: IProductVariant, units: IUnit[] = []) {
    const qty = variant?.quantity;
    const unitId = variant?.unitId;
    const option = variant?.optionValue?.trim();

    // Si on a une quantité et une unité, utiliser le formatage avec quantité + unité
    if (qty != null && unitId) {
        const unit = units.find(u => u.id === unitId);
        if (unit) {
            // Utiliser l'utilitaire existant pour formater quantité + unité
            return getVariantUnitName(variant, unit);
        }
    }
    
    // Si on a une option, l'utiliser
    if (option) {
        return option;
    }
    
    // Sinon, utiliser le nom de l'optionSet
    return variant.optionSet || '';
}

export function getVariantDisplayName(variant: IProductVariant, units: IUnit[]) {
    return getDisplayVariantValue(variant, units);
}
