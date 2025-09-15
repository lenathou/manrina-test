import { useMutation, useQueryClient } from '@tanstack/react-query';
import { backendFetchService } from '@/service/BackendFetchService';
import type { IGrower } from '@/server/grower/IGrower';
import type { IGrowerUpdateParams } from '@/server/grower/IGrowerRepository';

interface UpdateGrowerData {
  name?: string;
  email?: string;
  phone?: string;
  bio?: string;
  profilePhoto?: string;
  siret?: string | null;
  approved?: boolean;
  approvedAt?: Date | null;
  commissionRate?: number;
  deliveryCommissionRate?: number | null;
  assignmentId?: string | null;
}

interface GrowerListResponse {
  data: IGrower[];
  total: number;
}

export const useUpdateGrower = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ growerId, updateData }: { growerId: string; updateData: UpdateGrowerData }): Promise<IGrower> => {
      const growerUpdateParams: IGrowerUpdateParams = {
        id: growerId,
        ...updateData,
        updatedAt: new Date(),
      } as IGrowerUpdateParams;
      return await backendFetchService.updateGrower(growerUpdateParams);
    },
    // Mutation optimiste
    onMutate: async ({ growerId, updateData }) => {
      // Annuler les requêtes en cours pour éviter les conflits
      await queryClient.cancelQueries({ queryKey: ['grower', growerId] });
      
      // Sauvegarder les données actuelles pour le rollback
      const previousGrower = queryClient.getQueryData(['grower', growerId]);
      
      // Mettre à jour optimistiquement les données
      queryClient.setQueryData(['grower', growerId], (old: IGrower | undefined) => {
        if (!old) return old;
        return {
          ...old,
          ...updateData,
          updatedAt: new Date(),
        };
      });
      
      return { previousGrower };
    },
    onError: (err, variables, context) => {
      // Rollback en cas d'erreur
      if (context?.previousGrower) {
        queryClient.setQueryData(['grower', variables.growerId], context.previousGrower);
      }
    },
    onSettled: (_, __, variables) => {
      // Rafraîchir les données après la mutation
      queryClient.invalidateQueries({ queryKey: ['grower', variables.growerId] });
      queryClient.invalidateQueries({ queryKey: ['growers'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'grower', variables.growerId, 'stats'] });
    },
  });
};

export const useApproveGrower = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (growerId: string): Promise<IGrower> => {
      const approvalParams: IGrowerUpdateParams = {
        id: growerId,
        approved: true,
        approvedAt: new Date(),
        updatedAt: new Date(),
      } as IGrowerUpdateParams;
      return await backendFetchService.updateGrower(approvalParams);
    },
    onMutate: async (growerId) => {
      await queryClient.cancelQueries({ queryKey: ['grower', growerId] });
      await queryClient.cancelQueries({ queryKey: ['growers'] });
      
      const previousGrower = queryClient.getQueryData(['grower', growerId]);
      const previousGrowers = queryClient.getQueryData(['growers']);
      
      // Mettre à jour optimistiquement le statut
      queryClient.setQueryData(['grower', growerId], (old: IGrower | undefined) => {
        if (!old) return old;
        return {
          ...old,
          status: 'approved',
          updatedAt: new Date(),
        };
      });
      
      // Mettre à jour la liste des producteurs
      queryClient.setQueryData(['growers'], (old: GrowerListResponse | undefined) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((grower: IGrower) => 
            grower.id === growerId 
              ? { ...grower, status: 'approved', updatedAt: new Date() }
              : grower
          ),
        };
      });
      
      return { previousGrower, previousGrowers };
    },
    onError: (err, growerId, context) => {
      if (context?.previousGrower) {
        queryClient.setQueryData(['grower', growerId], context.previousGrower);
      }
      if (context?.previousGrowers) {
        queryClient.setQueryData(['growers'], context.previousGrowers);
      }
    },
    onSettled: (_, __, growerId) => {
      queryClient.invalidateQueries({ queryKey: ['grower', growerId] });
      queryClient.invalidateQueries({ queryKey: ['growers'] });
    },
  });
};

export const useDeleteGrower = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (growerId: string): Promise<void> => {
      await backendFetchService.deleteGrower(growerId);
    },
    onMutate: async (growerId) => {
      await queryClient.cancelQueries({ queryKey: ['growers'] });
      
      const previousGrowers = queryClient.getQueryData(['growers']);
      
      // Supprimer optimistiquement le producteur de la liste
      queryClient.setQueryData(['growers'], (old: GrowerListResponse | undefined) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.filter((grower: IGrower) => grower.id !== growerId),
          total: old.total - 1,
        };
      });
      
      return { previousGrowers };
    },
    onError: (err, growerId, context) => {
      if (context?.previousGrowers) {
        queryClient.setQueryData(['growers'], context.previousGrowers);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['growers'] });
    },
  });
};

export const useCreateGrower = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (growerData: Omit<IGrower, 'id' | 'createdAt' | 'updatedAt'>): Promise<IGrower> => {
      return await backendFetchService.createGrower(growerData);
    },
    onSuccess: (newGrower) => {
      // Ajouter optimistiquement le nouveau producteur à la liste
      queryClient.setQueryData(['growers'], (old: GrowerListResponse | undefined) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: [newGrower, ...old.data],
          total: old.total + 1,
        };
      });
      
      // Invalider les requêtes pour s'assurer de la cohérence
      queryClient.invalidateQueries({ queryKey: ['growers'] });
    },
  });
};