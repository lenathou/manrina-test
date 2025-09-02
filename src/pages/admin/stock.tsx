import { ShowDescriptionOnPrintDeliveryEditor } from '@/components/admin/ShowDescriptionOnPrintDeliveryEditorProps';
import { ShowInStoreBadge } from '@/components/admin/ShowInStoreBadge';
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
import { useState } from 'react';
import { UnitQuantityEditor } from '../../components/admin/stock/UnitQuantityEditor';

import { ProductModal } from '@/components/admin/stock/ProductModal';
import { ProductEditModal } from '@/components/admin/stock/ProductEditModal';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { GlobalStockModal } from '@/components/admin/stock/GlobalStockModal';
import { VariantCalculatedStock } from '@/components/admin/stock/VariantCalculatedStock';
import { STOCK_GET_ALL_PRODUCTS_QUERY_KEY } from '@/components/admin/stock.config';
import { GrowerPricesModal } from '@/components/admin/GrowerPricesModal';
import { SearchBarNext } from '@/components/ui/SearchBarNext';

function GrowerPricesButton({ product }: { product: IProduct }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <div className="flex flex-col items-center space-y-1">
                <Button
                    onClick={() => setIsModalOpen(true)}
                    variant="secondary"
                    className="px-3 py-1 text-sm"
                >
                    Prix producteurs
                </Button>
            </div>
            <GrowerPricesModal
                productId={product.id}
                productName={product.name}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                isAdminMode={true}
            />
        </>
    );
}

function GlobalStockButton({ product }: { product: IProduct }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const queryClient = useQueryClient();
    
    const baseUnit = product.baseUnit;
    const displayUnit = baseUnit ? `${baseUnit.symbol}` : 'unités';

    const updateGlobalStockMutation = useMutation({
        mutationFn: async ({ globalStock, unitId }: { globalStock: number; unitId: string }) => {
            return await backendFetchService.updateProduct(product.id, {
                globalStock,
                baseUnitId: unitId
            });
        },
        onMutate: () => {
            setIsUpdating(true);
        },
        onSuccess: () => {
            // Invalider les requêtes de manière optimisée pour éviter les re-renders complets
            queryClient.invalidateQueries({ 
                queryKey: STOCK_GET_ALL_PRODUCTS_QUERY_KEY,
                refetchType: 'none' // Évite le refetch immédiat
            });
            queryClient.invalidateQueries({ 
                queryKey: ['products_with_stock'],
                refetchType: 'none'
            });
            queryClient.invalidateQueries({ 
                queryKey: ['calculateGlobalStock', product.id],
                refetchType: 'none'
            });
            
            // Refetch de manière différée pour éviter le saut de page
            setTimeout(() => {
                queryClient.refetchQueries({ queryKey: STOCK_GET_ALL_PRODUCTS_QUERY_KEY });
                queryClient.refetchQueries({ queryKey: ['products_with_stock'] });
                queryClient.refetchQueries({ queryKey: ['calculateGlobalStock', product.id] });
            }, 200);
            
            setIsUpdating(false);
        },
        onError: (error) => {
            console.error('Erreur lors de la mise à jour du stock global:', error);
            setIsUpdating(false);
        }
    });

    const handleSave = (globalStock: number, unitId: string) => {
        updateGlobalStockMutation.mutate({ globalStock, unitId });
        setIsModalOpen(false);
    };

    return (
        <>
            <div className="flex flex-col items-center space-y-1">
                <Button
                    onClick={() => setIsModalOpen(true)}
                    variant="secondary"
                    className="px-3 py-1 text-sm"
                >
                    {product.globalStock || 0}
                </Button>
                <div className="text-xs text-gray-500">
                    {displayUnit}
                </div>
            </div>
            <GlobalStockModal
                product={product}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                isLoading={isUpdating}
            />
        </>
    );
}

// Composant pour afficher le stock calculé d'un variant (lecture seule)

// Fonction utilitaire pour l'affichage du variant
function getDisplayVariantValue(variant: IProductVariant, units: IUnit[]) {
    if (variant.quantity && variant.unitId) {
        const unit = units.find((u) => u.id === variant.unitId);
        return `${variant.quantity} ${unit?.symbol || 'unité'}`;
    }
    return variant.optionValue;
}

// Composant pour sélectionner les variants

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

    const { data: units = [] } = useQuery({
        queryKey: ['units'],
        queryFn: () => backendFetchService.getAllUnits(),
    });

    const { mutate: createProductsFromAirtable, isPending: isCreatingProducts } = useMutation({
        mutationFn: async () => {
            await backendFetchService.createProductsFromAirtable();
        },
        onSuccess: () => {
            // Invalider les requêtes pour rafraîchir les données sans recharger la page
            queryClient.invalidateQueries({ queryKey: STOCK_GET_ALL_PRODUCTS_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: ['products_with_stock'] });
        },
        onError: (error) => {
            console.error('Failed to import products from Airtable:', error);
            alert('Erreur lors de la récupération des produits depuis Airtable');
        },
    });

    // Extraire toutes les catégories uniques
    const allCategories = Array.from(
        new Set(
            products.map((product) => product.category).filter((category): category is string => Boolean(category)),
        ),
    );

    // Filtrer d'abord par terme de recherche
    const searchFilteredProducts = useFilteredProducts(products, searchTerm, {
        includeVariants: true,
    });

    // Puis filtrer par catégorie
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
                                    ...allCategories.map(category => ({ value: category, label: category }))
                                ]}
                                value={selectedCategory}
                                placeholder="Filtre par catégorie"
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
                                    label: 'Créer un produit',
                                    onClick: () => {
                                        setEditingProduct(undefined);
                                        setProductModalOpen(true);
                                    }
                                },
                                {
                                    id: 'create-from-airtable',
                                    label: isCreatingProducts ? 'Création...' : 'Créer depuis Airtable',
                                    disabled: isCreatingProducts,
                                    onClick: () => {
                                        const confirmed = window.confirm(
                                            'Voulez-vous vraiment récupérer les produits depuis Airtable ?',
                                        );
                                        if (confirmed) {
                                            createProductsFromAirtable();
                                        }
                                    }
                                },
                                {
                                    id: 'manage-panyen',
                                    label: 'Gérer les panyen',
                                    onClick: () => (window.location.href = '/admin/panyen')
                                },
                                {
                                    id: 'refresh-cache',
                                    label: 'Actualiser Cache',
                                    onClick: () => {
                                        // Invalider tous les caches liés aux produits
                                        queryClient.invalidateQueries({ queryKey: STOCK_GET_ALL_PRODUCTS_QUERY_KEY });
                                        queryClient.invalidateQueries({ queryKey: ['products'] });
                                        queryClient.invalidateQueries({ queryKey: ['products_with_stock'] });
                                        queryClient.invalidateQueries({ queryKey: ['calculateGlobalStock'] });
                                        // Afficher un message de confirmation
                                        alert('Cache invalidé ! Les données vont se rafraîchir automatiquement.');
                                    }
                                }
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
                                <ProductTable.HeaderCell>Stock Global</ProductTable.HeaderCell>
                                <ProductTable.HeaderCell>Prix producteurs</ProductTable.HeaderCell>
                                <ProductTable.HeaderCell>TVA</ProductTable.HeaderCell>
                                <ProductTable.HeaderCell className="text-center">Status</ProductTable.HeaderCell>
                                <ProductTable.HeaderCell>Unité/Quantité</ProductTable.HeaderCell>
                                <ProductTable.HeaderCell>Actions</ProductTable.HeaderCell>
                            </ProductTable.HeaderRow>
                        </ProductTable.Header>
                        <ProductTable.Body>
                            {filteredProductsList.map((product) => {
                                if (!product.variants || product.variants.length === 0) return null;

                                return (
                                    <ProductTable.Row
                                        key={product.id}
                                        className={!product.showInStore ? 'opacity-50' : ''}
                                    >
                                        <ProductTable.Cell>
                                            <div className="flex items-center space-x-3">
                                                <AppImage
                                                    source={product.imageUrl}
                                                    style={{ width: 50, height: 50, borderRadius: 4 }}
                                                    alt={product.name}
                                                />
                                                <div>
                                                    <Button
                                                        onClick={() => {
                                                            setEditingProductForEdit(product);
                                                            setProductEditModalOpen(true);
                                                        }}
                                                        className="font-medium text-gray-900 hover:text-primary hover:underline cursor-pointer text-left transition-colors p-0 bg-transparent"
                                                        variant="secondary"
                                                    >
                                                        {product.name}
                                                    </Button>
                                                    <div className="text-xs text-gray-500">
                                                        {product.variants.length} variant{product.variants.length > 1 ? 's' : ''}
                                                    </div>
                                                </div>
                                            </div>
                                        </ProductTable.Cell>

                                        <ProductTable.Cell>
                                            <div className="space-y-2">
                                                {product.variants.map((variant) => {
                                                    return (
                                                        <div key={variant.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-medium">
                                                                    {getDisplayVariantValue(variant, units)}
                                                                </span>
                                                                <span className="text-xs text-gray-500">
                                                                    {variant.price}€
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </ProductTable.Cell>

                                        <ProductTable.Cell>
                                            <div className="space-y-2">
                                                {product.variants.map((variant) => (
                                                    <VariantCalculatedStock 
                                                        key={variant.id} 
                                                        variant={variant} 
                                                        product={product} 
                                                        units={units}
                                                    />
                                                ))}
                                            </div>
                                        </ProductTable.Cell>

                                        <ProductTable.Cell>
                                            <GlobalStockButton product={product} />
                                        </ProductTable.Cell>

                                        <ProductTable.Cell>
                                            <GrowerPricesButton product={product} />
                                        </ProductTable.Cell>

                                        <ProductTable.Cell>
                                            <div className="space-y-2">
                                                {product.variants.map((variant) => (
                                                    <div key={variant.id} className="p-1">
                                                        <VatRateEditor variant={variant} />
                                                    </div>
                                                ))}
                                            </div>
                                        </ProductTable.Cell>

                                        <ProductTable.Cell className="text-center">
                                            <ShowInStoreBadge product={product} />
                                        </ProductTable.Cell>

                                        <ProductTable.Cell>
                                            <div className="space-y-2">
                                                {product.variants.map((variant) => (
                                                    <div key={variant.id} className="p-1">
                                                        <UnitQuantityEditor
                                            variant={variant}
                                            productName={product.name}
                                            productId={product.id}
                                            product={product}
                                            allVariants={product.variants}
                                            showInStore={product.showInStore}
                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </ProductTable.Cell>

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
                            })}
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
                    console.log('Produit créé:', product);
                    // Le modal se fermera automatiquement après la création
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
                    {/* En-tête de la page */}
                    <div className="mb-8">
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                            <Text
                                variant="h2"
                                className="font-secondary font-bold text-2xl sm:text-3xl text-[var(--color-secondary)] mb-2"
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