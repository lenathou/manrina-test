'use client';

import React, { useEffect } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import NotificationModal from '@/components/modals/NotificationModal';

const NotificationDisplay: React.FC = () => {
  const {
    showNotificationModal,
    setShowNotificationModal,
    currentNotification,
    setCurrentNotification,
    notifications,
  } = useNotifications();

  // Gérer l'affichage automatique des notifications non lues
  useEffect(() => {
    if (!showNotificationModal && notifications.length > 0) {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      if (unreadNotifications.length > 0 && !currentNotification) {
        setCurrentNotification(unreadNotifications[0]);
        setShowNotificationModal(true);
      }
    }
  }, [notifications, showNotificationModal, currentNotification, setCurrentNotification, setShowNotificationModal]);

  const handleCloseModal = () => {
    setShowNotificationModal(false);
    
    // Vérifier s'il y a d'autres notifications non lues à afficher
    setTimeout(() => {
      const remainingUnread = notifications.filter(
        n => !n.isRead && n.id !== currentNotification?.id
      );
      
      if (remainingUnread.length > 0) {
        setCurrentNotification(remainingUnread[0]);
        setShowNotificationModal(true);
      } else {
        setCurrentNotification(null);
      }
    }, 500); // Petit délai pour éviter les conflits d'animation
  };

  if (!showNotificationModal || !currentNotification) {
    return null;
  }

  return (
    <NotificationModal
      notification={currentNotification}
      onClose={handleCloseModal}
    />
  );
};

export default NotificationDisplay;