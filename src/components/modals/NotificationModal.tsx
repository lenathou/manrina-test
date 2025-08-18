'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { Notification } from '@prisma/client';
import { useNotifications } from '@/contexts/NotificationContext';
import {  Button } from '@/components/ui';
import { Text } from '../ui/Text';
import { NotificationIcon } from '@/components/notifications';
import { NotificationConfigUtils } from '@/config/notifications/NotificationConfigUtils';
import { PlaceholderIcon } from '@/components/icons/PlaceholderIcon';

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

  const config = NotificationConfigUtils.getConfig(notification.type);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto border-2">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <NotificationIcon type={notification.type} size="md" />
            <Text variant="h4" className="font-semibold">
              Notification
            </Text>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <PlaceholderIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <div className="p-3 rounded-lg border mb-4" style={{ backgroundColor: config.ui.backgroundColor, borderColor: config.ui.backgroundColor }}>
            <Text variant="h4" className="font-semibold mb-2">
              {notification.title}
            </Text>
            
            {/* Market info if applicable */}
            {notification.marketId && (
              <Text variant="small" className="text-gray-600 mb-2">
                Marché ID : {notification.marketId}
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