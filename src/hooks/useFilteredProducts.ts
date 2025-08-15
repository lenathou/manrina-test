import { useMemo } from 'react';
import { IProduct } from '../server/product/IProduct';

/**
 * Returns a memoized filtered list of products based on a search query.
 */
export const useFilteredProducts = (
    products: IProduct[],
    search: string,
    options?: { includeVariants?: boolean },
): IProduct[] => {
    return useMemo(() => filterProducts(products, search, options), [products, search, options]);
};
export const matchesSearch = (product: IProduct, searchText: string, includeVariants: boolean = false): boolean => {
    if (!searchText) return true;
    const lowerSearch = searchText.toLowerCase();
    const nameMatches = product.name.toLowerCase().includes(lowerSearch);
    if (includeVariants && !nameMatches) {
        const variantMatches = product.variants.some((variant) =>
            variant.optionValue.toLowerCase().includes(lowerSearch),
        );
        return nameMatches || variantMatches;
    }
    return nameMatches;
};

export const filterProducts = (
    products: IProduct[],
    searchText: string,
    options?: { includeVariants?: boolean },
): IProduct[] => {
    if (!searchText) return products;
    const includeVariants = options?.includeVariants || false;
    return products.filter((product) => matchesSearch(product, searchText, includeVariants));
};
