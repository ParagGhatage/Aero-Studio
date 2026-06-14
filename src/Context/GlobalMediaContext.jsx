import { createContext, useContext } from 'react';

// Create the context
export const GlobalMediaContext = createContext();

// Custom hook to consume the context
export function useGlobalMedia() {
  const context = useContext(GlobalMediaContext);
  if (!context) {
    throw new Error('useGlobalMedia must be used within a GlobalMediaProvider');
  }
  return context;
}