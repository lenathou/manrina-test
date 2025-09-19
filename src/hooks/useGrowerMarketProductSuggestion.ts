import { useMutation } from '@tanstack/react-query';
import { backendFetchService } from '@/service/BackendFetchService';
import { IMarketProductSuggestionCreateParams } from '@/server/grower/IGrowerRepository';
import { IMarketProductSuggestion } from '@/server/grower/IGrower';

export const useCreateMarketProductSuggestion = () => {
  return useMutation<IMarketProductSuggestion, Error, IMarketProductSuggestionCreateParams>({
    mutationFn: async (params) => {
      return await backendFetchService.createMarketProductSuggestion(params);
    },
  });
};

