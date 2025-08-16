import React, { useState } from 'react';
import { IProduct, IUnit } from '@/server/product/IProduct';
import { Button } from '@/components/ui/Button';
import { useMutation } from '@tanstack/react-query';

interface SystemToolsTabProps {
  products: IProduct[];
  units: IUnit[];
  onCreateFromAirtable: () => void;
  onManagePanyen: () => void;
  onInvalidateCache: () => void;
  isCreatingProducts: boolean;
}

export function SystemToolsTab({ 
  products, 
  units, 
  onCreateFromAirtable, 
  onManagePanyen, 
  onInvalidateCache, 
  isCreatingProducts 
}: SystemToolsTabProps) {
  const [isInvalidating, setIsInvalidating] = useState(false);

  // Calculer les métriques système
  const systemMetrics = {
    totalProducts: products.length,
    totalVariants: products.reduce((acc, p) => acc + p.variants.length, 0),
    totalUnits: units.length,
    productsWithIssues: products.filter(p => 
      !p.baseUnit || 
      p.variants.some(v => !v.price || v.price === 0) ||
      (!p.globalStock || p.globalStock === 0)
    ).length,
  };

  const handleInvalidateCache = () => {
    setIsInvalidating(true);
    onInvalidateCache();
    alert('Cache invalidé avec succès !');
    setIsInvalidating(false);
  };

  type ExportProductData = {
    id: string;
    name: string;
    category: string | null | undefined;
    globalStock: number;
    baseUnit: string | undefined;
    showInStore: boolean;
    variants: {
      id: string;
      optionSet: string;
      optionValue: string;
      quantity: number | null | undefined;
      unit: string | undefined;
      price: number;
      vatRate: number | undefined;
    }[];
  };

  const exportDataMutation = useMutation({
    mutationFn: async (format: 'csv' | 'json') => {
      const data: ExportProductData[] = products.map(product => ({
        id: product.id,
        name: product.name,
        category: product.category,
        globalStock: product.globalStock,
        baseUnit: product.baseUnit?.name,
        showInStore: product.showInStore,
        variants: product.variants.map(variant => ({
          id: variant.id,
          optionSet: variant.optionSet,
          optionValue: variant.optionValue,
          quantity: variant.quantity,
          unit: variant.unit?.name,
          price: variant.price,
          vatRate: variant.vatRate?.taxRate
        }))
      }));

      const dataStr = format === 'json' 
        ? JSON.stringify(data, null, 2)
        : convertToCSV(data);
      
      const blob = new Blob([dataStr], { type: format === 'json' ? 'application/json' : 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `products_export_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    onSuccess: () => {
      alert('Export réalisé avec succès !');
    },
    onError: () => {
      alert('Erreur lors de l\'export');
    }
  });

  const convertToCSV = (data: ExportProductData[]) => {
    const headers = ['ID', 'Nom', 'Catégorie', 'Stock Global', 'Unité de Base', 'En Boutique', 'Variants'];
    const rows = data.map(product => [
      product.id,
      product.name,
      product.category,
      product.globalStock || 0,
      product.baseUnit || '',
      product.showInStore ? 'Oui' : 'Non',
      product.variants.length
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };



  return (
    <div className="space-y-6">
      {/* Dashboard système */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm font-medium">Total produits</p>
              <p className="text-3xl font-bold">{systemMetrics.totalProducts}</p>
            </div>
            <div className="bg-indigo-400 bg-opacity-30 rounded-full p-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100 text-sm font-medium">Total variants</p>
              <p className="text-3xl font-bold">{systemMetrics.totalVariants}</p>
            </div>
            <div className="bg-teal-400 bg-opacity-30 rounded-full p-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-cyan-100 text-sm font-medium">Unités disponibles</p>
              <p className="text-3xl font-bold">{systemMetrics.totalUnits}</p>
            </div>
            <div className="bg-cyan-400 bg-opacity-30 rounded-full p-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Produits avec problèmes</p>
              <p className="text-3xl font-bold">{systemMetrics.productsWithIssues}</p>
            </div>
            <div className="bg-orange-400 bg-opacity-30 rounded-full p-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Outils d'import/export */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Import / Export</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Import de données</h4>
            <div className="space-y-3">
              <Button
                onClick={onCreateFromAirtable}
                disabled={isCreatingProducts}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                Importer depuis Airtable
              </Button>
              <p className="text-sm text-gray-500">
                Synchronise les produits depuis la base Airtable
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Export de données</h4>
            <div className="space-y-3">
              <div className="flex space-x-2">
                <Button
                  onClick={() => exportDataMutation.mutate('csv')}
                  disabled={exportDataMutation.isPending}
                  variant="secondary"
                  className="flex-1"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export CSV
                </Button>
                <Button
                  onClick={() => exportDataMutation.mutate('json')}
                  disabled={exportDataMutation.isPending}
                  variant="secondary"
                  className="flex-1"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export JSON
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                Exporte tous les produits et variants au format CSV ou JSON
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Outils de maintenance */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Maintenance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Cache et performance</h4>
            <div className="space-y-3">
              <Button
                onClick={handleInvalidateCache}
                disabled={isInvalidating}
                variant="secondary"
                className="w-full"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {isInvalidating ? 'Invalidation...' : 'Invalider le cache'}
              </Button>
              <p className="text-sm text-gray-500">
                Force le rechargement de toutes les données depuis le serveur
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Gestion spécialisée</h4>
            <div className="space-y-3">
              <Button
                onClick={onManagePanyen}
                variant="secondary"
                className="w-full"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Gérer les paniers (Panyen)
              </Button>
              <p className="text-sm text-gray-500">
                Accès aux outils de gestion des paniers spécialisés
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Diagnostic système */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Diagnostic système</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Produits sans unité de base</h4>
              <p className="text-2xl font-bold text-red-600">
                {products.filter(p => !p.baseUnit).length}
              </p>
              <p className="text-sm text-gray-500">Produits nécessitant une unité de base</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Variants sans prix</h4>
              <p className="text-2xl font-bold text-orange-600">
                {products.reduce((acc, p) => 
                  acc + p.variants.filter(v => !v.price || v.price === 0).length, 0
                )}
              </p>
              <p className="text-sm text-gray-500">Variants nécessitant un prix</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Produits sans stock</h4>
              <p className="text-2xl font-bold text-yellow-600">
                {products.filter(p => !p.globalStock || p.globalStock === 0).length}
              </p>
              <p className="text-sm text-gray-500">Produits sans stock global défini</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Produits cachés</h4>
              <p className="text-2xl font-bold text-blue-600">
                {products.filter(p => !p.showInStore).length}
              </p>
              <p className="text-sm text-gray-500">Produits non visibles en boutique</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}