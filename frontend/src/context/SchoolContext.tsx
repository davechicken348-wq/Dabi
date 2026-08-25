import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { SCHOOLS, DEFAULT_SCHOOL_ID, getSchool, type School } from "../data/geo";

interface SchoolContextValue {
  school: School;
  schoolId: string;
  schools: School[];
  setSchoolId: (id: string) => void;
}

const SchoolContext = createContext<SchoolContextValue | null>(null);

const STORAGE_KEY = "dabi.schoolId";

export function SchoolProvider({ children }: { children: ReactNode }) {
  const [schoolId, setSchoolId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && SCHOOLS.some((s) => s.id === saved)) return saved;
    } catch {
      /* localStorage unavailable — fall back to default */
    }
    return DEFAULT_SCHOOL_ID;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, schoolId);
    } catch {
      /* ignore persistence errors */
    }
  }, [schoolId]);

  const value = useMemo<SchoolContextValue>(
    () => ({
      schoolId,
      school: getSchool(schoolId),
      schools: SCHOOLS,
      setSchoolId,
    }),
    [schoolId],
  );

  return <SchoolContext.Provider value={value}>{children}</SchoolContext.Provider>;
}

export function useSchool(): SchoolContextValue {
  const ctx = useContext(SchoolContext);
  if (!ctx) throw new Error("useSchool must be used within a SchoolProvider");
  return ctx;
}
