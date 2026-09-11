import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { fetchFacilities } from '../services/api';
import type { Facility } from '../admin/types';

interface FacilitiesValue { facilities: Facility[]; refresh: () => Promise<void>; }
const FacilitiesContext = createContext<FacilitiesValue | null>(null);

export function FacilitiesProvider({ children }: { children: ReactNode }) {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const refresh = async () => setFacilities(await fetchFacilities() as Facility[]);
  useEffect(() => { refresh().catch(() => setFacilities([])); }, []);
  const value = useMemo(() => ({ facilities, refresh }), [facilities]);
  return <FacilitiesContext.Provider value={value}>{children}</FacilitiesContext.Provider>;
}
export function useFacilities(): FacilitiesValue {
  const value = useContext(FacilitiesContext);
  if (!value) throw new Error('useFacilities must be used within FacilitiesProvider');
  return value;
}
