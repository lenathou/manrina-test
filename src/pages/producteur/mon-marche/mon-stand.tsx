/* eslint-disable react/no-unescaped-entities */
import React, { useState, useMemo, useCallback, useReducer } from 'react';
import { Decimal } from '@prisma/client/runtime/library';
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
import { useMarketSessions } from '@/hooks/useMarket';
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
    
    // Récupérer les sessions de marché actives avec mémorisation
    const sessionFilters = useMemo(() => ({ upcoming: true, limit: 1 }), []);
    const { sessions } = useMarketSessions(sessionFilters);
    const activeSession = useMemo(() => 
        sessions.find(session => session.status === 'ACTIVE' || session.status === 'UPCOMING'),
        [sessions]
    );
    
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock' | 'date'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    
    // Types pour le reducer
    type FormState = {
        selectedProduct: IProduct | null;
        variantId: string;
        unitId: string;
        price: string;
        quantity: string;
        errors: {
            activeSession?: string;
            product?: string;
            variantId?: string;
            unitId?: string;
            price?: string;
            quantity?: string;
        };
    };

    type FormAction = 
        | { type: 'SET_PRODUCT'; payload: IProduct }
        | { type: 'SET_FIELD'; payload: { field: keyof FormState; value: string | boolean | IProduct | null } }
        | { type: 'SET_ERROR'; payload: { field: string; message: string } }
        | { type: 'CLEAR_ERRORS' }
        | { type: 'RESET' };

    const initialFormState: FormState = {
        selectedProduct: null,
        variantId: '',
        unitId: '',
        price: '',
        quantity: '',
        errors: {}
    };

    const formReducer = (state: FormState, action: FormAction): FormState => {
        switch (action.type) {
            case 'SET_PRODUCT':
            return {
                ...state,
                selectedProduct: action.payload,
                variantId: '',
                errors: { ...state.errors, product: undefined }
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
        stock: string;
        isActive: boolean;
    }>({ price: '', stock: '', isActive: true });

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
                standProduct.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                standProduct.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                standProduct.unit?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                standProduct.category?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        // Tri
        const sorted = [...filtered].sort((a, b) => {
            let aValue: string | number;
            let bValue: string | number;
            
            switch (sortBy) {
                case 'name':
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                    break;
                case 'price':
                    aValue = Number(a.price);
                    bValue = Number(b.price);
                    break;
                case 'stock':
                    aValue = Number(a.stock);
                    bValue = Number(b.stock);
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
            payload: product
        });
        
        // Définir la variante sélectionnée séparément
        if (selectedVariant) {
            dispatch({
                type: 'SET_FIELD',
                payload: { field: 'variantId', value: selectedVariant.id }
            });
        }
    }, []);

    const validateForm = useCallback((): boolean => {
        dispatch({ type: 'CLEAR_ERRORS' });
        let isValid = true;

        if (!formState.selectedProduct) {
            dispatch({ type: 'SET_ERROR', payload: { field: 'product', message: 'Veuillez sélectionner un produit' } });
            isValid = false;
        }

        if (!formState.unitId) {
            dispatch({ type: 'SET_ERROR', payload: { field: 'unitId', message: 'Veuillez sélectionner une unité' } });
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
            const selectedVariant = formState.selectedProduct?.variants?.find(v => v.id === formState.variantId);
            const selectedUnit = units.find(u => u.id === formState.unitId);
            
            const newMarketProduct = {
                growerId: growerId,
                name: formState.selectedProduct!.name + (selectedVariant ? ` - ${selectedVariant.optionValue}` : ''),
                description: formState.selectedProduct!.description || '',
                imageUrl: formState.selectedProduct!.imageUrl || '',
                price: parseFloat(formState.price),
                stock: parseInt(formState.quantity),
                unit: selectedUnit?.symbol || '',
                category: formState.selectedProduct!.category || '',
                marketSessionId: activeSession?.id || '',
                isActive: true
            };

            const productSuccess = await addStandProduct(newMarketProduct);

            if (productSuccess) {
                success('Produit ajouté au stand');
                dispatch({ type: 'RESET' });
                setShowAddForm(false);
            }
        } finally {
            setIsSubmitting(false);
        }
    }, [formState, addStandProduct, success, validateForm, activeSession, growerId, units]);

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
    const startEdit = useCallback((standProduct: { id: string; price: Decimal; stock: number | null; isActive: boolean }) => {
        setEditingId(standProduct.id);
        setEditData({
            price: standProduct.price.toString(),
            stock: (standProduct.stock ?? 0).toString(),
            isActive: standProduct.isActive
        });
    }, []);

    // Annuler l'édition avec useCallback
    const cancelEdit = useCallback(() => {
        setEditingId(null);
        setEditData({ price: '', stock: '', isActive: true });
    }, []);

    // Sauvegarder les modifications avec useCallback
    const saveEdit = useCallback(async () => {
        if (!editingId) return;

        const updateSuccess = await updateStandProduct(editingId, {
            price: parseFloat(editData.price),
            quantity: parseFloat(editData.stock),
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

    // Handlers mémorisés pour les changements d'état d'édition
    const handleEditDataChange = useCallback((field: keyof typeof editData, value: string | boolean) => {
        setEditData(prev => ({ ...prev, [field]: value }));
    }, []);

    // Handler mémorisé pour les changements de tri
    const handleSortChange = useCallback((newSortBy: typeof sortBy) => {
        if (newSortBy === sortBy) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(newSortBy);
            setSortOrder('asc');
        }
    }, [sortBy]);

    // Handler mémorisé pour la recherche
    const handleSearchChange = useCallback((value: string) => {
        setSearchTerm(value);
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
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mon Stand</h1>
                    <p className="text-sm sm:text-base text-gray-600 mt-1">
                        Gérez les produits de votre stand pour les sessions de marché
                    </p>
                </div>
                <Button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                    <span>➕</span>
                    <span className="hidden sm:inline">{showAddForm ? 'Annuler' : 'Ajouter un produit'}</span>
                    <span className="sm:hidden">{showAddForm ? 'Annuler' : 'Ajouter'}</span>
                </Button>
            </div>

            {/* Formulaire d'ajout */}
            {showAddForm && (
                <Card className="mb-4 sm:mb-6">
                    <div className="p-4 sm:p-6">
                        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Ajouter un produit au stand</h3>
                        <div className="space-y-4">
                            {!activeSession && (
                                <div className="p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                                    <p className="text-yellow-800 text-xs sm:text-sm">
                                        ℹ️ Aucune session de marché active. Vous pouvez composer votre liste de produits librement.
                                    </p>
                                </div>
                            )}
                            
                            <div className="space-y-3 sm:space-y-4">
                                <div>
                                    <Label className="text-xs sm:text-sm">Produit</Label>
                                    <ProductSelector
                                        items={products}
                                        value={formState.selectedProduct}
                                        onSelect={(product) => dispatch({ type: 'SET_PRODUCT', payload: product })}
                                        clearAfterSelect={false}
                                        className="mt-1"
                                    />
                                    {formState.errors.product && (
                                        <p className="text-red-500 text-xs sm:text-sm mt-1">{formState.errors.product}</p>
                                    )}
                                </div>
                                
                                {formState.selectedProduct && formState.selectedProduct.variants.length > 1 && (
                                    <div>
                                        <Label htmlFor="variantId" className="text-xs sm:text-sm">Variante</Label>
                                        <Select value={formState.variantId} onValueChange={(value) => handleFormFieldChange('variantId', value)}>
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Sélectionner une variante" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {formState.selectedProduct.variants.map((variant) => (
                                                    <SelectItem key={variant.id} value={variant.id}>
                                                        {variant.optionValue}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                                <div>
                                    <Label htmlFor="unitId" className="flex items-center gap-2 text-xs sm:text-sm">
                                        Unité
                                        <span title="Choisissez l'unité de mesure pour ce produit" className="cursor-help">
                                             <InfoIcon className="w-3 h-3 text-gray-400" />
                                         </span>
                                    </Label>
                                    <Select value={formState.unitId} onValueChange={(value) => handleFormFieldChange('unitId', value)}>
                                        <SelectTrigger className="text-sm">
                                            <SelectValue placeholder="Sélectionner une unité" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {units.map((unit) => (
                                                <SelectItem key={unit.id} value={unit.id}>
                                                    {unit.name} ({unit.symbol})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {formState.errors.unitId && (
                                        <p className="text-red-500 text-xs sm:text-sm mt-1">{formState.errors.unitId}</p>
                                    )}
                                </div>
                                
                                <div>
                                    <Label htmlFor="price" className="flex items-center gap-2 text-xs sm:text-sm">
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
                                        className="text-sm"
                                    />
                                    {formState.errors.price && (
                                        <p className="text-red-500 text-xs sm:text-sm mt-1">{formState.errors.price}</p>
                                    )}
                                </div>
                                
                                <div>
                                    <Label htmlFor="quantity" className="flex items-center gap-2 text-xs sm:text-sm">
                                        Quantité
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
                                        className="text-sm"
                                    />
                                    {formState.errors.quantity && (
                                        <p className="text-red-500 text-xs sm:text-sm mt-1">{formState.errors.quantity}</p>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-2">
                                <Button 
                                    onClick={handleAddProduct}
                                    disabled={!formState.selectedProduct || !formState.unitId || !formState.price || !formState.quantity || isSubmitting}
                                    className="flex items-center gap-2 w-full sm:w-auto justify-center text-sm"
                                >
                                    <span>💾</span>
                                    {isSubmitting ? 'Ajout en cours...' : 'Ajouter au stand'}
                                </Button>
                                <Button 
                                    variant="secondary" 
                                    onClick={handleCancelForm}
                                    className="flex items-center gap-2 w-full sm:w-auto justify-center text-sm"
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
                 <div className="mb-3 sm:mb-4 space-y-3 sm:space-y-4">
                     <div>
                         <Label htmlFor="search" className="text-xs sm:text-sm">Rechercher dans vos produits</Label>
                         <Input
                             id="search"
                             type="text"
                             placeholder="Rechercher par nom de produit..."
                             value={searchTerm}
                             onChange={(e) => setSearchTerm(e.target.value)}
                             className="mt-1 text-sm"
                         />
                     </div>
                     
                     <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                         <div className="flex-1">
                             <Label htmlFor="sortBy" className="text-xs sm:text-sm">Trier par</Label>
                             <Select value={sortBy} onValueChange={(value: string) => setSortBy(value as 'name' | 'price' | 'stock' | 'date')}>
                                 <SelectTrigger className="mt-1 text-sm">
                                     <span className="block truncate text-sm">
                                         {sortBy === 'name' && 'Nom du produit'}
                                         {sortBy === 'price' && 'Prix'}
                                         {sortBy === 'stock' && 'Stock'}
                                         {sortBy === 'date' && 'Date d\'ajout'}
                                     </span>
                                 </SelectTrigger>
                                 <SelectContent>
                                     <SelectItem value="name">Nom du produit</SelectItem>
                                     <SelectItem value="price">Prix</SelectItem>
                                     <SelectItem value="stock">Stock</SelectItem>
                                     <SelectItem value="date">Date d'ajout</SelectItem>
                                 </SelectContent>
                             </Select>
                         </div>
                         
                         <div className="flex-1">
                             <Label htmlFor="sortOrder" className="text-xs sm:text-sm">Ordre</Label>
                             <Select value={sortOrder} onValueChange={(value: string) => setSortOrder(value as 'asc' | 'desc')}>
                                 <SelectTrigger className="mt-1 text-sm">
                                     <span className="block truncate text-sm">
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
                      <div className="text-xs sm:text-sm text-gray-600">
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
                    <div className="text-center py-8 sm:py-12">
                        <p className="text-gray-500 mb-4 text-sm sm:text-base">
                            Aucun produit dans votre stand pour le moment
                        </p>
                        <Button 
                            onClick={() => setShowAddForm(true)}
                            className="flex items-center gap-2 mx-auto text-sm"
                        >
                            <span>➕</span>
                            <span className="hidden sm:inline">Ajouter votre premier produit</span>
                            <span className="sm:hidden">Ajouter un produit</span>
                        </Button>
                    </div>
                </Card>
            ) : (
                <div className="space-y-3 sm:space-y-4">
                    {filteredAndSortedStandProducts.length === 0 ? (
                        <Card>
                            <div className="text-center py-6 sm:py-8">
                                <p className="text-gray-500 text-sm sm:text-base">
                                    Aucun produit ne correspond à votre recherche "{searchTerm}"
                                </p>
                                <Button 
                                    onClick={() => setSearchTerm('')}
                                    variant="secondary"
                                    className="mt-2 text-sm"
                                >
                                    Effacer la recherche
                                </Button>
                            </div>
                        </Card>
                    ) : (
                        filteredAndSortedStandProducts.map((standProduct) => (
                        <Card key={standProduct.id}>
                            <div className="p-3 sm:p-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-base sm:text-lg">
                                            {standProduct.name}
                                        </h3>
                                        <div className="text-gray-600 text-xs sm:text-sm space-y-1 sm:space-y-0">
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                                <span className="font-medium">{standProduct.price.toString()}€ / {standProduct.unit}</span>
                                                <span className="hidden sm:inline">•</span>
                                                <span>Stock: {standProduct.stock}</span>
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                                <span>Catégorie: {standProduct.category}</span>
                                                <span className="hidden sm:inline">•</span>
                                                <span>Statut: {standProduct.isActive ? '🟢 Actif' : '🔴 Inactif'}</span>
                                            </div>
                                        </div>
                                        {standProduct.description && (
                                            <p className="text-xs sm:text-sm text-gray-500 mt-2">
                                                {standProduct.description}
                                            </p>
                                        )}
                                    </div>
                                    
                                    <div className="flex flex-row sm:flex-col lg:flex-row items-center gap-2 w-full sm:w-auto">
                                        {editingId === standProduct.id ? (
                                            <>
                                                <Button 
                                                    onClick={saveEdit}
                                                    className="flex items-center justify-center gap-1 px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm flex-1 sm:flex-none"
                                                >
                                                    <span>💾</span>
                                                    <span className="hidden sm:inline">Sauvegarder</span>
                                                </Button>
                                                <Button 
                                                    onClick={cancelEdit}
                                                    variant="secondary"
                                                    className="flex items-center justify-center gap-1 px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm flex-1 sm:flex-none"
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
                                                    className="flex items-center justify-center gap-1 px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm flex-1 sm:flex-none"
                                                >
                                                    <span>✏️</span>
                                                    <span className="hidden sm:inline">Modifier</span>
                                                </Button>
                                                <Button 
                                                    onClick={() => handleRemoveProduct(standProduct.id)}
                                                    variant="secondary"
                                                    disabled={isSubmitting}
                                                    className="flex items-center justify-center gap-1 px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm bg-red-600 hover:bg-red-700 flex-1 sm:flex-none"
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
                                    <div className="mt-3 pt-3 sm:mt-4 sm:pt-4 border-t border-gray-200">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                            <div>
                                                <Label className="text-xs sm:text-sm">Prix (€)</Label>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={editData.price}
                                                    onChange={(e) => setEditData(prev => ({ ...prev, price: e.target.value }))}
                                                    className="text-sm"
                                                />
                                            </div>
                                            
                                            <div>
                                                <Label className="text-xs sm:text-sm">Stock</Label>
                                                <Input
                                                    type="number"
                                                    step="0.1"
                                                    min="0"
                                                    value={editData.stock}
                                                    onChange={(e) => setEditData(prev => ({ ...prev, stock: e.target.value }))}
                                                    className="text-sm"
                                                />
                                            </div>
                                            
                                            <div className="flex items-center space-x-2">
                                                <Switch
                                                    checked={editData.isActive}
                                                    onCheckedChange={(checked) => setEditData(prev => ({ ...prev, isActive: checked }))}
                                                />
                                                <Label className="text-xs sm:text-sm">Actif</Label>
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