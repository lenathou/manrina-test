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
import { useMutation, useQuery, useQueryClient, QueryClient, dehydrate } from '@tanstack/react-query';
import React, { useState, Suspense, useEffect, useMemo, useCallback, lazy } from 'react';
import { GetServerSidePropsContext } from 'next';
// Temporarily removing react-window and AutoSizer due to import issues

import { Text } from '@/components/ui/Text';
import { VariantCalculatedStock } from '@/components/admin/stock/VariantCalculatedStock';
import { SearchBarNext } from '@/components/ui/SearchBarNext';
import { ProductActionsDropdown } from '@/components/admin/stock/ProductActionsDropdown';
import { GlobalStockDisplay } from '@/components/admin/stock/GlobalStockDisplay';
import { useAllProductsGlobalStock, useProductGlobalStockFromCache } from '@/hooks/useAllProductsGlobalStock';
import { useAllVariantsPriceRanges } from '@/hooks/useAllProductsPriceRanges';
import { invalidateAllProductQueries } from '@/utils/queryInvalidation';
import { useProductsLoading } from '@/contexts/ProductsLoadingContext';

// Lazy loading des composants non critiques
const LazyProductModal = lazy(() => import('@/components/admin/stock/ProductModal').then(module => ({ default: module.ProductModal })));
const LazyProductEditModal = lazy(() => import('@/components/admin/stock/ProductEditModal').then(module => ({ default: module.ProductEditModal })));
const LazyAlertsContainer = lazy(() => import('@/components/admin/stock/AlertsContainer').then(module => ({ default: module.AlertsContainer })));

// Composant pour afficher le Stock calcule d'un variant (lecture seule)

// Fonction utilitaire pour l'affichage du variant
function getDisplayVariantValue(variant: IProductVariant, units: IUnit[]) {
    if (variant.quantity && variant.unitId) {
        const unit = units.find((u) => u.id === variant.unitId);
        return `${variant.quantity} ${unit?.symbol || 'unité'}`;
    }
    return variant.optionValue;
}

// Composant de carte mobile pour les produits
function ProductMobileCard({
    product,
    units,
    allGlobalStocks,
    allVariantPriceRanges,
    isLoadingPrices,
}: {
    product: IProduct;
    units: IUnit[];
    allGlobalStocks?: Record<string, number>;
    allVariantPriceRanges: Record<string, { min: number; max: number }>;
    isLoadingPrices: boolean;
}) {
    const globalStock = useProductGlobalStockFromCache(product.id, allGlobalStocks);

    if (!product.variants || product.variants.length === 0) return null;

    return (
        <div
            className={`bg-white rounded-lg border border-gray-200 shadow-sm p-4 space-y-4 ${!product.showInStore ? 'opacity-60' : ''}`}
        >
            {/* En-tête du produit */}
            <div className="flex items-start space-x-3">
                <AppImage
                    source={product.imageUrl}
                    style={{ width: 60, height: 60, borderRadius: 8 }}
                    alt={product.name}
                />
                <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                    <p className="text-sm text-gray-500">
                        {product.variants.length} variant{product.variants.length > 1 ? 's' : ''}
                    </p>
                    <div className="mt-2">
                        <GlobalStockDisplay
                            variant={product.variants[0]}
                            product={product}
                            globalStock={globalStock}
                        />
                    </div>
                </div>
                <div className="flex-shrink-0">
                    <ProductActionsDropdown
                        product={product}
                        units={units}
                    />
                </div>
            </div>

            {/* Variants */}
            <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-1">Variants et Prix</h4>
                <div className="space-y-2">
                    {product.variants.map((variant) => {
                        const rng = (allVariantPriceRanges as Record<string, { min: number; max: number }>)[variant.id];
                        const priceText =
                            !rng || rng.min == null || rng.max == null
                                ? '-'
                                : rng.min === rng.max
                                  ? `${rng.min.toFixed(2)} €`
                                  : `${rng.min.toFixed(2)} € - ${rng.max.toFixed(2)} €`;
                        return (
                            <div
                                key={variant.id}
                                className="bg-gray-50 rounded-lg p-3"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1">
                                        <span className="text-sm font-medium text-gray-900">
                                            {getDisplayVariantValue(variant, units)}
                                        </span>
                                        <div className="text-xs text-gray-600 mt-1">
                                            Prix: {isLoadingPrices ? 'Chargement...' : priceText}
                                        </div>
                                    </div>
                                </div>

                                {/* Stock calculé */}
                                <div className="mt-2">
                                    <div className="text-xs text-gray-600 mb-1">Stock calculé:</div>
                                    <VariantCalculatedStock
                                        variant={variant}
                                        product={product}
                                        units={units}
                                        globalStock={globalStock}
                                    />
                                </div>

                                {/* TVA et Description livraison */}
                                <div className="mt-3 grid grid-cols-2 gap-3">
                                    <div>
                                        <div className="text-xs text-gray-600 mb-1">TVA:</div>
                                        <VatRateEditor variant={variant} />
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-600 mb-1">Description livraison:</div>
                                        <ShowDescriptionOnPrintDeliveryEditor variant={variant} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function ProductRowWithGlobalStock({
    product,
    units,
    allGlobalStocks,
    allVariantPriceRanges,
    isLoadingPrices,
}: {
    product: IProduct;
    units: IUnit[];
    allGlobalStocks?: Record<string, number>;
    allVariantPriceRanges: Record<string, { min: number; max: number }>;
    isLoadingPrices: boolean;
}) {
    const globalStock = useProductGlobalStockFromCache(product.id, allGlobalStocks);

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

            {/* Variants (avec prix min-max sous le libellé) */}
            <ProductTable.Cell>
                <div className="space-y-2">
                    {product.variants.map((variant) => {
                        const rng = (allVariantPriceRanges as Record<string, { min: number; max: number }>)[variant.id];
                        const priceText =
                            !rng || rng.min == null || rng.max == null
                                ? '-'
                                : rng.min === rng.max
                                  ? `${rng.min.toFixed(2)} €`
                                  : `${rng.min.toFixed(2)} € - ${rng.max.toFixed(2)} €`;
                        return (
                            <div
                                key={variant.id}
                                className="flex items-center justify-between p-2 bg-gray-50 rounded"
                            >
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium">
                                        {getDisplayVariantValue(variant, units)}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {isLoadingPrices ? 'Chargement...' : priceText}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </ProductTable.Cell>

            {/* Stock calcule */}
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
} // Composant pour sélectionner les variants

// Removed virtualized components as they are no longer needed

// Simple mobile list
function VirtualizedMobileList({ 
    products, 
    units, 
    allGlobalStocks, 
    allVariantPriceRanges, 
    isLoadingPrices 
}: {
    products: IProduct[];
    units: IUnit[];
    allGlobalStocks?: Record<string, number>;
    allVariantPriceRanges: Record<string, { min: number; max: number }>;
    isLoadingPrices: boolean;
}) {

    return (
        <div className="block lg:hidden">
            {products.map((product) => (
                <ProductMobileCard
                    key={product.id}
                    product={product}
                    units={units}
                    allGlobalStocks={allGlobalStocks}
                    allVariantPriceRanges={allVariantPriceRanges}
                    isLoadingPrices={isLoadingPrices}
                />
            ))}
        </div>
    );
}

// Simple desktop list
function VirtualizedDesktopList({ 
    products, 
    units, 
    allGlobalStocks, 
    allVariantPriceRanges, 
    isLoadingPrices 
}: {
    products: IProduct[];
    units: IUnit[];
    allGlobalStocks?: Record<string, number>;
    allVariantPriceRanges: Record<string, { min: number; max: number }>;
    isLoadingPrices: boolean;
}) {

    return (
        <div className="hidden lg:block bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="overflow-x-auto">
                <ProductTable>
                    <ProductTable.Header>
                        <ProductTable.HeaderRow>
                            <ProductTable.HeaderCell>Produit</ProductTable.HeaderCell>
                            <ProductTable.HeaderCell>Variants</ProductTable.HeaderCell>
                            <ProductTable.HeaderCell>Stock calcule</ProductTable.HeaderCell>
                            <ProductTable.HeaderCell>Stock global</ProductTable.HeaderCell>
                            <ProductTable.HeaderCell>Actions</ProductTable.HeaderCell>
                            <ProductTable.HeaderCell>TVA</ProductTable.HeaderCell>
                            <ProductTable.HeaderCell>Description livraison</ProductTable.HeaderCell>
                        </ProductTable.HeaderRow>
                    </ProductTable.Header>
                </ProductTable>
                <ProductTable>
                    <ProductTable.Body>
                        {products.map((product) => (
                            <ProductRowWithGlobalStock
                                key={product.id}
                                product={product}
                                units={units}
                                allGlobalStocks={allGlobalStocks}
                                allVariantPriceRanges={allVariantPriceRanges}
                                isLoadingPrices={isLoadingPrices}
                            />
                        ))}
                    </ProductTable.Body>
                </ProductTable>
            </div>
        </div>
    );
}

// Composant pour la section des produits avec Suspense
function ProductsSection() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [productModalOpen, setProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<IProduct | undefined>();
    const [productEditModalOpen, setProductEditModalOpen] = useState(false);
    const [editingProductForEdit, setEditingProductForEdit] = useState<IProduct | undefined>();
    const queryClient = useQueryClient();
    const { setProductsLoaded } = useProductsLoading();
    
    // 1. PRIORITÉ MAXIMALE : Chargement des produits
    const { data: products, isLoading: isProductsLoading } = useProductQuery();
    const typedProducts = useMemo(() => products || [], [products]);
    
    // Signaler que les produits sont chargés
    useEffect(() => {
        if (!isProductsLoading && products) {
            setProductsLoaded(true);
        }
    }, [isProductsLoading, products, setProductsLoaded]);

    // Handlers optimisés avec useCallback
    const handleSearchChange = useCallback((value: string) => {
        setSearchTerm(value);
    }, []);

    const handleCategoryChange = useCallback((value: string) => {
        setSelectedCategory(value);
    }, []);

    const handleCreateProduct = useCallback(() => {
        setEditingProduct(undefined);
        setProductModalOpen(true);
    }, []);

    // 2. PRIORITÉ HAUTE : Unités (en parallèle avec les produits car nécessaires pour l'affichage)
    const { data: units = [] } = useQuery({
        queryKey: ['units'],
        queryFn: () => backendFetchService.getAllUnits(),
        staleTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        meta: { priority: 'high' },
    });

    const { error: taxRatesError } = useTaxRates();

    // 3. PRIORITÉ MOYENNE : Stocks globaux (chargement automatique avec les produits)
    const { data: allGlobalStocks } = useAllProductsGlobalStock({
        products: typedProducts,
        enabled: !isProductsLoading && typedProducts.length > 0,
    });

    // 4. PRIORITÉ BASSE : Prix (chargement automatique après les stocks)
    const { data: allVariantPriceRanges = {}, isLoading: isLoadingPrices } = useAllVariantsPriceRanges({
        enabled: !isProductsLoading && typedProducts.length > 0 && !!allGlobalStocks,
    });

    const { mutate: createProductsFromAirtable, isPending: isCreatingProducts } = useMutation({
        mutationFn: async () => {
            await backendFetchService.createProductsFromAirtable();
        },
        onSuccess: () => {
            // Invalider toutes les requêtes liées aux produits de manière cohérente
            invalidateAllProductQueries(queryClient);
        },
        onError: (error) => {
            console.error('Failed to import products from Airtable:', error);
            alert('Erreur lors de la récupération des produits depuis Airtable');
        },
    });

    const handleCreateFromAirtable = useCallback(() => {
        const confirmed = window.confirm(
            'Voulez-vous vraiment récupérer les produits depuis Airtable ?',
        );
        if (confirmed) {
            createProductsFromAirtable();
        }
    }, [createProductsFromAirtable]);

    const handleRefreshCache = useCallback(() => {
        invalidateAllProductQueries(queryClient);
        alert('Cache invalidé ! Les données vont se rafraîchir automatiquement.');
    }, [queryClient]);

    // Extraire toutes les catégories uniques avec useMemo
    const allCategories = useMemo(() => {
        return Array.from(
            new Set(
                typedProducts.map((product) => product.category).filter((category): category is string => Boolean(category)),
            ),
        );
    }, [typedProducts]);

    // Filtrer d'abord par terme de recherche avec le hook
    const searchFilteredProducts = useFilteredProducts(typedProducts, searchTerm, {
        includeVariants: true,
    });

    // Puis filtrer par catégorie avec useMemo
    const filteredProductsList = useMemo(() => {
        return selectedCategory === ''
            ? searchFilteredProducts
            : searchFilteredProducts.filter((product) => product.category === selectedCategory);
    }, [searchFilteredProducts, selectedCategory]);

    // Suspense gère automatiquement les états de chargement
    // Attendre que les stocks globaux soient disponibles pour éviter les requêtes individuelles
    if (!allGlobalStocks) {
        return (
            <div className="flex-1 flex justify-center items-center">
                <p className="text-lg">Chargement stocks...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <ErrorBanner message={taxRatesError?.message || ''} />

            {/* Barre d'outils principale */}
            <div className=" p-6">
                <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                    {/* Section de recherche et filtres - Desktop: tous ensemble, Mobile: séparés */}
                    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center flex-1">
                        {/* Barre de recherche - visible sur desktop seulement dans cette section */}
                        <div className="hidden lg:block lg:min-w-[300px]">
                            <SearchBarNext
                                placeholder="Rechercher un produit..."
                                value={searchTerm}
                                onSearch={handleSearchChange}
                            />
                        </div>
                        {/* Filtres - toujours visibles */}
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
                            <div className="w-full sm:w-auto sm:min-w-[200px]">
                                <Dropdown
                                    options={[
                                        { value: '', label: 'Toutes les catégories' },
                                        ...allCategories.map((category) => ({ value: category, label: category })),
                                    ]}
                                    value={selectedCategory}
                                    placeholder="Filtrer par catégorie"
                                    onSelect={handleCategoryChange}
                                    variant="settings"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section actions */}
                    <div className="flex gap-3 w-full sm:w-auto">
                        <div className="relative">
                            <ActionDropdown
                                placeholder="Actions"
                                className="min-w-[200px] flex-1 sm:flex-none"
                                actions={[
                                    {
                                        id: 'create-product',
                                        label: 'Créer un produit',
                                        onClick: handleCreateProduct,
                                    },
                                    {
                                        id: 'create-from-airtable',
                                        label: isCreatingProducts ? 'Création...' : 'Créer depuis Airtable',
                                        disabled: isCreatingProducts,
                                        onClick: handleCreateFromAirtable,
                                    },
                                    {
                                        id: 'manage-panyen',
                                        label: 'Gérer les panyen',
                                        onClick: () => (window.location.href = '/admin/panyen'),
                                    },
                                    {
                                        id: 'validate-stock',
                                        label: 'Validation des stocks',
                                        icon: (
                                            <svg
                                                className="w-4 h-4 text-green-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                        ),
                                        onClick: () => (window.location.href = '/admin/stock-validation'),
                                    },
                                    {
                                        id: 'refresh-cache',
                                        label: 'Actualiser Cache',
                                        onClick: handleRefreshCache,
                                    },
                                ]}
                            />

                        </div>
                    </div>
                </div>
            </div>

            {/* Les alertes sont maintenant gérées dans SecondaryComponents */}

            {/* Barre de recherche mobile - positionnée juste au-dessus du contenu */}
            <div className="block lg:hidden px-6">
                <SearchBarNext
                            placeholder="Rechercher un produit..."
                            value={searchTerm}
                            onSearch={handleSearchChange}
                        />
            </div>

            {/* Affichage responsive : cartes mobiles et tableau desktop avec virtualisation */}

            {/* Version mobile : cartes empilées virtualisées */}
            <VirtualizedMobileList
                products={filteredProductsList}
                units={units}
                allGlobalStocks={allGlobalStocks}
                allVariantPriceRanges={allVariantPriceRanges as Record<string, { min: number; max: number }>}
                isLoadingPrices={!!isLoadingPrices}
            />

            {/* Version desktop : tableau virtualisé */}
            <VirtualizedDesktopList
                products={filteredProductsList}
                units={units}
                allGlobalStocks={allGlobalStocks}
                allVariantPriceRanges={allVariantPriceRanges as Record<string, { min: number; max: number }>}
                isLoadingPrices={!!isLoadingPrices}
            />

            {/* Modales - lazy loaded */}
            <Suspense fallback={null}>
                <LazyProductModal
                    isOpen={productModalOpen}
                    onClose={() => {
                        setProductModalOpen(false);
                        setEditingProduct(undefined);
                    }}
                    onSave={(product) => {
                        console.log('Produit créé:', product);
                        // Le modal se fermera automatiquement après la création
                    }}
                    product={editingProduct}
                />
            </Suspense>

            {editingProductForEdit && (
                <Suspense fallback={null}>
                    <LazyProductEditModal
                        product={editingProductForEdit}
                        isOpen={productEditModalOpen}
                        onClose={() => {
                            setProductEditModalOpen(false);
                            setEditingProductForEdit(undefined);
                        }}
                    />
                </Suspense>
            )}
        </div>
    );
}

// Composant pour les éléments secondaires (alertes, etc.)
function SecondaryComponents() {
    const { areProductsLoaded } = useProductsLoading();
    
    return (
        <div className="space-y-4">
            {/* Alerte globale pour les validations de stock en attente - lazy loaded */}
            <Suspense fallback={<div className="h-4"></div>}>
                <LazyAlertsContainer 
                    delayMs={1000} 
                    productsLoaded={areProductsLoaded}
                />
            </Suspense>
        </div>
    );
}

// Nouveau composant principal qui combine tout
function StockManagementPageContent() {
    return (
        <div className="space-y-8">
            {/* Composants secondaires (annonce) juste après le header */}
            <Suspense fallback={null}>
                <SecondaryComponents />
            </Suspense>

            {/* Section principale des produits avec Suspense prioritaire */}
            <Suspense fallback={
                <div className="flex-1 flex justify-center items-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-lg text-gray-600">Chargement des produits...</p>
                    </div>
                </div>
            }>
                <ProductsSection />
            </Suspense>
        </div>
    );
}

function StockManagementPage() {
    return (
        <TaxRatesProvider>
            <div className="min-h-screen ">
                <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* En-tête de la page */}
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

// Prefetch des produits côté serveur pour un chargement instantané
export async function getServerSideProps(context: GetServerSidePropsContext) {
    const queryClient = new QueryClient();
    
    try {
        // Construction de l'URL absolue pour les appels SSR
        const proto = (context.req.headers['x-forwarded-proto'] as string) || 'http';
        const host = context.req.headers.host as string;
        const baseUrl = `${proto}://${host}`;
        
        // Fonction helper pour les appels fetch SSR-safe
        const fetchJson = async (body: unknown) => {
            const res = await fetch(`${baseUrl}/api/_fetch`, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
            return res.json();
        };
        
        // Précharger les produits avec URL absolue
        const products = await queryClient.fetchQuery({
            queryKey: ['products'],
            queryFn: () => fetchJson({ functionToRun: 'getAllProductsWithStock', params: [] }),
            staleTime: 5 * 60 * 1000, // 5 minutes
        });
        
        // Précharger aussi les unités avec URL absolue
        await queryClient.prefetchQuery({
            queryKey: ['units'],
            queryFn: () => fetchJson({ functionToRun: 'getAllUnits', params: [] }),
            staleTime: 10 * 60 * 1000, // 10 minutes
        });

        // Précharger les stocks globaux si on a des produits
        if (products && Array.isArray(products) && products.length > 0) {
            const productIds = products.map((p: IProduct) => p.id).sort();
            await queryClient.prefetchQuery({
                queryKey: ['all-products-global-stock', productIds],
                queryFn: () => fetchJson({ functionToRun: 'getAllProductsGlobalStock', params: [productIds] }),
                staleTime: 30000, // 30 secondes
            });
        }

        // Précharger les ranges de prix des variantes
        await queryClient.prefetchQuery({
            queryKey: ['all-variants-price-ranges'],
            queryFn: () => fetchJson({ functionToRun: 'getAllVariantsPriceRanges', params: [] }),
            staleTime: 5 * 60 * 1000, // 5 minutes
        });
    } catch (error) {
        console.error('Erreur lors du prefetch SSR:', error);
        // En cas d'erreur, on continue sans prefetch
    }
    
    return {
        props: {
            dehydratedState: dehydrate(queryClient),
        },
    };
}

export default StockManagementPage;
