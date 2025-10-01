import React, { useState } from 'react';
import { ShowDescriptionOnPrintDeliveryEditor } from '@/components/admin/ShowDescriptionOnPrintDeliveryEditorProps';
import { VatRateEditor } from '@/components/admin/VatRateEditor';
import { Dropdown } from '@/components/ui/Dropdown';
import { ActionDropdown } from '@/components/ui/ActionDropdown';
import { useRouter } from 'next/router';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { AppImage } from '@/components/Image';
import { ProductTable } from '@/components/products/Table';
import { TaxRatesProvider, useTaxRates } from '@/contexts/TaxRatesContext';
import { useFilteredProducts } from '@/hooks/useFilteredProducts';
import { useProductQuery } from '@/hooks/useProductQuery';
import { IProduct, IProductVariant, IUnit } from '@/server/product/IProduct';
import { backendFetchService } from '@/service/BackendFetchService';
import { useQuery } from '@tanstack/react-query';
import { VariantCalculatedStock } from '@/components/admin/stock/VariantCalculatedStock';
import { ProductActionsDropdown } from '@/components/admin/stock/ProductActionsDropdown';
import { GlobalStockDisplay } from '@/components/admin/stock/GlobalStockDisplay';
import { useAllProductsGlobalStock, useProductGlobalStockFromCache } from '@/hooks/useAllProductsGlobalStock';
import { Text } from '@/components/ui/Text';
import { useAllVariantsPriceRanges } from '@/hooks/useAllProductsPriceRanges';

function getDisplayVariantValue(variant: IProductVariant, units: IUnit[]) {
    if (variant.quantity && variant.unitId) {
        const unit = units.find((u) => u.id === variant.unitId);
        return `${variant.quantity} ${unit?.symbol || ''}`.trim();
    }
    return variant.optionValue;
}

function ProductRowWithGlobalStock({
    product,
    units,
    allGlobalStocks,
}: {
    product: IProduct;
    units: IUnit[];
    allGlobalStocks?: Record<string, number>;
}) {
    const globalStock = useProductGlobalStockFromCache(product.id, allGlobalStocks);
    const { data: allVariantPriceRanges = {}, isLoading: isLoadingPrices } = useAllVariantsPriceRanges();
    if (!product.variants || product.variants.length === 0) return null;

    return (
        <ProductTable.Row
            key={product.id}
            className={!product.showInStore ? 'text-gray-400' : ''}
            style={!product.showInStore ? { backgroundColor: 'rgba(0,0,0,0.05)', color: 'rgba(0,0,0,0.5)' } : {}}
        >
            {/* Produit */}
            <ProductTable.Cell>
                <div className="flex items-center space-x-3">
                    <AppImage
                        source={product.imageUrl}
                        style={{ width: 50, height: 50, borderRadius: 4 }}
                        alt={product.name}
                    />
                    <div>
                        <span className="font-medium text-gray-900">{product.name}</span>
                        <div className="text-xs text-gray-500">
                            {product.variants.length} variant{product.variants.length > 1 ? 's' : ''}
                        </div>
                    </div>
                </div>
            </ProductTable.Cell>

            {/* Variants */}
            <ProductTable.Cell>
                <div className="space-y-2">
                    {product.variants.map((variant) => {
                        const vr = (allVariantPriceRanges as Record<string, { min: number; max: number }>)[variant.id];
                        const priceText =
                            !vr || vr.min == null || vr.max == null
                                ? '-'
                                : vr.min === vr.max
                                  ? vr.min.toFixed(2) + ' €'
                                  : vr.min.toFixed(2) + ' € - ' + vr.max.toFixed(2) + ' €';
                        return (
                            <div
                                key={variant.id}
                                className="p-2 bg-gray-50 rounded"
                            >
                                <span className="text-sm font-medium">{getDisplayVariantValue(variant, units)}</span>
                                <span className="block text-xs text-gray-500">
                                    {isLoadingPrices ? 'Chargement...' : priceText}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </ProductTable.Cell>

            {/* Stock calculé */}
            <ProductTable.Cell>
                <div className="space-y-2">
                    {product.variants.map((variant) => (
                        <VariantCalculatedStock
                            key={variant.id}
                            variant={variant}
                            product={product}
                            units={units}
                            globalStock={globalStock}
                        />
                    ))}
                </div>
            </ProductTable.Cell>

            {/* Stock global */}
            <ProductTable.Cell>
                <div className="flex items-center justify-center h-full">
                    <GlobalStockDisplay
                        variant={product.variants[0]}
                        product={product}
                        globalStock={globalStock}
                    />
                </div>
            </ProductTable.Cell>

            {/* Actions */}
            <ProductTable.Cell>
                <ProductActionsDropdown
                    product={product}
                    units={units}
                />
            </ProductTable.Cell>

            {/* TVA */}
            <ProductTable.Cell>
                <div className="space-y-2">
                    {product.variants.map((variant) => (
                        <div
                            key={variant.id}
                            className="p-1"
                        >
                            <VatRateEditor variant={variant} />
                        </div>
                    ))}
                </div>
            </ProductTable.Cell>

            {/* Description livraison */}
            <ProductTable.Cell>
                <div className="space-y-2">
                    {product.variants.map((variant) => (
                        <div
                            key={variant.id}
                            className="p-1"
                        >
                            <ShowDescriptionOnPrintDeliveryEditor variant={variant} />
                        </div>
                    ))}
                </div>
            </ProductTable.Cell>
        </ProductTable.Row>
    );
}

function StockManagementPageContent() {
    const [searchTerm] = useState('');
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState('');
    const { data: products = [], isLoading } = useProductQuery();
    const { error: taxRatesError } = useTaxRates();

    const { data: allGlobalStocks } = useAllProductsGlobalStock({
        products,
        enabled: !isLoading && products.length > 0,
    });

    const { data: units = [] } = useQuery({
        queryKey: ['units'],
        queryFn: () => backendFetchService.getAllUnits(),
        staleTime: 5 * 60 * 1000,
    });

    const allCategories = Array.from(new Set(products.map((p) => p.category).filter((c): c is string => Boolean(c))));
    const searchFilteredProducts = useFilteredProducts(products, searchTerm, { includeVariants: true });
    const filteredProductsList =
        selectedCategory === ''
            ? searchFilteredProducts
            : searchFilteredProducts.filter((p) => p.category === selectedCategory);

    if (isLoading) {
        return (
            <div className="flex-1 flex justify-center items-center">
                <p className="text-lg">Loading...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <ErrorBanner message={taxRatesError?.message || ''} />

            {/* Barre d'outils */}
            <div className="p-6">
                <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
                        <div className="w-full sm:w-auto sm:min-w-[200px]">
                            <Dropdown
                                options={[
                                    { value: '', label: 'Toutes les catégories' },
                                    ...allCategories.map((c) => ({ value: c, label: c })),
                                ]}
                                value={selectedCategory}
                                placeholder="Filtrer par catégorie"
                                onSelect={setSelectedCategory}
                            />
                        </div>
                    </div>
                    <div>
                        {(() => {
                            const toolbarActions = [
                                {
                                    id: 'validation-stock',
                                    label: 'Validation stocks producteurs',
                                    onClick: () => router.push('/admin/stock/validation-stock'),
                                },
                                {
                                    id: 'page-produits',
                                    label: 'Aller a produits',
                                    onClick: () => router.push('/admin/produits'),
                                },
                            ];
                            return (
                                <ActionDropdown
                                    placeholder="Actions"
                                    actions={toolbarActions}
                                />
                            );
                        })()}
                    </div>
                </div>
            </div>

            {/* Tableau produits */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="overflow-x-auto">
                    <ProductTable>
                        <ProductTable.Header>
                            <ProductTable.HeaderRow>
                                <ProductTable.HeaderCell>Produit</ProductTable.HeaderCell>
                                <ProductTable.HeaderCell>Variants</ProductTable.HeaderCell>
                                <ProductTable.HeaderCell>Stock calculé</ProductTable.HeaderCell>
                                <ProductTable.HeaderCell>Stock global</ProductTable.HeaderCell>
                                <ProductTable.HeaderCell>Actions</ProductTable.HeaderCell>
                                <ProductTable.HeaderCell>TVA</ProductTable.HeaderCell>
                                <ProductTable.HeaderCell>Description livraison</ProductTable.HeaderCell>
                            </ProductTable.HeaderRow>
                        </ProductTable.Header>
                        <ProductTable.Body>
                            {filteredProductsList.map((product) => (
                                <ProductRowWithGlobalStock
                                    key={product.id}
                                    product={product}
                                    units={units}
                                    allGlobalStocks={allGlobalStocks}
                                />
                            ))}
                        </ProductTable.Body>
                    </ProductTable>
                </div>
            </div>
        </div>
    );
}

function StockManagementPage() {
    return (
        <TaxRatesProvider>
            <div className="min-h-screen">
                <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-8">
                        <div className="p-6">
                            <Text
                                variant="h2"
                                className="font-secondary font-bold text-2xl sm:text-3xl text-secondary mb-2"
                            >
                                Gestion du stock
                            </Text>
                            <p className="text-base sm:text-lg text-[var(--muted-foreground)]">
                                Gérez les produits, leurs variantes, les stocks et les prix de votre magasin.
                            </p>
                        </div>
                    </div>
                    <StockManagementPageContent />
                </div>
            </div>
        </TaxRatesProvider>
    );
}

export default StockManagementPage;
