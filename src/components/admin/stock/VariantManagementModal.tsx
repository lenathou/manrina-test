import React, { useState } from 'react';
import { IProduct, IProductVariant, IUnit, IProductVariantCreationData } from '../../../server/product/IProduct';
import { useUpdateVariant } from '../../../hooks/useUpdateVariant';
import { useCreateVariant } from '../../../hooks/useCreateVariant';
import { useDeleteVariant } from '../../../hooks/useDeleteVariant';
import { useQuery } from '@tanstack/react-query';
import { backendFetchService } from '../../../service/BackendFetchService';
import { Button } from '../../ui/Button';
import { Text } from '../../ui/Text';
import { Card, CardHeader, CardContent, CardTitle } from '../../ui/Card';
import { getDisplayVariantValue } from '../../../utils/productDisplay';

interface VariantManagementModalProps {
    product: IProduct;
    isOpen: boolean;
    onClose: () => void;
}

export const VariantManagementModal: React.FC<VariantManagementModalProps> = ({
    product,
    isOpen,
    onClose
}) => {
    const [editingVariant, setEditingVariant] = useState<IProductVariant | null>(null);
    const [tempQuantity, setTempQuantity] = useState('');
    const [selectedUnitId, setSelectedUnitId] = useState('');
    const [tempPrice, setTempPrice] = useState('');
    const [isAddingVariant, setIsAddingVariant] = useState(false);
    const [newVariantData, setNewVariantData] = useState<Partial<IProductVariantCreationData>>({
        optionSet: 'variant',
        optionValue: '',
        productId: product.id,
        price: 0,
        quantity: 1,
        unitId: '',
        description: null,
        imageUrl: null,
    });

    const { data: units = [] } = useQuery({
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
    const canAddMoreVariants = product.variants.length < 4;

    // Fonction pour obtenir les unités compatibles pour les variants selon l'unité globale du produit
    const getCompatibleUnitsForVariant = () => {
        const globalUnit = product.baseUnit || units.find((unit: IUnit) => unit.id === product.baseUnitId);
            
        if (!globalUnit) {
            return units;
        }
        
        if (globalUnit.category === 'weight') {
            return units.filter((unit: IUnit) => 
                unit.category === 'weight' && ['kg', 'g'].includes(unit.symbol)
            );
        } else if (globalUnit.category === 'volume') {
            return units.filter((unit: IUnit) => 
                unit.category === 'volume' && ['L', 'ml', 'cl'].includes(unit.symbol)
            );
        } else {
            return units.filter((unit: IUnit) => unit.id === globalUnit.id);
        }
    };

    const handleEditVariant = (variant: IProductVariant) => {
        setEditingVariant(variant);
        setTempQuantity(variant.quantity?.toString() || '1');
        setSelectedUnitId(variant.unitId || '');
        setTempPrice(variant.price?.toString() || '0');
    };

    const handleSaveVariant = async () => {
        if (!editingVariant) return;
        
        const quantity = parseFloat(tempQuantity) || 1;
        const price = parseFloat(tempPrice) || 0;
        
        // Générer automatiquement le nom du variant
        
        updateVariantMutation.mutate({
            variantId: editingVariant.id,
            dataToUpdate: {
                unitId: selectedUnitId || null,
                quantity: quantity,
                price: price,
            },
        });
        
        setEditingVariant(null);
    };

    const handleCreateVariant = async () => {
        if (!newVariantData.unitId || !newVariantData.quantity) {
            alert('Veuillez sélectionner une unité et saisir une quantité');
            return;
        }

        const selectedUnit = units.find((unit: IUnit) => unit.id === newVariantData.unitId);
        // Générer automatiquement le nom du variant
        const optionValue = selectedUnit ? `${newVariantData.quantity} ${selectedUnit.symbol}` : `${newVariantData.quantity}`;

        createVariantMutation.mutate({
            productId: product.id,
            variantData: {
                optionSet: 'variant',
                optionValue: optionValue,
                productId: product.id,
                price: newVariantData.price || 0,
                quantity: newVariantData.quantity || 1,
                unitId: newVariantData.unitId || '',
                stock: 0,
                description: newVariantData.description || null,
                imageUrl: newVariantData.imageUrl || null,
            },
        });
        
        setIsAddingVariant(false);
        setNewVariantData({
            optionSet: 'variant',
            optionValue: '',
            productId: product.id,
            price: 0,
            quantity: 1,
            unitId: '',
            description: null,
            imageUrl: null,
        });
    };

    const handleDeleteVariant = async (variantId: string) => {
        const confirmed = window.confirm('Êtes-vous sûr de vouloir supprimer ce variant ?');
        if (confirmed) {
            deleteVariantMutation.deleteVariant({ variantId, productId: product.id });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <CardHeader className="bg-secondary">
                    <div className="flex justify-between items-center">
                        <CardTitle>Gestion des variants - {product.name}</CardTitle>
                        <Button
                            onClick={onClose}
                            variant="secondary"
                            className="text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-6">

                {/* Liste des variants existants */}
                <div className="space-y-4 mb-6">
                    <Text variant="h4">Variants existants</Text>
                    {product.variants.map((variant) => {
                        const isEditing = editingVariant?.id === variant.id;
                        
                        return (
                            <div key={variant.id} className="border rounded-lg p-4">
                                {isEditing ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Quantité
                                                </label>
                                                <input
                                                    type="number"
                                                    value={tempQuantity}
                                                    onChange={(e) => setTempQuantity(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                    step="0.01"
                                                    min="0"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Unité
                                                </label>
                                                <select
                                                    value={selectedUnitId}
                                                    onChange={(e) => setSelectedUnitId(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                >
                                                    <option value="">Sélectionner une unité</option>
                                                    {getCompatibleUnitsForVariant().map((unit) => (
                                                        <option key={unit.id} value={unit.id}>
                                                            {unit.name} ({unit.symbol})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Prix (€)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={tempPrice}
                                                    onChange={(e) => setTempPrice(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                    step="0.01"
                                                    min="0"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={handleSaveVariant}
                                                disabled={updating}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                {updating ? 'Sauvegarde...' : 'Sauvegarder'}
                                            </Button>
                                            <Button
                                                onClick={() => setEditingVariant(null)}
                                                variant="secondary"
                                            >
                                                Annuler
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <Text variant="body" className="font-medium">
                                                {getDisplayVariantValue(variant, units)}
                                            </Text>
                                            <Text variant="small" className="text-gray-600">
                                                {variant.price}€
                                            </Text>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => handleEditVariant(variant)}
                                                variant="secondary"
                                                size="sm"
                                            >
                                                Modifier
                                            </Button>
                                            {product.variants.length > 1 && (
                                                <Button
                                                    onClick={() => handleDeleteVariant(variant.id)}
                                                    variant="secondary"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-700"
                                                    disabled={deleting}
                                                >
                                                    {deleting ? 'Suppression...' : 'Supprimer'}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Ajouter un nouveau variant */}
                {canAddMoreVariants && (
                    <div className="border-t pt-6">
                        <Text variant="h4" className="mb-4">Ajouter un nouveau variant</Text>
                        {isAddingVariant ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Quantité
                                        </label>
                                        <input
                                            type="number"
                                            value={newVariantData.quantity || ''}
                                            onChange={(e) => setNewVariantData(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 1 }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            step="0.01"
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Unité
                                        </label>
                                        <select
                                            value={newVariantData.unitId || ''}
                                            onChange={(e) => setNewVariantData(prev => ({ ...prev, unitId: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        >
                                            <option value="">Sélectionner une unité</option>
                                            {getCompatibleUnitsForVariant().map((unit) => (
                                                <option key={unit.id} value={unit.id}>
                                                    {unit.name} ({unit.symbol})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Prix (€)
                                        </label>
                                        <input
                                            type="number"
                                            value={newVariantData.price || ''}
                                            onChange={(e) => setNewVariantData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            step="0.01"
                                            min="0"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={handleCreateVariant}
                                        disabled={creating}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        {creating ? 'Création...' : 'Créer le variant'}
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            setIsAddingVariant(false);
                                            setNewVariantData({
                                                optionSet: 'variant',
                                                optionValue: '',
                                                productId: product.id,
                                                price: 0,
                                                quantity: 1,
                                                unitId: '',
                                                description: null,
                                                imageUrl: null,
                                            });
                                        }}
                                        variant="secondary"
                                    >
                                        Annuler
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <Button
                                onClick={() => setIsAddingVariant(true)}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                + Ajouter un variant
                            </Button>
                        )}
                    </div>
                )}

                {!canAddMoreVariants && (
                    <div className="border-t pt-6">
                        <Text variant="small" className="text-gray-500">
                            Limite de 4 variants atteinte. Supprimez un variant existant pour en ajouter un nouveau.
                        </Text>
                    </div>
                )}
                </CardContent>
            </Card>
        </div>
    );
};

export default VariantManagementModal;