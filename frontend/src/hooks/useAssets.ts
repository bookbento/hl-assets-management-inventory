// frontend/src/hooks/useAssets.ts
import { useQuery } from '@tanstack/react-query';
import { getAssets, AssetsQuery } from '@/lib/api';

export const useAssets = (query: AssetsQuery) => {
  return useQuery({
    queryKey: ['assets', query],
    queryFn: () => getAssets(query),
  });
};
