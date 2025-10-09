import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { backendFetchService } from '@/service/BackendFetchService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Text } from '@/components/ui/Text';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '@/components/ui/Card';
// Fonction toast simple pour remplacer sonner
const toast = {
    success: (message: string) => {
        console.log('✅ Success:', message);
        // Optionnel: afficher une alerte ou notification personnalisée
    },
    error: (message: string) => {
        console.error('❌ Error:', message);
        // Optionnel: afficher une alerte ou notification personnalisée
    }
};

interface EditGrowerStockModalProps {
    isOpen: boolean;
    onClose: () => void;
    growerId: string;
    variantId: string;
    productId: string;
    currentStock: number;
    variantName: string;
    productName: string;
    growerName: string;
    productBaseUnitSymbol?: string | null;
}

function EditGrowerStockModal({
    isOpen,
    onClose,
    growerId,
    productId,
    currentStock,
    variantName,
    productName,
    growerName,
    productBaseUnitSymbol
}: EditGrowerStockModalProps) {
    const [stockValue, setStockValue] = useState<string>(currentStock.toString());
    const queryClient = useQueryClient();

    useEffect(() => {
        if (isOpen) {
            setStockValue(currentStock.toString());
        }
    }, [isOpen, currentStock]);

    const updateStockMutation = useMutation({
        mutationFn: async (newStock: number) => {
            return backendFetchService.updateGrowerProductStock({
                growerId,
                productId,
                stock: newStock
            });
        },
        onSuccess: () => {
            toast.success('Stock mis à jour avec succès');
            queryClient.invalidateQueries({ queryKey: ['product-stock-info', productId] });
            queryClient.invalidateQueries({ queryKey: ['global-stock', productId] });
            onClose();
        },
        onError: (error: Error | { message: string }) => {
            console.error('Erreur lors de la mise à jour du stock:', error);
            toast.error('Erreur lors de la mise à jour du stock');
        }
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
            <Card className="max-w-md w-full mx-4 transform transition-all p-0">
                {/* Header */}
                <CardHeader className="bg-secondary text-white p-0 m-0">
                    <div className="px-6 py-4">
                        <CardTitle className="text-lg font-semibold mb-2">
                            Modifier le stock du producteur
                        </CardTitle>
                        <Text variant="small" className="text-white opacity-90">
                            Modifiez le stock de <strong>{growerName}</strong> pour le variant{' '}
                            <strong>{variantName}</strong> du produit <strong>{productName}</strong>.
                        </Text>
                        <button
                            onClick={onClose}
                            disabled={updateStockMutation.isPending}
                            className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 disabled:opacity-50"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </CardHeader>

                {/* Content */}
                <CardContent className="bg-background p-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="stock">Stock disponible</Label>
                            <Input
                                id="stock"
                                type="number"
                                min="0"
                                step="0.001"
                                value={stockValue}
                                onChange={(e) => setStockValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Entrez le stock"
                                className="w-full"
                            />
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg">
                            <Text variant="small" className="text-gray-600">
                                <strong>Stock actuel:</strong> {currentStock} {productBaseUnitSymbol || 'unités'}
                            </Text>
                        </div>
                    </div>
                </CardContent>

                {/* Footer */}
                <CardFooter className="flex flex-col sm:flex-row gap-3 p-6 pt-0 sm:justify-end">
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
                        {updateStockMutation.isPending ? (
                            'Sauvegarde...'
                        ) : (
                            'Sauvegarder'
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );

    return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}

export default EditGrowerStockModal;