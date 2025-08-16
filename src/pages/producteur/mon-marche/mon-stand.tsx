/* eslint-disable react/no-unescaped-entities */
import React, { useState, useMemo, useCallback, useReducer } from 'react';
import Image from 'next/image';
import { ProductSelector } from '@/components/products/Selector';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { useGrowerStandProducts } from '@/hooks/useGrowerStandProducts';
import { useUnits } from '@/hooks/useUnits';
import { useToast } from '@/components/ui/Toast';
import { useProductQuery } from '@/hooks/useProductQuery';
import { withProducteurLayout } from '@/components/layouts/ProducteurLayout';
import { IGrowerTokenPayload } from '@/server/grower/IGrower';
import { IProduct } from '@/server/product/IProduct';
// Composant Info simple sans dépendance externe
const InfoIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
);

function MonStand({ authenticatedGrower }: { authenticatedGrower: IGrowerTokenPayload }) {
    const growerId = authenticatedGrower?.id;
    const { success } = useToast();
    
    const {
        standProducts,
        isLoading,
        error,
        addStandProduct,
        updateStandProduct,
        removeStandProduct
    } = useGrowerStandProducts(growerId);
    
    const { data: units = [] } = useUnits();
    const { data: products = [] } = useProductQuery();
    
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sortBy, setSortBy] = useState<'name' | 'price' | 'quantity' | 'date'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    
    // Types pour le reducer
    type FormState = {
        productId: string;
        variantId: string;
        unitId: string;
        price: string;
        quantity: string;
        isActive: boolean;
        selectedProduct: IProduct | null;
        errors: {
            product?: string;
            unit?: string;
            price?: string;
            quantity?: string;
        };
    };

    type FormAction = 
        | { type: 'SET_PRODUCT'; payload: { product: IProduct; variantId: string } }
        | { type: 'SET_FIELD'; payload: { field: keyof FormState; value: string | boolean | IProduct | null } }
        | { type: 'SET_ERROR'; payload: { field: string; message: string } }
        | { type: 'CLEAR_ERRORS' }
        | { type: 'RESET' };

    const initialFormState: FormState = {
        productId: '',
        variantId: '',
        unitId: '',
        price: '',
        quantity: '1',
        isActive: true,
        selectedProduct: null,
        errors: {}
    };

    const formReducer = (state: FormState, action: FormAction): FormState => {
        switch (action.type) {
            case 'SET_PRODUCT':
                return {
                    ...state,
                    selectedProduct: action.payload.product,
                    productId: action.payload.product.id,
                    variantId: action.payload.variantId,
                    errors: { ...state.errors, product: undefined },
                };
            case 'SET_FIELD':
                return {
                    ...state,
                    [action.payload.field]: action.payload.value,
                    errors: { ...state.errors, [action.payload.field]: undefined },
                };
            case 'SET_ERROR':
                return {
                    ...state,
                    errors: { ...state.errors, [action.payload.field]: action.payload.message },
                };
            case 'CLEAR_ERRORS':
                return {
                    ...state,
                    errors: {},
                };
            case 'RESET':
                return initialFormState;
            default:
                return state;
        }
    };

    // État pour le formulaire d'ajout avec reducer
    const [formState, dispatch] = useReducer(formReducer, initialFormState);
    
    // État pour l'édition
    const [editData, setEditData] = useState<{
        price: string;
        unitId: string;
        quantity: string;
        isActive: boolean;
    }>({ price: '', unitId: '', quantity: '', isActive: true });

    // Mémorisation des options d'unités
    const unitOptions = useMemo(() => 
        units.map(unit => ({
            id: unit.id,
            name: unit.name,
            symbol: unit.symbol,
            displayText: `${unit.name} (${unit.symbol})`
        })), [units]);

    // Filtrer et trier les produits du stand
    const filteredAndSortedStandProducts = useMemo(() => {
        let filtered = standProducts;
        
        // Filtrage par terme de recherche
        if (searchTerm.trim()) {
            filtered = standProducts.filter(standProduct => 
                standProduct.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                standProduct.product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                standProduct.unit.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        // Tri
        const sorted = [...filtered].sort((a, b) => {
            let aValue: string | number;
            let bValue: string | number;
            
            switch (sortBy) {
                case 'name':
                    aValue = a.product.name.toLowerCase();
                    bValue = b.product.name.toLowerCase();
                    break;
                case 'price':
                    aValue = Number(a.price);
                    bValue = Number(b.price);
                    break;
                case 'quantity':
                    aValue = Number(a.quantity);
                    bValue = Number(b.quantity);
                    break;
                case 'date':
                    aValue = new Date(a.createdAt).getTime();
                    bValue = new Date(b.createdAt).getTime();
                    break;
                default:
                    return 0;
            }
            
            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
        
        return sorted;
    }, [standProducts, searchTerm, sortBy, sortOrder]);

    // Gérer la sélection d'un produit avec useCallback
    const handleProductSelect = useCallback((product: IProduct) => {
        // Sélectionner la première variante par défaut ou la variante primaire
        const variants = product.variants || [];
        const selectedVariant = variants.find(v => v.id === product.primaryVariantId) || variants[0];
        
        dispatch({
            type: 'SET_PRODUCT',
            payload: {
                product,
                variantId: selectedVariant?.id || ''
            }
        });
    }, []);

    const validateForm = useCallback((): boolean => {
        dispatch({ type: 'CLEAR_ERRORS' });
        let isValid = true;

        if (!formState.selectedProduct) {
            dispatch({ type: 'SET_ERROR', payload: { field: 'product', message: 'Veuillez sélectionner un produit' } });
            isValid = false;
        }

        if (!formState.unitId) {
            dispatch({ type: 'SET_ERROR', payload: { field: 'unit', message: 'Veuillez sélectionner une unité' } });
            isValid = false;
        }

        if (!formState.price || parseFloat(formState.price) <= 0) {
            dispatch({ type: 'SET_ERROR', payload: { field: 'price', message: 'Le prix doit être supérieur à 0' } });
            isValid = false;
        }

        if (!formState.quantity || parseFloat(formState.quantity) <= 0) {
            dispatch({ type: 'SET_ERROR', payload: { field: 'quantity', message: 'La quantité doit être supérieure à 0' } });
            isValid = false;
        }

        return isValid;
    }, [formState]);

    // Ajouter un produit au stand avec useCallback
    const handleAddProduct = useCallback(async () => {
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        try {
            const productSuccess = await addStandProduct({
                productId: formState.productId,
                variantId: formState.variantId,
                unitId: formState.unitId,
                price: parseFloat(formState.price),
                quantity: parseFloat(formState.quantity)
            });

            if (productSuccess) {
                success('Produit ajouté au stand');
                dispatch({ type: 'RESET' });
                setShowAddForm(false);
            }
        } finally {
            setIsSubmitting(false);
        }
    }, [formState, addStandProduct, success, validateForm]);

    // Supprimer un produit du stand avec useCallback et confirmation
    const handleRemoveProduct = useCallback(async (id: string) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce produit du stand ?')) {
            return;
        }
        
        setIsSubmitting(true);
        try {
            const removeSuccess = await removeStandProduct(id);
            if (removeSuccess) {
                success('Produit supprimé du stand');
            }
        } finally {
            setIsSubmitting(false);
        }
    }, [removeStandProduct, success]);

    // Commencer l'édition avec useCallback
    const startEdit = useCallback((standProduct: { id: string; price: number; unitId: string; quantity: number | null; isActive: boolean }) => {
        setEditingId(standProduct.id);
        setEditData({
            price: standProduct.price.toString(),
            unitId: standProduct.unitId,
            quantity: (standProduct.quantity ?? 0).toString(),
            isActive: standProduct.isActive
        });
    }, []);

    // Annuler l'édition avec useCallback
    const cancelEdit = useCallback(() => {
        setEditingId(null);
        setEditData({ price: '', unitId: '', quantity: '', isActive: true });
    }, []);

    // Sauvegarder les modifications avec useCallback
    const saveEdit = useCallback(async () => {
        if (!editingId) return;

        const updateSuccess = await updateStandProduct(editingId, {
            price: parseFloat(editData.price),
            unitId: editData.unitId,
            quantity: parseFloat(editData.quantity),
            isActive: editData.isActive
        });

        if (updateSuccess) {
            success('Produit mis à jour');
            setEditingId(null);
        }
    }, [editingId, editData, updateStandProduct, success]);

    // Handler pour les changements de champs du formulaire
    const handleFormFieldChange = useCallback((field: keyof FormState, value: string | boolean | IProduct | null) => {
        dispatch({ type: 'SET_FIELD', payload: { field, value } });
    }, []);

    // Handler pour annuler le formulaire d'ajout
    const handleCancelForm = useCallback(() => {
        setShowAddForm(false);
        dispatch({ type: 'RESET' });
    }, []);

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">Chargement...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center text-red-600">Erreur: {error}</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Mon Stand</h1>
                <Button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-2"
                >
                    <span>➕</span>
                    {showAddForm ? 'Annuler' : 'Ajouter un produit'}
                </Button>
            </div>

            {/* Formulaire d'ajout */}
            {showAddForm && (
                <Card className="mb-6">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Ajouter un produit au stand</h3>
                        <div className="space-y-4">
                            <div>
                                <Label>Produit</Label>
                                <ProductSelector
                                    items={products}
                                    onSelect={handleProductSelect}
                                />
                                {formState.errors.product && (
                                    <p className="text-red-500 text-sm mt-1">{formState.errors.product}</p>
                                )}
                                {formState.selectedProduct && (
                                    <div className="mt-2 p-3 bg-gray-50 rounded-md flex items-center gap-3">
                                        {formState.selectedProduct.imageUrl && (
                                            <Image 
                                                src={formState.selectedProduct.imageUrl} 
                                                alt={formState.selectedProduct.name}
                                                width={48}
                                                height={48}
                                                className="w-12 h-12 object-cover rounded"
                                            />
                                        )}
                                        <div>
                                            <p className="font-medium text-sm">{formState.selectedProduct.name}</p>
                                            {formState.selectedProduct.description && (
                                                <p className="text-xs text-gray-600">{formState.selectedProduct.description}</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="unit" className="flex items-center gap-2">
                                        Unité
                                        <span title="Choisissez l'unité de mesure pour ce produit (kg, pièce, litre, etc.)" className="cursor-help">
                                             <InfoIcon className="w-3 h-3 text-gray-400" />
                                         </span>
                                    </Label>
                                    <Select value={formState.unitId} onValueChange={(value) => 
                                        handleFormFieldChange('unitId', value)
                                    }>
                                        <SelectTrigger>
                                            <span className="block truncate">
                                                {formState.unitId && unitOptions.find(u => u.id === formState.unitId) ? 
                                                    unitOptions.find(u => u.id === formState.unitId)?.displayText : 
                                                    <span className="text-gray-500">Choisir une unité</span>
                                                }
                                            </span>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {unitOptions.map(unit => (
                                                <SelectItem key={unit.id} value={unit.id}>
                                                    {unit.displayText}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {formState.errors.unit && (
                                        <p className="text-red-500 text-sm mt-1">{formState.errors.unit}</p>
                                    )}
                                </div>
                                
                                <div>
                                    <Label htmlFor="price" className="flex items-center gap-2">
                                        Prix (€)
                                        <span title="Prix de vente par unité (ex: 2.50€ par kg)" className="cursor-help">
                                             <InfoIcon className="w-3 h-3 text-gray-400" />
                                         </span>
                                    </Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formState.price}
                                        onChange={(e) => handleFormFieldChange('price', e.target.value)}
                                        placeholder="0.00"
                                    />
                                    {formState.errors.price && (
                                        <p className="text-red-500 text-sm mt-1">{formState.errors.price}</p>
                                    )}
                                </div>
                                
                                <div>
                                    <Label htmlFor="quantity" className="flex items-center gap-2">
                                        <span>
                                            Quantité{formState.unitId && unitOptions.find(u => u.id === formState.unitId) ? 
                                                ` en ${unitOptions.find(u => u.id === formState.unitId)?.name}` : 
                                                ''
                                            }
                                        </span>
                                        <span title="Quantité disponible à la vente" className="cursor-help">
                                             <InfoIcon className="w-3 h-3 text-gray-400" />
                                         </span>
                                    </Label>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        value={formState.quantity}
                                        onChange={(e) => handleFormFieldChange('quantity', e.target.value)}
                                        placeholder="1"
                                    />
                                    {formState.errors.quantity && (
                                        <p className="text-red-500 text-sm mt-1">{formState.errors.quantity}</p>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex gap-2">
                                <Button 
                                    onClick={handleAddProduct}
                                    disabled={!formState.selectedProduct || !formState.unitId || !formState.price || !formState.quantity || isSubmitting}
                                    className="flex items-center gap-2"
                                >
                                    <span>💾</span>
                                    {isSubmitting ? 'Ajout en cours...' : 'Ajouter au stand'}
                                </Button>
                                <Button 
                                    variant="secondary" 
                                    onClick={handleCancelForm}
                                    className="flex items-center gap-2"
                                >
                                    <span>❌</span>
                                    Annuler
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Barre de recherche et tri */}
             {standProducts.length > 0 && (
                 <div className="mb-4 space-y-4">
                     <div>
                         <Label htmlFor="search">Rechercher dans vos produits</Label>
                         <Input
                             id="search"
                             type="text"
                             placeholder="Rechercher par nom de produit, description ou unité..."
                             value={searchTerm}
                             onChange={(e) => setSearchTerm(e.target.value)}
                             className="mt-1"
                         />
                     </div>
                     
                     <div className="flex flex-col sm:flex-row gap-4">
                         <div className="flex-1">
                             <Label htmlFor="sortBy">Trier par</Label>
                             <Select value={sortBy} onValueChange={(value: string) => setSortBy(value as 'name' | 'price' | 'quantity' | 'date')}>
                                 <SelectTrigger className="mt-1">
                                     <span className="block truncate">
                                         {sortBy === 'name' && 'Nom du produit'}
                                         {sortBy === 'price' && 'Prix'}
                                         {sortBy === 'quantity' && 'Quantité'}
                                         {sortBy === 'date' && 'Date d\'ajout'}
                                     </span>
                                 </SelectTrigger>
                                 <SelectContent>
                                     <SelectItem value="name">Nom du produit</SelectItem>
                                     <SelectItem value="price">Prix</SelectItem>
                                     <SelectItem value="quantity">Quantité</SelectItem>
                                     <SelectItem value="date">Date d'ajout</SelectItem>
                                 </SelectContent>
                             </Select>
                         </div>
                         
                         <div className="flex-1">
                             <Label htmlFor="sortOrder">Ordre</Label>
                             <Select value={sortOrder} onValueChange={(value: string) => setSortOrder(value as 'asc' | 'desc')}>
                                 <SelectTrigger className="mt-1">
                                     <span className="block truncate">
                                         {sortOrder === 'asc' ? 'Croissant' : 'Décroissant'}
                                     </span>
                                 </SelectTrigger>
                                 <SelectContent>
                                     <SelectItem value="asc">Croissant</SelectItem>
                                     <SelectItem value="desc">Décroissant</SelectItem>
                                 </SelectContent>
                             </Select>
                         </div>
                     </div>
                      
                      {/* Indicateur de résultats */}
                      <div className="text-sm text-gray-600">
                          {searchTerm.trim() ? (
                              <span>
                                  {filteredAndSortedStandProducts.length} produit(s) trouvé(s) sur {standProducts.length} total
                              </span>
                          ) : (
                              <span>
                                  {standProducts.length} produit(s) dans votre stand
                              </span>
                          )}
                      </div>
                  </div>
              )}

            {/* Liste des produits */}
            {standProducts.length === 0 ? (
                <Card>
                    <div className="text-center py-12">
                        <p className="text-gray-500 mb-4">
                            Aucun produit dans votre stand pour le moment
                        </p>
                        <Button 
                            onClick={() => setShowAddForm(true)}
                            className="flex items-center gap-2 mx-auto"
                        >
                            <span>➕</span>
                            Ajouter votre premier produit
                        </Button>
                    </div>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredAndSortedStandProducts.length === 0 ? (
                        <Card>
                            <div className="text-center py-8">
                                <p className="text-gray-500">
                                    Aucun produit ne correspond à votre recherche "{searchTerm}"
                                </p>
                                <Button 
                                    onClick={() => setSearchTerm('')}
                                    variant="secondary"
                                    className="mt-2"
                                >
                                    Effacer la recherche
                                </Button>
                            </div>
                        </Card>
                    ) : (
                        filteredAndSortedStandProducts.map((standProduct) => (
                        <Card key={standProduct.id}>
                            <div className="p-4">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg">
                                            {standProduct.product?.name} - {standProduct.variant?.optionValue}
                                        </h3>
                                        <p className="text-gray-600">
                                            {standProduct.price}€ / {standProduct.unit?.symbol} • 
                                            Quantité: {standProduct.quantity} • 
                                            Statut: {standProduct.isActive ? '🟢 Actif' : '🔴 Inactif'}
                                        </p>
                                    </div>
                                    
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                                        {editingId === standProduct.id ? (
                                            <>
                                                <Button 
                                                    onClick={saveEdit}
                                                    className="flex items-center justify-center gap-1 px-3 py-2 text-sm"
                                                >
                                                    <span>💾</span>
                                                    <span className="hidden sm:inline">Sauvegarder</span>
                                                </Button>
                                                <Button 
                                                    onClick={cancelEdit}
                                                    variant="secondary"
                                                    className="flex items-center justify-center gap-1 px-3 py-2 text-sm"
                                                >
                                                    <span>❌</span>
                                                    <span className="hidden sm:inline">Annuler</span>
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button 
                                                    onClick={() => startEdit(standProduct)}
                                                    variant="secondary"
                                                    className="flex items-center justify-center gap-1 px-3 py-2 text-sm"
                                                >
                                                    <span>✏️</span>
                                                    <span className="hidden sm:inline">Modifier</span>
                                                </Button>
                                                <Button 
                                                    onClick={() => handleRemoveProduct(standProduct.id)}
                                                    variant="secondary"
                                                    disabled={isSubmitting}
                                                    className="flex items-center justify-center gap-1 px-3 py-2 text-sm bg-red-600 hover:bg-red-700"
                                                >
                                                    <span>🗑️</span>
                                                    <span className="hidden sm:inline">{isSubmitting ? 'Suppression...' : 'Supprimer'}</span>
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Formulaire d'édition */}
                                {editingId === standProduct.id && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                            <div>
                                                <Label>Prix (€)</Label>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={editData.price}
                                                    onChange={(e) => setEditData(prev => ({ ...prev, price: e.target.value }))}
                                                />
                                            </div>
                                            
                                            <div>
                                                <Label>Unité</Label>
                                                <Select value={editData.unitId} onValueChange={(value) => 
                                                    setEditData(prev => ({ ...prev, unitId: value }))
                                                }>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {units.map(unit => (
                                                            <SelectItem key={unit.id} value={unit.id}>
                                                                {unit.name} ({unit.symbol})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            
                                            <div>
                                                <Label>Quantité</Label>
                                                <Input
                                                    type="number"
                                                    step="0.1"
                                                    min="0"
                                                    value={editData.quantity}
                                                    onChange={(e) => setEditData(prev => ({ ...prev, quantity: e.target.value }))}
                                                />
                                            </div>
                                            
                                            <div className="flex items-center space-x-2">
                                                <Switch
                                                    checked={editData.isActive}
                                                    onCheckedChange={(checked) => setEditData(prev => ({ ...prev, isActive: checked }))}
                                                />
                                                <Label>Actif</Label>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

export default withProducteurLayout(MonStand);