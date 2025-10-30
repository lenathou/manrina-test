import { useQuery } from '@tanstack/react-query';

/**
 * Hook pour récupérer le nombre de candidatures de producteurs en attente de validation
 * Utilisé pour afficher des badges de notification dans la sidebar admin
 */
export const usePendingGrowerApplicationsCount = ({ enabled = true }: { enabled?: boolean } = {}) => {
    return useQuery<number>({
        queryKey: ['admin', 'pending-grower-applications-count'],
        queryFn: async () => {
            const response = await fetch('/api/admin/growers/pending-count');
            
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération du nombre de candidatures en attente');
            }
            
            const data = await response.json();
            return data.count || 0;
        },
        refetchInterval: 120000, // Rafraîchir toutes les 2 minutes
        staleTime: 90000, // Considérer les données comme fraîches pendant 90 secondes
        refetchOnWindowFocus: false, // Éviter les refetch inutiles
        enabled,
        networkMode: 'online', // Seulement quand en ligne
        meta: {
            priority: 'low', // Priorité basse pour ne pas interférer
        },
    });
};