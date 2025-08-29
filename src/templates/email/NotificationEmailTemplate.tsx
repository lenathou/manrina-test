/* eslint-disable react/no-unescaped-entities */
'use client';

import React from 'react';
import { NotificationType } from '@prisma/client';
import { NotificationConfigUtils } from '@/config/notifications/NotificationConfigUtils';

interface NotificationEmailTemplateProps {
  type: NotificationType;
  title: string;
  message: string;
  recipientName?: string;
  additionalContent?: React.ReactNode;
  footerText?: string;
}

/**
 * Template d'email pour les notifications utilisant Tailwind CSS
 * Remplace le CSS inline par des classes Tailwind
 */
const NotificationEmailTemplate: React.FC<NotificationEmailTemplateProps> = ({
  type,
  title,
  message,
  recipientName = 'Cher utilisateur',
  additionalContent,
  footerText = 'Votre marché local de confiance'
}) => {
  const config = NotificationConfigUtils.getUIConfig(type);
  
  // Mapping des couleurs de fond
  const getBackgroundClass = () => {
    switch (config.backgroundColor) {
      case '#FEF2F2': return 'bg-red-50';
      case '#FEFCE8': return 'bg-yellow-50';
      case '#F0F9FF': return 'bg-sky-50';
      case '#F0FDF4': return 'bg-green-50';
      case '#FAF5FF': return 'bg-purple-50';
      case '#FFFBEB': return 'bg-amber-50';
      case '#FEF3C7': return 'bg-amber-100';
      default: return 'bg-gray-50';
    }
  };

  // Mapping des couleurs de texte
  const getTextClass = () => {
    switch (config.textColor) {
      case '#991B1B': return 'text-red-800';
      case '#92400E': return 'text-amber-800';
      case '#1E40AF': return 'text-blue-800';
      case '#166534': return 'text-green-800';
      case '#6B21A8': return 'text-purple-800';
      case '#D97706': return 'text-amber-600';
      default: return 'text-gray-800';
    }
  };

  // Mapping des couleurs d'icône

  // Mapping des couleurs de bordure
  const getBorderClass = () => {
    switch (config.iconColor) {
      case '#DC2626': return 'border-red-600';
      case '#F59E0B': return 'border-amber-500';
      case '#3B82F6': return 'border-blue-500';
      case '#10B981': return 'border-green-500';
      case '#8B5CF6': return 'border-purple-500';
      default: return 'border-gray-500';
    }
  };

  return (
    <div className="font-sans max-w-2xl mx-auto p-5" style={{ backgroundColor: '#f8f0e9' }}>
      <div className="bg-white rounded-lg p-8 shadow-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`${getBackgroundClass()} rounded-full w-20 h-20 mx-auto mb-5 flex items-center justify-center`}>
            <span className="text-4xl">{config.icon}</span>
          </div>
          <h1 className={`${getTextClass()} text-3xl font-bold m-0`} style={{ fontFamily: 'Redgar, serif' }}>
            {title}
          </h1>
        </div>

        {/* Content */}
        <div className="mb-8">
          <p className="text-gray-600 text-base leading-relaxed mb-5">
            Bonjour {recipientName},
          </p>
          
          <div className={`${getBackgroundClass()} border-l-4 ${getBorderClass()} p-5 my-5 rounded`}>
            <p className="text-gray-600 text-base leading-relaxed m-0">
              {message}
            </p>
          </div>

          {additionalContent && (
            <div className="my-5">
              {additionalContent}
            </div>
          )}

          <p className="text-gray-600 text-base leading-relaxed">
            Nous nous excusons pour la gêne occasionnée et vous remercions de votre compréhension.
          </p>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-5 text-center">
          <p className="text-gray-800 text-lg font-bold m-0 mb-2">
            L'équipe Manrina
          </p>
          <p className="text-gray-600 text-sm m-0">
            {footerText}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationEmailTemplate;