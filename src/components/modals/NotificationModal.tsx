/* eslint-disable react/no-unescaped-entities */
'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Notification } from '@prisma/client';
import { useNotifications } from '@/contexts/NotificationContext';
import { Text } from '../ui/Text';
import { NotificationIcon } from '@/components/notifications';
import { PlaceholderIcon } from '@/components/icons/PlaceholderIcon';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '@/components/ui/Card';

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

  const handleMarkAsRead = async () => {
    await markAsRead(notification.id);
    onClose();
  };


  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto border-2 p-0" padding="none">
        {/* Header */}
        <CardHeader className="bg-secondary p-0 m-0 border-b border-gray-200">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <NotificationIcon type={notification.type} size="md" />
              <CardTitle className="font-semibold text-white">
                Notification
              </CardTitle>
            </div>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors disabled:opacity-50"
            >
              <PlaceholderIcon className="w-5 h-5 text-white" />
            </button>
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="bg-background p-6 space-y-4">
          <div className="space-y-2">
            <Text variant="h5" className="font-medium">
              {notification.title}
            </Text>
            <Text variant="body" className="text-gray-600">
              {notification.message}
            </Text>
          </div>



          <div className="text-sm text-gray-500">
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
              locale: fr,
            })}
          </div>
        </CardContent>

        {/* Footer */}
        <CardFooter className="flex justify-end gap-2 p-4 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Fermer
          </button>
          <button
            onClick={handleMarkAsRead}
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
          >
            Marquer comme lu
          </button>
        </CardFooter>
      </Card>
    </div>,
    document.body
  );
};

export default NotificationModal;