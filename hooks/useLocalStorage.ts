/**
 * useLocalStorage Hook
 * Synced state with localStorage with type safety
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseLocalStorageOptions<T> {
  serializer?: (value: T) => string;
  deserializer?: (value: string) => T;
  syncAcrossTabs?: boolean;
}

/**
 * Hook for syncing state with localStorage
 *
 * @example
 * const [user, setUser] = useLocalStorage('user', null);
 * const [settings, setSettings] = useLocalStorage('settings', { theme: 'light' });
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions<T> = {}
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const {
    serializer = JSON.stringify,
    deserializer = JSON.parse,
    syncAcrossTabs = true,
  } = options;

  const initialValueRef = useRef(initialValue);

  // Get initial value from localStorage or use provided initial value
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValueRef.current;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? deserializer(item) : initialValueRef.current;
    } catch (error) {
      console.warn(`[useLocalStorage] Error reading key "${key}":`, error);
      return initialValueRef.current;
    }
  }, [key, deserializer]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Write value to localStorage
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;

        setStoredValue(valueToStore);

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, serializer(valueToStore));

          // Dispatch custom event for cross-tab sync
          window.dispatchEvent(
            new CustomEvent('local-storage-change', {
              detail: { key, value: valueToStore },
            })
          );
        }
      } catch (error) {
        console.warn(`[useLocalStorage] Error setting key "${key}":`, error);
      }
    },
    [key, serializer, storedValue]
  );

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValueRef.current);

      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);

        window.dispatchEvent(
          new CustomEvent('local-storage-change', {
            detail: { key, value: null },
          })
        );
      }
    } catch (error) {
      console.warn(`[useLocalStorage] Error removing key "${key}":`, error);
    }
  }, [key]);

  // Listen for changes to this key (from other tabs or same tab)
  useEffect(() => {
    if (!syncAcrossTabs) return;

    const handleStorageChange = (e: StorageEvent | CustomEvent) => {
      if ('key' in e) {
        // Native storage event (from other tabs)
        if (e.key === key && e.newValue !== null) {
          try {
            setStoredValue(deserializer(e.newValue));
          } catch (error) {
            console.warn(`[useLocalStorage] Error parsing storage event for key "${key}":`, error);
          }
        }
      } else if ('detail' in e) {
        // Custom event (from same tab)
        const detail = e.detail as { key: string; value: T };
        if (detail.key === key) {
          setStoredValue(detail.value ?? initialValueRef.current);
        }
      }
    };

    // Listen for both native storage events and custom events
    window.addEventListener('storage', handleStorageChange as EventListener);
    window.addEventListener('local-storage-change', handleStorageChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange as EventListener);
      window.removeEventListener('local-storage-change', handleStorageChange as EventListener);
    };
  }, [key, deserializer, syncAcrossTabs]);

  // Sync with localStorage on mount
  useEffect(() => {
    setStoredValue(readValue());
  }, [readValue]);

  return [storedValue, setValue, removeValue];
}

export default useLocalStorage;
