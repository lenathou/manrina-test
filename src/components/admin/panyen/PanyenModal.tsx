/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { AppImage } from '@/components/Image';
import SearchBarNext from '@/components/ui/SearchBarNext';
import { useFilteredProducts } from '@/hooks/useFilteredProducts';
import { useProductQuery } from '@/hooks/useProductQuery';
import { IProduct } from '@/server/product/IProduct';
import { IPanyenProduct, IPanyenComponent } from '@/server/panyen/IPanyen';

interface PanyenModalProps {
  isOpen: boolean;
  onClose: () => void;
  panyen?: IPanyenProduct;
  onSave: (panyen: Partial<IPanyenProduct>) => void;
  isSaving?: boolean;
}

const PanyenModal: React.FC<PanyenModalProps> = ({
  isOpen,
  onClose,
  panyen,
  onSave,
  isSaving = false
}) => {
  const [name, setName] = useState(panyen?.name || '');
  const [description, setDescription] = useState(panyen?.description || '');
  const [imageUrl, setImageUrl] = useState(panyen?.imageUrl || '');
  const [price, setPrice] = useState(panyen?.price || 0);
  const [showInStore, setShowInStore] = useState(panyen?.showInStore ?? true);
  const [components, setComponents] = useState<IPanyenComponent[]>(panyen?.components || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    setErrors({});
  }, [panyen]);

  const { data: allProducts = [] } = useProductQuery();
  const filteredProducts = useFilteredProducts(allProducts, searchTerm, { includeVariants: true });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = 'Le nom du panyen est requis';
    }
    if (price <= 0) {
      newErrors.price = 'Le prix doit être supérieur à 0';
    }
    if (components.length === 0) {
      newErrors.components = 'Au moins un composant est requis';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
      productVariant: variant,
    };
    setComponents([...components, newComponent]);
    setShowProductSelector(false);
    setSearchTerm('');
    // Effacer l'erreur des composants si elle existe
    if (errors.components) {
      setErrors(prev => ({ ...prev, components: '' }));
    }
  };

  const handleRemoveComponent = (componentId: string) => {
    setComponents(components.filter((c) => c.id !== componentId));
  };

  const handleQuantityChange = (componentId: string, quantity: number) => {
    setComponents(components.map((c) => (c.id === componentId ? { ...c, quantity: Math.max(1, quantity) } : c)));
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    onSave({
      name: name.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim(),
      price,
      showInStore,
      components,
    });
  };

  const handleClose = () => {
    if (!isSaving) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex bg-secondary justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-white">
            {panyen ? 'Modifier le panyen' : 'Créer un nouveau panyen'}
          </h2>
          <Button
            onClick={handleClose}
            variant="ghost"
            size="sm"
            disabled={isSaving}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Informations de base */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nom du panyen *</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                  }}
                  placeholder="Ex: Panyen légumes de saison"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
              <div>
                <Label htmlFor="price">Prix (€) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => {
                    setPrice(parseFloat(e.target.value) || 0);
                    if (errors.price) setErrors(prev => ({ ...prev, price: '' }));
                  }}
                  placeholder="0.00"
                  className={errors.price ? 'border-red-500' : ''}
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="imageUrl">URL de l'image</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label>Visibilité en magasin</Label>
                <div className="flex items-center space-x-3 mt-2">
                  <input
                    type="checkbox"
                    id="showInStore"
                    checked={showInStore}
                    onChange={(e) => setShowInStore(e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <Label htmlFor="showInStore" className="text-sm">
                    Afficher ce panyen dans le magasin
                  </Label>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Description du panyen..."
              />
            </div>

            {/* Composants */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Composants du panyen *</h3>
                  {errors.components && <p className="text-red-500 text-sm mt-1">{errors.components}</p>}
                </div>
                <Button
                  onClick={() => setShowProductSelector(true)}
                  variant="outline"
                  size="sm"
                >
                  + Ajouter un produit
                </Button>
              </div>

              {components.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                  <span className="text-4xl mb-2 block">📦</span>
                  Aucun composant ajouté. Cliquez sur "Ajouter un produit" pour commencer.
                </div>
              ) : (
                <div className="space-y-3">
                  {components.map((component) => (
                    <div
                      key={component.id}
                      className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg bg-gray-50"
                    >
                      <div className="flex-shrink-0">
                        <AppImage
                          source={component.productVariant.imageUrl || component.product.imageUrl}
                          style={{ width: 50, height: 50, borderRadius: 4 }}
                          alt={component.product.name}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{component.product.name}</div>
                        <div className="text-sm text-gray-500">
                          {component.productVariant.optionSet}: {component.productVariant.optionValue}
                        </div>
                        <div className="text-sm text-gray-500">
                          Stock disponible: {component.productVariant.stock}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Label className="text-sm font-medium text-gray-700 whitespace-nowrap">Quantité:</Label>
                        <Input
                          type="number"
                          min="1"
                          value={component.quantity}
                          onChange={(e) => handleQuantityChange(component.id, parseInt(e.target.value) || 1)}
                          className="w-20"
                        />
                      </div>
                      <Button
                        onClick={() => handleRemoveComponent(component.id)}
                        variant="danger"
                        size="sm"
                      >
                        Supprimer
                      </Button>
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
                  <Button
                    onClick={() => {
                      setShowProductSelector(false);
                      setSearchTerm('');
                    }}
                    variant="ghost"
                    size="sm"
                  >
                    Annuler
                  </Button>
                </div>
                <div className="mb-4">
                  <SearchBarNext
                    placeholder="Rechercher un produit..."
                    value={searchTerm}
                    onSearch={setSearchTerm}
                  />
                </div>
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
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
                            <Button
                              key={variant.id}
                              onClick={() => handleAddComponent(product, variant)}
                              variant="ghost"
                              size="sm"
                              className="w-full justify-between text-left p-3 bg-gray-50 hover:bg-gray-100 border"
                            >
                              <span>
                                {variant.optionSet}: {variant.optionValue} - {variant.price}€
                              </span>
                              <span className="text-gray-500">
                                Stock: {variant.stock}
                              </span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-4 p-6 border-t border-gray-200 bg-gray-50">
          <Button
            onClick={handleClose}
            variant="ghost"
            disabled={isSaving}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            variant="primary"
            disabled={isSaving}
          >
            {isSaving ? 'Sauvegarde...' : (panyen ? 'Modifier' : 'Créer')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PanyenModal;