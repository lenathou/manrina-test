import { useQuery } from '@tanstack/react-query';
import { backendFetchService } from '@/service/BackendFetchService';
import type { IGrower } from '@/server/grower/IGrower';

export function useGrowerById(growerId: string | undefined) {
  return useQuery<IGrower>({
    queryKey: ['grower', growerId],
    queryFn: async () => {
      if (!growerId) {
        throw new Error('Grower ID is required');
      }
      const grower = await backendFetchService.findGrowerById(growerId);
      if (!grower) {
        throw new Error(`Grower with ID ${growerId} not found`);
      }
      return grower;
    },
    enabled: !!growerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}