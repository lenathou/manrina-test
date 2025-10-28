import { UpdateQuantityButtons } from '@/components/products/BasketItem';
import { Button } from '@/components/ui/Button';
import { IProduct } from '@/server/product/IProduct';
import { GrowerStockValidationStatus, IGrowerStockUpdate } from '@/server/grower/IGrowerStockValidation';
import { useState } from 'react';

interface ValidatedStockEditorProps {
    growerId: string;
    variant: IProduct['variants'][0];
    onStockUpdateRequest: (variantId: string, newStock: number, reason?: string) => Promise<void>;
    pendingUpdate?: IGrowerStockUpdate;
    disabled?: boolean;
}

export function ValidatedStockEditor({
    variant,
    onStockUpdateRequest,
    pendingUpdate,
    disabled = false,
}: ValidatedStockEditorProps) {
    const [inputValue, setInputValue] = useState(variant.stock.toString());
    const [reason, setReason] = useState('');
    const [showReasonModal, setShowReasonModal] = useState(false);
    const [pendingNewStock, setPendingNewStock] = useState<number | null>(null);
    const [updating, setUpdating] = useState(false);

    const inputValueNumber = parseFloat(inputValue);
    const hasChanges = inputValueNumber !== variant.stock && !isNaN(inputValueNumber);
    const hasPendingUpdate = pendingUpdate && pendingUpdate.status === GrowerStockValidationStatus.PENDING;

    const handleStockChange = (newValue: string) => {
        setInputValue(newValue);
    };

    const handleQuantityChange = (newQuantity: number) => {
        setInputValue(newQuantity.toString());
    };

    const requestStockUpdate = async () => {
        if (!hasChanges || disabled) return;

        setPendingNewStock(inputValueNumber);
        setShowReasonModal(true);
    };

    const submitStockUpdateRequest = async () => {
        if (pendingNewStock === null) return;

        setUpdating(true);
        try {
            await onStockUpdateRequest(variant.id, pendingNewStock, reason);
            setReason('');
            setShowReasonModal(false);
            setPendingNewStock(null);
        } catch (error) {
            console.error('Erreur lors de la demande de mise à jour:', error);
        } finally {
            setUpdating(false);
        }
    };

    const cancelRequest = () => {
        setInputValue(variant.stock.toString());
        setReason('');
        setShowReasonModal(false);
        setPendingNewStock(null);
    };

    const getStatusBadge = () => {
        if (!pendingUpdate) return null;

        const statusConfig = {
            [GrowerStockValidationStatus.PENDING]: {
                color: 'bg-yellow-100 text-yellow-800',
                text: 'En attente',
            },
            [GrowerStockValidationStatus.APPROVED]: {
                color: 'bg-green-100 text-green-800',
                text: 'Approuvé',
            },
            [GrowerStockValidationStatus.REJECTED]: {
                color: 'bg-red-100 text-red-800',
                text: 'Rejeté',
            },
        };

        const config = statusConfig[pendingUpdate.status];
        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                {config.text}
            </span>
        );
    };

    return (
        <div className="flex flex-col items-center space-y-2">
            <div className="flex items-center space-x-2">
                <UpdateQuantityButtons
                    increment={() => handleStockChange(Math.max(0, inputValueNumber + 0.001).toString())}
                    decrement={() => handleStockChange(Math.max(0, inputValueNumber - 0.001).toString())}
                    quantity={inputValueNumber}
                    disabled={disabled || hasPendingUpdate || updating}
                    centerEditing={true}
                    onQuantityChange={handleQuantityChange}
                />

                {hasChanges && !hasPendingUpdate && (
                    <Button
                        variant="primary"
                        onClick={requestStockUpdate}
                        disabled={disabled || updating}
                        className="ml-2 text-xs px-2 py-1"
                    >
                        Demander
                    </Button>
                )}
            </div>

            {/* Badge de statut */}
            {pendingUpdate && (
                <div className="flex flex-col items-center space-y-1">
                    {getStatusBadge()}
                    {pendingUpdate.status === GrowerStockValidationStatus.PENDING && (
                        <div className="text-xs text-gray-500 text-center">Demande: {pendingUpdate.newStock}</div>
                    )}
                    {pendingUpdate.adminComment && (
                        <div className="text-xs text-gray-600 text-center max-w-32">{pendingUpdate.adminComment}</div>
                    )}
                </div>
            )}

            {/* Modal pour la raison */}
            {showReasonModal && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                    onClick={cancelRequest}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                            cancelRequest();
                        }
                    }}
                    role="dialog"
                    tabIndex={-1}
                    aria-label="Fermer la modale"
                >
                    <div 
                        className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-semibold mb-4">Demande de mise à jour du stock</h3>

                        <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">
                                Stock actuel: <span className="font-medium">{variant.stock}</span>
                            </p>
                            <p className="text-sm text-gray-600 mb-4">
                                Stock demandé: <span className="font-medium">{pendingNewStock}</span>
                            </p>

                            <label htmlFor="reason-textarea" className="block text-sm font-medium text-gray-700 mb-2">
                                Raison de la modification (optionnel)
                            </label>
                            <textarea
                                id="reason-textarea"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows={3}
                                placeholder="Expliquez pourquoi vous souhaitez modifier ce stock..."
                            />
                        </div>

                        <div className="flex justify-end space-x-3">
                            <Button
                                variant="secondary"
                                onClick={cancelRequest}
                                disabled={updating}
                            >
                                Annuler
                            </Button>
                            <Button
                                variant="primary"
                                onClick={submitStockUpdateRequest}
                                disabled={updating}
                            >
                                {updating ? 'Envoi...' : 'Envoyer la demande'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
