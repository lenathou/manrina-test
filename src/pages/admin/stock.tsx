import { ErrorBanner } from '@/components/common/ErrorBanner';
import { TaxRatesProvider, useTaxRates } from '@/contexts/TaxRatesContext';
import { useProductQuery } from '@/hooks/useProductQuery';
import { IProduct } from '@/server/product/IProduct';
import { backendFetchService } from '@/service/BackendFetchService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { withAdminLayout } from '@/components/layouts/AdminLayout';
import { ProductModal } from '@/components/admin/stock/ProductModal';
import { ProductEditModal } from '@/components/admin/stock/ProductEditModal';
import { Text } from '@/components/ui/Text';
import { STOCK_GET_ALL_PRODUCTS_QUERY_KEY } from '@/components/admin/stock.config';
import { GrowerPricesModal } from '@/components/admin/GrowerPricesModal';
import { StockTabs } from '@/components/admin/stock/StockTabs';


// Composant pour afficher le stock calculé d'un variant (lecture seule)

// Fonction utilitaire pour l'affichage du variant

// Composant pour sélectionner les variants

function StockManagementPageContent() {
    const [productModalOpen, setProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<IProduct | undefined>();
    const [productEditModalOpen, setProductEditModalOpen] = useState(false);
    const [editingProductForEdit, setEditingProductForEdit] = useState<IProduct | undefined>();
    const [growerPricesModalOpen, setGrowerPricesModalOpen] = useState(false);
    const [selectedProductForPrices, setSelectedProductForPrices] = useState<IProduct | undefined>();
    const queryClient = useQueryClient();

    const handleOpenPricesModal = (product: IProduct) => {
        setSelectedProductForPrices(product);
        setGrowerPricesModalOpen(true);
    };

    const handleClosePricesModal = () => {
        setGrowerPricesModalOpen(false);
        setSelectedProductForPrices(undefined);
    };
    
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
            queryClient.invalidateQueries({ queryKey: STOCK_GET_ALL_PRODUCTS_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: ['products_with_stock'] });
            alert('Produits créés depuis Airtable avec succès !');
        },
        onError: (error) => {
            console.error('Failed to import products from Airtable:', error);
            alert('Erreur lors de la récupération des produits depuis Airtable');
        },
    });

    const handleCreateFromAirtable = () => {
        const confirmed = window.confirm(
            'Voulez-vous vraiment récupérer les produits depuis Airtable ?',
        );
        if (confirmed) {
            createProductsFromAirtable();
        }
    };

    const handleManagePanyen = () => {
        window.location.href = '/admin/panyen';
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex justify-center items-center">
                <p className="text-lg">Loading...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 bg-white">
            <ErrorBanner message={taxRatesError?.message || ''} />
            
            <StockTabs 
                products={products}
                units={units}
                onCreateProduct={() => setProductModalOpen(true)}
                onCreateFromAirtable={handleCreateFromAirtable}
                onManagePanyen={handleManagePanyen}
                onInvalidateCache={() => {
                    queryClient.invalidateQueries({ queryKey: STOCK_GET_ALL_PRODUCTS_QUERY_KEY });
                    queryClient.invalidateQueries({ queryKey: ['products_with_stock'] });
                    queryClient.invalidateQueries({ queryKey: ['products'] });
                    queryClient.invalidateQueries({ queryKey: ['calculateGlobalStock'] });
                }}
                onEditProduct={(product) => {
                    setEditingProductForEdit(product);
                    setProductEditModalOpen(true);
                }}
                onOpenPricesModal={handleOpenPricesModal}
                isCreatingProducts={isCreatingProducts}
            />

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
            
            {selectedProductForPrices && (
                <GrowerPricesModal
                    isOpen={growerPricesModalOpen}
                    onClose={handleClosePricesModal}
                    productId={selectedProductForPrices.id}
                    productName={selectedProductForPrices.name}
                    isAdminMode={true}
                />
            )}
        </div>
    );
}

function StockManagementPage() {
    return (
        <TaxRatesProvider>
            <div className="space-y-6">
                {/* En-tête de la page */}
                <div className=" rounded-lg shadow p-6 bg-white">
                    <Text
                        variant="h2"
                        className="font-secondary font-bold text-2xl sm:text-3xl text-[var(--color-secondary)] mb-4"
                    >
                        Gestion du stock
                    </Text>
                    <p className="text-base sm:text-lg text-[var(--muted-foreground)]">
                        Gérez les produits, leurs variantes, les stocks et les prix de votre magasin.
                    </p>
                </div>
                <StockManagementPageContent />
            </div>
        </TaxRatesProvider>
    );
}

export default withAdminLayout(StockManagementPage);
