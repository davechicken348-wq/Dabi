import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  fetchFacilities,
  createFacility as apiCreate,
  updateFacility as apiUpdate,
  deleteFacility as apiDelete,
  type FacilityInput,
} from "../services/api";
import type { Facility } from "../admin/types";
import { DEFAULT_FACILITIES } from "../pages/FindHostel/options";

interface FacilitiesContextValue {
  facilities: Facility[];
  byKey: Map<string, Facility>;
  /** Human label for a facility key, with a sensible fallback. */
  label: (key?: string | null) => string;
  /** Look up a full facility by its key. */
  get: (key: string) => Facility | undefined;
  /** Reload the catalog from the API. */
  refresh: () => Promise<void>;
  create: (input: FacilityInput) => Promise<Facility>;
  update: (id: string, patch: Partial<FacilityInput>) => Promise<Facility>;
  remove: (id: string) => Promise<void>;
}

const FacilitiesContext = createContext<FacilitiesContextValue | null>(null);

export function FacilitiesProvider({ children }: { children: ReactNode }) {
  const [facilities, setFacilities] = useState<Facility[]>(DEFAULT_FACILITIES);

  const refresh = useMemo(
    () =>
      async () => {
        try {
          const list = await fetchFacilities();
          if (list.length) setFacilities(list);
        } catch {
          /* Keep the fallback catalog if the API is unavailable. */
        }
      },
    [],
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const byKey = useMemo(() => {
    const m = new Map<string, Facility>();
    for (const f of facilities) m.set(f.key, f);
    return m;
  }, [facilities]);

  const value: FacilitiesContextValue = {
    facilities,
    byKey,
    label: (key) =>
      key
        ? (byKey.get(key)?.label ??
          key.charAt(0).toUpperCase() + key.slice(1))
        : "",
    get: (key) => byKey.get(key),
    refresh,
    create: async (input) => {
      const f = await apiCreate(input);
      await refresh();
      return f;
    },
    update: async (id, patch) => {
      const f = await apiUpdate(id, patch);
      await refresh();
      return f;
    },
    remove: async (id) => {
      await apiDelete(id);
      await refresh();
    },
  };

  return (
    <FacilitiesContext.Provider value={value}>
      {children}
    </FacilitiesContext.Provider>
  );
}

export function useFacilities(): FacilitiesContextValue {
  const ctx = useContext(FacilitiesContext);
  if (!ctx) {
    throw new Error("useFacilities must be used within a FacilitiesProvider");
  }
  return ctx;
}
