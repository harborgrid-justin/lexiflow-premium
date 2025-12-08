
import { useState, useEffect, useRef, useTransition } from 'react';
import { SearchWorker } from '../services/searchWorker';

interface UseWorkerSearchProps<T> {
  items: T[];
  query: string;
  fields?: (keyof T)[];
  idKey?: keyof T;
}

export const useWorkerSearch = <T>({ items, query, fields, idKey = 'id' as keyof T }: UseWorkerSearchProps<T>) => {
  const [filteredItems, setFilteredItems] = useState<T[]>(items);
  const [isSearching, setIsSearching] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const requestIdRef = useRef(0);
  
  // Initialize Worker
  useEffect(() => {
    workerRef.current = SearchWorker.create();
    
    workerRef.current.onmessage = (e) => {
      const { results, requestId } = e.data;
      // Race Condition Protection: Only accept results matching the latest request ID
      if (requestId === requestIdRef.current) {
          setFilteredItems(results);
          setIsSearching(false);
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  // Dispatch Search Task
  useEffect(() => {
    if (!workerRef.current) return;

    if (!query) {
        setFilteredItems(items);
        return;
    }

    setIsSearching(true);
    const currentRequestId = ++requestIdRef.current;
    
    // Send data to worker (Structured Clone Algorithm handles the copy)
    workerRef.current.postMessage({
        items,
        query,
        fields,
        idKey,
        requestId: currentRequestId
    });

  }, [items, query, fields]); // Re-run when source data or query changes

  return { filteredItems, isSearching };
};
