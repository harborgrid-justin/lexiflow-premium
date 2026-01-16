/**
 * Hook for managing local storage data
 * Provides access to browser localStorage items with reactive updates.
 */

import { useState } from 'react';

interface LocalStorageFile {
  name: string;
  size: string;
  modified: string;
}

export function useLocalStorageFiles() {
  const [files, setFiles] = useState<LocalStorageFile[]>([]);

  const loadFiles = () => {
    const items: LocalStorageFile[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key) || '';
        const size = (new Blob([value]).size / 1024).toFixed(2) + ' KB';
        items.push({ name: key, size, modified: 'Unknown' });
      }
    }
    setFiles(items);
  };

  const clearCache = () => {
    if (confirm('Are you sure you want to clear all local storage? This will reset your preferences.')) {
      localStorage.clear();
      setFiles([]);
    }
  };

  const deleteItem = (key: string) => {
    localStorage.removeItem(key);
    setFiles((prev) => prev.filter((f) => f.name !== key));
  };

  return { files, loadFiles, clearCache, deleteItem };
}
