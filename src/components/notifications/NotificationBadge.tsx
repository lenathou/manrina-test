'use client';

import React from 'react';
import { NotificationType } from '@prisma/client';
import { NotificationConfigUtils } from '@/config/notifications/NotificationConfigUtils';
import { Text } from '@/components/ui/Text';
import NotificationIcon from './NotificationIcon';

interface NotificationBadgeProps {
  type: NotificationType;
  title: string;
  message?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

/**
 * Composant badge pour afficher une notification de manière compacte
 * Utilise la configuration centralisée pour le style et les couleurs
 */
const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  type,
  title,
  message,
  showIcon = true,
  size = 'md',
  className = '',
  onClick
}) => {
  const config = NotificationConfigUtils.getUIConfig(type);
  
  // Classes de taille
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  };

  // Classes d'icône selon la taille
  const iconSizes = {
    sm: 'sm' as const,
    md: 'sm' as const,
    lg: 'md' as const
  };

  // Générer les classes Tailwind dynamiques
  const getBackgroundClass = () => {
    switch (config.backgroundColor) {
      case '#FEF2F2': return 'bg-red-50';
      case '#FFFBEB': return 'bg-orange-50';
      case '#F0F9FF': return 'bg-sky-50';
      case '#F0FDF4': return 'bg-green-50';
      case '#FAF5FF': return 'bg-purple-50';
      default: return 'bg-gray-50';
    }
  };

  const getBorderClass = () => {
    switch (config.backgroundColor) {
      case '#FEF2F2': return 'border-red-200';
      case '#FFFBEB': return 'border-orange-200';
      case '#F0F9FF': return 'border-sky-200';
      case '#F0FDF4': return 'border-green-200';
      case '#FAF5FF': return 'border-purple-200';
      default: return 'border-gray-200';
    }
  };

  const getTextClass = () => {
    switch (config.textColor) {
      case '#991B1B': return 'text-red-800';
      case '#92400E': return 'text-orange-800';
      case '#1E40AF': return 'text-sky-800';
      case '#166534': return 'text-green-800';
      case '#6B21A8': return 'text-purple-800';
      default: return 'text-gray-800';
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <div
      className={`
        inline-flex items-center gap-2 rounded-lg border transition-all duration-200
        ${getBackgroundClass()} ${getBorderClass()} ${getTextClass()}
        ${sizeClasses[size]}
        ${onClick ? 'cursor-pointer hover:shadow-md hover:scale-105' : ''}
        ${className}
      `}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {showIcon && (
        <NotificationIcon 
          type={type} 
          size={iconSizes[size]}
        />
      )}
      
      <div className="flex-1 min-w-0">
        <Text 
          variant={size === 'sm' ? 'small' : 'body'} 
          className={`font-medium truncate ${getTextClass()}`}
        >
          {title}
        </Text>
        
        {message && size !== 'sm' && (
          <Text 
            variant="small" 
            className={`opacity-80 truncate mt-1 ${getTextClass()}`}
          >
            {message}
          </Text>
        )}
      </div>

      {config.priority === 1 && (
        <div 
          className="w-2 h-2 rounded-full flex-shrink-0 bg-blue-600"
          title="Priorité élevée"
        />
      )}
    </div>
  );
};

export default NotificationBadge;