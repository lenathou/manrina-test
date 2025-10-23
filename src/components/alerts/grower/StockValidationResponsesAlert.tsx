/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import Link from 'next/link';
import { useStockValidationResponsesCount } from '@/hooks/useStockValidationResponsesCount';
import { useDismissStockValidationAlerts } from '@/hooks/useDismissStockValidationAlerts';

interface StockValidationResponsesAlertProps {
    growerId: string;
}

const StockValidationResponsesAlert: React.FC<StockValidationResponsesAlertProps> = ({ growerId }) => {
    const { data: count, isLoading, error } = useStockValidationResponsesCount(growerId);
    const dismissAlerts = useDismissStockValidationAlerts(growerId);

    const handleDismiss = () => {
        dismissAlerts.mutate();
    };

    if (isLoading || error || !count || count === 0) {
        return null;
    }

    return (
        <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>  
                    </span>
                    <span className="text-sm font-semibold text-orange-800">
                        Nouvelles réponses de validation de stock
                    </span>
                </div>
                <button
                    onClick={handleDismiss}
                    disabled={dismissAlerts.isPending}
                    className="text-orange-600 hover:text-orange-800 transition-colors disabled:opacity-50"
                    title="Marquer comme vu"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <div className="text-xs text-orange-700">
                L'administrateur a traité vos demandes de validation de stock.
            </div>
            <div className="mt-2">
                <Link
                    href="/producteur/stocks"
                    className="text-xs text-orange-800 underline hover:text-orange-900 font-medium"
                >
                    Voir mes stocks →
                </Link>
            </div>
        </div>
    );
};

export default StockValidationResponsesAlert;