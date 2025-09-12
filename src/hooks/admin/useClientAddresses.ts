import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { backendFetchService } from '@/service/BackendFetchService';

interface Address {
  id: string;
  postalCode: string;
  address: string;
  city: string;
  country: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  type: string;
  customerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateAddressData {
  customerId: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  type: string;
}

interface UpdateAddressData {
  customerId: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  type: string;
}


export const useClientAddresses = (clientId: string) => {
  return useQuery({
    queryKey: ['admin', 'client', clientId, 'addresses'],
    queryFn: async (): Promise<Address[]> => {
      return await backendFetchService.getCustomerAddresses(clientId);
    },
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateClientAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ data }: { clientId: string; data: CreateAddressData }) => {
      return await backendFetchService.createCustomerAddress(data);
    },
    onSuccess: (_, { clientId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'client', clientId, 'addresses'] });
    },
  });
};

export const useUpdateClientAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      addressId, 
      data 
    }: { 
      clientId: string; 
      addressId: string; 
      data: UpdateAddressData 
    }) => {
      return await backendFetchService.updateCustomerAddress(addressId, data);
    },
    onSuccess: (_, { clientId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'client', clientId, 'addresses'] });
    },
  });
};

export const useDeleteClientAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ addressId }: { clientId: string; addressId: string }) => {
      return await backendFetchService.deleteCustomerAddress(addressId);
    },
    onSuccess: (_, { clientId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'client', clientId, 'addresses'] });
    },
  });
};