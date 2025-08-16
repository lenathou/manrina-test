/* eslint-disable react/no-unescaped-entities */
import { AppButton } from '@/components/button';
import { AppImage } from '@/components/Image';
import { SearchBar } from '@/components/products/SearchBar';
import { ProductTable } from '@/components/products/Table';
import { useFilteredProducts } from '@/hooks/useFilteredProducts';
import { useProductQuery } from '@/hooks/useProductQuery';
import { IProduct } from '@/server/product/IProduct';
import { IPanyenProduct, IPanyenCreateInput, IPanyenUpdateInput, IPanyenComponent } from '@/server/panyen/IPanyen';
import { backendFetchService } from '@/service/BackendFetchService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { withAdminLayout } from '@/components/layouts/AdminLayout';
import { PanyenShowInStoreBadge } from '@/components/admin/PanyenShowInStoreBadge';



interface PanyenModalProps {
  isOpen: boolean;
  onClose: () => void;
  panyen?: IPanyenProduct;
  onSave: (panyen: Partial<IPanyenProduct>) => void;
}

function PanyenModal({ isOpen, onClose, panyen, onSave }: PanyenModalProps) {
  const [name, setName] = useState(panyen?.name || '');
  const [description, setDescription] = useState(panyen?.description || '');
  const [imageUrl, setImageUrl] = useState(panyen?.imageUrl || '');
  const [price, setPrice] = useState(panyen?.price || 0);
  const [showInStore, setShowInStore] = useState(panyen?.showInStore ?? true);
  const [components, setComponents] = useState<IPanyenComponent[]>(panyen?.components || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [showProductSelector, setShowProductSelector] = useState(false);

  // Mettre à jour les états quand le panyen change
  useEffect(() => {
    if (panyen) {
      setName(panyen.name || '');
      setDescription(panyen.description || '');
      setImageUrl(panyen.imageUrl || '');
      setPrice(panyen.price || 0);
      setShowInStore(panyen.showInStore ?? true);
      setComponents(panyen.components || []);
    } else {
      // Réinitialiser pour un nouveau panyen
      setName('');
      setDescription('');
      setImageUrl('');
      setPrice(0);
      setShowInStore(true);
      setComponents([]);
    }
    setSearchTerm('');
    setShowProductSelector(false);
  }, [panyen]);

  const { data: allProducts = [] } = useProductQuery();
  const filteredProducts = useFilteredProducts(allProducts, searchTerm, { includeVariants: true });

  const handleAddComponent = (product: IProduct, variant: IProduct['variants'][0]) => {
    const newComponent: IPanyenComponent = {
      id: `${product.id}-${variant.id}-${Date.now()}`,
      panyenProductId: panyen?.id || '',
      productId: product.id,
      productVariantId: variant.id,
      quantity: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      product,
      productVariant: variant
    };
    setComponents([...components, newComponent]);
    setShowProductSelector(false);
    setSearchTerm('');
  };

  const handleRemoveComponent = (componentId: string) => {
    setComponents(components.filter(c => c.id !== componentId));
  };

  const handleQuantityChange = (componentId: string, quantity: number) => {
    setComponents(components.map(c => 
      c.id === componentId ? { ...c, quantity: Math.max(1, quantity) } : c
    ));
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert('Le nom du panyen est requis');
      return;
    }
    if (price <= 0) {
      alert('Le prix doit être supérieur à 0');
      return;
    }
    if (components.length === 0) {
      alert('Au moins un composant est requis');
      return;
    }

    onSave({
      name: name.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim(),
      price,
      showInStore,
      components
    });
    // onClose() est maintenant géré par les mutations dans onSuccess
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {panyen ? 'Modifier le panyen' : 'Créer un nouveau panyen'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du panyen *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Panyen légumes de saison"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prix (€) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL de l'image
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visibilité en magasin
              </label>
              <div className="flex items-center space-x-3 mt-3">
                <input
                  type="checkbox"
                  id="showInStore"
                  checked={showInStore}
                  onChange={(e) => setShowInStore(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="showInStore" className="text-sm text-gray-700">
                  Afficher ce panyen dans le magasin
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Description du panyen..."
            />
          </div>

          {/* Composants */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Composants du panyen</h3>
              <AppButton
                label="Ajouter un produit"
                action={() => setShowProductSelector(true)}
              />
            </div>

            {components.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Aucun composant ajouté. Cliquez sur "Ajouter un produit" pour commencer.
              </div>
            ) : (
              <div className="space-y-3">
                {components.map((component) => (
                  <div key={component.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <AppImage
                      source={component.productVariant.imageUrl || component.product.imageUrl}
                      style={{ width: 50, height: 50, borderRadius: 4 }}
                      alt={component.product.name}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{component.product.name}</div>
                      <div className="text-sm text-gray-500">
                        {component.productVariant.optionSet}: {component.productVariant.optionValue}
                      </div>
                      <div className="text-sm text-gray-500">
                        Stock disponible: {component.productVariant.stock}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-700">Quantité:</label>
                      <input
                        type="number"
                        min="1"
                        value={component.quantity}
                        onChange={(e) => handleQuantityChange(component.id, parseInt(e.target.value) || 1)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      onClick={() => handleRemoveComponent(component.id)}
                      className="text-red-500 hover:text-red-700 font-medium"
                    >
                      Supprimer
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sélecteur de produits */}
          {showProductSelector && (
            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Sélectionner un produit</h3>
                <button
                  onClick={() => {
                    setShowProductSelector(false);
                    setSearchTerm('');
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Annuler
                </button>
              </div>
              <SearchBar initialValue={searchTerm} onSearch={setSearchTerm} />
              <div className="mt-4 max-h-60 overflow-y-auto">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="border-b border-gray-200 last:border-b-0">
                    <div className="p-3">
                      <div className="flex items-center space-x-3 mb-2">
                        <AppImage
                          source={product.imageUrl}
                          style={{ width: 40, height: 40, borderRadius: 4 }}
                          alt={product.name}
                        />
                        <div className="font-medium text-gray-900">{product.name}</div>
                      </div>
                      <div className="ml-11 space-y-1">
                        {product.variants.map((variant) => (
                          <button
                            key={variant.id}
                            onClick={() => handleAddComponent(product, variant)}
                            className="block w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded border"
                          >
                            <div className="flex justify-between items-center">
                              <span>
                                {variant.optionSet}: {variant.optionValue} - {variant.price}€
                              </span>
                              <span className="text-gray-500">Stock: {variant.stock}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
          <AppButton
            label="Annuler"
            action={onClose}
          />
          <AppButton
            label={panyen ? 'Modifier' : 'Créer'}
            action={handleSave}
          />
        </div>
      </div>
    </div>
  );
}

function PanyenManagementPageContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPanyen, setEditingPanyen] = useState<IPanyenProduct | undefined>();
  const queryClient = useQueryClient();

  const { data: panyenProducts = [], isLoading } = useQuery({
    queryKey: ['panyen-products'],
    queryFn: async (): Promise<IPanyenProduct[]> => {
      console.log('Récupération de tous les panyen...');
      const result = await backendFetchService.getAllPanyen(true);
      console.log('Panyen récupérés:', result.length, 'éléments:', result);
      return result;
    },
  });

  useProductQuery();

  const createPanyenMutation = useMutation({
    mutationFn: async (panyenData: Partial<IPanyenProduct>) => {
      console.log('Création panyen avec données:', panyenData);
      const result = await backendFetchService.createPanyen(panyenData as IPanyenCreateInput);
      console.log('Panyen créé avec succès:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('onSuccess createPanyen appelé avec:', data);
      queryClient.invalidateQueries({ queryKey: ['panyen-products'] });
      // Invalider aussi le cache du magasin si le nouveau panier est visible
      queryClient.invalidateQueries({ queryKey: ['panyen-store-products'] });
      setModalOpen(false);
      setEditingPanyen(undefined);
    },
    onError: (error) => {
      console.error('Erreur lors de la création du panyen:', error);
      alert('Erreur lors de la création du panyen: ' + (error as Error).message);
    },
  });

  const updatePanyenMutation = useMutation({
    mutationFn: async ({ id, ...panyenData }: Partial<IPanyenProduct> & { id: string }) => {
      console.log('Mise à jour panyen avec ID:', id, 'et données:', panyenData);
      const result = await backendFetchService.updatePanyen(id, panyenData as IPanyenUpdateInput);
      console.log('Panyen mis à jour avec succès:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('onSuccess updatePanyen appelé avec:', data);
      queryClient.invalidateQueries({ queryKey: ['panyen-products'] });
      // Invalider aussi le cache du magasin si les changements affectent la visibilité
      queryClient.invalidateQueries({ queryKey: ['panyen-store-products'] });
      setModalOpen(false);
      setEditingPanyen(undefined);
    },
    onError: (error) => {
      console.error('Erreur lors de la mise à jour du panyen:', error);
      alert('Erreur lors de la mise à jour du panyen: ' + (error as Error).message);
    },
  });

  const deletePanyenMutation = useMutation({
    mutationFn: async (id: string) => {
      return await backendFetchService.deletePanyen(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['panyen-products'] });
      // Invalider aussi le cache du magasin au cas où le panier supprimé était visible
      queryClient.invalidateQueries({ queryKey: ['panyen-store-products'] });
    },
  });

  const handleCreatePanyen = () => {
    setEditingPanyen(undefined);
    setModalOpen(true);
  };

  const handleEditPanyen = (panyen: IPanyenProduct) => {
    setEditingPanyen(panyen);
    setModalOpen(true);
  };

  const handleSavePanyen = (panyenData: Partial<IPanyenProduct>) => {
    if (editingPanyen) {
      updatePanyenMutation.mutate({ ...panyenData, id: editingPanyen.id });
    } else {
      createPanyenMutation.mutate(panyenData);
    }
  };

  const handleDeletePanyen = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce panyen ?')) {
      deletePanyenMutation.mutate(id);
    }
  };

  const calculatePanyenStock = (panyen: IPanyenProduct): number => {
    if (panyen.components.length === 0) return 0;
    
    return Math.min(
      ...panyen.components.map(component => 
        Math.floor(component.productVariant.stock / component.quantity)
      )
    );
  };

  const filteredPanyenProducts = panyenProducts.filter(panyen =>
    panyen.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (panyen.description && panyen.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <p className="text-lg">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 bg-[#F7F0EA]">
      <div className="flex-1 bg-white rounded-lg p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Gestion des Panyen</h1>
          <AppButton
            label="Créer un nouveau panyen"
            action={handleCreatePanyen}
          />
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Les panyen sont des produits composés de plusieurs produits différents. 
            Leur stock est automatiquement calculé en fonction du stock des produits qui les composent.
          </p>
          <SearchBar initialValue={searchTerm} onSearch={setSearchTerm} />
        </div>

        {filteredPanyenProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">
              {searchTerm ? 'Aucun panyen trouvé pour cette recherche' : 'Aucun panyen créé'}
            </div>
            {!searchTerm && (
              <AppButton
                label="Créer votre premier panyen"
                action={handleCreatePanyen}
              />
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <ProductTable>
              <ProductTable.Header>
                <ProductTable.HeaderRow>
                  <ProductTable.HeaderCell>Panyen</ProductTable.HeaderCell>
                  <ProductTable.HeaderCell>Composants</ProductTable.HeaderCell>
                  <ProductTable.HeaderCell>Stock calculé</ProductTable.HeaderCell>
                  <ProductTable.HeaderCell>Statut</ProductTable.HeaderCell>
                  <ProductTable.HeaderCell>Actions</ProductTable.HeaderCell>
                </ProductTable.HeaderRow>
              </ProductTable.Header>
              <ProductTable.Body>
                {filteredPanyenProducts.map((panyen) => {
                  const calculatedStock = calculatePanyenStock(panyen);
                  
                  return (
                    <ProductTable.Row key={panyen.id}>
                      <ProductTable.Cell>
                        <div className="flex items-center space-x-3">
                          <AppImage
                            source={panyen.imageUrl}
                            style={{ width: 50, height: 50, borderRadius: 4 }}
                            alt={panyen.name}
                          />
                          <div>
                            <div className="font-medium text-gray-900">{panyen.name}</div>
                            {panyen.description && (
                              <div className="text-sm text-gray-500">{panyen.description}</div>
                            )}
                          </div>
                        </div>
                      </ProductTable.Cell>
                      
                      <ProductTable.Cell>
                        <div className="space-y-1">
                          {panyen.components.map((component) => (
                            <div key={component.id} className="text-sm">
                              <span className="font-medium">{component.quantity}x</span>{' '}
                              <span>{component.product.name}</span>
                              <span className="text-gray-500">
                                {' '}({component.productVariant.optionSet}: {component.productVariant.optionValue})
                              </span>
                            </div>
                          ))}
                        </div>
                      </ProductTable.Cell>
                      
                      <ProductTable.Cell>
                        <div className={`font-medium ${
                          calculatedStock > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {calculatedStock}
                        </div>
                      </ProductTable.Cell>
                      
                      <ProductTable.Cell>
                        <PanyenShowInStoreBadge panyen={panyen} />
                      </ProductTable.Cell>
                      
                      <ProductTable.Cell>
                        <div className="flex space-x-2">
                          <AppButton
                            label="Modifier"
                            action={() => handleEditPanyen(panyen)}
                          />
                          <AppButton
                            label="Supprimer"
                            action={() => handleDeletePanyen(panyen.id)}
                          />
                        </div>
                      </ProductTable.Cell>
                    </ProductTable.Row>
                  );
                })}
              </ProductTable.Body>
            </ProductTable>
          </div>
        )}
      </div>

      <PanyenModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingPanyen(undefined);
        }}
        panyen={editingPanyen}
        onSave={handleSavePanyen}
      />
    </div>
  );
}

function PanyenManagementPage() {
  return <PanyenManagementPageContent />;
}

export default withAdminLayout(PanyenManagementPage);