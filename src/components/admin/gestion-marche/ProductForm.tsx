import React, { useState, useEffect } from 'react';
import { CreateMarketProductRequest, UpdateMarketProductRequest, MarketProduct } from '../../../types/market';
import { useGrowers } from '../../../hooks/useGrowers';

interface ProductFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateMarketProductRequest | UpdateMarketProductRequest) => Promise<void>;
    product?: MarketProduct | null;
    sessionId: string;
    title: string;
}

const ProductForm: React.FC<ProductFormProps> = ({ isOpen, onClose, onSubmit, product, sessionId, title }) => {
    const { growers } = useGrowers({ page: 1, limit: 100 });
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: 0,
        stock: 0,
        unit: '',
        category: '',
        growerId: '',
        isActive: true,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                description: product.description || '',
                price: Number(product.price),
                stock: product.stock,
                unit: product.unit || '',
                category: product.category || '',
                growerId: product.growerId,
                isActive: product.isActive,
            });
        } else {
            setFormData({
                name: '',
                description: '',
                price: 0,
                stock: 0,
                unit: '',
                category: '',
                growerId: '',
                isActive: true,
            });
        }
        setError(null);
    }, [product, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (product) {
                await onSubmit({
                    id: product.id,
                    ...formData,
                } as UpdateMarketProductRequest);
            } else {
                await onSubmit({
                    ...formData,
                    marketSessionId: sessionId,
                } as CreateMarketProductRequest);
            }
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]:
                type === 'number'
                    ? Number(value)
                    : type === 'checkbox'
                      ? (e.target as HTMLInputElement).checked
                      : value,
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                </div>

                {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                >
                    <div>
                        <label htmlFor="product-name" className="block text-sm font-medium text-gray-700 mb-1">Nom du produit *</label>
                        <input
                            type="text"
                            id="product-name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="product-description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            id="product-description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="product-price" className="block text-sm font-medium text-gray-700 mb-1">Prix (€) *</label>
                            <input
                                type="number"
                                id="product-price"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="product-stock" className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
                            <input
                                type="number"
                                id="product-stock"
                                name="stock"
                                value={formData.stock}
                                onChange={handleChange}
                                min="0"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="product-unit" className="block text-sm font-medium text-gray-700 mb-1">Unité</label>
                            <input
                                type="text"
                                id="product-unit"
                                name="unit"
                                value={formData.unit}
                                onChange={handleChange}
                                placeholder="kg, pièce, litre..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="product-category" className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                            <input
                                type="text"
                                id="product-category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                placeholder="Légumes, Fruits..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="product-grower" className="block text-sm font-medium text-gray-700 mb-1">Producteur *</label>
                        <select
                            id="product-grower"
                            name="growerId"
                            value={formData.growerId}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Sélectionner un producteur</option>
                            {growers.map((grower) => (
                                <option
                                    key={grower.id}
                                    value={grower.id}
                                >
                                    {grower.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="product-is-active"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={handleChange}
                            className="mr-2"
                        />
                        <label htmlFor="product-is-active" className="text-sm font-medium text-gray-700">Produit actif</label>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Enregistrement...' : product ? 'Modifier' : 'Créer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductForm;
