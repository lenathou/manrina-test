import React from 'react';

interface NotificationBadgeProps {
    count: number;
    className?: string;
}

/**
 * Badge de notification pour afficher le nombre d'éléments en attente
 * Utilisé dans la sidebar admin pour les notifications
 */
export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ 
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
                ${className}
            `}
        >
            {count > 99 ? '99+' : count}
        </span>
    );
};