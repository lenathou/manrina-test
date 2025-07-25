/* eslint-disable react/no-unescaped-entities */
import { useState, useEffect } from 'react';
import { IProduct } from '../../server/product/IProduct';
import { backendFetchService } from '../../service/BackendFetchService';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { createPortal } from 'react-dom';
import { STOCK_GET_ALL_PRODUCTS_QUERY_KEY } from './stock.config';

interface ProductEditModalProps {
    product: IProduct;
    isOpen: boolean;
    onClose: () => void;
}

export function ProductEditModal({ product, isOpen, onClose }: ProductEditModalProps) {
    const [productName, setProductName] = useState(product.name);
    const [selectedCategory, setSelectedCategory] = useState(product.category || '');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const queryClient = useQueryClient();

    // Récupérer tous les produits pour extraire les catégories
    const { data: allProducts = [] } = useQuery({
        queryKey: [STOCK_GET_ALL_PRODUCTS_QUERY_KEY],
        queryFn: () => backendFetchService.getAllProducts(),
    });

    // Extraire les catégories uniques
    const availableCategories = Array.from(
        new Set(allProducts.map((p) => p.category).filter((category) => category && category.trim() !== '')),
    ).sort();

    const updateProductMutation = useMutation({
        mutationFn: async (updates: { name?: string; category?: string }) => {
            return await backendFetchService.updateProduct(product.id, updates);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [STOCK_GET_ALL_PRODUCTS_QUERY_KEY] });
            onClose();
        },
        onError: (error) => {
            console.error('Erreur lors de la mise à jour du produit:', error);
            alert('Erreur lors de la mise à jour du produit');
        },
    });

    const deleteProductMutation = useMutation({
        mutationFn: async () => {
            return await backendFetchService.deleteProduct(product.id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [STOCK_GET_ALL_PRODUCTS_QUERY_KEY] });
            onClose();
        },
        onError: (error) => {
            console.error('Erreur lors de la suppression du produit:', error);
            alert('Erreur lors de la suppression du produit');
        },
    });

    // Réinitialiser les valeurs quand le produit change
    useEffect(() => {
        setProductName(product.name);
        setSelectedCategory(product.category || '');
        setShowDeleteConfirm(false);
    }, [product]);

    const handleSave = () => {
        const updates: { name?: string; category?: string } = {};

        if (productName.trim() !== product.name) {
            updates.name = productName.trim();
        }

        if (selectedCategory !== product.category) {
            updates.category = selectedCategory || undefined;
        }

        if (Object.keys(updates).length > 0) {
            updateProductMutation.mutate(updates);
        } else {
            onClose();
        }
    };

    const handleDelete = async () => {
        try {
            await deleteProductMutation.mutateAsync();
            setShowDeleteConfirm(false);
            onClose();
            // Recharger la page pour s'assurer que la suppression est visible
            window.location.reload();
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
        }
    };

    const handleCancel = () => {
        setProductName(product.name);
        setSelectedCategory(product.category || '');
        setShowDeleteConfirm(false);

        onClose();
    };

    if (!isOpen) return null;

    const modalContent = (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            style={{ zIndex: 9999 }}
        >
            <div className="bg-white rounded-xl p-8 w-[500px] max-w-[90vw] shadow-2xl max-h-[90vh] overflow-y-auto">
                {/* En-tête du modal */}
                <div className="mb-6">
                    <h3 className="text-xl font-secondary font-bold text-secondary mb-3">
                        {showDeleteConfirm ? 'Supprimer le produit' : 'Modifier le produit'}
                    </h3>
                    <p className="text-base text-gray-700 mb-1">Produit : {product.name}</p>
                    <p className="text-sm text-gray-500">ID : {product.id}</p>
                </div>

                {!showDeleteConfirm ? (
                    // Formulaire de modification
                    <>
                        <div className="space-y-6">
                            {/* Nom du produit */}
                            <div>
                                <label className="block text-base font-medium text-secondary mb-2">
                                    Nom du produit *
                                </label>
                                <input
                                    type="text"
                                    value={productName}
                                    onChange={(e) => setProductName(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                    placeholder="Nom du produit"
                                    disabled={updateProductMutation.isPending}
                                />
                            </div>

                            {/* Catégorie */}
                            <div>
                                <label className="block text-base font-medium text-secondary mb-2">Catégorie</label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                    disabled={updateProductMutation.isPending}
                                >
                                    <option value="">Aucune catégorie</option>
                                    {availableCategories.map((category) => (
                                        <option
                                            key={category}
                                            value={category}
                                        >
                                            {category}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-sm text-gray-500 mt-1">
                                    Sélectionnez une catégorie existante ou laissez vide
                                </p>
                            </div>
                        </div>

                        {/* Boutons d'action */}
                        <div className="flex justify-between items-center mt-8">
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                disabled={updateProductMutation.isPending}
                                className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Supprimer le produit
                            </button>

                            <div className="flex space-x-4">
                                <button
                                    onClick={handleCancel}
                                    disabled={updateProductMutation.isPending}
                                    className="px-6 py-3 text-base font-medium text-secondary bg-background border-2 border-gray-200 rounded-lg hover:bg-gray-100 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={updateProductMutation.isPending || !productName.trim()}
                                    className="px-6 py-3 text-base font-medium text-white bg-primary rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                                >
                                    {updateProductMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    // Confirmation de suppression
                    <>
                        <div className="space-y-6">
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-center mb-2">
                                    <svg
                                        className="w-5 h-5 text-red-600 mr-2"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    <h4 className="text-red-800 font-medium">Confirmation</h4>
                                </div>
                                <p className="text-red-700 text-sm">
                                    Êtes-vous sûr de vouloir supprimer le produit "{product.name}" ?
                                </p>
                            </div>
                        </div>

                        {/* Boutons de confirmation */}
                        <div className="flex justify-end space-x-4 mt-8">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={deleteProductMutation.isPending}
                                className="px-6 py-3 text-base font-medium text-secondary bg-background border-2 border-gray-200 rounded-lg hover:bg-gray-100 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Non
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleteProductMutation.isPending}
                                className="px-6 py-3 text-base font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                            >
                                {deleteProductMutation.isPending ? 'Suppression...' : 'Oui'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );

    return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
