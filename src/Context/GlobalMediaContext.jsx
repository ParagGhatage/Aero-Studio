import { createContext, useContext } from 'react';

export const GlobalMediaContext = createContext();

export function useGlobalMedia() {
  const context = useContext(GlobalMediaContext);
  if (!context) {
    throw new Error('useGlobalMedia must be used within a GlobalMediaProvider');
  }
  return context;
}