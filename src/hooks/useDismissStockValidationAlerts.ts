import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Hook pour gérer la fermeture des alertes de validation de stock
 * Marque toutes les réponses de validation comme vues et invalide les caches
 */
export const useDismissStockValidationAlerts = (growerId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/grower/mark-stock-responses-viewed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          growerId: growerId,
          // Ne pas spécifier responseIds pour marquer toutes les réponses non vues
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors du marquage des réponses comme vues');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalider les caches pour mettre à jour immédiatement l'UI
      queryClient.invalidateQueries({ queryKey: ['stockValidationResponsesCount', growerId] });
      queryClient.invalidateQueries({ queryKey: ['growerAlerts', growerId] });
      
      // Invalider aussi les caches globaux pour la sidebar
      queryClient.invalidateQueries({ queryKey: ['pendingStockValidationCount'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stock-validation'] });
    },
    onError: (error) => {
      console.error('Erreur lors de la fermeture des alertes:', error);
    },
  });
};