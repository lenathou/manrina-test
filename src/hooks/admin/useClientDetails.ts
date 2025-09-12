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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'client', variables.clientId] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};