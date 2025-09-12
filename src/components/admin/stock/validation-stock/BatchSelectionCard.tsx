import React from 'react';
import { Button } from '@/components/ui/Button';

interface BatchSelectionCardProps {
    selectedCount: number;
    totalCount: number;
    isAllSelected: boolean;
    onToggleAll: () => void;
    onBatchApprove: () => void;
    onBatchReject: () => void;
    isProcessing: boolean;
}

const BatchSelectionCard: React.FC<BatchSelectionCardProps> = ({
    selectedCount,
    totalCount,
    isAllSelected,
    onToggleAll,
    onBatchApprove,
    onBatchReject,
    isProcessing,
}) => {
    return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <input
                                type="checkbox"
                                id="select-all"
                                checked={isAllSelected && totalCount > 0}
                                onChange={onToggleAll}
                                className="w-5 h-5 rounded border-2 border-gray-300 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
                            />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900">Sélection en lot</p>
                            <p className="text-sm text-gray-600">
                                {selectedCount}/{totalCount} demandes sélectionnées
                            </p>
                        </div>
                    </div>
                </div>

                {selectedCount > 0 && (
                    <div className="flex space-x-3">
                        <Button
                            onClick={onBatchApprove}
                            disabled={isProcessing}
                            variant="secondary"
                            size="lg"
                        >
                            {isProcessing ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Traitement...
                                </>
                            ) : (
                                <>✓ Approuver ({selectedCount})</>
                            )}
                        </Button>
                        <Button
                            onClick={onBatchReject}
                            disabled={isProcessing}
                            variant="danger"
                            size="lg"
                        >
                            {isProcessing ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Traitement...
                                </>
                            ) : (
                                <>✕ Rejeter ({selectedCount})</>
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BatchSelectionCard;
