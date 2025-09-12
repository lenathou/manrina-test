/* eslint-disable react/no-unescaped-entities */
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

interface AdjustGlobalStockModalProps {
    isOpen: boolean;
    onClose: () => void;
    productId: string;
    productName: string;
    productBaseUnitSymbol?: string | null;
}

function AdjustGlobalStockModal({
    isOpen,
    onClose,
    productId,
    productName,
    productBaseUnitSymbol,
}: AdjustGlobalStockModalProps) {
    const [adjustmentValue, setAdjustmentValue] = useState<string>('');
    const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract'>('add');
    const queryClient = useQueryClient();

    useEffect(() => {
        if (isOpen) {
            setAdjustmentValue('');
            setAdjustmentType('add');
        }
    }, [isOpen]);

    const adjustStockMutation = useMutation<void, Error, { adjustment: number; type: 'add' | 'subtract' }>({
        mutationFn: async ({ adjustment, type }: { adjustment: number; type: 'add' | 'subtract' }) => {
            const finalAdjustment = type === 'subtract' ? -adjustment : adjustment;
            return backendFetchService.adjustGlobalStock({
                productId,
                adjustment: finalAdjustment,
                type,
            });
        },
        onSuccess: () => {
            toast.success('Stock global ajusté avec succès');
            queryClient.invalidateQueries({ queryKey: ['grower-stocks-for-product', productId] });
            queryClient.invalidateQueries({ queryKey: ['global-stock', productId] });
            onClose();
        },
        onError: (error: Error | { message: string }) => {
            console.error("Erreur lors de l'ajustement du stock:", error);
            toast.error("Erreur lors de l'ajustement du stock");
        },
    });

    const handleSave = () => {
        const adjustment = parseFloat(adjustmentValue);

        if (isNaN(adjustment) || adjustment <= 0) {
            toast.error('Veuillez entrer un nombre valide (> 0)');
            return;
        }

        adjustStockMutation.mutate({ adjustment, type: adjustmentType });
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Ajuster le stock global</h3>
                    <Text
                        variant="small"
                        className="text-gray-600"
                    >
                        Ajustez le stock global pour le produit <strong>{productName}</strong>.
                    </Text>
                    <div className="mt-3 p-3 bg-amber-50 rounded-lg">
                        <Text
                            variant="small"
                            className="text-amber-800"
                        >
                            <strong>Attention:</strong> Cet ajustement sera réparti proportionnellement entre tous les
                            variants et producteurs de ce produit.
                        </Text>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 pb-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Type d'ajustement</Label>
                            <div className="flex gap-2">
                                <Button
                                    variant={adjustmentType === 'add' ? 'primary' : 'outline'}
                                    onClick={() => setAdjustmentType('add')}
                                    className="flex-1"
                                >
                                    Ajouter
                                </Button>
                                <Button
                                    variant={adjustmentType === 'subtract' ? 'primary' : 'outline'}
                                    onClick={() => setAdjustmentType('subtract')}
                                    className="flex-1"
                                >
                                    Retirer
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="adjustment">
                                Quantité à {adjustmentType === 'add' ? 'ajouter' : 'retirer'}
                            </Label>
                            <Input
                                id="adjustment"
                                type="number"
                                min="0.001"
                                step="0.001"
                                value={adjustmentValue}
                                onChange={(e) => setAdjustmentValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Entrez la quantité"
                                className="w-full"
                            />
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg">
                            <Text
                                variant="small"
                                className="text-gray-600"
                            >
                                <strong>Unité:</strong> {productBaseUnitSymbol || 'unités'}
                            </Text>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex flex-col sm:flex-row gap-3 p-6 pt-0 sm:justify-end">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={adjustStockMutation.isPending}
                        className="w-full sm:w-auto order-2 sm:order-1"
                    >
                        Annuler
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={adjustStockMutation.isPending}
                        className="w-full sm:w-auto order-1 sm:order-2 min-w-[100px]"
                    >
                        {adjustStockMutation.isPending
                            ? 'Ajustement...'
                            : `${adjustmentType === 'add' ? 'Ajouter' : 'Retirer'} stock`}
                    </Button>
                </div>
            </div>
        </div>
    );

    return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}

export default AdjustGlobalStockModal;
