/**
 * StateProvider - Global state management
 */

import { createContext, useContext, type ReactNode } from 'react';
import { store } from './store';

interface StateContextValue {
  store: typeof store;
}

const StateContext = createContext<StateContextValue | null>(null);

export function useState() {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error('useState must be used within StateProvider');
  }
  return context;
}

interface StateProviderProps {
  children: ReactNode;
}

export function StateProvider({ children }: StateProviderProps) {
  const value: StateContextValue = {
    store,
  };

  return (
    <StateContext.Provider value={value}>
      {children}
    </StateContext.Provider>
  );
}
