import { useState, useEffect } from 'react';
import { IProduct, IUnit } from '@/server/product/IProduct';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useQuery } from '@tanstack/react-query';
import { backendFetchService } from '@/service/BackendFetchService';
import { createPortal } from 'react-dom';

interface GlobalStockModalProps {
    product: IProduct;
    isOpen: boolean;
    onClose: () => void;
    onSave: (newStock: number, unitId: string) => void;
    isLoading?: boolean;
}

export function GlobalStockModal({ 
    product, 
    isOpen, 
    onClose, 
    onSave, 
    isLoading = false
}: GlobalStockModalProps) {
    const [stockValue, setStockValue] = useState((product.globalStock || 0).toString());
    const [selectedUnitId, setSelectedUnitId] = useState(product.baseUnitId || '');
    const [scrollPosition, setScrollPosition] = useState(0);
    
    // Sauvegarder la position de scroll avant l'ouverture du modal
    useEffect(() => {
        if (isOpen) {
            setScrollPosition(window.scrollY);
        }
    }, [isOpen]);
    
    const { data: units = [], isLoading: unitsLoading } = useQuery({
        queryKey: ['units'],
        queryFn: () => backendFetchService.getAllUnits(),
    });
    
    const selectedUnit = units.find((unit: IUnit) => unit.id === selectedUnitId);
    const displayUnit = selectedUnit ? selectedUnit.symbol : 'unités';
    const unitName = selectedUnit ? selectedUnit.name : 'unités';
    
    // Filtrer les unités selon les catégories autorisées
    
    
    const handleSave = () => {
        const numValue = parseFloat(stockValue);
        if (!isNaN(numValue) && numValue >= 0 && selectedUnitId) {
            onSave(numValue, selectedUnitId);
            
            // Restaurer la position de scroll après la sauvegarde
            setTimeout(() => {
                window.scrollTo({
                    top: scrollPosition,
                    behavior: 'instant'
                });
            }, 100);
            
            onClose();
        }
    };
    
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            onClose();
        }
    };
    
    if (!isOpen) return null;
    
    const modalContent = (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Modifier le stock global
                    </h3>
                    <Text className="text-sm text-gray-600" variant={'small'}>
                        {product.name}
                    </Text>
                </div>
                
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Unité globale
                    </label>
                    {unitsLoading ? (
                        <div className="text-center py-4 text-gray-500">Chargement des unités...</div>
                    ) : units.length === 0 ? (
                        <div className="text-center py-4 text-red-500">Aucune unité disponible</div>
                    ) : (
                        <div className="grid grid-cols-3 gap-2 mb-4">
                            {units.map((unit: IUnit) => (
                                <button
                                    key={unit.id}
                                    type="button"
                                    onClick={() => setSelectedUnitId(unit.id)}
                                    disabled={isLoading}
                                    className={`px-3 py-2 text-sm font-medium rounded-lg border-2 transition-all ${
                                        selectedUnitId === unit.id
                                            ? 'bg-tertiary text-white border-tertiary shadow-md'
                                            : 'bg-white text-gray-700 border-gray-200 hover:bg-tertiary/50 hover:border-tertiary hover:text-black'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {unit.symbol}
                                </button>
                            ))}
                        </div>
                    )}
                    
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stock global en {unitName} ({displayUnit})
                    </label>
                    <input
                        type="number"
                        value={stockValue}
                        onChange={(e) => setStockValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tertiary focus:border-transparent"
                        placeholder="Entrez la quantité"
                        min="0"
                        step="0.1"
                        autoFocus
                        disabled={isLoading || !selectedUnitId}
                    />
                    <Text className="text-xs text-gray-500 mt-1" variant={'small'}>
                        Cette quantité sera répartie automatiquement entre les variants selon leurs proportions.
                        {selectedUnit && (selectedUnit.category === 'weight' || selectedUnit.category === 'volume') && (
                            <span className="block mt-1">
                                Les variants pourront être saisis en {selectedUnit.category === 'weight' ? 'grammes et kilogrammes' : 'millilitres, centilitres et litres'} avec conversion automatique.
                            </span>
                        )}
                    </Text>
                </div>
                
                <div className="flex justify-end space-x-3">
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Annuler
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isLoading || stockValue === '' || parseFloat(stockValue) < 0 || !selectedUnitId}
                    >
                        {isLoading ? 'Enregistrement...' : 'Enregistrer'}
                    </Button>
                </div>
            </div>
        </div>
    );
    
    return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}