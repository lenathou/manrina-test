'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { useNotifications, Notification } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import CloseIcon from '@/icons/close';
import CancelIcon from '@/icons/cancel';
import SettingsIcon from '@/icons/settings';

interface NotificationModalProps {
  notification: Notification;
  onClose: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ notification, onClose }) => {
  const { markAsRead } = useNotifications();

  const handleClose = async () => {
    await markAsRead(notification.id);
    onClose();
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'MARKET_CANCELLATION':
        return <div className="w-6 h-6 text-red-500" dangerouslySetInnerHTML={{ __html: CancelIcon({ color: '#ef4444' }) }} />;
      case 'SYSTEM_MAINTENANCE':
        return <div className="w-6 h-6 text-orange-500" dangerouslySetInnerHTML={{ __html: SettingsIcon({ primary: '#f97316' }) }} />;
      default:
        return <div className="w-6 h-6 text-blue-500" dangerouslySetInnerHTML={{ __html: SettingsIcon({ primary: '#3b82f6' }) }} />;
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'MARKET_CANCELLATION':
        return 'bg-red-50 border-red-200';
      case 'SYSTEM_MAINTENANCE':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {getIcon()}
            <Text variant="h4" className="font-semibold">
              Notification
            </Text>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <div className="w-5 h-5 text-gray-500" dangerouslySetInnerHTML={{ __html: CloseIcon({ primary: '#6b7280' }) }} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <div className={`p-3 rounded-lg border mb-4 ${getBackgroundColor()}`}>
            <Text variant="h4" className="font-semibold mb-2">
              {notification.title}
            </Text>
            
            {/* Market info if applicable */}
            {notification.market && (
              <Text variant="small" className="text-gray-600 mb-2">
                Marché : {notification.market.name} - {formatDate(notification.market.date)}
              </Text>
            )}
          </div>

          {/* Message */}
          <div className="mb-4">
            <Text variant="body" className="whitespace-pre-wrap leading-relaxed">
              {notification.message}
            </Text>
          </div>

          {/* Date */}
          <div className="mb-6">
            <Text variant="small" className="text-gray-500">
              Publié le {formatDate(notification.createdAt)}
            </Text>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              variant="primary"
              onClick={handleClose}
              className="px-6"
            >
              J'ai compris
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default NotificationModal;