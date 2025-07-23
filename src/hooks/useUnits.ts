import { useQuery } from '@tanstack/react-query';
import { backendFetchService } from '../service/BackendFetchService';
import { IUnit } from '../server/product/IProduct';

export function useUnits() {
  return useQuery({
    queryKey: ['units'],
    queryFn: () => backendFetchService.getAllUnits(),
    staleTime: 5 * 60 * 1000, // 5 minutes - les unités changent rarement
  });
}

export function useUnitById(unitId: string | null) {
  const { data: units = [] } = useUnits();
  return units.find((unit: IUnit) => unit.id === unitId) || null;
}