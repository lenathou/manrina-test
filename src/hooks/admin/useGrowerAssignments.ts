import { useQuery } from '@tanstack/react-query';
import { Assignment } from '@prisma/client';


export const useGrowerAssignments = () => {
  return useQuery({
    queryKey: ['admin', 'assignments'],
    queryFn: async (): Promise<Assignment[]> => {
      const response = await fetch('/api/admin/assignments');
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des affectations');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useGrowerAssignmentById = (growerId: string) => {
  return useQuery({
    queryKey: ['admin', 'grower', growerId, 'assignment'],
    queryFn: async (): Promise<Assignment | null> => {
      const response = await fetch(`/api/admin/growers/${growerId}/assignment`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Erreur lors du chargement de l\'affectation');
      }
      return response.json();
    },
    enabled: !!growerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useGrowerStats = (growerId: string) => {
  return useQuery({
    queryKey: ['admin', 'grower', growerId, 'stats'],
    queryFn: async () => {
      const response = await fetch(`/api/admin/growers/${growerId}/stats`);
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des statistiques');
      }
      return response.json();
    },
    enabled: !!growerId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};