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
import { SearchBarNext } from '@/components/ui/SearchBarNext';
import { useGrowerStandProducts } from '@/hooks/useGrowerStandProducts';
import { useUnits } from '@/hooks/useUnits';
import { useToast } from '@/components/ui/Toast';
import { useProductQuery } from '@/hooks/useProductQuery';
import { useMarketSessions } from '@/hooks/useMarket';
import { formatDateLong } from '@/utils/dateUtils';

import { IGrowerTokenPayload } from '@/server/grower/IGrower';
import { IProduct } from '@/server/product/IProduct';
import { MarketProductSuggestionForm } from '@/components/grower/marche/mon-stand/MarketProductSuggestionForm';
import { useMarketProductSuggestions, useDeleteMarketProductSuggestion } from '@/hooks/useMarketProductSuggestion';
import { useApprovedSuggestionProducts } from '@/hooks/useApprovedSuggestionProducts';
import { useConvertSuggestionProduct } from '@/hooks/useConvertSuggestionProduct';
import { SendProductsExplanationModal } from '@/components/grower/marche/mon-stand/SendProductsExplanationModal';
import { MarketProductValidationModal } from '@/components/grower/MarketProductValidationModal';
import { useMarketProductValidation } from '@/hooks/useMarketProductValidation';
// Composant Info simple sans dépendance externe
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

    // États pour les suggestions de produits de marché
    const [showSuggestionForm, setShowSuggestionForm] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Hooks pour les suggestions de produits de marché
    const { data: marketSuggestions = [], isLoading: suggestionsLoading } = useMarketProductSuggestions(growerId);
    const deleteMarketSuggestionMutation = useDeleteMarketProductSuggestion();

    // Hook pour les produits créés à partir de suggestions approuvées
    useApprovedSuggestionProducts(growerId);

    // Hook pour convertir les produits suggérés en produits normaux
    const convertSuggestionMutation = useConvertSuggestionProduct();

    // Hook pour le modal de validation de liste de produits
    const {
        isSubmitting: isValidatingProducts,
        isModalOpen,
        selectedSession,
        openValidationModal,
        closeValidationModal,
        toggleMarketProduct,
        validateMarketProductList,
    } = useMarketProductValidation({ growerId });

    const { standProducts, isLoading, error, addStandProduct, updateStandProduct, removeStandProduct } =
        useGrowerStandProducts(growerId);

    const { data: units = [] } = useUnits();
    const { data: allProducts = [] } = useProductQuery();

    // Filtrer les produits disponibles (non déjà dans le stand)
    const availableProducts = useMemo(() => {
        return allProducts.filter(
            (product) =>
                product.showInStore && !standProducts.some((standProduct) => standProduct.name === product.name),
        );
    }, [allProducts, standProducts]);

    // Récupérer les sessions de marché actives avec mémorisation
    const sessionFilters = useMemo(() => ({ upcoming: true, limit: 1 }), []);
    const { sessions } = useMarketSessions(sessionFilters);
    const activeSession = useMemo(
        () => sessions.find((session) => session.status === 'ACTIVE' || session.status === 'UPCOMING'),
        [sessions],
    );

    // Récupérer toutes les sessions à venir pour le dropdown
    const upcomingSessionsFilters = useMemo(() => ({ upcoming: true }), []);
    const { sessions: upcomingSessions, loading: upcomingSessionsLoading } = useMarketSessions(upcomingSessionsFilters);

    // État pour la session sélectionnée pour l'envoi de produits
    const [selectedSessionId, setSelectedSessionId] = useState<string>('');
    const [showExplanationModal, setShowExplanationModal] = useState(false);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock' | 'date'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // Fonction pour ouvrir le modal de validation avant l'envoi
    const handleSendProductsToSession = useCallback(() => {
        if (!selectedSessionId || standProducts.length === 0) return;
        const sessionToSend = upcomingSessions.find((s) => s.id === selectedSessionId);
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

    // État pour le formulaire d'ajout avec reducer
    const [formState, dispatch] = useReducer(formReducer, initialFormState);

    // État pour l'édition
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
            dispatch({
                type: 'SET_ERROR',
                payload: { field: 'quantity', message: 'La quantité doit être supérieure à 0' },
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
                stock: parseInt(formState.quantity),
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

    // Handlers mémorisés pour les changements d'état d'édition

    // Handler mémorisé pour les changements de tri

    // Handler mémorisé pour la recherche

    // Handlers pour les suggestions de produits de marché
    const handleSuggestionSuccess = useCallback(() => {
        setShowSuggestionForm(false);
        success('Suggestion de produit envoyée avec succès!');
    }, [success]);

    // Fonction pour convertir un produit suggéré en produit normal
    const handleConvertToNormalProduct = useCallback(
        async (productId: string) => {
            try {
                await convertSuggestionMutation.mutateAsync({ productId, growerId });
                success('Produit converti avec succès en produit normal!');
            } catch (error) {
                console.error('Erreur lors de la conversion du produit:', error);
            }
        },
        [convertSuggestionMutation, growerId, success],
    );

    const handleDeleteSuggestion = useCallback(
        async (suggestionId: string) => {
            if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette suggestion ?')) {
                return;
            }

            try {
                await deleteMarketSuggestionMutation.mutateAsync(suggestionId);
                success('Suggestion supprimée avec succès');
            } catch (error) {
                console.error('Erreur lors de la suppression de la suggestion:', error);
            }
        },
        [deleteMarketSuggestionMutation, success],
    );

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            case 'APPROVED':
                return 'bg-green-100 text-green-800';
            case 'REJECTED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'En attente';
            case 'APPROVED':
                return 'Approuvée';
            case 'REJECTED':
                return 'Rejetée';
            default:
                return status;
        }
    };

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
                            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
                                Ajouter un produit au stand
                            </h3>
                            <div className="space-y-4">
                                {!activeSession && (
                                    <div className="p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                                        <p className="text-yellow-800 text-xs sm:text-sm">
                                            ℹ️ Aucune session de marché active. Vous pouvez composer votre liste de
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
                                                title="Quantité disponible à la vente"
                                                className="cursor-help"
                                            >
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
                                            !formState.price ||
                                            !formState.quantity ||
                                            isSubmitting
                                        }
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

                {/* Section Suggestions de produits de marché */}
                <Card className="p-3 sm:p-4 mb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                            Suggestions de produits de marché
                        </h3>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                                onClick={() => setShowSuggestionForm(!showSuggestionForm)}
                                variant="outline"
                                className="flex items-center gap-2 text-sm"
                            >
                                <span>💡</span>
                                {showSuggestionForm ? 'Masquer le formulaire' : 'Suggérer un produit'}
                            </Button>
                            <Button
                                onClick={() => setShowSuggestions(!showSuggestions)}
                                variant="outline"
                                className="flex items-center gap-2 text-sm"
                            >
                                <span>📋</span>
                                {showSuggestions
                                    ? 'Masquer mes suggestions'
                                    : `Voir mes suggestions (${marketSuggestions.length})`}
                            </Button>
                        </div>
                    </div>

                    {showSuggestionForm && (
                        <div className="mb-4">
                            <MarketProductSuggestionForm
                                growerId={growerId}
                                onSuccess={handleSuggestionSuccess}
                                onCancel={() => setShowSuggestionForm(false)}
                            />
                        </div>
                    )}

                    {showSuggestions && (
                        <div className="space-y-3">
                            {suggestionsLoading ? (
                                <p className="text-gray-500 text-sm">Chargement des suggestions...</p>
                            ) : marketSuggestions.length === 0 ? (
                                <p className="text-gray-500 text-sm">Aucune suggestion de produit pour le moment.</p>
                            ) : (
                                marketSuggestions.map((suggestion) => (
                                    <div
                                        key={suggestion.id}
                                        className="border rounded-lg p-3 bg-gray-50"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h4 className="font-medium text-gray-800">{suggestion.name}</h4>
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(suggestion.status)}`}
                                                    >
                                                        {getStatusText(suggestion.status)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                                                <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                                                    <span>
                                                        Prix: {suggestion.pricing}€/{suggestion.unit}
                                                    </span>
                                                    <span>Catégorie: {suggestion.category}</span>
                                                    <span>Créé le: {formatDateLong(suggestion.createdAt)}</span>
                                                </div>
                                                {suggestion.adminComment && (
                                                    <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                                                        <strong>Commentaire admin:</strong> {suggestion.adminComment}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                {suggestion.imageUrl && (
                                                    <Image
                                                        src={suggestion.imageUrl}
                                                        alt={suggestion.name}
                                                        width={60}
                                                        height={60}
                                                        className="rounded object-cover"
                                                    />
                                                )}
                                                {suggestion.status === 'APPROVED' && (
                                                    <Button
                                                        onClick={() => handleConvertToNormalProduct(suggestion.id)}
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                    >
                                                        Convertir en produit normal
                                                    </Button>
                                                )}
                                                {suggestion.status === 'PENDING' && (
                                                    <Button
                                                        onClick={() => handleDeleteSuggestion(suggestion.id)}
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        🗑️
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </Card>

                {/* La section "Produits créés à partir de suggestions approuvées" a été supprimée car ces produits sont déjà recensés dans l'onglet "Voir mes suggestions" */}

                {/* Section d'envoi de produits vers une session */}
                {standProducts.length > 0 && (
                    <Card className="p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">📤 Envoyer ma liste de produits</h3>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setShowExplanationModal(true)}
                                className="flex items-center gap-2 text-sm"
                            >
                                <InfoIcon className="w-4 h-4" />
                                Aide
                            </Button>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">
                            Sélectionnez une session de marché à venir pour y envoyer votre liste de produits actuelle.
                            Cela permettra aux administrateurs de voir vos produits pour cette session.
                        </p>

                        <div className="space-y-4">
                            <div>
                                <Label
                                    htmlFor="sessionSelect"
                                    className="text-sm font-medium"
                                >
                                    Choisir une session de marché
                                </Label>
                                <Select
                                    value={selectedSessionId}
                                    onValueChange={setSelectedSessionId}
                                    disabled={upcomingSessionsLoading}
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Sélectionner une session..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {upcomingSessions
                                            .filter((session) => session.id !== activeSession?.id)
                                            .map((session) => (
                                                <SelectItem
                                                    key={session.id}
                                                    value={session.id}
                                                >
                                                    {formatDateLong(session.date)} - {session.location}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {selectedSessionId && (
                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                        <strong>
                                            {standProducts.length} produit{standProducts.length > 1 ? 's' : ''}
                                        </strong>{' '}
                                        sera{standProducts.length > 1 ? 'ont' : ''} envoyé
                                        {standProducts.length > 1 ? 's' : ''} pour cette session.
                                    </p>
                                </div>
                            )}

                            <Button
                                onClick={handleSendProductsToSession}
                                disabled={!selectedSessionId || isValidatingProducts || standProducts.length === 0}
                                className="w-full sm:w-auto"
                            >
                                {isValidatingProducts ? 'Envoi en cours...' : 'Envoyer ma liste de produits'}
                            </Button>
                        </div>
                    </Card>
                )}

                {/* Barre de recherche et tri */}
                {standProducts.length > 0 && (
                    <div className="mb-3 sm:mb-4 space-y-3 sm:space-y-4">
                        <div>
                            <Label
                                htmlFor="search"
                                className="text-xs sm:text-sm"
                            >
                                Rechercher dans vos produits
                            </Label>
                            <div className="mt-1">
                                <SearchBarNext
                                    placeholder="Rechercher par nom de produit..."
                                    value={searchTerm}
                                    onSearch={setSearchTerm}
                                    className="text-sm"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                            <div className="flex-1">
                                <Label
                                    htmlFor="sortBy"
                                    className="text-xs sm:text-sm"
                                >
                                    Trier par
                                </Label>
                                <Select
                                    value={sortBy}
                                    onValueChange={(value: string) =>
                                        setSortBy(value as 'name' | 'price' | 'stock' | 'date')
                                    }
                                >
                                    <SelectTrigger className="mt-1 text-sm">
                                        <span className="block truncate text-sm">
                                            {sortBy === 'name' && 'Nom du produit'}
                                            {sortBy === 'price' && 'Prix'}
                                            {sortBy === 'stock' && 'Stock'}
                                            {sortBy === 'date' && "Date d'ajout"}
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
                                <Label
                                    htmlFor="sortOrder"
                                    className="text-xs sm:text-sm"
                                >
                                    Ordre
                                </Label>
                                <Select
                                    value={sortOrder}
                                    onValueChange={(value: string) => setSortOrder(value as 'asc' | 'desc')}
                                >
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
                                    {filteredAndSortedStandProducts.length} produit(s) trouvé(s) sur{' '}
                                    {standProducts.length} total
                                </span>
                            ) : (
                                <span>{standProducts.length} produit(s) dans votre stand</span>
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
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-semibold text-base sm:text-lg">
                                                        {standProduct.name}
                                                    </h3>
                                                    <span
                                                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                            standProduct.isActive
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'
                                                        }`}
                                                    >
                                                        {standProduct.isActive ? '🟢 Actif' : '🔴 Inactif'}
                                                    </span>
                                                </div>
                                                <div className="text-gray-600 text-xs sm:text-sm space-y-1 sm:space-y-0">
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                                        <span className="font-medium">
                                                            {standProduct.price.toString()}€ / {standProduct.unit}
                                                        </span>
                                                        <span className="hidden sm:inline">•</span>
                                                        <span>Stock: {standProduct.stock}</span>
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                                        <span>Catégorie: {standProduct.category}</span>
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
                                                            onClick={() =>
                                                                startEdit({
                                                                    id: standProduct.id,
                                                                    price: Number(standProduct.price),
                                                                    stock: standProduct.stock,
                                                                    isActive: standProduct.isActive,
                                                                })
                                                            }
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
                                                            <span className="hidden sm:inline">
                                                                {isSubmitting ? 'Suppression...' : 'Supprimer'}
                                                            </span>
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
                                                            onChange={(e) =>
                                                                setEditData((prev) => ({
                                                                    ...prev,
                                                                    price: e.target.value,
                                                                }))
                                                            }
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
                                                            onChange={(e) =>
                                                                setEditData((prev) => ({
                                                                    ...prev,
                                                                    stock: e.target.value,
                                                                }))
                                                            }
                                                            className="text-sm"
                                                        />
                                                    </div>

                                                    <div className="flex items-center space-x-2">
                                                        <Switch
                                                            checked={editData.isActive}
                                                            onCheckedChange={(checked) =>
                                                                setEditData((prev) => ({ ...prev, isActive: checked }))
                                                            }
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
                onValidateList={validateMarketProductList}
                isSubmitting={isValidatingProducts}
            />
        </>
    );
}

export default MonStand;
