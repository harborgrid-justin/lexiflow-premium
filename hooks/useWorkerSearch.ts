
import { useState, useEffect, useRef } from 'react';
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

  // Use a stable key for fields to prevent effect loops with inline arrays
  const fieldsKey = JSON.stringify(fields);

  // Dispatch Data Update (Only when items/config change)
  useEffect(() => {
      if (!workerRef.current) return;
      
      workerRef.current.postMessage({
          type: 'UPDATE',
          payload: {
              items,
              fields,
              idKey
          }
      });
      
      // If query is empty, reset display immediately
      if (!query) {
          setFilteredItems(items);
      } else {
          // If data updated while searching, re-trigger search
          const currentRequestId = ++requestIdRef.current;
          setIsSearching(true);
          workerRef.current.postMessage({
              type: 'SEARCH',
              payload: {
                  query,
                  requestId: currentRequestId
              }
          });
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, fieldsKey, idKey]); 

  // Dispatch Search Task (Only when query changes)
  useEffect(() => {
    if (!workerRef.current) return;

    if (!query) {
        setFilteredItems(items);
        return;
    }

    setIsSearching(true);
    const currentRequestId = ++requestIdRef.current;
    
    workerRef.current.postMessage({
        type: 'SEARCH',
        payload: {
            query,
            requestId: currentRequestId
        }
    });

  }, [query]); 

  return { filteredItems, isSearching };
};
