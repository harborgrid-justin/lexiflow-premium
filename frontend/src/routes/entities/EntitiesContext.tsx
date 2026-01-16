import React, { createContext, useContext, useState } from 'react';
import { LegalEntity } from '@/types';

interface EntitiesContextType {
  entities: LegalEntity[];
  setEntities: (entities: LegalEntity[]) => void;
  isLoading: boolean;
}

const EntitiesContext = createContext<EntitiesContextType | undefined>(undefined);

interface EntitiesProviderProps {
  children: React.ReactNode;
  initialEntities: LegalEntity[];
}

export function EntitiesProvider({ children, initialEntities }: EntitiesProviderProps) {
  const [entities, setEntities] = useState<LegalEntity[]>(initialEntities);
  const [isLoading] = useState(false);

  return (
    <EntitiesContext.Provider value={{ entities, setEntities, isLoading }}>
      {children}
    </EntitiesContext.Provider>
  );
}

export function useEntities() {
  const context = useContext(EntitiesContext);
  if (context === undefined) {
    throw new Error('useEntities must be used within an EntitiesProvider');
  }
  return context;
}
