import { useQuery } from '@tanstack/react-query';
import { backendFetchService } from '@/service/BackendFetchService';
import type { IGrower } from '@/server/grower/IGrower';
import { useMemo } from 'react';

interface UseGrowersParams {
  page: number;
  limit: number;
  search?: string;
}

interface UseGrowersReturn {
  growers: IGrower[];
  totalPages: number;
  isLoading: boolean;
  error: string | null;
}

export const useAllGrowers = () => {
  return useQuery<IGrower[]>({
    queryKey: ['growers', 'all'],
    queryFn: () => backendFetchService.listGrowers(),
  });
};

export function useGrowers({ page, limit, search }: UseGrowersParams): UseGrowersReturn {
  const {
    data: allGrowers = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['growers'],
    queryFn: () => backendFetchService.listGrowers(),
  });

  const { growers, totalPages } = useMemo(() => {
    let filteredGrowers = allGrowers;

    // Appliquer le filtre de recherche
    if (search && search.trim()) {
      const searchTerm = search.toLowerCase().trim();
      filteredGrowers = allGrowers.filter((grower: IGrower) =>
        grower.name.toLowerCase().includes(searchTerm) ||
        grower.email.toLowerCase().includes(searchTerm)
      );
    }

    // Calculer la pagination
    const totalPages = Math.ceil(filteredGrowers.length / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedGrowers = filteredGrowers.slice(startIndex, endIndex);

    return {
      growers: paginatedGrowers,
      totalPages: Math.max(1, totalPages)
    };
  }, [allGrowers, page, limit, search]);

  return {
    growers,
    totalPages,
    isLoading,
    error: error ? String(error) : null,
  };
}