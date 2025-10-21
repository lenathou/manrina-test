import { useQuery } from '@tanstack/react-query';

/**
 * Hook pour récupérer le nombre de commandes en attente pour un producteur
 * Suit le même pattern que usePendingStockValidationCount
 */
export const usePendingOrdersCount = (growerId: string) => {
  return useQuery({
    queryKey: ['pendingOrdersCount', growerId],
    queryFn: async () => {
      if (!growerId) return 0;
      
      const response = await fetch(`/api/grower/pending-orders-count?growerId=${growerId}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du nombre de commandes en attente');
      }
      
      const data = await response.json();
      return data.count || 0;
    },
    enabled: !!growerId,
    refetchInterval: 30000, // Actualiser toutes les 30 secondes
    staleTime: 10000, // Considérer les données comme fraîches pendant 10 secondes
  });
};