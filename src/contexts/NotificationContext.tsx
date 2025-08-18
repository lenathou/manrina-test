'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface Notification {
  id: string;
  type: 'MARKET_CANCELLATION' | 'GENERAL_ANNOUNCEMENT' | 'SYSTEM_MAINTENANCE';
  title: string;
  message: string;
  marketId?: string;
  targetUsers: string[];
  readBy: string[];
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  isActive: boolean;
  isRead: boolean;
  market?: {
    id: string;
    name: string;
    date: string;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  showNotificationModal: boolean;
  setShowNotificationModal: (show: boolean) => void;
  currentNotification: Notification | null;
  setCurrentNotification: (notification: Notification | null) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuthentication = () => {
    // Vérifier si l'utilisateur a un token d'authentification
    const hasAdminToken = document.cookie.includes('adminToken=');
    const hasCustomerToken = document.cookie.includes('customerToken=');
    const hasGrowerToken = document.cookie.includes('growerToken=');
    const hasDelivererToken = document.cookie.includes('delivererToken=');
    
    return hasAdminToken || hasCustomerToken || hasGrowerToken || hasDelivererToken;
  };

  const fetchNotifications = async () => {
    if (!isAuthenticated) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        
        // Afficher automatiquement la première notification non lue
        const unreadNotifications = data.filter((n: Notification) => !n.isRead);
        if (unreadNotifications.length > 0 && !showNotificationModal) {
          setCurrentNotification(unreadNotifications[0]);
          setShowNotificationModal(true);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, isRead: true }
              : notification
          )
        );
      }
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
    }
  };

  const refreshNotifications = async () => {
    await fetchNotifications();
  };

  // Vérifier l'authentification au montage
  useEffect(() => {
    const authenticated = checkAuthentication();
    setIsAuthenticated(authenticated);
    if (authenticated) {
      fetchNotifications();
    }
  }, []);

  // Polling pour vérifier les nouvelles notifications toutes les 30 secondes
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      // Re-vérifier l'authentification à chaque polling
      const stillAuthenticated = checkAuthentication();
      setIsAuthenticated(stillAuthenticated);
      if (stillAuthenticated) {
        fetchNotifications();
      }
    }, 30000); // 30 secondes

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    refreshNotifications,
    showNotificationModal,
    setShowNotificationModal,
    currentNotification,
    setCurrentNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;