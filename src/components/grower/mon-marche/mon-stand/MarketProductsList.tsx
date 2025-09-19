/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { SearchBarNext } from '@/components/ui/SearchBarNext';
import { Prisma } from '@prisma/client';

// Type pour les produits du stand (MarketProduct avec relations)
type MarketProduct = Prisma.MarketProductGetPayload<{
    include: {
        grower: true;
        marketSession: true;
    };
}>;

// Type pour les données d'édition
interface EditData {
  price: string;
  stock: string;
  isActive: boolean;
}

// Type pour les données passées à startEdit
interface StartEditData {
  id: string;
  price: number;
  stock: number | null;
  isActive: boolean;
}

interface ProductsListProps {
  standProducts: MarketProduct[];
  filteredAndSortedStandProducts: MarketProduct[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortBy: 'name' | 'price' | 'stock' | 'date';
  setSortBy: (sort: 'name' | 'price' | 'stock' | 'date') => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
  setShowAddForm: (show: boolean) => void;
  editingId: string | null;
  editData: EditData;
  setEditData: (data: EditData | ((prev: EditData) => EditData)) => void;
  startEdit: (data: StartEditData) => void;
  saveEdit: () => void;
  cancelEdit: () => void;
  handleRemoveProduct: (id: string) => void;
  isSubmitting: boolean;
}

export function ProductsList({
  standProducts,
  filteredAndSortedStandProducts,
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  setShowAddForm,
  editingId,
  editData,
  setEditData,
  startEdit,
  saveEdit,
  cancelEdit,
  handleRemoveProduct,
  isSubmitting
}: ProductsListProps) {
  return (
    <>
      {/* Barre de recherche et tri */}
      {standProducts.length > 0 && (
        <div className="mb-3 sm:mb-4 space-y-3 sm:space-y-4">
          <div>
            <Label htmlFor="search" className="text-xs sm:text-sm">Rechercher dans vos produits</Label>
            <div className="mt-1">
              <SearchBarNext
                placeholder="Rechercher par nom de produit..."
                value={searchTerm}
                onSearch={setSearchTerm}
                className="text-sm"
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <Label htmlFor="sortBy" className="text-xs sm:text-sm">Trier par</Label>
              <Select value={sortBy} onValueChange={(value: string) => setSortBy(value as 'name' | 'price' | 'stock' | 'date')}>
                <SelectTrigger className="mt-1 text-sm">
                  <span className="block truncate text-sm">
                    {sortBy === 'name' && 'Nom du produit'}
                    {sortBy === 'price' && 'Prix'}
                    {sortBy === 'stock' && 'Stock'}
                    {sortBy === 'date' && 'Date d\'ajout'}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nom du produit</SelectItem>
                  <SelectItem value="price">Prix</SelectItem>
                  <SelectItem value="stock">Stock</SelectItem>
                  <SelectItem value="date">Date d'ajout</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <Label htmlFor="sortOrder" className="text-xs sm:text-sm">Ordre</Label>
              <Select value={sortOrder} onValueChange={(value: string) => setSortOrder(value as 'asc' | 'desc')}>
                <SelectTrigger className="mt-1 text-sm">
                  <span className="block truncate text-sm">
                    {sortOrder === 'asc' ? 'Croissant' : 'Décroissant'}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Croissant</SelectItem>
                  <SelectItem value="desc">Décroissant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
           
           {/* Indicateur de résultats */}
           <div className="text-xs sm:text-sm text-gray-600">
               {searchTerm.trim() ? (
                   <span>
                       {filteredAndSortedStandProducts.length} produit(s) trouvé(s) sur {standProducts.length} total
                   </span>
               ) : (
                   <span>
                       {standProducts.length} produit(s) dans votre stand
                   </span>
               )}
           </div>
       </div>
      )}

      {/* Liste des produits */}
      {standProducts.length === 0 ? (
        <Card>
          <div className="text-center py-8 sm:py-12">
            <p className="text-gray-500 mb-4 text-sm sm:text-base">
              Aucun produit dans votre stand pour le moment
            </p>
            <Button 
              onClick={() => setShowAddForm(true)}
              variant='secondary'
              className="rounded-full p-4"
            >
              <span className="hidden sm:inline">+ Ajouter votre premier produit</span>
              <span className="sm:hidden">Ajouter un produit</span>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filteredAndSortedStandProducts.length === 0 ? (
            <Card>
              <div className="text-center py-6 sm:py-8">
                <p className="text-gray-500 text-sm sm:text-base">
                  Aucun produit ne correspond à votre recherche "{searchTerm}"
                </p>
                <Button 
                  onClick={() => setSearchTerm('')}
                  variant="secondary"
                  className="mt-2 text-sm"
                >
                  Effacer la recherche
                </Button>
              </div>
            </Card>
          ) : (
            filteredAndSortedStandProducts.map((standProduct) => (
              <Card key={standProduct.id}>
                <div className="p-3 sm:p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-base sm:text-lg">
                          {standProduct.name}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          standProduct.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {standProduct.isActive ? '🟢 Actif' : '🔴 Inactif'}
                        </span>
                      </div>
                      <div className="text-gray-600 text-xs sm:text-sm space-y-1 sm:space-y-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                          <span className="font-medium">{standProduct.price.toString()}€ / {standProduct.unit}</span>
                          <span className="hidden sm:inline">•</span>
                          <span>Stock: {standProduct.stock}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                          <span>Catégorie: {standProduct.category}</span>
                        </div>
                      </div>
                      {standProduct.description && (
                        <p className="text-xs sm:text-sm text-gray-500 mt-2">
                          {standProduct.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex flex-row sm:flex-col lg:flex-row items-center gap-2 w-full sm:w-auto">
                      {editingId === standProduct.id ? (
                        <>
                          <Button 
                            onClick={saveEdit}
                            className="flex items-center justify-center gap-1 px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm flex-1 sm:flex-none"
                          >
                            <span>💾</span>
                            <span className="hidden sm:inline">Sauvegarder</span>
                          </Button>
                          <Button 
                            onClick={cancelEdit}
                            variant="secondary"
                            className="flex items-center justify-center gap-1 px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm flex-1 sm:flex-none"
                          >
                            <span>❌</span>
                            <span className="hidden sm:inline">Annuler</span>
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button 
                            onClick={() => startEdit({
                              id: standProduct.id,
                              price: Number(standProduct.price),
                              stock: standProduct.stock,
                              isActive: standProduct.isActive
                            })}
                            variant="secondary"
                            className="flex items-center justify-center gap-1 px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm flex-1 sm:flex-none"
                          >
                            <span>✏️</span>
                            <span className="hidden sm:inline">Modifier</span>
                          </Button>
                          <Button 
                            onClick={() => handleRemoveProduct(standProduct.id)}
                            variant="secondary"
                            disabled={isSubmitting}
                            className="flex items-center justify-center gap-1 px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm bg-red-600 hover:bg-red-700 flex-1 sm:flex-none"
                          >
                            <span>🗑️</span>
                            <span className="hidden sm:inline">{isSubmitting ? 'Suppression...' : 'Supprimer'}</span>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Formulaire d'édition */}
                  {editingId === standProduct.id && (
                    <div className="mt-3 pt-3 sm:mt-4 sm:pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        <div>
                          <Label className="text-xs sm:text-sm">Prix (€)</Label>
                          <Input
                            type="number"
                            step="0.001"
                            min="0"
                            value={editData.price}
                            onChange={(e) => setEditData(prev => ({ ...prev, price: e.target.value }))}
                            className="text-sm"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-xs sm:text-sm">Stock</Label>
                          <Input
                            type="number"
                            step="0.001"
                            min="0"
                            value={editData.stock}
                            onChange={(e) => setEditData(prev => ({ ...prev, stock: e.target.value }))}
                            className="text-sm"
                          />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={editData.isActive}
                            onCheckedChange={(checked) => setEditData(prev => ({ ...prev, isActive: checked }))}
                          />
                          <Label className="text-xs sm:text-sm">Actif</Label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </>
  );
}