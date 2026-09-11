import { createContext, useContext } from 'react';
import type { Enquiry } from '../types/index';

interface AppContextType {
  enquiries: Enquiry[];
  addEnquiry: (enquiry: Enquiry) => void;
}

export const AppContext = createContext<AppContextType | null>(null);

export function useAppContext(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}
