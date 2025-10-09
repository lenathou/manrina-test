import React, { useState } from 'react';
import { IProduct, IUnit } from '@/server/product/IProduct';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';
import { VariantLowestPriceButton } from '../../VariantLowestPriceButton';
import { VatRateEditor } from '../../VatRateEditor';
import { ShowInStoreBadge } from '../../ShowInStoreBadge';
import { UnitQuantityEditor } from '../UnitQuantityEditor';

interface PriceValidationTabProps {
    products: IProduct[];
    units: IUnit[];
    onOpenPricesModal: (product: IProduct) => void;
}

export function PriceValidationTab({ products, onOpenPricesModal }: PriceValidationTabProps) {
    const [filterStatus, setFilterStatus] = useState<'all' | 'no-price' | 'low-price' | 'high-vat'>('all');
    const [sortBy, setSortBy] = useState<'name' | 'price' | 'vat'>('name');

    // Calculer les métriques de prix
    const priceMetrics = {
        totalVariants: products.reduce((acc, p) => acc + p.variants.length, 0),
        variantsWithPrice: products.reduce(
            (acc, p) => acc + p.variants.filter((v) => v.price && v.price > 0).length,
            0,
        ),
        variantsWithoutPrice: products.reduce(
            (acc, p) => acc + p.variants.filter((v) => !v.price || v.price === 0).length,
            0,
        ),
        productsInStore: products.filter((p) => p.showInStore).length,
    };

    // Filtrer les produits selon le statut sélectionné
    const filteredProducts = products.filter((product) => {
        switch (filterStatus) {
            case 'no-price':
                return product.variants.some((v) => !v.price || v.price === 0);
            case 'low-price':
                return product.variants.some((v) => v.price && v.price < 5);
            case 'high-vat':
                return product.variants.some((v) => v.vatRate && v.vatRate.taxRate > 10);
            default:
                return true;
        }
    });

    // Trier les produits
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        switch (sortBy) {
            case 'price':
                const avgPriceA = a.variants.reduce((acc, v) => acc + (v.price || 0), 0) / a.variants.length;
                const avgPriceB = b.variants.reduce((acc, v) => acc + (v.price || 0), 0) / b.variants.length;
                return avgPriceB - avgPriceA;
            case 'vat':
                const avgVatA = a.variants.reduce((acc, v) => acc + (v.vatRate?.taxRate || 0), 0) / a.variants.length;
                const avgVatB = b.variants.reduce((acc, v) => acc + (v.vatRate?.taxRate || 0), 0) / b.variants.length;
                return avgVatB - avgVatA;
            default:
                return a.name.localeCompare(b.name);
        }
    });

    return (
        <div className="space-y-6">
            {/* Dashboard de prix */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm font-medium">Total variants</p>
                            <p className="text-3xl font-bold">{priceMetrics.totalVariants}</p>
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
                                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm font-medium">Avec prix</p>
                            <p className="text-3xl font-bold">{priceMetrics.variantsWithPrice}</p>
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
                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-red-100 text-sm font-medium">Sans prix</p>
                            <p className="text-3xl font-bold">{priceMetrics.variantsWithoutPrice}</p>
                        </div>
                        <div className="bg-red-400 bg-opacity-30 rounded-full p-3">
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
                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm font-medium">En boutique</p>
                            <p className="text-3xl font-bold">{priceMetrics.productsInStore}</p>
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
                                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtres et tri */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Filtrer par statut</label>
                            <select
                                value={filterStatus}
                                onChange={(e) =>
                                    setFilterStatus(e.target.value as 'all' | 'no-price' | 'low-price' | 'high-vat')
                                }
                                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">Tous les produits</option>
                                <option value="no-price">Sans prix</option>
                                <option value="low-price">Prix bas (&lt; 5€)</option>
                                <option value="high-vat">TVA élevée (&gt; 10%)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Trier par</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'vat')}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="name">Nom</option>
                                <option value="price">Prix moyen</option>
                                <option value="vat">Taux de TVA</option>
                            </select>
                        </div>
                    </div>
                    <div className="text-sm text-gray-500">{sortedProducts.length} produit(s) affiché(s)</div>
                </div>
            </div>

            {/* Liste des produits avec prix et validation */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Gestion des prix et validation</h3>
                </div>

                <div className="divide-y divide-gray-200">
                    {sortedProducts.map((product) => (
                        <div
                            key={product.id}
                            className="px-6 py-4 hover:bg-gray-50"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-4">
                                    <Image
                                        src={product.imageUrl}
                                        width={80}
                                        height={80}
                                        style={{ borderRadius: 8 }}
                                        alt={product.name}
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <h4 className="text-lg font-medium text-gray-900">{product.name}</h4>
                                            <ShowInStoreBadge product={product} />
                                        </div>
                                        <p className="text-sm text-gray-500 mb-3">
                                            {product.category} • {product.variants.length} variant(s)
                                        </p>

                                        {/* Variants avec prix et TVA */}
                                        <div className="space-y-2">
                                            {product.variants.map((variant) => (
                                                <div
                                                    key={variant.id}
                                                    className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
                                                >
                                                    <div className="flex items-center space-x-4">
                                                        <div>
                                                            <p className="font-medium text-gray-900">
                                                                {variant.quantity} {variant.unit?.symbol || 'unité'}
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                {variant.optionValue}
                                                            </p>
                                                        </div>
                                                        <UnitQuantityEditor
                                                            variant={variant}
                                                            productName={product.name}
                                                            productId={product.id}
                                                            product={product}
                                                            allVariants={product.variants}
                                                            showInStore={product.showInStore}
                                                        />
                                                    </div>

                                                    <div className="flex items-center space-x-4">
                                                        {/* Prix */}
                                                        <div className="text-center">
                                                            <p className="text-sm text-gray-500">Prix</p>
                                                            <VariantLowestPriceButton
                                                                variantId={variant.id}
                                                                productId={product.id}
                                                                productName={product.name}
                                                                onOpenPricesModal={() => onOpenPricesModal(product)}
                                                            />
                                                        </div>

                                                        {/* TVA */}
                                                        <div className="text-center">
                                                            <p className="text-sm text-gray-500">TVA</p>
                                                            <VatRateEditor variant={variant} />
                                                        </div>

                                                        {/* Statut */}
                                                        <div className="text-center">
                                                            <p className="text-sm text-gray-500">Statut</p>
                                                            <div className="flex flex-col space-y-1">
                                                                {(!variant.price || variant.price === 0) && (
                                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                                        Pas de prix
                                                                    </span>
                                                                )}
                                                                {variant.price && variant.price < 5 && (
                                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                                        Prix bas
                                                                    </span>
                                                                )}
                                                                {variant.vatRate && variant.vatRate.taxRate > 10 && (
                                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                                                        TVA élevée
                                                                    </span>
                                                                )}
                                                                {variant.price &&
                                                                    variant.price >= 5 &&
                                                                    (!variant.vatRate ||
                                                                        variant.vatRate.taxRate <= 10) && (
                                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                            Validé
                                                                        </span>
                                                                    )}
                                                            </div>
                                                        </div>

                                                        {/* Actions */}
                                                        <div>
                                                            <Button
                                                                onClick={() => onOpenPricesModal(product)}
                                                                variant="secondary"
                                                            >
                                                                Gérer prix
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
