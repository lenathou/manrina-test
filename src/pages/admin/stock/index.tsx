import { ShowDescriptionOnPrintDeliveryEditor } from '@/components/admin/ShowDescriptionOnPrintDeliveryEditorProps';
import { VatRateEditor } from '@/components/admin/VatRateEditor';
import { Dropdown } from '@/components/ui/Dropdown';
import { ActionDropdown } from '@/components/ui/ActionDropdown';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { AppImage } from '@/components/Image';
import { ProductTable } from '@/components/products/Table';
import { TaxRatesProvider, useTaxRates } from '@/contexts/TaxRatesContext';
import { useFilteredProducts } from '@/hooks/useFilteredProducts';
import { useProductQuery } from '@/hooks/useProductQuery';
import { IProduct, IProductVariant, IUnit } from '@/server/product/IProduct';
import { backendFetchService } from '@/service/BackendFetchService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState, useMemo } from 'react';

import { ProductModal } from '@/components/admin/stock/ProductModal';
import { ProductEditModal } from '@/components/admin/stock/ProductEditModal';
import { Text } from '@/components/ui/Text';
import { VariantCalculatedStock } from '@/components/admin/stock/VariantCalculatedStock';
import { SearchBarNext } from '@/components/ui/SearchBarNext';
import { ProductActionsDropdown } from '@/components/admin/stock/ProductActionsDropdown';
import { GlobalStockDisplay } from '@/components/admin/stock/GlobalStockDisplay';
import { useAllProductsGlobalStock, useProductGlobalStockFromCache } from '@/hooks/useAllProductsGlobalStock';
import { invalidateAllProductQueries } from '@/utils/queryInvalidation';

// Composant pour afficher le Stock calculé d'un variant (lecture seule)

// Fonction utilitaire pour l'affichage du variant
function getDisplayVariantValue(variant: IProductVariant, units: IUnit[]) {
    if (variant.quantity && variant.unitId) {
        const unit = units.find((u) => u.id === variant.unitId);
        return `${variant.quantity} ${unit?.symbol || 'unitÃ©'}`;
    }
    return variant.optionValue;}


import { useAllProductsPriceRanges, useDetailedProductPriceRanges } from '@/hooks/useAllProductsPriceRanges';

// Hook optimisé pour récupérer les plages de prix d'un produit depuis le cache global
function usePriceRanges(productId: string) {
    const { data: detailedPrices, isLoading } = useDetailedProductPriceRanges(productId, true);
    
    // Transformer les données en Map par variantId comme attendu par le composant
    const byVariantId = useMemo(() => {
        const map = new Map();
        if (detailedPrices?.variants) {
            detailedPrices.variants.forEach(variant => {
                const prices = variant.growerPrices.map(gp => gp.price).filter(p => p > 0);
                if (prices.length > 0) {
                    const min = Math.min(...prices);
                    const max = Math.max(...prices);
                    map.set(variant.variantId, { min, max });
                } else {
                    map.set(variant.variantId, { min: null, max: null });
                }
            });
        }
        return map;
    }, [detailedPrices]);
    
    return { isLoading, byVariantId };
}

// Composant pour une ligne de produit avec stock global partagÃ©
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
    const { isLoading: isLoadingPrices, byVariantId } = usePriceRanges(product.id);

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
                    <AppImage source={product.imageUrl} style={{ width: 50, height: 50, borderRadius: 4 }} alt={product.name} />
                    <div>
                        <span className="font-medium text-gray-900">{product.name}</span>
                        <div className="text-xs text-gray-500">{product.variants.length} variant{product.variants.length > 1 ? 's' : ''}</div>
                    </div>
                </div>
            </ProductTable.Cell>

            {/* Variants (avec prix min-max sous le libellé) */}
            <ProductTable.Cell>
                <div className="space-y-2">
                    {product.variants.map((variant) => {
                        const rng = byVariantId.get(variant.id);
                        const priceText = !rng || rng.min == null || rng.max == null
                            ? '-'
                            : (rng.min === rng.max
                                ? `${rng.min.toFixed(2)} €`
                                : `${rng.min.toFixed(2)} € - ${rng.max.toFixed(2)} €`);
                        return (
                            <div key={variant.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium">{getDisplayVariantValue(variant, units)}</span>
                                    <span className="text-xs text-gray-500">{isLoadingPrices ? 'Chargement...' : priceText}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </ProductTable.Cell>

            {/* Stock calculé */}
            <ProductTable.Cell>
                <div className="space-y-2">
                    {product.variants.map((variant) => (
                        <VariantCalculatedStock key={variant.id} variant={variant} product={product} units={units} globalStock={globalStock} />
                    ))}
                </div>
            </ProductTable.Cell>

            {/* Stock global */}
            <ProductTable.Cell>
                <div className="flex items-center justify-center h-full">
                    <GlobalStockDisplay variant={product.variants[0]} product={product} globalStock={globalStock} />
                </div>
            </ProductTable.Cell>

            {/* Actions */}
            <ProductTable.Cell>
                <ProductActionsDropdown product={product} units={units} />
            </ProductTable.Cell>

            {/* TVA */}
            <ProductTable.Cell>
                <div className="space-y-2">
                    {product.variants.map((variant) => (
                        <div key={variant.id} className="p-1">
                            <VatRateEditor variant={variant} />
                        </div>
                    ))}
                </div>
            </ProductTable.Cell>

            {/* Description livraison */}
            <ProductTable.Cell>
                <div className="space-y-2">
                    {product.variants.map((variant) => (
                        <div key={variant.id} className="p-1">
                            <ShowDescriptionOnPrintDeliveryEditor variant={variant} />
                        </div>
                    ))}
                </div>
            </ProductTable.Cell>
        </ProductTable.Row>
    );
}// Composant pour sÃ©lectionner les variants

function StockManagementPageContent() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [] = useState<Record<string, string>>({});
    const [productModalOpen, setProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<IProduct | undefined>();
    const [productEditModalOpen, setProductEditModalOpen] = useState(false);
    const [editingProductForEdit, setEditingProductForEdit] = useState<IProduct | undefined>();
    const queryClient = useQueryClient();
    const { data: products = [], isLoading } = useProductQuery();
    const { error: taxRatesError } = useTaxRates();

    // RÃ©cupÃ©rer tous les stocks globaux en une seule requÃªte optimisÃ©e
    const { data: allGlobalStocks } = useAllProductsGlobalStock({
        products,
        enabled: !isLoading && products.length > 0,
    });

    // Précharger toutes les données de prix en une seule requête optimisée
    useAllProductsPriceRanges();

    const { data: units = [] } = useQuery({
        queryKey: ['units'],
        queryFn: () => backendFetchService.getAllUnits(),
    });

    const { mutate: createProductsFromAirtable, isPending: isCreatingProducts } = useMutation({
        mutationFn: async () => {
            await backendFetchService.createProductsFromAirtable();
        },
        onSuccess: () => {
            // Invalider toutes les requÃªtes liÃ©es aux produits de maniÃ¨re cohÃ©rente
            invalidateAllProductQueries(queryClient);
        },
        onError: (error) => {
            console.error('Failed to import products from Airtable:', error);
            alert('Erreur lors de la rÃ©cupÃ©ration des produits depuis Airtable');
        },
    });

    // Extraire toutes les catÃ©gories uniques
    const allCategories = Array.from(
        new Set(
            products.map((product) => product.category).filter((category): category is string => Boolean(category)),
        ),
    );

    // Filtrer d'abord par terme de recherche
    const searchFilteredProducts = useFilteredProducts(products, searchTerm, {
        includeVariants: true,
    });

    // Puis filtrer par catÃ©gorie
    const filteredProductsList =
        selectedCategory === ''
            ? searchFilteredProducts
            : searchFilteredProducts.filter((product) => product.category === selectedCategory);

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

            {/* Barre d'outils principale */}
            <div className=" p-6">
                <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                    {/* Section de recherche et filtres */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
                        <div className="w-full sm:w-auto sm:min-w-[300px]">
                            <SearchBarNext
                                placeholder="Rechercher un produit..."
                                value={searchTerm}
                                onSearch={setSearchTerm}
                            />
                        </div>
                        <div className="w-full sm:w-auto sm:min-w-[200px]">
                            <Dropdown
                                options={[
                                    { value: '', label: 'Toutes les catégories' },
                                    ...allCategories.map((category) => ({ value: category, label: category })),
                                ]}
                                value={selectedCategory}
                                placeholder="Filtrer par catégorie"
                                onSelect={setSelectedCategory}
                                variant="settings"
                            />
                        </div>
                    </div>

                    {/* Section actions */}
                    <div className="flex gap-3 w-full sm:w-auto">
                        <ActionDropdown
                            placeholder="Actions"
                            className="min-w-[200px] flex-1 sm:flex-none"
                            actions={[
                                {
                                    id: 'create-product',
                                    label: 'CrÃ©er un produit',
                                    onClick: () => {
                                        setEditingProduct(undefined);
                                        setProductModalOpen(true);
                                    },
                                },
                                {
                                    id: 'create-from-airtable',
                                    label: isCreatingProducts ? 'CrÃ©ation...' : 'CrÃ©er depuis Airtable',
                                    disabled: isCreatingProducts,
                                    onClick: () => {
                                        const confirmed = window.confirm(
                                            'Voulez-vous vraiment rÃ©cupÃ©rer les produits depuis Airtable ?',
                                        );
                                        if (confirmed) {
                                            createProductsFromAirtable();
                                        }
                                    },
                                },
                                {
                                    id: 'manage-panyen',
                                    label: 'GÃ©rer les panyen',
                                    onClick: () => (window.location.href = '/admin/panyen'),
                                },
                                {
                                    id: 'validate-stock',
                                    label: 'Validation des stocks',
                                    onClick: () => (window.location.href = '/admin/stock/validation-stock'),
                                },
                                {
                                    id: 'refresh-cache',
                                    label: 'Actualiser Cache',
                                    onClick: () => {
                                        // Invalider tous les caches liÃ©s aux produits
                                        invalidateAllProductQueries(queryClient);
                                        // Afficher un message de confirmation
                                        alert('Cache invalidÃ© ! Les donnÃ©es vont se rafraÃ®chir automatiquement.');
                                    },
                                },
                            ]}
                        />
                    </div>
                </div>
            </div>

            {/* Tableau des produits */}
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
                        </ProductTable.Header><ProductTable.Body>
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

            {/* Modales */}
            <ProductModal
                isOpen={productModalOpen}
                onClose={() => {
                    setProductModalOpen(false);
                    setEditingProduct(undefined);
                }}
                onSave={(product) => {
                    console.log('Produit crÃ©Ã©:', product);
                    // Le modal se fermera automatiquement aprÃ¨s la crÃ©ation
                }}
                product={editingProduct}
            />

            {editingProductForEdit && (
                <ProductEditModal
                    product={editingProductForEdit}
                    isOpen={productEditModalOpen}
                    onClose={() => {
                        setProductEditModalOpen(false);
                        setEditingProductForEdit(undefined);
                    }}
                />
            )}
        </div>
    );
}

function StockManagementPage() {
    return (
        <TaxRatesProvider>
            <div className="min-h-screen ">
                <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* En-tÃªte de la page */}
                    <div className="mb-8">
                        <div className="p-6">
                            <Text
                                variant="h2"
                                className="font-secondary font-bold text-2xl sm:text-3xl text-secondary mb-2"
                            >
                                Gestion du stock
                            </Text>
                            <p className="text-base sm:text-lg text-[var(--muted-foreground)]">
                                GÃ©rez les produits, leurs variantes, les stocks et les prix de votre magasin.
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





















