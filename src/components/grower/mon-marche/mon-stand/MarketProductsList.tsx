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
import Image from 'next/image';
import { useUnits } from '@/hooks/useUnits';

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
  isActive: boolean;
  unit: string;
}

// Type pour les données passées à startEdit
interface StartEditData {
  id: string;
  price: number;
  isActive: boolean;
  unit: string;
}

interface ProductsListProps {
  standProducts: MarketProduct[];
  filteredAndSortedStandProducts: MarketProduct[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortBy: 'name' | 'price' | 'date';
  setSortBy: (sort: 'name' | 'price' | 'date') => void;
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
}: ProductsListProps) {
  const { data: units = [], isLoading: unitsLoading } = useUnits();

  // Fonction pour obtenir le symbole de l'unité
  const getUnitSymbol = (unitValue: string | null) => {
    if (!unitValue) return 'unité';
    // Chercher d'abord par ID, puis par symbole
    const unitById = units.find((u) => u.id === unitValue);
    if (unitById) return unitById.symbol;
    
    const unitBySymbol = units.find((u) => u.symbol === unitValue);
    if (unitBySymbol) return unitBySymbol.symbol;
    
    return unitValue; // Fallback sur la valeur originale
  };
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
                initialValue={searchTerm}
                onSearch={setSearchTerm}
                className="text-sm"
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <Label htmlFor="sortBy" className="text-xs sm:text-sm">Trier par</Label>
              <Select value={sortBy} onValueChange={(value: string) => setSortBy(value as 'name' | 'price' | 'date')}>
                <SelectTrigger className="mt-1 text-sm">
                  <span className="block truncate text-sm">
                    {sortBy === 'name' && 'Nom du produit'}
                    {sortBy === 'price' && 'Prix'}
                    {sortBy === 'date' && 'Date d\'ajout'}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nom du produit</SelectItem>
                  <SelectItem value="price">Prix</SelectItem>
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
              className="rounded-full px-4 py-3 text-sm sm:text-base"
            >
              <span className="hidden sm:inline">+ Ajouter votre premier produit</span>
              <span className="sm:hidden">+ Ajouter un produit</span>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredAndSortedStandProducts.length === 0 ? (
            <div className="col-span-full">
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
            </div>
          ) : (
            filteredAndSortedStandProducts.map((standProduct) => (
              <div
                key={standProduct.id}
                className="bg-secondary border rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200 min-h-96 flex flex-col relative border-secondary/20"
              >
                {/* Badge de statut */}
                <div className="absolute top-2 left-2 z-10">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    standProduct.isActive 
                      ? 'bg-green-500 text-white' 
                      : 'bg-red-500 text-white'
                  }`}>
                    {standProduct.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </div>

                {/* Header avec image et nom */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative">
                    <Image
                      src="/placeholder-product.svg"
                      alt={standProduct.name}
                      width={80}
                      height={80}
                      className="w-20 h-20 rounded-lg object-cover border border-white/20"
                      priority={false}
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                    />
                    {/* Bouton supprimer en overlay */}
                    <button
                      onClick={() => handleRemoveProduct(standProduct.id)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-accent text-white rounded-full flex items-center justify-center text-xs hover:bg-accent/80 transition-colors"
                      title="Retirer le produit"
                    >
                      ×
                    </button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-white leading-tight mb-1 line-clamp-2">
                      {standProduct.name}
                    </h3>
                    <p className="text-sm text-white/70">
                      Catégorie: {standProduct.category}
                    </p>
                  </div>
                </div>

                {/* Prix */}
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white/90">Prix</span>
                    <span className="text-lg font-bold text-white">
                      {standProduct.price.toString()}€ / {getUnitSymbol(standProduct.unit)}
                    </span>
                  </div>
                </div>

                {/* Description */}
                {standProduct.description && (
                  <div className="flex-1 mb-4">
                    <h4 className="text-sm font-medium text-white/90 mb-2">Description</h4>
                    <p className="text-sm text-white/70 line-clamp-3">
                      {standProduct.description}
                    </p>
                  </div>
                )}

                {/* Formulaire d'édition ou boutons d'action */}
                {editingId === standProduct.id ? (
                  <div className="mt-auto space-y-3 pt-2">
                    <div>
                      <Label className="text-xs text-white/90">Prix (€)</Label>
                      <Input
                        type="number"
                        step="0.001"
                        min="0"
                        value={editData.price}
                        onChange={(e) => setEditData(prev => ({ ...prev, price: e.target.value }))}
                        className="text-sm bg-white/10 border-white/20 text-white placeholder-white/50 h-9"
                      />
                    </div>

                    <div>
                      <Label className="text-xs text-white/90">Unité de mesure</Label>
                      <Select 
                        value={editData.unit} 
                        onValueChange={(value) => setEditData(prev => ({ ...prev, unit: value }))}
                        disabled={unitsLoading}
                      >
                        <SelectTrigger className="text-sm bg-white/10 border-white/20 text-white h-9">
                          <span className="block truncate text-sm">
                            {getUnitSymbol(editData.unit) || 'Sélectionner une unité'}
                          </span>
                        </SelectTrigger>
                        <SelectContent>
                          {units.map((unit) => (
                            <SelectItem key={unit.id} value={unit.symbol}>
                              {unit.symbol}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center space-x-2 py-1">
                      <Switch
                        checked={editData.isActive}
                        onCheckedChange={(checked) => setEditData(prev => ({ ...prev, isActive: checked }))}
                      />
                      <Label className="text-xs text-white/90">Actif</Label>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button 
                        onClick={saveEdit}
                        variant='primary'
                        className="flex-1 text-xs h-9"
                      >
                        Sauvegarder
                      </Button>
                      <Button 
                        onClick={cancelEdit}
                        variant="danger"
                        className="flex-1 text-xs h-9"
                      >
                        Annuler
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-auto flex gap-2">
                    <Button 
                      onClick={() => startEdit({
                        id: standProduct.id,
                        price: Number(standProduct.price),
                        isActive: standProduct.isActive,
                        unit: standProduct.unit || ''
                      })}
                      variant="primary"
                      className="flex-1 text-xs"
                    >
                      Modifier
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </>
  );
}