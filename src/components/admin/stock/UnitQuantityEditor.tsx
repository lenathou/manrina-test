
/* eslint-disable react/no-unescaped-entities */
import { useState } from 'react';
import { IProduct, IProductVariant, IUnit, IProductVariantCreationData } from '../../../server/product/IProduct';
import { useUpdateVariant } from '../../../hooks/useUpdateVariant';
import { useCreateVariant } from '../../../hooks/useCreateVariant';
import { useDeleteVariant } from '../../../hooks/useDeleteVariant';
import { useQuery } from '@tanstack/react-query';
import { backendFetchService } from '../../../service/BackendFetchService';
import { createPortal } from 'react-dom';
import { getDisplayVariantValue } from '../../../utils/productDisplay';

interface UnitQuantityEditorProps {
    variant: IProductVariant;
    productName?: string;
    productId: string;
    product: IProduct;
    allVariants: IProductVariant[];
    showInStore?: boolean;
}

export function UnitQuantityEditor({ variant, productName, productId, product, allVariants, showInStore = true }: UnitQuantityEditorProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tempQuantity, setTempQuantity] = useState(variant.quantity?.toString() || '1');
    const [selectedUnitId, setSelectedUnitId] = useState(variant.unitId || '');
    const [tempPrice, setTempPrice] = useState(variant.price?.toString() || '0');
    const [isAddingVariant, setIsAddingVariant] = useState(false);
    const [newVariantData, setNewVariantData] = useState<Partial<IProductVariantCreationData>>({
        optionValue: '',
        price: 0,
        quantity: 1,
        unitId: '',
        stock: 0,
    });

    const { data: units = [], isLoading: unitsLoading } = useQuery({
        queryKey: ['units'],
        queryFn: () => backendFetchService.getAllUnits(),
    });

    const updateVariantMutation = useUpdateVariant<'unitId' | 'quantity' | 'price'>({
        errorMessage: "Erreur lors de la mise à jour de l'unité",
    });

    const createVariantMutation = useCreateVariant({
        errorMessage: 'Erreur lors de la création du variant',
    });

    const deleteVariantMutation = useDeleteVariant();

    const updating = updateVariantMutation.isPending;
    const creating = createVariantMutation.isPending;
    const deleting = deleteVariantMutation.isDeleting;
    const currentUnit = units.find((unit: IUnit) => unit.id === variant.unitId);
    const displayQuantity = variant.quantity || 1;
    const canAddMoreVariants = allVariants.length < 4;

    // Fonction pour obtenir les unités compatibles pour les variants selon l'unité globale du produit
    const getCompatibleUnitsForVariant = () => {
        // Récupérer l'unité globale du produit depuis l'unité de base du produit
        const globalUnit = product.baseUnit || units.find((unit: IUnit) => unit.id === product.baseUnitId);
            
        if (!globalUnit) {
            return units; // Si pas d'unité globale définie, afficher toutes les unités
        }
        
        if (globalUnit.category === 'weight') {
            // Si l'unité globale est du poids (kg), permettre kg et g
            return units.filter((unit: IUnit) => 
                unit.category === 'weight' && ['kg', 'g'].includes(unit.symbol)
            );
        } else if (globalUnit.category === 'volume') {
            // Si l'unité globale est du volume (L), permettre L, ml et cl
            return units.filter((unit: IUnit) => 
                unit.category === 'volume' && ['L', 'ml', 'cl'].includes(unit.symbol)
            );
        } else {
            // Pour les autres catégories, utiliser uniquement l'unité globale
            return units.filter((unit: IUnit) => unit.id === globalUnit.id);
        }
    };

    const handleSave = async () => {
        const quantity = parseFloat(tempQuantity) || 1;
        const price = parseFloat(tempPrice) || 0;
        
        // Mettre à jour uniquement le variant actuel
        updateVariantMutation.mutate({
            variantId: variant.id,
            dataToUpdate: {
                unitId: selectedUnitId || null,
                quantity: quantity,
                price: price,
            },
        });
        
        setIsModalOpen(false);
    };

    const handleCreateVariant = async () => {
        if (!newVariantData.optionValue) {
            alert('Veuillez remplir le nom du variant');
            return;
        }

        createVariantMutation.mutate({
            productId: productId,
            variantData: {
                optionSet: 'variant',
                optionValue: newVariantData.optionValue!,
                productId: productId,
                price: newVariantData.price || 0,
                quantity: newVariantData.quantity || 1,
                unitId: newVariantData.unitId!,
                stock: 0, // Stock géré au niveau global
                description: newVariantData.description || null,
                imageUrl: null,
            },
        });
        
        setIsAddingVariant(false);
        setNewVariantData({
            optionValue: '',
            price: 0,
            quantity: 1,
            unitId: '',
            stock: 0,
        });
    };

    const handleCancel = () => {
        setTempQuantity(variant.quantity?.toString() || '1');
        setSelectedUnitId(variant.unitId || '');
        setTempPrice(variant.price?.toString() || '0');
        setIsAddingVariant(false);
        setIsModalOpen(false);
    };

    const handleDeleteVariant = () => {
        if (allVariants.length <= 1) {
            alert('Impossible de supprimer ce variant : un produit doit avoir au moins un variant.');
            return;
        }

        if (confirm(`Êtes-vous sûr de vouloir supprimer ce variant ?`)) {
            deleteVariantMutation.deleteVariant({
                variantId: variant.id,
                productId: productId,
            });
            setIsModalOpen(false);
        }
    };

    const openModal = (selectedVariant?: IProductVariant) => {
        const variantToUse = selectedVariant || variant;
        setTempQuantity(variantToUse.quantity?.toString() || '1');
        setSelectedUnitId(variantToUse.unitId || '');
        setTempPrice(variantToUse.price?.toString() || '0');
        setIsModalOpen(true);
    };

    if (unitsLoading) {
        return <div className="text-center text-gray-500">Chargement...</div>;
    }

    const modalContent = (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            style={{ zIndex: 9999 }}
        >
            <div className="bg-white rounded-xl p-8 w-[500px] max-w-[90vw] shadow-2xl max-h-[90vh] overflow-y-auto">
                {/* En-tête du modal */}
                <div className="mb-6">
                    <h3 className="text-xl font-secondary font-bold text-secondary mb-3">
                        {isAddingVariant ? 'Ajouter un nouveau variant' : 'Modifier le variant'}
                    </h3>
                    <p className="text-base text-gray-700 mb-1">Produit : {productName || 'Produit sans nom'}</p>
                    {!isAddingVariant && (
                        <p className="text-sm text-gray-500">
                            Variante : {getDisplayVariantValue(variant, units)}
                        </p>
                    )}
                </div>

                {/* Sélecteur de variant et onglets */}
                <div className="mb-6">
                    {!isAddingVariant && allVariants.length > 1 && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-secondary mb-2">Variant à modifier</label>
                            <select
                                value={variant.id}
                                onChange={(e) => {
                                    const selectedVariant = allVariants.find((v) => v.id === e.target.value);
                                    if (selectedVariant) {
                                        openModal(selectedVariant);
                                    }
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            >
                                {allVariants.map((v) => (
                                    <option
                                        key={v.id}
                                        value={v.id}
                                    >
                                        {v.optionValue || 'Variant par défaut'} - {v.price}€
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setIsAddingVariant(false)}
                            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                                !isAddingVariant
                                    ? 'bg-white text-tertiary shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Modifier variant
                        </button>
                        {canAddMoreVariants && (
                            <button
                                onClick={() => setIsAddingVariant(true)}
                                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                                    isAddingVariant
                                        ? 'bg-white text-tertiary shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                Ajouter variant ({allVariants.length}/4)
                            </button>
                        )}
                    </div>
                </div>

                {/* Formulaire */}
                <div className="space-y-6">
                    {isAddingVariant ? (
                        // Formulaire pour nouveau variant
                        <>
                            <div>
                                <label className="block text-base font-medium text-secondary mb-2">
                                    Nom du variant *
                                </label>
                                <input
                                    type="text"
                                    value={newVariantData.optionValue || ''}
                                    onChange={(e) =>
                                        setNewVariantData((prev) => ({ ...prev, optionValue: e.target.value }))
                                    }
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-tertiary focus:border-tertiary transition-all"
                                    placeholder="Ex: 2kg, 500g, 1L..."
                                    disabled={creating}
                                />
                            </div>
                            <div>
                                <label className="block text-base font-medium text-secondary mb-2">Prix (€) *</label>
                                <input
                                    type="number"
                                    value={newVariantData.price || ''}
                                    onChange={(e) =>
                                        setNewVariantData((prev) => ({
                                            ...prev,
                                            price: parseFloat(e.target.value) || 0,
                                        }))
                                    }
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-tertiary focus:border-tertiary transition-all"
                                    placeholder="Prix"
                                    disabled={creating}
                                    step="0.01"
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="block text-base font-medium text-secondary mb-2">
                                    Quantité
                                </label>
                                <input
                                    type="number"
                                    value={newVariantData.quantity || ''}
                                    onChange={(e) =>
                                        setNewVariantData((prev) => ({
                                            ...prev,
                                            quantity: parseFloat(e.target.value) || 1,
                                        }))
                                    }
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-tertiary focus:border-tertiary transition-all"
                                    placeholder="Quantité"
                                    disabled={creating}
                                    step="0.001"
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="block text-base font-medium text-secondary mb-2">
                                    Unité
                                </label>
                                {unitsLoading ? (
                                    <div className="text-center py-4 text-gray-500">Chargement des unités...</div>
                                ) : units.length === 0 ? (
                                    <div className="text-center py-4 text-red-500">Aucune unité disponible</div>
                                ) : (
                                    <div className="grid grid-cols-3 gap-3">
                                        {getCompatibleUnitsForVariant().map((unit: IUnit) => (
                                            <button
                                                key={unit.id}
                                                type="button"
                                                onClick={() => setNewVariantData(prev => ({ ...prev, unitId: unit.id }))}
                                                disabled={creating}
                                                className={`px-4 py-3 text-sm font-medium rounded-lg border-2 transition-all ${
                                                    newVariantData.unitId === unit.id
                                                        ? 'bg-tertiary text-white border-tertiary shadow-md'
                                                        : 'bg-white text-gray-700 border-gray-200 hover:bg-background hover:border-tertiary'
                                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                                            >
                                                {unit.symbol}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        // Formulaire pour modifier variant existant
                        <>
                            <div>
                                <label className="block text-base font-medium text-secondary mb-2">Prix (€)</label>
                                <input
                                    type="number"
                                    value={tempPrice}
                                    onChange={(e) => setTempPrice(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-tertiary focus:border-tertiary transition-all"
                                    placeholder="Prix"
                                    disabled={updating}
                                    step="0.01"
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="block text-base font-medium text-secondary mb-2">Quantité</label>
                                <input
                                    type="number"
                                    value={tempQuantity}
                                    onChange={(e) => setTempQuantity(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-tertiary focus:border-tertiary transition-all"
                                    placeholder="Quantité"
                                    disabled={updating}
                                    step="0.001"
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="block text-base font-medium text-secondary mb-3">
                                    Unité du variant
                                    <span className="block text-sm text-gray-500 font-normal mt-1">
                                        Choisissez l'unité pour ce variant spécifique
                                    </span>
                                </label>
                                {unitsLoading ? (
                                    <div className="text-center py-4 text-gray-500">Chargement des unités...</div>
                                ) : units.length === 0 ? (
                                    <div className="text-center py-4 text-red-500">Aucune unité disponible</div>
                                ) : (
                                    <div className="grid grid-cols-3 gap-3">
                                        {getCompatibleUnitsForVariant().map((unit: IUnit) => (
                                            <button
                                                key={unit.id}
                                                type="button"
                                                onClick={() => setSelectedUnitId(unit.id)}
                                                disabled={updating}
                                                className={`px-4 py-3 text-sm font-medium rounded-lg border-2 transition-all ${
                                                    selectedUnitId === unit.id
                                                        ? 'bg-tertiary text-white border-tertiary shadow-md'
                                                        : 'bg-white text-gray-700 border-gray-200 hover:bg-background hover:border-tertiary'
                                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                                            >
                                                {unit.symbol}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Boutons d'action */}
                <div className="flex justify-between mt-8">
                    {/* Bouton de suppression à gauche (seulement si on modifie un variant existant et qu'il y a plus d'un variant) */}
                    <div>
                        {!isAddingVariant && allVariants.length > 1 && (
                            <button
                                onClick={handleDeleteVariant}
                                disabled={updating || creating || deleting}
                                className="px-6 py-3 text-base font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                            >
                                {deleting ? 'Suppression...' : 'Supprimer'}
                            </button>
                        )}
                    </div>
                    
                    {/* Boutons Annuler et Sauvegarder à droite */}
                    <div className="flex space-x-4">
                        <button
                            onClick={handleCancel}
                            disabled={updating || creating || deleting}
                            className="px-6 py-3 text-base font-medium text-secondary bg-background border-2 border-gray-200 rounded-lg hover:bg-gray-100 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={isAddingVariant ? handleCreateVariant : handleSave}
                            disabled={updating || creating || deleting}
                            className="px-6 py-3 text-base font-medium text-white bg-tertiary rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                        >
                            {isAddingVariant
                                ? creating
                                    ? 'Création...'
                                    : 'Créer variant'
                                : updating
                                  ? 'Sauvegarde...'
                                  : 'Sauvegarder'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Affichage de l'unité actuelle */}
            <div className={`flex flex-col items-center space-y-2 ${!showInStore ? 'opacity-50' : ''}`}>
                <div className="text-sm text-gray-700 text-center">
                    {displayQuantity} {currentUnit ? currentUnit.symbol : 'unité'}
                </div>
                <button
                    onClick={() => openModal()}
                    disabled={updating}
                    className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                    Modifier
                </button>
            </div>

            {/* Modal rendu via Portal */}
            {isModalOpen && typeof document !== 'undefined' && createPortal(modalContent, document.body)}
        </>
    );
}
