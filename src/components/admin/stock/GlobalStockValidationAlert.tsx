import React from 'react';
import { usePendingStockValidationCount } from '@/hooks/usePendingStockValidationCount';

interface GlobalStockValidationAlertProps {
    enabled?: boolean;
}

export const GlobalStockValidationAlert: React.FC<GlobalStockValidationAlertProps> = ({ enabled = true }) => {
    // Utiliser le hook pour obtenir le nombre de validations en attente
    const { data: pendingCount = 0, isLoading } = usePendingStockValidationCount({ enabled });

    if (isLoading || pendingCount === 0) {
        return null;
    }

    return (
        <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
                <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>  
                </span>
                <span className="text-sm font-semibold text-orange-800">
                    {pendingCount} demande{pendingCount > 1 ? 's' : ''} de validation de stock en attente
                </span>
            </div>
            <div className="text-xs text-orange-700">
                Des producteurs ont transmis leurs listes de stock et attendent votre validation.
            </div>
            <div className="mt-2">
                <button
                    onClick={() => window.location.href = '/admin/stock/validation-stock'}
                    className="text-xs text-orange-800 underline hover:text-orange-900 font-medium"
                >
                    Accéder à la validation des stocks →
                </button>
            </div>
        </div>
    );
};

export default GlobalStockValidationAlert;