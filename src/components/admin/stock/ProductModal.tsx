/* eslint-disable react/no-unescaped-entities */
import { useState, useEffect, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// Removed Decimal import - using number instead
import { IProduct } from '@/server/product/IProduct';
import { backendFetchService } from '@/service/BackendFetchService';
import { STOCK_GET_ALL_PRODUCTS_QUERY_KEY } from '../stock.config';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';

type TabType = 'product' | 'variant';

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (product: IProduct) => void;
    product?: IProduct;
}

export function ProductModal({ isOpen, onClose, onSave, product }: ProductModalProps) {
    const [activeTab, setActiveTab] = useState<TabType>('product');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [category, setCategory] = useState('');
    const [showInStore, setShowInStore] = useState(true);
    const [variantOptionSet, setVariantOptionSet] = useState('');
    const [variantOptionValue, setVariantOptionValue] = useState('');
    const [variantPrice, setVariantPrice] = useState<number>(0);
    const [variantQuantity, setVariantQuantity] = useState<number>(1);
    const [variantUnitId, setVariantUnitId] = useState('');
    const [variantStock, setVariantStock] = useState<number>(0);
    const [variantDescription, setVariantDescription] = useState('');
    const [variantImageUrl, setVariantImageUrl] = useState('');

    const queryClient = useQueryClient();

    const { data: units = [] } = useQuery({
        queryKey: ['units'],
        queryFn: () => backendFetchService.getAllUnits(),
    });

    // Nouvelle requête pour récupérer tous les produits et extraire les catégories
    const { data: allProducts = [] } = useQuery({
        queryKey: STOCK_GET_ALL_PRODUCTS_QUERY_KEY,
        queryFn: () => backendFetchService.getAllProducts(),
    });

    // Extraire les catégories uniques des produits existants
    const availableCategories = useMemo(() => {
        const categories = allProducts
            .map((product) => product.category)
            .filter(
                (category): category is string => category !== null && category !== undefined && category.trim() !== '',
            )
            .filter((category, index, array) => array.indexOf(category) === index) // Supprimer les doublons
            .sort((a, b) => a.localeCompare(b)); // Trier alphabétiquement
        return categories;
    }, [allProducts]);

    const { mutate: createProduct, isPending } = useMutation({
        mutationFn: async (productData: IProduct) => {
            return backendFetchService.createProduct(productData);
        },
        onSuccess: (createdProduct) => {
            queryClient.invalidateQueries({ queryKey: STOCK_GET_ALL_PRODUCTS_QUERY_KEY });
            onSave({
                ...createdProduct,
                globalStock: 0,
                baseQuantity: 1
            });
            onClose();
        },
        onError: (error) => {
            console.error('Erreur lors de la création du produit:', error);
            alert('Erreur lors de la création du produit');
        },
    });

    useEffect(() => {
        if (product) {
            setName(product.name);
            setDescription(product.description || '');
            setImageUrl(product.imageUrl);
            setCategory(product.category || '');
            setShowInStore(product.showInStore);

            // Si le produit a des variants, prendre le premier
            if (product.variants.length > 0) {
                const variant = product.variants[0];
                setVariantOptionSet(variant.optionSet);
                setVariantOptionValue(variant.optionValue);
                setVariantPrice(variant.price);
                setVariantQuantity(variant.quantity || 1);
                setVariantUnitId(variant.unitId || '');
                setVariantStock(variant.stock);
                setVariantDescription(variant.description || '');
                setVariantImageUrl(variant.imageUrl || '');
            }
        } else {
            // Reset pour nouveau produit
            setName('');
            setDescription('');
            setImageUrl('');
            setCategory('');
            setShowInStore(true);
            setVariantOptionSet('variant');
            setVariantOptionValue('');
            setVariantPrice(0);
            setVariantQuantity(1);
            setVariantUnitId('');
            setVariantStock(0);
            setVariantDescription('');
            setVariantImageUrl('');
        }
    }, [product]);

    const handleSave = () => {
        if (!name.trim()) {
            alert('Le nom du produit est requis');
            return;
        }
        if (!variantOptionSet.trim() || !variantOptionValue.trim()) {
            alert('Les options du variant sont requises');
            return;
        }
        if (variantPrice <= 0) {
            alert('Le prix doit être supérieur à 0');
            return;
        }

        const productData: IProduct = {
            globalStock: 0,
            baseQuantity: 1,
            baseUnitId: variantUnitId || null,
            baseUnit: null,
            id: product?.id || `product_${Date.now()}`,
            name: name.trim(),
            description: description.trim() || null,
            imageUrl: imageUrl.trim(),
            category: category.trim() || null,
            showInStore,
            variants: [
                {
                    id: product?.variants[0]?.id || `variant_${Date.now()}`,
                    productId: product?.id || `product_${Date.now()}`,
                    optionSet: variantOptionSet.trim(),
                    optionValue: variantOptionValue.trim(),
                    price: variantPrice,
                    quantity: variantQuantity,
                    unitId: variantUnitId || null,
                    stock: variantStock,
                    description: variantDescription.trim() || null,
                    imageUrl: variantImageUrl.trim() || null,
                    vatRate: { taxRate: 8.5, taxId: 'default' }, // Valeur par défaut
                    showDescriptionOnPrintDelivery: false,
                },
            ],
        };

        createProduct(productData);
    };

    if (!isOpen) return null;

    const tabs = [
        { id: 'product' as TabType, label: 'Informations du produit' },
        { id: 'variant' as TabType, label: 'Variant du produit' },
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="bg-background w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <CardHeader className="bg-secondary text-white">
                    <div className="flex justify-between items-center">
                        <CardTitle className="font-secondary font-bold text-xl sm:text-2xl">
                            {product ? 'Modifier le produit' : 'Créer un nouveau produit'}
                        </CardTitle>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-gray-300 text-xl font-bold"
                        >
                            ✕
                        </button>
                    </div>
                </CardHeader>
                <CardContent className="p-6">

                {/* Onglets */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-8">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                                    activeTab === tab.id
                                        ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Contenu des onglets */}
                <div className="space-y-6">
                    {/* Onglet Informations du produit */}
                    {activeTab === 'product' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du produit *</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-3 py-2 border border-[var(--muted)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-colors duration-200"
                                    placeholder="Nom du produit"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-3 py-2 border border-[var(--muted)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-colors duration-200"
                                    rows={3}
                                    placeholder="Description du produit"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">URL de l'image</label>
                                <input
                                    type="url"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    className="w-full px-3 py-2 border border-[var(--muted)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-colors duration-200"
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full px-3 py-2 border border-[var(--muted)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-colors duration-200"
                                >
                                    <option value="">Sélectionner une catégorie</option>
                                    {availableCategories.map((cat) => (
                                        <option
                                            key={cat}
                                            value={cat}
                                        >
                                            {cat}
                                        </option>
                                    ))}
                                    <option value="__custom__">Autre (saisir manuellement)</option>
                                </select>

                                {/* Champ de saisie manuel si "Autre" est sélectionné */}
                                {category === '__custom__' && (
                                    <input
                                        type="text"
                                        value={category === '__custom__' ? '' : category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full px-3 py-2 border border-[var(--muted)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-colors duration-200 mt-2"
                                        placeholder="Nouvelle catégorie"
                                        autoFocus
                                    />
                                )}
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="showInStore"
                                    checked={showInStore}
                                    onChange={(e) => setShowInStore(e.target.checked)}
                                    className="mr-2"
                                />
                                <label
                                    htmlFor="showInStore"
                                    className="text-sm font-medium text-gray-700"
                                >
                                    Afficher en magasin
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Onglet Variant du produit */}
                    {activeTab === 'variant' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Type d'option *
                                    </label>
                                    <input
                                        type="text"
                                        value={variantOptionSet}
                                        onChange={(e) => setVariantOptionSet(e.target.value)}
                                        className="w-full px-3 py-2 border border-[var(--muted)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-colors duration-200"
                                        placeholder="ex: Taille, Couleur"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Valeur d'option *
                                    </label>
                                    <input
                                        type="text"
                                        value={variantOptionValue}
                                        onChange={(e) => setVariantOptionValue(e.target.value)}
                                        className="w-full px-3 py-2 border border-[var(--muted)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-colors duration-200"
                                        placeholder="ex: M, Rouge"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Prix (€) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={variantPrice}
                        onChange={(e) => setVariantPrice(parseFloat(e.target.value) || 0)}
                                        className="w-full px-3 py-2 border border-[var(--muted)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-colors duration-200"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={variantStock}
                        onChange={(e) => setVariantStock(parseFloat(e.target.value) || 0)}
                                        className="w-full px-3 py-2 border border-[var(--muted)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-colors duration-200"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantité</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        value={variantQuantity}
                        onChange={(e) => setVariantQuantity(parseFloat(e.target.value) || 1)}
                                        className="w-full px-3 py-2 border border-[var(--muted)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-colors duration-200"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Unité</label>
                                    <select
                                        value={variantUnitId}
                                        onChange={(e) => setVariantUnitId(e.target.value)}
                                        className="w-full px-3 py-2 border border-[var(--muted)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-colors duration-200"
                                    >
                                        <option value="">Aucune unité</option>
                                        {units.map((unit) => (
                                            <option
                                                key={unit.id}
                                                value={unit.id}
                                            >
                                                {unit.name} ({unit.symbol})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description du variant
                                </label>
                                <textarea
                                    value={variantDescription}
                                    onChange={(e) => setVariantDescription(e.target.value)}
                                    className="w-full px-3 py-2 border border-[var(--muted)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-colors duration-200"
                                    rows={2}
                                    placeholder="Description spécifique au variant"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    URL image du variant
                                </label>
                                <input
                                    type="url"
                                    value={variantImageUrl}
                                    onChange={(e) => setVariantImageUrl(e.target.value)}
                                    className="w-full px-3 py-2 border border-[var(--muted)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-colors duration-200"
                                    placeholder="https://example.com/variant-image.jpg"
                                />
                            </div>
                        </div>
                    )}
                </div>
                </CardContent>

                <CardFooter className="flex justify-end space-x-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-[var(--muted-foreground)] border border-[var(--muted)] rounded-md hover:bg-[var(--muted)] transition-colors duration-200 font-medium"
                        disabled={isPending}
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isPending}
                        className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-md hover:bg-[var(--color-primary)]/90 disabled:opacity-50 transition-colors duration-200 font-medium"
                    >
                        {isPending ? 'Création...' : product ? 'Modifier' : 'Créer'}
                    </button>
                </CardFooter>
            </Card>
        </div>
    );
}
