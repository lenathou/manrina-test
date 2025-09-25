import React from 'react';
import { useNewMarketParticipations } from '@/hooks/useNewMarketParticipations';

interface SessionAlertProps {
    sessionId: string;
    className?: string;
}

export const SessionAlert: React.FC<SessionAlertProps> = ({ sessionId, className = '' }) => {
    const { growersWithNewMarketParticipations, isLoading } = useNewMarketParticipations(sessionId);

    if (isLoading) {
        return null;
    }

    const newParticipationsCount = growersWithNewMarketParticipations.length;

    if (newParticipationsCount === 0) {
        return null;
    }

    return (
        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800 ${className}`}>
            {newParticipationsCount} nouvelle{newParticipationsCount > 1 ? 's' : ''} participation{newParticipationsCount > 1 ? 's' : ''}
        </span>
    );
};

export default SessionAlert;