import React from 'react';

interface PendingGrowerBadgeProps {
    count: number;
    className?: string;
}

/**
 * Badge scintillant pour les candidatures de producteurs en attente
 * Utilise un effet de pulsation subtil pour attirer l'attention sans être agressif
 */
export const PendingGrowerBadge: React.FC<PendingGrowerBadgeProps> = ({ 
    count, 
    className = '' 
}) => {
    if (count === 0) {
        return null;
    }

    return (
        <span 
            className={`
                inline-flex items-center justify-center 
                min-w-[20px] h-5 px-1.5 
                text-xs font-medium text-white 
                bg-red-500 rounded-full 
                animate-pulse
                shadow-lg shadow-red-500/50
                ${className}
            `}
            style={{
                animation: 'gentle-glow 2s ease-in-out infinite alternate'
            }}
        >
            {count > 99 ? '99+' : count}
            <style jsx>{`
                @keyframes gentle-glow {
                    0% {
                        box-shadow: 0 0 5px rgba(239, 68, 68, 0.5), 0 0 10px rgba(239, 68, 68, 0.3);
                        transform: scale(1);
                    }
                    100% {
                        box-shadow: 0 0 10px rgba(239, 68, 68, 0.8), 0 0 20px rgba(239, 68, 68, 0.4);
                        transform: scale(1.05);
                    }
                }
            `}</style>
        </span>
    );
};