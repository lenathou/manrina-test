import { IProductVariant, IUnit } from '../server/product/IProduct';

export function getDisplayVariantValue(variant: IProductVariant, units: IUnit[]) {
  if (variant.quantity && variant.unitId) {
    const unit = units.find((u) => u.id === variant.unitId);
    return `${variant.quantity} ${unit?.symbol || 'unité'}`;
  }
  return variant.optionValue || 'Variante par défaut';
}

export function getVariantDisplayName(variant: IProductVariant, units: IUnit[]) {
  return getDisplayVariantValue(variant, units);
}