'use client';

import React from 'react';
import { NotificationType } from '@prisma/client';
import { NotificationConfigUtils } from '@/config/notifications/NotificationConfigUtils';
import { Text } from '@/components/ui/Text';
import NotificationIcon from './NotificationIcon';
import { formatDateTimeShort } from '@/utils/dateUtils';

interface NotificationCardProps {
  type: NotificationType;
  title: string;
  message: string;
  createdAt?: Date;
  showIcon?: boolean;
  showActions?: boolean;
  onRead?: () => void;
  onDismiss?: () => void;
  className?: string;
}

/**
 * Composant carte pour afficher une notification complète
 * Utilise la configuration centralisée pour le style et les couleurs
 */
const NotificationCard: React.FC<NotificationCardProps> = ({
  type,
  title,
  message,
  createdAt,
  showIcon = true,
  showActions = true,
  onRead,
  onDismiss,
  className = ''
}) => {
  const config = NotificationConfigUtils.getUIConfig(type);
  
  // Générer les classes Tailwind dynamiques
  const getBackgroundClass = () => {
    switch (config.backgroundColor) {
      case '#FEF2F2': return 'bg-red-50';
      case '#F0F9FF': return 'bg-blue-50';
      case '#FFFBEB': return 'bg-orange-50';
      case '#F0FDF4': return 'bg-green-50';
      default: return 'bg-gray-50';
    }
  };

  const getTextClass = () => {
    switch (config.textColor) {
      case '#991B1B': return 'text-red-800';
      case '#1E40AF': return 'text-blue-800';
      case '#92400E': return 'text-orange-800';
      case '#166534': return 'text-green-800';
      default: return 'text-gray-800';
    }
  };

  const getBorderClass = () => {
    switch (config.iconColor) {
      case '#DC2626': return 'border-red-200';
      case '#3B82F6': return 'border-blue-200';
      case '#F59E0B': return 'border-orange-200';
      case '#10B981': return 'border-green-200';
      default: return 'border-gray-200';
    }
  };

  const handleAction = (action: 'read' | 'dismiss') => {
    if (action === 'read' && onRead) {
      onRead();
    } else if (action === 'dismiss' && onDismiss) {
      onDismiss();
    }
  };

  return (
    <div 
      className={`
        ${getBackgroundClass()}
        ${getBorderClass()}
        ${getTextClass()}
        border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200
        ${className}
      `}
    >
      <div className="flex items-start space-x-3">
        {showIcon && (
          <div className="flex-shrink-0">
            <NotificationIcon 
              type={type} 
              size="md"
              className="mt-0.5"
            />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Text 
                variant="h4" 
                className={`font-semibold ${getTextClass()} mb-1`}
              >
                {title}
              </Text>
              
              <Text 
                variant="body" 
                className={`${getTextClass()} opacity-90 leading-relaxed`}
              >
                {message}
              </Text>
              
              {createdAt && (
                <Text 
                variant="small" 
                className={`${getTextClass()} opacity-70 mt-2`}
              >
                  {formatDateTimeShort(createdAt)}
                </Text>
              )}
            </div>
            
            {config.priority === 1 && (
              <div className="flex-shrink-0 ml-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Urgent
                </span>
              </div>
            )}
          </div>
          
          {showActions && (onRead || onDismiss) && (
            <div className="flex items-center space-x-2 mt-3">
              {onRead && (
                <button
                  onClick={() => handleAction('read')}
                  className={`
                    px-3 py-1 text-xs font-medium rounded-md transition-colors duration-200
                    ${config.priority === 1 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }
                  `}
                >
                  Marquer comme lu
                </button>
              )}
              
              {onDismiss && (
                <button
                  onClick={() => handleAction('dismiss')}
                  className={`
                    px-3 py-1 text-xs font-medium rounded-md transition-colors duration-200
                    border ${getBorderClass()} ${getTextClass()} hover:bg-gray-50
                  `}
                >
                  Ignorer
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;