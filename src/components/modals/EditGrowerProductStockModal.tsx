import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { backendFetchService } from '@/service/BackendFetchService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Text } from '@/components/ui/Text';

// Fonction toast simple pour remplacer sonner
const toast = {
    success: (message: string) => {
        console.log('✅ Success:', message);
        // Optionnel: afficher une alerte ou notification personnalisée
    },
    error: (message: string) => {
        console.error('❌ Error:', message);
        // Optionnel: afficher une alerte ou notification personnalisée
    },
};

interface EditGrowerProductStockModalProps {
    isOpen: boolean;
    onClose: () => void;
    growerId: string;
    productId: string;
    currentStock: number;
    productName: string;
    growerName: string;
    productBaseUnitSymbol?: string | null;
}

function EditGrowerProductStockModal({
    isOpen,
    onClose,
    growerId,
    productId,
    currentStock,
    productName,
    growerName,
    productBaseUnitSymbol,
}: EditGrowerProductStockModalProps) {
    const [stockValue, setStockValue] = useState<string>(currentStock.toString());
    const queryClient = useQueryClient();

    useEffect(() => {
        if (isOpen) {
            setStockValue(currentStock.toString());
        }
    }, [isOpen, currentStock]);

    const updateStockMutation = useMutation<void, Error, number>({
        mutationFn: async (newStock: number) => {
            return backendFetchService.updateGrowerProductStock({
                growerId,
                productId,
                stock: newStock,
            });
        },
        onSuccess: () => {
            toast.success('Stock mis à jour avec succès');
            queryClient.invalidateQueries({ queryKey: ['grower-stocks-for-product', productId] });
            queryClient.invalidateQueries({ queryKey: ['global-stock', productId] });
            onClose();
        },
        onError: (error: Error | { message: string }) => {
            console.error('Erreur lors de la mise à jour du stock:', error);
            toast.error('Erreur lors de la mise à jour du stock');
        },
    });

    const handleSave = () => {
        const newStock = parseFloat(stockValue);

        if (isNaN(newStock) || newStock < 0) {
            toast.error('Veuillez entrer un nombre valide (≥ 0)');
            return;
        }

        updateStockMutation.mutate(newStock);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        }
    };

    if (!isOpen) return null;

    const modalContent = (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all">
                {/* Header */}
                <div className="p-6 pb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Modifier le stock du producteur</h3>
                    <Text
                        variant="small"
                        className="text-gray-600"
                    >
                        Modifiez le stock de <strong>{growerName}</strong> pour le produit{' '}
                        <strong>{productName}</strong>.
                    </Text>
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <Text
                            variant="small"
                            className="text-blue-800"
                        >
                            <strong>Note:</strong> Le stock sera automatiquement réparti de manière égale entre tous les
                            variants de ce produit.
                        </Text>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 pb-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="stock">Stock total disponible</Label>
                            <Input
                                id="stock"
                                type="number"
                                min="0"
                                step="0.001"
                                value={stockValue}
                                onChange={(e) => setStockValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Entrez le stock total"
                                className="w-full"
                            />
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg">
                            <Text
                                variant="small"
                                className="text-gray-600"
                            >
                                <strong>Stock actuel:</strong> {currentStock} {productBaseUnitSymbol || 'unités'}
                            </Text>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex flex-col sm:flex-row gap-3 p-6 pt-0 sm:justify-end">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={updateStockMutation.isPending}
                        className="w-full sm:w-auto order-2 sm:order-1"
                    >
                        Annuler
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={updateStockMutation.isPending}
                        className="w-full sm:w-auto order-1 sm:order-2 min-w-[100px]"
                    >
                        {updateStockMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
                    </Button>
                </div>
            </div>
        </div>
    );

    return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}

export default EditGrowerProductStockModal;
