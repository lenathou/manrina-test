import React from 'react';
import { usePendingStockValidationCount } from '@/hooks/usePendingStockValidationCount';

export const GlobalStockValidationAlert: React.FC = () => {
    // Utiliser le hook pour obtenir le nombre de validations en attente
    const { pendingCount, hasPendingRequests, isLoading } = usePendingStockValidationCount();

    if (isLoading || !hasPendingRequests || pendingCount === 0) {
        return null;
    }

    return (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
                <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="text-sm font-semibold text-red-800">
                    {pendingCount} demande{pendingCount > 1 ? 's' : ''} de validation de stock en attente
                </span>
            </div>
            <div className="text-xs text-red-700">
                Des producteurs ont transmis leurs listes de stock et attendent votre validation.
            </div>
            <div className="mt-2">
                <button
                    onClick={() => window.location.href = '/admin/stock/validation-stock'}
                    className="text-xs text-red-800 underline hover:text-red-900 font-medium"
                >
                    Accéder à la validation des stocks →
                </button>
            </div>
        </div>
    );
};

export default GlobalStockValidationAlert;