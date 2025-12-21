/**
 * @module hooks/useSessionStorage
 * @category Hooks - Storage
 * @description Session storage hook with useState-like API, automatic serialization/deserialization,
 * and cross-tab synchronization via storage events. Provides persistent state that survives page
 * refreshes but not browser restarts.
 * 
 * NO THEME USAGE: Utility hook for session storage persistence
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useState, useEffect } from 'react';

// ============================================================================
// HOOK
// ============================================================================
export function useSessionStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      // Get from local storage by key
      const item = window.sessionStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.warn(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to sessionStorage.
  const setValue = React.useCallback((value: T | ((val: T) => T)) => {
    try {
      // Use functional update to avoid depending on storedValue
      setStoredValue((prev) => {
        const valueToStore = value instanceof Function ? value(prev) : value;
        
        // Save to session storage
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
        }
        
        return valueToStore;
      });
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.warn(`Error saving sessionStorage key "${key}":`, error);
    }
  }, [key]);

  useEffect(() => {
    // Sync state if storage changes in another tab (optional for session, but good practice)
    const handleStorageChange = (e: StorageEvent) => {
        if (e.key === key && e.storageArea === window.sessionStorage) {
            try {
                setStoredValue(e.newValue ? JSON.parse(e.newValue) : initialValue);
            } catch (error) {
                console.warn(`Error parsing storage change for key "${key}"`, error);
            }
        }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue]);

  return [storedValue, setValue];
}