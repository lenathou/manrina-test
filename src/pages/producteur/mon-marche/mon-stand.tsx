/* eslint-disable react/no-unescaped-entities */
import React, { useState, useMemo, useCallback, useReducer } from 'react';
import { ProductSelector } from '@/components/products/Selector';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { useGrowerStandProducts } from '@/hooks/useGrowerStandProducts';
import { useUnits } from '@/hooks/useUnits';
import { useToast } from '@/components/ui/Toast';
import { useProductQuery } from '@/hooks/useProductQuery';
import { useMarketSessionsQuery } from '@/hooks/useMarketSessionsQuery';
import { MarketSessionWithProducts } from '@/types/market';
import { Text } from '@/components/ui/Text';
import { IGrowerTokenPayload } from '@/server/grower/IGrower';
import { IProduct } from '@/server/product/IProduct';
import { SendProductsExplanationModal } from '@/components/grower/mon-marche/mon-stand/SendProductsExplanationModal';
import { MarketProductValidationModal } from '@/components/grower/MarketProductValidationModal';
import { useMarketProductValidation } from '@/hooks/useMarketProductValidation';
import { ProductSuggestionsSection } from '@/components/grower/mon-marche/mon-stand/MarketProductSuggestionsSection';
import { SendProductsSection } from '@/components/grower/mon-marche/mon-stand/MarketSendProductsSection';
import { ProductsList } from '@/components/grower/mon-marche/mon-stand/MarketProductsList';

// Composant pour l'icône d'informationInfo simple sans dépendance externe
const InfoIcon = ({ className }: { className?: string }) => (
    <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <circle
            cx="12"
            cy="12"
            r="10"
        ></circle>
        <line
            x1="12"
            y1="16"
            x2="12"
            y2="12"
        ></line>
        <line
            x1="12"
            y1="8"
            x2="12.01"
            y2="8"
        ></line>
    </svg>
);

function MonStand({ authenticatedGrower }: { authenticatedGrower: IGrowerTokenPayload }) {
    const growerId = authenticatedGrower?.id;
    const { success } = useToast();

    // Résultats pour les suggestions de produits de marché
    const [showSuggestionForm, setShowSuggestionForm] = useState(false);

    // Hooks pour les suggestions de produits de marché

    // Hook pour les produits créés à  partir de suggestions approuvées

    // Hook pour convertir les produits suggérés en produits normaux

    const { standProducts, isLoading, error, addStandProduct, updateStandProduct, removeStandProduct, refetch } =
        useGrowerStandProducts(growerId);

    // Hook pour le modal de validation de liste de produits
    const {
        isSubmitting: isValidatingProducts,
        isModalOpen,
        selectedSession,
        openValidationModal,
        closeValidationModal,
        toggleMarketProduct,
        validateMarketProductList,
    } = useMarketProductValidation({
        growerId,
        onSuccess: () => {
            // Rafraîchir la liste des produits du stand après l'envoi
            refetch();
        },
    });

    const { data: units = [] } = useUnits();
    const { data: allProducts } = useProductQuery();
    const safeAllProducts = allProducts || [];

    // Filtrer les produits disponibles (non déjà  dans le stand)
    const availableProducts = useMemo(() => {
        return safeAllProducts.filter(
            (product) =>
                product.showInStore && !standProducts.some((standProduct) => standProduct.name === product.name),
        );
    }, [safeAllProducts, standProducts]);

    // Récupérer les sessions de marché actives avec mémorisation
    const sessionFilters = useMemo(() => ({ upcoming: true, limit: 1 }), []);
    const { sessions } = useMarketSessionsQuery(sessionFilters);
    const activeSession = useMemo(
        () => sessions.find((session) => session.status === 'ACTIVE' || session.status === 'UPCOMING') || null,
        [sessions],
    );

    // Récupérer toutes les sessions à  venir pour le dropdown
    const upcomingSessionsFilters = useMemo(() => ({ upcoming: true }), []);
    const { sessions: upcomingSessions, loading: upcomingSessionsLoading } = useMarketSessionsQuery(upcomingSessionsFilters);

    // Résultat pour la session sélectionnée pour l'envoi de produits
    const [selectedSessionId, setSelectedSessionId] = useState<string>('');
    const [showExplanationModal, setShowExplanationModal] = useState(false);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock' | 'date'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // Mémoriser setSearchTerm pour éviter les rerenders du SearchBarNext
    const handleSearchTermChange = useCallback((term: string) => {
        setSearchTerm(term);
    }, []);

    // Mémoriser les fonctions de tri pour éviter les rerenders
    const handleSortByChange = useCallback((sort: 'name' | 'price' | 'stock' | 'date') => {
        setSortBy(sort);
    }, []);

    const handleSortOrderChange = useCallback((order: 'asc' | 'desc') => {
        setSortOrder(order);
    }, []);

    // Fonction pour ouvrir le modal de validation avant l'envoi
    const handleSendProductsToSession = useCallback(() => {
        if (!selectedSessionId || standProducts.length === 0) return;
        const sessionToSend = upcomingSessions.find((s: MarketSessionWithProducts) => s.id === selectedSessionId);
        if (sessionToSend) {
            openValidationModal(sessionToSend);
        }
    }, [selectedSessionId, standProducts.length, upcomingSessions, openValidationModal]);

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
        errors: {},
    };

    const formReducer = (state: FormState, action: FormAction): FormState => {
        switch (action.type) {
            case 'SET_PRODUCT':
                return {
                    ...state,
                    selectedProduct: action.payload,
                    variantId: '',
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

    // Résultat pour le formulaire d'ajout avec reducer
    const [formState, dispatch] = useReducer(formReducer, initialFormState);

    // Résulttat pour l'édition
    const [editData, setEditData] = useState<{
        price: string;
        stock: string;
        isActive: boolean;
    }>({ price: '', stock: '', isActive: true });

    // Mémorisation des options d'unités

    // Filtrer et trier les produits du stand
    const filteredAndSortedStandProducts = useMemo(() => {
        let filtered = standProducts;

        // Filtrage par terme de recherche
        if (searchTerm.trim()) {
            filtered = standProducts.filter(
                (standProduct) =>
                    standProduct.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    standProduct.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    standProduct.unit?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    standProduct.category?.toLowerCase().includes(searchTerm.toLowerCase()),
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

    const validateForm = useCallback((): boolean => {
        dispatch({ type: 'CLEAR_ERRORS' });
        let isValid = true;

        if (!formState.selectedProduct) {
            dispatch({
                type: 'SET_ERROR',
                payload: { field: 'product', message: 'Veuillez sélectionner un produit' },
            });
            isValid = false;
        }

        if (!formState.unitId) {
            dispatch({
                type: 'SET_ERROR',
                payload: { field: 'unitId', message: 'Veuillez sélectionner une unité' },
            });
            isValid = false;
        }

        if (!formState.price || parseFloat(formState.price) <= 0) {
            dispatch({
                type: 'SET_ERROR',
                payload: { field: 'price', message: 'Le prix doit être supérieur à  0' },
            });
            isValid = false;
        }

        if (!formState.quantity || parseFloat(formState.quantity) <= 0) {
            dispatch({
                type: 'SET_ERROR',
                payload: { field: 'quantity', message: 'La quantité doit être supérieure à  0' },
            });
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
            const selectedVariant = formState.variantId
                ? formState.selectedProduct?.variants?.find((v) => v.id === formState.variantId)
                : null;
            const selectedUnit = units.find((u) => u.id === formState.unitId);

            const newMarketProduct = {
                growerId: growerId,
                name: formState.selectedProduct!.name + (selectedVariant ? ` - ${selectedVariant.optionValue}` : ''),
                description: formState.selectedProduct!.description || '',
                imageUrl: formState.selectedProduct!.imageUrl || '',
                price: parseFloat(formState.price),
                stock: parseFloat(formState.quantity),
                unit: selectedUnit?.symbol || '',
                category: formState.selectedProduct!.category || '',
                marketSessionId: activeSession?.id || '',
                isActive: true,
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
    const handleRemoveProduct = useCallback(
        async (id: string) => {
            if (!window.confirm('êtes-vous sûr de vouloir supprimer ce produit du stand ?')) {
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
        },
        [removeStandProduct, success],
    );

    // Commencer l'édition avec useCallback
    const startEdit = useCallback(
        (standProduct: { id: string; price: number; stock: number | null; isActive: boolean }) => {
            setEditingId(standProduct.id);
            setEditData({
                price: standProduct.price.toString(),
                stock: (standProduct.stock ?? 0).toString(),
                isActive: standProduct.isActive,
            });
        },
        [],
    );

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
            isActive: editData.isActive,
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

    const handleSuggestionSuccess = useCallback(() => {
        setShowSuggestionForm(false);
        success('Suggestion de produit envoyée avec succès!');
    }, [success]);

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
        <>
            <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
                    <div>
                        <Text
                            variant="h1"
                            className="text-secondary"
                        >
                            Mon Stand
                        </Text>
                        <p className="text-sm sm:text-base text-gray-600 mt-1">
                            Gérez les produits de votre stand pour les sessions de marché
                        </p>
                    </div>
                    <Button
                        onClick={() => setShowAddForm(!showAddForm)}
                        variant="secondary"
                        className="py-4 rounded-full"
                    >
                        <span className="hidden sm:inline">{showAddForm ? 'Annuler' : '+ Ajouter un produit'}</span>
                        <span className="sm:hidden">{showAddForm ? 'Annuler' : 'Ajouter'}</span>
                    </Button>
                </div>

                {/* Formulaire d'ajout */}
                {showAddForm && (
                    <Card className="mb-4 sm:mb-6">
                        <div className="p-4 sm:p-6">
                            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
                                Ajouter un produit au stand
                            </h3>
                            <div className="space-y-4">
                                {!activeSession && (
                                    <div className="p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                                        <p className="text-yellow-800 text-xs sm:text-sm">
                                            â„¹ï¸ Aucune session de marché active. Vous pouvez composer votre liste de
                                            produits librement.
                                        </p>
                                    </div>
                                )}

                                <div className="space-y-3 sm:space-y-4">
                                    <div>
                                        <Label className="text-xs sm:text-sm">Produit</Label>
                                        <ProductSelector
                                            items={availableProducts}
                                            value={formState.selectedProduct}
                                            onSelect={(product) => dispatch({ type: 'SET_PRODUCT', payload: product })}
                                            clearAfterSelect={false}
                                            className="mt-1"
                                        />
                                        {formState.errors.product && (
                                            <p className="text-red-500 text-xs sm:text-sm mt-1">
                                                {formState.errors.product}
                                            </p>
                                        )}
                                    </div>

                                    {formState.selectedProduct && formState.selectedProduct.variants.length > 0 && (
                                        <div>
                                            <Label
                                                htmlFor="variantId"
                                                className="text-xs sm:text-sm"
                                            >
                                                Variante (optionnel pour le marché)
                                            </Label>
                                            <Select
                                                value={formState.variantId}
                                                onValueChange={(value) => handleFormFieldChange('variantId', value)}
                                            >
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder="Sélectionner une variante (optionnel)" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="">Aucune variante spécifique</SelectItem>
                                                    {formState.selectedProduct.variants.map((variant) => (
                                                        <SelectItem
                                                            key={variant.id}
                                                            value={variant.id}
                                                        >
                                                            {variant.optionValue}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Pour le marché, vous pouvez choisir librement vos variants ou ne pas en
                                                spécifier
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                                    <div>
                                        <Label
                                            htmlFor="unitId"
                                            className="flex items-center gap-2 text-xs sm:text-sm"
                                        >
                                            Unité
                                            <span
                                                title="Choisissez l'unité de mesure pour ce produit"
                                                className="cursor-help"
                                            >
                                                <InfoIcon className="w-3 h-3 text-gray-400" />
                                            </span>
                                        </Label>
                                        <Select
                                            value={formState.unitId}
                                            onValueChange={(value) => handleFormFieldChange('unitId', value)}
                                        >
                                            <SelectTrigger className="text-sm">
                                                <SelectValue placeholder="Sélectionner une unité" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {units.map((unit) => (
                                                    <SelectItem
                                                        key={unit.id}
                                                        value={unit.id}
                                                    >
                                                        {unit.name} ({unit.symbol})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {formState.errors.unitId && (
                                            <p className="text-red-500 text-xs sm:text-sm mt-1">
                                                {formState.errors.unitId}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label
                                            htmlFor="price"
                                            className="flex items-center gap-2 text-xs sm:text-sm"
                                        >
                                            Prix (€)
                                            <span
                                                title="Prix de vente par unité (ex: 2.50€ par kg)"
                                                className="cursor-help"
                                            >
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
                                            <p className="text-red-500 text-xs sm:text-sm mt-1">
                                                {formState.errors.price}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label
                                            htmlFor="quantity"
                                            className="flex items-center gap-2 text-xs sm:text-sm"
                                        >
                                            Quantité
                                            <span
                                                title="Quantité disponible à la vente"
                                                className="cursor-help"
                                            >
                                                <InfoIcon className="w-3 h-3 text-gray-400" />
                                            </span>
                                        </Label>
                                        <Input
                                            id="quantity"
                                            type="number"
                                            step="0.001"
                                            min="0"
                                            value={formState.quantity}
                                            onChange={(e) => handleFormFieldChange('quantity', e.target.value)}
                                            placeholder="1"
                                            className="text-sm"
                                        />
                                        {formState.errors.quantity && (
                                            <p className="text-red-500 text-xs sm:text-sm mt-1">
                                                {formState.errors.quantity}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-2">
                                    <Button
                                        onClick={handleAddProduct}
                                        disabled={
                                            !formState.selectedProduct ||
                                            !formState.unitId ||
                                            !formState.price?.trim() ||
                                            !formState.quantity?.trim() ||
                                            parseFloat(formState.price || '0') <= 0 ||
                                            parseFloat(formState.quantity || '0') <= 0 ||
                                            isSubmitting
                                        }
                                        className="flex items-center gap-2 w-full sm:w-auto justify-center text-sm"
                                    >
                                        <span>X</span>
                                        {isSubmitting ? 'Ajout en cours...' : 'Ajouter au stand'}
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={handleCancelForm}
                                        className="flex items-center gap-2 w-full sm:w-auto justify-center text-sm"
                                    >
                                        <span>X</span>
                                        Annuler
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Section Suggestions de produits de marché */}
                <ProductSuggestionsSection
                    showSuggestionForm={showSuggestionForm}
                    setShowSuggestionForm={setShowSuggestionForm}
                    growerId={growerId}
                    handleSuggestionSuccess={handleSuggestionSuccess}
                />

                {/* La section "Produits créés à  partir de suggestions approuvées" a été supprimée car ces produits sont déjà  recensés dans l'onglet "Voir mes suggestions" */}

                {/* Section d'envoi de produits vers une session */}
                <SendProductsSection
                    standProducts={standProducts}
                    setShowExplanationModal={setShowExplanationModal}
                    selectedSessionId={selectedSessionId}
                    setSelectedSessionId={setSelectedSessionId}
                    upcomingSessionsLoading={upcomingSessionsLoading}
                    upcomingSessions={upcomingSessions}
                    activeSession={activeSession}
                    isValidatingProducts={isValidatingProducts}
                    handleSendProductsToSession={handleSendProductsToSession}
                />

                <ProductsList
                    standProducts={standProducts}
                    filteredAndSortedStandProducts={filteredAndSortedStandProducts}
                    searchTerm={searchTerm}
                    setSearchTerm={handleSearchTermChange}
                    sortBy={sortBy}
                    setSortBy={handleSortByChange}
                    sortOrder={sortOrder}
                    setSortOrder={handleSortOrderChange}
                    setShowAddForm={setShowAddForm}
                    editingId={editingId}
                    editData={editData}
                    setEditData={setEditData}
                    startEdit={startEdit}
                    saveEdit={saveEdit}
                    cancelEdit={cancelEdit}
                    handleRemoveProduct={handleRemoveProduct}
                    isSubmitting={isSubmitting}
                />
            </div>

            <SendProductsExplanationModal
                isOpen={showExplanationModal}
                onClose={() => setShowExplanationModal(false)}
            />

            <MarketProductValidationModal
                isOpen={isModalOpen}
                onClose={closeValidationModal}
                standProducts={standProducts}
                selectedSession={selectedSession}
                units={units}
                growerId={growerId}
                onProductToggle={toggleMarketProduct}
                onValidateList={async (sessionId, products) => {
                    const ok = await validateMarketProductList(sessionId, products);
                    if (!ok) return false;
                    try {
                        const response = await fetch('/api/market/participations', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ sessionId, growerId, status: 'CONFIRMED' }),
                        });
                        return response.ok;
                    } catch (e) {
                        return false;
                    }
                }}
                isSubmitting={isValidatingProducts}
            />
        </>
    );
}

export default MonStand;
