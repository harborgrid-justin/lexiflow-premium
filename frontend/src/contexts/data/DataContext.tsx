/**
 * @module contexts/data/DataContext
 * @description Data context for managing application data
 */

import { createContext, useContext } from 'react';
import type { DataSourceContextValue } from './DataSourceContext.types';

export const DataContext = createContext<DataSourceContextValue | null>(null);

export function useDataContext() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataContext must be used within DataProvider');
  }
  return context;
}
