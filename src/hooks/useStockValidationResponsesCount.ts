import { useQuery } from '@tanstack/react-query';

/**
 * Hook pour récupérer le nombre de réponses de validation de stock non consultées
 * pour un producteur (approuvées ou rejetées par l'admin)
 */
export const useStockValidationResponsesCount = (growerId: string) => {
  return useQuery({
    queryKey: ['stockValidationResponsesCount', growerId],
    queryFn: async () => {
      if (!growerId) return 0;
      
      const response = await fetch(`/api/grower/stock-validation-responses-count?growerId=${growerId}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du nombre de réponses de validation');
      }
      
      const data = await response.json();
      return data.count || 0;
    },
    enabled: !!growerId,
    refetchInterval: 120000, // Actualiser toutes les 2 minutes (réduit grâce à l'invalidation immédiate)
    staleTime: 90000, // Considérer les données comme fraîches pendant 90 secondes
    refetchOnWindowFocus: false, // Éviter les refetch inutiles
    networkMode: 'online', // Seulement quand en ligne
  });
};