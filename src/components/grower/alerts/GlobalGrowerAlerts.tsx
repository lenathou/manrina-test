import React from 'react';
import { useGrowerAlerts } from '@/alerts/useGrowerAlerts';
import StockValidationResponsesAlert from './StockValidationResponsesAlert';
import PendingOrdersAlert from './PendingOrdersAlert';

interface GlobalGrowerAlertsProps {
    growerId: string;
}

const GlobalGrowerAlerts: React.FC<GlobalGrowerAlertsProps> = ({ growerId }) => {
    const { totalAlertsCount } = useGrowerAlerts(growerId);

    // Si aucune alerte, ne rien afficher
    if (totalAlertsCount === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            <StockValidationResponsesAlert growerId={growerId} />
            <PendingOrdersAlert growerId={growerId} />
        </div>
    );
};

export default GlobalGrowerAlerts;