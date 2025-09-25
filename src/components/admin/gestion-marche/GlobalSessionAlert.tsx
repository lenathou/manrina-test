import React from 'react';
import { usePendingMarketSessionsCount } from '@/hooks/usePendingMarketSessionsCount';
import { MarketSessionWithProducts } from '@/types/market';

interface GlobalSessionAlertProps {
    sessions: MarketSessionWithProducts[];
}

export const GlobalSessionAlert: React.FC<GlobalSessionAlertProps> = ({ }) => {
    // Utiliser le hook global pour obtenir le total des nouvelles participations
    const { pendingCount, isLoading } = usePendingMarketSessionsCount();

    if (isLoading || pendingCount === 0) {
        return null;
    }

    return (
        <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
                <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
                <span className="text-sm font-semibold text-orange-800">
                    {pendingCount} nouvelle{pendingCount > 1 ? 's' : ''} participation{pendingCount > 1 ? 's' : ''} non consultée{pendingCount > 1 ? 's' : ''}
                </span>
            </div>
            <div className="text-xs text-orange-700">
                Vérifiez les sessions individuelles pour plus de détails.
            </div>
        </div>
    );
};

export default GlobalSessionAlert;