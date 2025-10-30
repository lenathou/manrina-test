import { useState, useEffect, useCallback } from 'react';

const VIEWED_CLIENTS_KEY = 'manrina_viewed_clients';

interface ViewedClientsData {
  [clientId: string]: {
    viewedAt: string;
    timestamp: number;
  };
}

export const useViewedClients = () => {
  const [viewedClients, setViewedClients] = useState<ViewedClientsData>({});

  // Charger les données depuis localStorage au montage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(VIEWED_CLIENTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setViewedClients(parsed);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des clients consultés:', error);
    }
  }, []);

  // Marquer un client comme consulté
  const markClientAsViewed = useCallback((clientId: string) => {
    const now = new Date();
    const viewData = {
      viewedAt: now.toISOString(),
      timestamp: now.getTime(),
    };

    setViewedClients(prev => {
      const updated = {
        ...prev,
        [clientId]: viewData,
      };

      // Sauvegarder dans localStorage
      try {
        localStorage.setItem(VIEWED_CLIENTS_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Erreur lors de la sauvegarde des clients consultés:', error);
      }

      return updated;
    });
  }, []);

  // Vérifier si un client a été consulté
  const isClientViewed = useCallback((clientId: string): boolean => {
    return clientId in viewedClients;
  }, [viewedClients]);

  // Obtenir la date de consultation d'un client
  const getClientViewedDate = useCallback((clientId: string): Date | null => {
    const viewData = viewedClients[clientId];
    return viewData ? new Date(viewData.viewedAt) : null;
  }, [viewedClients]);

  // Nettoyer les anciennes entrées (plus de 30 jours)
  const cleanupOldEntries = useCallback(() => {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    setViewedClients(prev => {
      const cleaned = Object.entries(prev).reduce((acc, [clientId, data]) => {
        if (data.timestamp > thirtyDaysAgo) {
          acc[clientId] = data;
        }
        return acc;
      }, {} as ViewedClientsData);

      // Sauvegarder dans localStorage
      try {
        localStorage.setItem(VIEWED_CLIENTS_KEY, JSON.stringify(cleaned));
      } catch (error) {
        console.error('Erreur lors du nettoyage des clients consultés:', error);
      }

      return cleaned;
    });
  }, []);

  // Nettoyer automatiquement au montage
  useEffect(() => {
    cleanupOldEntries();
  }, [cleanupOldEntries]);

  return {
    markClientAsViewed,
    isClientViewed,
    getClientViewedDate,
    cleanupOldEntries,
  };
};