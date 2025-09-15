import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { backendFetchService } from '@/service/BackendFetchService';

// Type pour les données Customer retournées par le backend
interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  passwordResetToken?: string | null;
  passwordResetExpires?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ClientWithDetails {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
  totalOrders?: number;
  totalSpent?: string;
  registrationDate?: string;
  lastOrderDate?: string | null;
}

interface UpdateClientData {
  name: string;
  email: string;
  phone?: string;
}


export const useClientDetails = (clientId: string) => {
  return useQuery({
    queryKey: ['admin', 'client', clientId],
    queryFn: async (): Promise<Customer> => {
      const customer = await backendFetchService.getCustomer(clientId);
      if (!customer) {
        throw new Error('Customer not found');
      }
      return customer;
    },
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clientId, updateData }: { clientId: string; updateData: UpdateClientData }): Promise<ClientWithDetails> => {
      return await backendFetchService.updateCustomer({ id: clientId, ...updateData });
    },
    // Mutation optimiste
    onMutate: async ({ clientId, updateData }) => {
      // Annuler les requêtes en cours pour éviter les conflits
      await queryClient.cancelQueries({ queryKey: ['admin', 'client', clientId] });
      
      // Sauvegarder les données actuelles pour le rollback
      const previousClient = queryClient.getQueryData(['admin', 'client', clientId]);
      
      // Mettre à jour optimistiquement les données
      queryClient.setQueryData(['admin', 'client', clientId], (old: Customer | undefined) => {
        if (!old) return old;
        return {
          ...old,
          ...updateData,
          updatedAt: new Date(),
        };
      });
      
      return { previousClient };
    },
    onError: (err, variables, context) => {
      // Rollback en cas d'erreur
      if (context?.previousClient) {
        queryClient.setQueryData(['admin', 'client', variables.clientId], context.previousClient);
      }
    },
    onSettled: (_, __, variables) => {
      // Rafraîchir les données après la mutation
      queryClient.invalidateQueries({ queryKey: ['admin', 'client', variables.clientId] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};

// Hook pour supprimer un client avec mutation optimiste
export const useDeleteClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clientId: string): Promise<void> => {
      await backendFetchService.deleteCustomer(clientId);
    },
    onMutate: async (clientId) => {
      await queryClient.cancelQueries({ queryKey: ['clients'] });
      
      const previousClients = queryClient.getQueryData(['clients']);
      
      // Supprimer optimistiquement le client de la liste
      queryClient.setQueryData(['clients'], (old: { data: ClientWithDetails[]; total: number } | undefined) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.filter((client: ClientWithDetails) => client.id !== clientId),
          total: old.total - 1,
        };
      });
      
      return { previousClients };
    },
    onError: (err, clientId, context) => {
      if (context?.previousClients) {
        queryClient.setQueryData(['clients'], context.previousClients);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};