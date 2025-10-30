import React from 'react';

interface NewClientBadgeProps {
    count: number;
    className?: string;
}

/**
 * Badge pour les nouveaux clients
 * Utilise un effet de pulsation subtil pour attirer l'attention sans être agressif
 */
export const NewClientBadge: React.FC<NewClientBadgeProps> = ({ 
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
                bg-blue-500 rounded-full 
                animate-pulse
                shadow-lg shadow-blue-500/50
                ${className}
            `}
            style={{
                animation: 'gentle-glow-blue 2s ease-in-out infinite alternate'
            }}
        >
            {count > 99 ? '99+' : count}
            <style jsx>{`
                @keyframes gentle-glow-blue {
                    0% {
                        box-shadow: 0 0 5px rgba(59, 130, 246, 0.5), 0 0 10px rgba(59, 130, 246, 0.3);
                        transform: scale(1);
                    }
                    100% {
                        box-shadow: 0 0 10px rgba(59, 130, 246, 0.8), 0 0 20px rgba(59, 130, 246, 0.4);
                        transform: scale(1.05);
                    }
                }
            `}</style>
        </span>
    );
};