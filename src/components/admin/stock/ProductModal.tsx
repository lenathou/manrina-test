/* eslint-disable react/no-unescaped-entities */
import { useState, useEffect, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// Removed Decimal import - using number instead
import { IProduct } from '@/server/product/IProduct';
import { backendFetchService } from '@/service/BackendFetchService';
import { STOCK_GET_ALL_PRODUCTS_QUERY_KEY } from '../stock.config';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/Select';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { ScrollArea } from '@/components/ui/ScrollArea';

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

    const [variantPrice, setVariantPrice] = useState<number>(0);
    const [variantQuantity, setVariantQuantity] = useState<number>(1);
    const [variantUnitId, setVariantUnitId] = useState('');

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

    // Générer automatiquement le nom du variant basé sur quantité + unité
    const generateVariantName = useMemo(() => {
        if (!variantQuantity || !variantUnitId) return '';
        const selectedUnit = units.find(unit => unit.id === variantUnitId);
        if (!selectedUnit) return '';
        return `${variantQuantity} ${selectedUnit.symbol}`;
    }, [variantQuantity, variantUnitId, units]);

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
                setVariantPrice(variant.price);
                setVariantQuantity(variant.quantity || 1);
                setVariantUnitId(variant.unitId || '');
            }
        } else {
            // Reset pour nouveau produit
            setName('');
            setDescription('');
            setImageUrl('');
            setCategory('');
            setShowInStore(true);
            setVariantPrice(0);
            setVariantQuantity(1);
            setVariantUnitId('');
        }
    }, [product]);

    const handleSave = () => {
        if (!name.trim()) {
            alert('Le nom du produit est requis');
            return;
        }
        if (variantPrice <= 0) {
            alert('Le prix doit être supérieur à 0');
            return;
        }
        if (!variantUnitId) {
            alert('L\'unité est requise');
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
                    optionSet: 'variant',
                    optionValue: generateVariantName,
                    price: variantPrice,
                    quantity: variantQuantity,
                    unitId: variantUnitId || null,
                    stock: 0, // Valeur par défaut
                    description: null,
                    imageUrl: null,
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
            <Card className="bg-background w-full max-w-4xl max-h-[90vh] p-0 flex flex-col">
                <CardHeader className="bg-secondary text-white p-6 m-0">
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
                <ScrollArea className="flex-1">
                    <CardContent className="bg-background p-6">

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
                                    className="w-full px-3 py-2 bg-white border border-primary rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-colors duration-200"
                                    placeholder="Nom du produit"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-primary rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-colors duration-200"
                                    rows={3}
                                    placeholder="Description du produit"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Image du produit</label>
                                <ImageUpload
                                    value={imageUrl}
                                    onChange={(imageUrl) => setImageUrl(imageUrl)}
                                    placeholder="URL de l'image ou uploadez un fichier"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                                <Select
                                    value={category}
                                    onValueChange={(value) => setCategory(value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner une catégorie" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableCategories.map((cat) => (
                                            <SelectItem
                                                key={cat}
                                                value={cat}
                                            >
                                                {cat}
                                            </SelectItem>
                                        ))}
                                        <SelectItem value="__custom__">Autre (saisir manuellement)</SelectItem>
                                    </SelectContent>
                                </Select>

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
                            {/* Affichage du nom généré automatiquement */}
                            {generateVariantName && (
                                <div className="bg-gray-50 p-3 rounded-md border">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nom du variant (généré automatiquement)
                                    </label>
                                    <p className="text-lg font-semibold text-[var(--color-primary)]">
                                        {generateVariantName}
                                    </p>
                                </div>
                            )}

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
                                    <Select
                                        value={variantUnitId}
                                        onValueChange={(value) => setVariantUnitId(value)}
                                    >
                                        <SelectTrigger>
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
                                </div>
                            </div>

                        </div>
                    )}
                </div>
                    </CardContent>
                </ScrollArea>

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
