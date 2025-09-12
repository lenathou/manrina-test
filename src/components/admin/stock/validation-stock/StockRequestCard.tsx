import React from 'react';
import { Button } from '@/components/ui/Button';
import { IGrowerStockUpdateWithRelations } from '@/hooks/useGrowerStockValidation';
import { GrowerStockValidationStatus } from '@/server/grower/IGrowerStockValidation';
import { useUnitById } from '@/hooks/useUnits';

interface StockRequestCardProps {
    request: IGrowerStockUpdateWithRelations;
    isSelected: boolean;
    onToggleSelection: () => void;
    onApprove: () => void;
    onReject: () => void;
    isProcessing: boolean;

    formatDistanceToNow: (date: Date) => string;
}

const StockRequestCard: React.FC<StockRequestCardProps> = ({
    request,
    isSelected,
    onToggleSelection,
    onApprove,
    onReject,
    isProcessing,
    formatDistanceToNow
}) => {
    const getStatusText = (status: GrowerStockValidationStatus) => {
        switch (status) {
            case GrowerStockValidationStatus.PENDING:
                return 'En attente';
            case GrowerStockValidationStatus.APPROVED:
                return 'Approuvé';
            case GrowerStockValidationStatus.REJECTED:
                return 'Rejeté';
            default:
                return '';
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
            {/* Version mobile - layout vertical */}
            <div className="flex flex-col sm:hidden">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id={`select-${request.id}`}
                            checked={isSelected}
                            onChange={onToggleSelection}
                            className="w-4 h-4 border-gray-300 rounded text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        />
                        <div>
                            <h3 className="text-base font-semibold text-gray-900">
                                {request.product.name}
                            </h3>
                            <div className="flex flex-col gap-1 text-xs text-gray-600">
                                <span>Demandé {formatDistanceToNow(new Date(request.requestDate))}</span>
                                <span>Unité: {useUnitById(request.product.baseUnitId || null)?.name || 'unité'}</span>
                            </div>
                        </div>
                    </div>
                    <span className="text-xs text-gray-500">{getStatusText(request.status)}</span>
                </div>

                <div className="mb-3">
                    <div className="bg-gray-50 border border-gray-200 rounded p-2">
                        <span className="text-xs text-gray-600">Nouveau stock demandé:</span>
                        <span className="ml-1 text-base font-semibold text-gray-900">
                            {request.newStock} {useUnitById(request.product.baseUnitId || null)?.name || 'unité'}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col gap-2 pt-2 border-t border-gray-200">
                    <Button
                        onClick={onApprove}
                        disabled={isProcessing}
                        variant="secondary"
                        size="sm"
                    >
                        {isProcessing ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Traitement...
                            </>
                        ) : (
                            'Approuver'
                        )}
                    </Button>
                    <Button
                        onClick={onReject}
                        disabled={isProcessing}
                        variant="danger"
                        size="sm"
                    >
                        {isProcessing ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Traitement...
                            </>
                        ) : (
                            'Rejeter'
                        )}
                    </Button>
                </div>
            </div>

            {/* Version bureau - layout horizontal avec flexbox */}
            <div className="hidden sm:flex sm:items-center sm:justify-between sm:gap-4">
                <div className="flex items-center space-x-3">
                    <input
                        type="checkbox"
                        id={`select-${request.id}`}
                        checked={isSelected}
                        onChange={onToggleSelection}
                        className="w-4 h-4 border-gray-300 rounded text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    />
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {request.product.name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Demandé {formatDistanceToNow(new Date(request.requestDate))}</span>
                            <span>Unité: {useUnitById(request.product.baseUnitId || null)?.name || 'unité'}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-gray-50 border border-gray-200 rounded px-3 py-2">
                        <span className="text-sm text-gray-600">Nouveau stock:</span>
                        <span className="ml-2 text-lg font-semibold text-gray-900">
                            {request.newStock} {useUnitById(request.product.baseUnitId || null)?.name || 'unité'}
                        </span>
                    </div>

                    <span className="text-sm text-gray-500">{getStatusText(request.status)}</span>

                    <div className="flex gap-3">
                        <Button
                            onClick={onApprove}
                            disabled={isProcessing}
                            variant="secondary"
                            size="md"
                        >
                            {isProcessing ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Traitement...
                                </>
                            ) : (
                                'Approuver'
                            )}
                        </Button>
                        <Button
                            onClick={onReject}
                            disabled={isProcessing}
                            variant="danger"
                            size="md"
                        >
                            {isProcessing ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Traitement...
                                </>
                            ) : (
                                'Rejeter'
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StockRequestCard;