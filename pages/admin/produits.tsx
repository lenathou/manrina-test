import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { CategorySelector } from '@/components/admin/stock/CategorySelector';
import { AppImage } from '@/components/Image';
import { useFilteredProducts } from '@/hooks/useFilteredProducts';
import { useProductQuery } from '@/hooks/useProductQuery';
import { IProduct, IProductVariant, IUnit } from '@/server/product/IProduct';
import { backendFetchService } from '@/service/BackendFetchService';
import { useQuery } from '@tanstack/react-query';
import { withAdminLayout } from '@/components/layouts/AdminLayout';
import { Button } from '@/components/ui/Button';

interface ProductTableProps {
  products: IProduct[];
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
  units: IUnit[];
}

function getDisplayVariantValue(variant: IProductVariant, units: IUnit[]) {
  if (variant.quantity && variant.unitId) {
    const unit = units.find((u) => u.id === variant.unitId);
    return `${variant.quantity} ${unit?.symbol || 'unité'}`;
  }
  return variant.optionValue;
}

const ProductTable: React.FC<ProductTableProps> = ({ 
  products, 
  currentPage, 
  totalPages, 
  onPageChange, 
  isLoading = false,
  units
}) => {
  const router = useRouter();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const handlePageChange = useCallback((page: number) => {
    if (onPageChange) {
      onPageChange(page);
    } else {
      router.push({ pathname: router.pathname, query: { ...router.query, page } }, undefined, {
        shallow: true,
      });
    }
  }, [router, onPageChange]);

  const toggleIdExpansion = (productId: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  return (
    <div className="bg-[var(--background)] p-6 rounded-xl">
      <table className="w-full text-left text-[var(--foreground)] border-separate border-spacing-y-2 rounded-xl">
        <thead className="text-sm text-[var(--muted-foreground)]">
          <tr>
            <th className="py-2 w-20">ID</th>
            <th>Produit</th>
            <th>Catégorie</th>
            <th>Variants</th>
            <th>Prix</th>
            <th>Statut</th>
            <th>Date de création</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {isLoading ? (
            // État de chargement
            Array.from({ length: 5 }).map((_, index) => (
              <tr key={`loading-${index}`} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <td className="py-4 px-4 rounded-l-xl">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </td>
                <td className="py-4 px-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </td>
                <td className="py-4 px-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </td>
                <td className="py-4 px-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </td>
                <td className="py-4 px-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </td>
                <td className="py-4 px-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </td>
                <td className="py-4 px-4 rounded-r-xl">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </td>
              </tr>
            ))
          ) : products.length === 0 ? (
            // État vide
            <tr>
              <td colSpan={7} className="py-8 text-center text-gray-500">
                Aucun produit trouvé
              </td>
            </tr>
          ) : (
            // Données des produits
            products.map((product) => (
              <tr
                key={product.id}
                className={`bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 ${
                  !product.showInStore ? 'opacity-50' : ''
                }`}
              >
                <td className="py-4 px-2 rounded-l-xl font-medium w-20">
                  <button
                    onClick={() => toggleIdExpansion(product.id)}
                    className="text-left hover:text-[var(--color-primary)] transition-colors duration-200 cursor-pointer"
                    title="Cliquer pour voir l'ID complet"
                  >
                    {expandedIds.has(product.id) ? `#${product.id}` : `#${product.id.slice(0, 6)}...`}
                  </button>
                </td>
                <td className="py-4 px-2">
                  <div className="flex items-center space-x-3">
                    <AppImage
                      source={product.imageUrl}
                      style={{ width: 40, height: 40, borderRadius: 4 }}
                      alt={product.name}
                    />
                    <div>
                      <div className="font-semibold">{product.name}</div>
                      <div className="text-xs text-gray-500">
                        {product.description && product.description.length > 50
                          ? `${product.description.substring(0, 50)}...`
                          : product.description}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {product.category || 'Non catégorisé'}
                  </span>
                </td>
                <td className="py-4 px-2">
                  <div className="space-y-1">
                    {product.variants && product.variants.length > 0 ? (
                      product.variants.slice(0, 2).map((variant) => (
                        <div key={variant.id} className="text-xs bg-gray-50 rounded px-2 py-1">
                          <span className="font-medium">
                            {getDisplayVariantValue(variant, units)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-gray-400 text-xs">Aucun variant</span>
                    )}
                    {product.variants && product.variants.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{product.variants.length - 2} autres
                      </div>
                    )}
                  </div>
                </td>
                <td className="py-4 px-2">
                  {product.variants && product.variants.length > 0 ? (
                    <div className="space-y-1">
                      {product.variants.slice(0, 2).map((variant) => (
                        <div key={variant.id} className="text-xs">
                          <span className="font-medium text-green-600">
                            {variant.price}€
                          </span>
                        </div>
                      ))}
                      {product.variants.length > 2 && (
                        <div className="text-xs text-gray-500">...</div>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs">-</span>
                  )}
                </td>
                <td className="py-4 px-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.showInStore
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {product.showInStore ? 'Visible' : 'Masqué'}
                  </span>
                </td>
                <td className="py-4 px-4 rounded-r-xl">
                  {product.createdAt ? new Date(product.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex items-center justify-end mt-4 text-sm text-[var(--muted-foreground)]">
        <span className="mr-4">
          {7 * (currentPage - 1) + 1}-{Math.min(7 * currentPage, products.length * totalPages)} de {products.length * totalPages}
        </span>
        <button 
          onClick={() => handlePageChange(1)} 
          disabled={currentPage === 1} 
          className="px-2 disabled:opacity-30 hover:text-[var(--foreground)] transition-colors duration-200"
        >
          «
        </button>
        <button 
          onClick={() => handlePageChange(currentPage - 1)} 
          disabled={currentPage === 1} 
          className="px-2 disabled:opacity-30 hover:text-[var(--foreground)] transition-colors duration-200"
        >
          ‹
        </button>
        <button 
          onClick={() => handlePageChange(currentPage + 1)} 
          disabled={currentPage === totalPages} 
          className="px-2 disabled:opacity-30 hover:text-[var(--foreground)] transition-colors duration-200"
        >
          ›
        </button>
        <button 
          onClick={() => handlePageChange(totalPages)} 
          disabled={currentPage === totalPages} 
          className="px-2 disabled:opacity-30 hover:text-[var(--foreground)] transition-colors duration-200"
        >
          »
        </button>
      </div>
    </div>
  );
};

function ProductsPageContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { data: products = [], isLoading } = useProductQuery();

  const { data: units = [] } = useQuery({
    queryKey: ['units'],
    queryFn: () => backendFetchService.getAllUnits(),
  });

  // Extraire toutes les catégories uniques
  const allCategories = Array.from(
    new Set(
      products.map((product) => product.category).filter((category): category is string => Boolean(category)),
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

  // Pagination
  const itemsPerPage = 7;
  const totalPages = Math.ceil(filteredProductsList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProductsList.slice(startIndex, startIndex + itemsPerPage);

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <p className="text-lg">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white">
      {/* En-tête */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Gestion des Produits</h1>
        
        {/* Filtres */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <CategorySelector
              categories={allCategories}
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => (window.location.href = '/admin/stock')}
              className="bg-blue-500 hover:bg-blue-600 flex items-center gap-2"
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
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              Gérer le Stock
            </Button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{products.length}</div>
            <div className="text-sm text-blue-600">Total produits</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {products.filter(p => p.showInStore).length}
            </div>
            <div className="text-sm text-green-600">Produits visibles</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {allCategories.length}
            </div>
            <div className="text-sm text-yellow-600">Catégories</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {products.reduce((acc, p) => acc + (p.variants?.length || 0), 0)}
            </div>
            <div className="text-sm text-purple-600">Total variants</div>
          </div>
        </div>
      </div>

      {/* Tableau des produits */}
      <ProductTable
        products={paginatedProducts}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        isLoading={isLoading}
        units={units}
      />
    </div>
  );
}

function ProductsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ProductsPageContent />
    </div>
  );
}

export default withAdminLayout(ProductsPage);