import { ShowDescriptionOnPrintDeliveryEditor } from '@/components/admin/ShowDescriptionOnPrintDeliveryEditorProps';
import { ShowInStoreBadge } from '@/components/admin/ShowInStoreBadge';
import { VatRateEditor } from '@/components/admin/VatRateEditor';
import { AppButton } from '@/components/button';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { AppImage } from '@/components/Image';
import { UpdateQuantityButtons } from '@/components/products/BasketItem';
import { SearchBar } from '@/components/products/SearchBar';
import { ProductTable } from '@/components/products/Table';
import { TaxRatesProvider, useTaxRates } from '@/contexts/TaxRatesContext';
import { useFilteredProducts } from '@/hooks/useFilteredProducts';
import { useProductQuery } from '@/hooks/useProductQuery';
import { IProduct, IProductVariant, IUnit } from '@/server/product/IProduct';
import { backendFetchService } from '@/service/BackendFetchService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useDebounce } from 'react-use';
import { UnitQuantityEditor } from '../../components/admin/UnitQuantityEditor';
import { withAdminLayout } from '@/components/layouts/AdminLayout';
import { ProductModal } from '@/components/admin/ProductModal';
import { ProductEditModal } from '@/components/admin/ProductEditModal';

function StockEditor({ variant }: { variant: IProduct['variants'][0] }) {
  const [inputValue, setInputValue] = useState(variant.stock.toString());
  const queryClient = useQueryClient();

  const inputValueNumber = parseInt(inputValue);

  const { mutate: updateStock, isPending: updating } = useMutation({
    mutationFn: async (newStock: number) => {
      if (newStock < 0) return variant.stock;

      await backendFetchService.adjustStock({
        variantId: variant.id,
        newStock,
        reason: 'Manual adjustment',
        adjustedBy: 'admin',
      });
      return newStock;
    },
    onSuccess: (newStock) => {
      queryClient.setQueryData<IProduct[]>(['products'], (oldProducts) => {
        if (!oldProducts) return oldProducts;
        return oldProducts.map((product) => ({
          ...product,
          variants: product.variants.map((v) =>
            v.id === variant.id ? { ...v, stock: newStock } : v
          ),
        }));
      });
    },
    onError: () => {
      setInputValue(variant.stock.toString());
      alert('Failed to update stock');
    },
  });

  const handleStockChange = (newValue: string) => {
    setInputValue(newValue);
  };

  const handleQuantityChange = (newQuantity: number) => {
    setInputValue(newQuantity.toString());
    updateStock(newQuantity);
  };

  useDebounce(() => {
    const numValue = parseInt(inputValue);
    if (!isNaN(numValue) && numValue !== variant.stock) {
      updateStock(numValue);
    }
  }, 300, [inputValue]);

  return (
    <div className="flex items-center">
      <UpdateQuantityButtons
        increment={() =>
          handleStockChange(Math.max(0, inputValueNumber + 1).toString())
        }
        decrement={() =>
          handleStockChange(Math.max(0, inputValueNumber - 1).toString())
        }
        quantity={inputValueNumber}
        disabled={updating}
        centerEditing={true}
        onQuantityChange={handleQuantityChange}
      />
    </div>
  );
}

// Fonction utilitaire pour l'affichage du variant
function getDisplayVariantValue(variant: IProductVariant, units: IUnit[]) {
  if (variant.quantity && variant.unitId) {
    const unit = units.find((u) => u.id === variant.unitId);
    return `${variant.quantity} ${unit?.symbol || 'unité'}`;
  }
  return variant.optionValue;
}

// Composant pour sélectionner les variants
function VariantSelector({ 
  product, 
  selectedVariantId, 
  onVariantSelect, 
  units 
}: { 
  product: IProduct; 
  selectedVariantId: string; 
  onVariantSelect: (variantId: string) => void;
  units: IUnit[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedVariant = product.variants.find(v => v.id === selectedVariantId) || product.variants[0];
  
  if (product.variants.length <= 1) {
    return (
      <span className="text-sm text-gray-700">
        {getDisplayVariantValue(selectedVariant, units)}
      </span>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-700">
          {getDisplayVariantValue(selectedVariant, units)}
        </span>
        <div className="text-xs text-gray-400">
          + {product.variants.length - 1} autre(s)
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 rounded-lg bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-all duration-200 transform active:scale-95"
          aria-label="Afficher/masquer les variants"
        >
          <svg
            className={`w-4 h-4 transition-all duration-300 ease-in-out ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48">
          {product.variants.map((variant) => (
            <button
              key={variant.id}
              onClick={() => {
                onVariantSelect(variant.id);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                variant.id === selectedVariantId ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
              }`}
            >
              <div className="font-medium">{getDisplayVariantValue(variant, units)}</div>
              <div className="text-xs text-gray-500">{variant.price}€</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function StockManagementPageContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<IProduct | undefined>();
  const [productEditModalOpen, setProductEditModalOpen] = useState(false);
  const [editingProductForEdit, setEditingProductForEdit] = useState<IProduct | undefined>();
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
      window.location.reload();
    },
    onError: (error) => {
      console.error('Failed to import products from Airtable:', error);
      alert('Erreur lors de la récupération des produits depuis Airtable');
    },
  });

  const filteredProductsList = useFilteredProducts(products, searchTerm, {
    includeVariants: true,
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 bg-[#F7F0EA]">
      <ErrorBanner message={taxRatesError?.message || ''} />
      <AppButton
        label={isCreatingProducts ? 'Récupération en cours...' : 'Récupérer les produits depuis Airtable'}
        action={() => {
          const confirmed = window.confirm('Voulez-vous vraiment récupérer les produits depuis Airtable ?');
          if (confirmed) {
            createProductsFromAirtable();
          }
        }}
        loading={isCreatingProducts}
        disable={isCreatingProducts}
      />
      <div className="flex-1 bg-white rounded-lg p-6 max-w-7xl mx-auto mt-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Products Stock Management</h1>
          <div className="flex space-x-3">
            <AppButton
              label="Gérer les panyen"
              action={() => window.location.href = '/admin/panyen'}
            />
            <AppButton
              label="Créer nouveau produit"
              action={() => {
                setEditingProduct(undefined);
                setProductModalOpen(true);
              }}
            />
          </div>
        </div>
        <SearchBar initialValue={searchTerm} onSearch={setSearchTerm} />

        <div className="overflow-x-auto mt-6">
          <ProductTable>
            <ProductTable.Header>
              <ProductTable.HeaderRow>
                <ProductTable.HeaderCell>Product</ProductTable.HeaderCell>
                <ProductTable.HeaderCell>Variant</ProductTable.HeaderCell>
                <ProductTable.HeaderCell>Price</ProductTable.HeaderCell>
                <ProductTable.HeaderCell>Stock</ProductTable.HeaderCell>
                <ProductTable.HeaderCell>VAT Rate</ProductTable.HeaderCell>
                <ProductTable.HeaderCell className="text-center">Status</ProductTable.HeaderCell>
                <ProductTable.HeaderCell>Unité/Quantité</ProductTable.HeaderCell>
                <ProductTable.HeaderCell>Actions</ProductTable.HeaderCell>
              </ProductTable.HeaderRow>
            </ProductTable.Header>
            <ProductTable.Body>
              {filteredProductsList.map((product) => {
                // Utiliser le variant sélectionné ou le premier par défaut
                const selectedVariantId = selectedVariants[product.id] || product.variants[0]?.id;
                const selectedVariant = product.variants.find(v => v.id === selectedVariantId) || product.variants[0];
                if (!selectedVariant) return null;
                
                return (
                  <ProductTable.Row
                    key={`${product.id}-${selectedVariant.id}`}
                    // Retirer className={!product.showInStore ? 'opacity-50' : ''}
                    >
                    <ProductTable.Cell>
                      <div className={`flex items-center space-x-3 ${!product.showInStore ? 'opacity-50' : ''}`}>
                        <AppImage
                          source={product.imageUrl}
                          style={{ width: 50, height: 50, borderRadius: 4 }}
                          alt={product.name}
                        />
                        <div>
                          <button
                            onClick={() => {
                              setEditingProductForEdit(product);
                              setProductEditModalOpen(true);
                            }}
                            className="font-medium text-gray-900 hover:text-primary hover:underline cursor-pointer text-left transition-colors"
                          >
                            {product.name}
                          </button>
                          {product.variants.length > 1 && (
                            <div className="text-xs text-gray-500">
                              {product.variants.length} variants
                            </div>
                          )}
                        </div>
                      </div>
                    </ProductTable.Cell>

                    <ProductTable.Cell>
                      {/* Le VariantSelector reste toujours fonctionnel */}
                      <VariantSelector
                        product={product}
                        selectedVariantId={selectedVariantId}
                        onVariantSelect={(variantId) => {
                          setSelectedVariants(prev => ({
                            ...prev,
                            [product.id]: variantId
                          }));
                        }}
                        units={units}
                      />
                    </ProductTable.Cell>

                    <ProductTable.Cell>
                      <span className={`font-medium text-gray-900 ${!product.showInStore ? 'opacity-50' : ''}`}>
                        {selectedVariant.price}€
                      </span>
                    </ProductTable.Cell>

                    <ProductTable.Cell className={!product.showInStore ? 'opacity-50' : ''}>
                      <StockEditor variant={selectedVariant} />
                    </ProductTable.Cell>

                    <ProductTable.Cell className={!product.showInStore ? 'opacity-50' : ''}>
                      <VatRateEditor variant={selectedVariant} />
                    </ProductTable.Cell>

                    <ProductTable.Cell className="text-center">
                      <ShowInStoreBadge product={product} />
                    </ProductTable.Cell>

                    <ProductTable.Cell>
                      {/* UnitQuantityEditor reste fonctionnel comme avant */}
                      <UnitQuantityEditor 
                        variant={selectedVariant} 
                        productName={product.name}
                        productId={product.id}
                        allVariants={product.variants}
                      />
                    </ProductTable.Cell>

                    <ProductTable.Cell className={!product.showInStore ? 'opacity-50' : ''}>
                      <ShowDescriptionOnPrintDeliveryEditor variant={selectedVariant} />
                    </ProductTable.Cell>
                  </ProductTable.Row>
                );
              })}
            </ProductTable.Body>
          </ProductTable>
        </div>
      </div>
      
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
      <StockManagementPageContent />
    </TaxRatesProvider>
  );
}

export default withAdminLayout(StockManagementPage);
