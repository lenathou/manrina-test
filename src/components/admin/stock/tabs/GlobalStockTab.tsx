import React, { useState } from 'react';
import { IProduct, IUnit } from '@/server/product/IProduct';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';
import { VariantCalculatedStock } from '../VariantCalculatedStock';
import {  useMutation, useQueryClient } from '@tanstack/react-query';
import { backendFetchService } from '@/service/BackendFetchService';
import { STOCK_GET_ALL_PRODUCTS_QUERY_KEY } from '@/components/admin/stock.config';

interface GlobalStockTabProps {
  products: IProduct[];
  units: IUnit[];
}

export function GlobalStockTab({ products, units }: GlobalStockTabProps) {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [bulkStockValue, setBulkStockValue] = useState('');
  const [bulkUnitId, setBulkUnitId] = useState('');
  const queryClient = useQueryClient();

  // Calculer les métriques de stock
  const stockMetrics = {
    totalProducts: products.length,
    productsWithStock: products.filter(p => p.globalStock && p.globalStock > 0).length,
    productsWithoutBaseUnit: products.filter(p => !p.baseUnit).length,
    lowStockProducts: products.filter(p => p.globalStock && p.globalStock < 10).length,
  };

  const bulkUpdateMutation = useMutation({
    mutationFn: async () => {
      const promises = selectedProducts.map(productId => 
        backendFetchService.updateProduct(productId, {
          globalStock: parseFloat(bulkStockValue),
          baseUnitId: bulkUnitId
        })
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STOCK_GET_ALL_PRODUCTS_QUERY_KEY });
      setSelectedProducts([]);
      setBulkStockValue('');
      setBulkUnitId('');
      alert('Stock mis à jour avec succès !');
    },
    onError: () => {
      alert('Erreur lors de la mise à jour du stock');
    }
  });

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };



  return (
    <div className="space-y-6">
      {/* Dashboard de stock */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total produits</p>
              <p className="text-3xl font-bold">{stockMetrics.totalProducts}</p>
            </div>
            <div className="bg-blue-400 bg-opacity-30 rounded-full p-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Avec stock</p>
              <p className="text-3xl font-bold">{stockMetrics.productsWithStock}</p>
            </div>
            <div className="bg-green-400 bg-opacity-30 rounded-full p-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Stock faible</p>
              <p className="text-3xl font-bold">{stockMetrics.lowStockProducts}</p>
            </div>
            <div className="bg-yellow-400 bg-opacity-30 rounded-full p-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Sans unité de base</p>
              <p className="text-3xl font-bold">{stockMetrics.productsWithoutBaseUnit}</p>
            </div>
            <div className="bg-red-400 bg-opacity-30 rounded-full p-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Outils de gestion en lot */}
      {selectedProducts.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            Gestion en lot ({selectedProducts.length} produit(s) sélectionné(s))
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock global
              </label>
              <input
                type="number"
                value={bulkStockValue}
                onChange={(e) => setBulkStockValue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Quantité"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unité de base
              </label>
              <select
                value={bulkUnitId}
                onChange={(e) => setBulkUnitId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sélectionner une unité</option>
                {units.map(unit => (
                  <option key={unit.id} value={unit.id}>{unit.name} ({unit.symbol})</option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <Button
                onClick={() => bulkUpdateMutation.mutate()}
                disabled={!bulkStockValue || !bulkUnitId || bulkUpdateMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {bulkUpdateMutation.isPending ? 'Mise à jour...' : 'Appliquer'}
              </Button>
              <Button
                onClick={() => setSelectedProducts([])}
                variant="secondary"
              >
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Liste des produits avec gestion de stock */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Gestion du stock global</h3>
            <div className="flex items-center gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedProducts.length === products.length && products.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Tout sélectionner</span>
              </label>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {products.map((product) => (
            <div key={product.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => handleProductSelect(product.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Image
                    src={product.imageUrl}
                    width={60}
                    height={60}
                    style={{ borderRadius: 8 }}
                    alt={product.name}
                  />
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{product.name}</h4>
                    <p className="text-sm text-gray-500">
                      {product.category} • {product.variants.length} variant(s)
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  {/* Stock global actuel */}
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Stock global</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {product.globalStock || 0}
                      {product.baseUnit && (
                        <span className="text-sm text-gray-500 ml-1">
                          {product.baseUnit.symbol}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Unité de base */}
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Unité de base</p>
                    <p className="text-sm font-medium text-gray-900">
                      {product.baseUnit ? product.baseUnit.name : 'Non définie'}
                    </p>
                  </div>

                  {/* Stock calculé pour les variants */}
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Stock calculé</p>
                    <div className="space-y-1">
                      {product.variants.slice(0, 2).map((variant) => (
                        <VariantCalculatedStock
                          key={variant.id}
                          variant={variant}
                          product={product}
                          units={units}
                        />
                      ))}
                      {product.variants.length > 2 && (
                        <p className="text-xs text-gray-400">
                          +{product.variants.length - 2} autres
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Statut */}
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Statut</p>
                    <div className="flex flex-col space-y-1">
                      {!product.baseUnit && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Unité manquante
                        </span>
                      )}
                      {product.globalStock && product.globalStock < 10 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Stock faible
                        </span>
                      )}
                      {(!product.globalStock || product.globalStock === 0) && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Pas de stock
                        </span>
                      )}
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