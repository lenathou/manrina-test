/* eslint-disable react/no-unescaped-entities */
import React, { useState } from 'react';
import { IProduct, IProductVariant, IUnit } from '@/server/product/IProduct';
import { useFilteredProducts } from '@/hooks/useFilteredProducts';
import { CategorySelector } from '../CategorySelector';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';
import { ShowInStoreBadge } from '@/components/admin/ShowInStoreBadge';
import { VariantLowestPriceButton } from '@/components/admin/VariantLowestPriceButton';
import { UnitQuantityEditor } from '../UnitQuantityEditor';
import SearchBarNext from '@/components/ui/SearchBarNext';

interface CatalogueTabProps {
    products: IProduct[];
    units: IUnit[];
    onCreateProduct: () => void;
    onEditProduct: (product: IProduct) => void;
    onOpenPricesModal: (product: IProduct) => void;
}

function getDisplayVariantValue(variant: IProductVariant, units: IUnit[]) {
    const unit = units.find((u) => u.id === variant.unitId);
    const unitSymbol = unit ? unit.symbol : 'unité';
    return `${variant.quantity} ${unitSymbol} - ${variant.price}€`;
}

export function CatalogueTab({
    products,
    units,
    onCreateProduct,
    onEditProduct,
    onOpenPricesModal,
}: CatalogueTabProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

    // Extraire toutes les catégories uniques
    const allCategories = Array.from(
        new Set(
            products.map((product) => product.category).filter((category): category is string => !!category),
        ),
    );

    // Filtrer d'abord par terme de recherche
    const searchFilteredProducts = useFilteredProducts(products, searchTerm, {
        includeVariants: true,
    });

    // Puis filtrer par catégorie
    const filteredProductsList =
        selectedCategory === ''
            ? searchFilteredProducts
            : searchFilteredProducts.filter((product) => product.category === selectedCategory);

    return (
        <div className="space-y-6">
            {/* Dashboard avec métriques */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm font-medium">Produits actifs</p>
                            <p className="text-3xl font-bold">{products.filter((p) => p.showInStore).length}</p>
                        </div>
                        <div className="bg-blue-400 bg-opacity-30 rounded-full p-3">
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm font-medium">Total produits</p>
                            <p className="text-3xl font-bold">{products.length}</p>
                        </div>
                        <div className="bg-green-400 bg-opacity-30 rounded-full p-3">
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-yellow-100 text-sm font-medium">Catégories</p>
                            <p className="text-3xl font-bold">{allCategories.length}</p>
                        </div>
                        <div className="bg-yellow-400 bg-opacity-30 rounded-full p-3">
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm font-medium">Variants</p>
                            <p className="text-3xl font-bold">
                                {products.reduce((acc, p) => acc + p.variants.length, 0)}
                            </p>
                        </div>
                        <div className="bg-purple-400 bg-opacity-30 rounded-full p-3">
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtres et actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                    <div className="flex flex-col sm:flex-row gap-4 items-center flex-1">
                        {/* Barre de recherche */}
                        <div className="flex-1 max-w-md">
                            <SearchBarNext
                                placeholder="Rechercher un produit..."
                                value={searchTerm}
                                onSearch={setSearchTerm}
                            />
                        </div>

                        {/* Sélecteur de catégorie */}
                        <CategorySelector
                            categories={allCategories}
                            selectedCategory={selectedCategory}
                            onCategorySelect={setSelectedCategory}
                        />

                        {/* Sélecteur de vue */}
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('cards')}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    viewMode === 'cards'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                                    />
                                </svg>
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    viewMode === 'table'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 10h16M4 14h16M4 18h16"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <Button
                            onClick={onCreateProduct}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                            variant="primary"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 4v16m8-8H4"
                                />
                            </svg>
                            Créer un produit
                        </Button>
                    </div>
                </div>

                {/* Résultats de recherche */}
                {(searchTerm || selectedCategory) && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                        <span>{filteredProductsList.length} produit(s) trouvé(s)</span>
                        {searchTerm && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                "{searchTerm}"
                            </span>
                        )}
                        {selectedCategory && (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                                {selectedCategory}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Contenu principal */}
            {viewMode === 'cards' ? (
                <ProductCardsView
                    products={filteredProductsList}
                    units={units}
                    onProductEdit={onEditProduct}
                    onPricesModalOpen={onOpenPricesModal}
                />
            ) : (
                <ProductTableView
                    products={filteredProductsList}
                    units={units}
                    onProductEdit={onEditProduct}
                    onPricesModalOpen={onOpenPricesModal}
                />
            )}
        </div>
    );
}

// Composant pour la vue en cartes
function ProductCardsView({
    products,
    units,
    onProductEdit,
    onPricesModalOpen,
}: {
    products: IProduct[];
    units: IUnit[];
    onProductEdit: (product: IProduct) => void;
    onPricesModalOpen: (product: IProduct) => void;
}) {
    if (products.length === 0) {
        return (
            <div className="text-center py-12">
                <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun produit trouvé</h3>
                <p className="mt-1 text-sm text-gray-500">Essayez de modifier vos critères de recherche.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
                <ProductCard
                    key={product.id}
                    product={product}
                    units={units}
                    onEdit={() => onProductEdit(product)}
                    onPricesModalOpen={() => onPricesModalOpen(product)}
                />
            ))}
        </div>
    );
}

// Composant pour la vue en tableau (version simplifiée de l'existant)
function ProductTableView({}: {
    products: IProduct[];
    units: IUnit[];
    onProductEdit: (product: IProduct) => void;
    onPricesModalOpen: (product: IProduct) => void;
}) {
    // Ici on peut réutiliser la logique du tableau existant
    // Pour l'instant, on affiche un message
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-gray-600">Vue tableau - À implémenter avec le tableau existant</p>
        </div>
    );
}

// Composant carte de produit
function ProductCard({
    product,
    units,
    onEdit,
    onPricesModalOpen,
}: {
    product: IProduct;
    units: IUnit[];
    onEdit: () => void;
    onPricesModalOpen: () => void;
}) {
    return (
        <div
            className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 ${
                !product.showInStore ? 'opacity-60' : ''
            }`}
        >
            {/* Image du produit */}
            <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                <Image
                    src={product.imageUrl}
                    width={400}
                    height={200}
                    style={{ objectFit: 'cover' }}
                    alt={product.name}
                />
            </div>

            {/* Contenu de la carte */}
            <div className="p-4">
                {/* En-tête avec nom et statut */}
                <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 truncate flex-1 mr-2">{product.name}</h3>
                    <ShowInStoreBadge product={product} />
                </div>

                {/* Catégorie */}
                {product.category && (
                    <div className="mb-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {product.category}
                        </span>
                    </div>
                )}

                {/* Variants */}
                <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Variants ({product.variants.length})</h4>
                    <div className="space-y-3 max-h-40 overflow-y-auto">
                        {product.variants.slice(0, 3).map((variant) => (
                            <div
                                key={variant.id}
                                className="flex items-center justify-between text-sm bg-gray-50 rounded p-3"
                            >
                                <div className="flex-1">
                                    <span className="text-gray-600 truncate block mb-1">
                                        {getDisplayVariantValue(variant, units)}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <UnitQuantityEditor
                                            variant={variant}
                                            productName={product.name}
                                            productId={product.id}
                                            product={product}
                                            allVariants={product.variants}
                                            showInStore={product.showInStore}
                                        />
                                        <VariantLowestPriceButton
                                            variantId={variant.id}
                                            productId={product.id}
                                            productName={product.name}
                                            onOpenPricesModal={() => onPricesModalOpen()}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        {product.variants.length > 3 && (
                            <div className="text-xs text-gray-500 text-center py-2">
                                +{product.variants.length - 3} autres variants
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <Button
                        onClick={onEdit}
                        variant="secondary"
                        className="flex-1 text-sm"
                    >
                        Modifier
                    </Button>
                    <Button
                        onClick={onPricesModalOpen}
                        variant="secondary"
                        className="flex-1 text-sm"
                    >
                        Prix
                    </Button>
                </div>
            </div>
        </div>
    );
}

// Composant pour le bouton de stock global (réutilisé)
