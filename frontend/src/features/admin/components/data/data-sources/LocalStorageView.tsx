import React, { useState, useEffect } from 'react';
import { HardDrive, Trash2 } from 'lucide-react';
import { useTheme } from '@/contexts/theme/ThemeContext';
import { cn } from '@/shared/lib/cn';
import { DataSourceSelector } from './DataSourceSelector';
import type { LocalStorageItem } from './types';

export const LocalStorageView: React.FC = () => {
  const { theme } = useTheme();
  const [files, setFiles] = useState<LocalStorageItem[]>([]);

  useEffect(() => {
    const items = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key) || '';
        const size = (new Blob([value]).size / 1024).toFixed(2) + ' KB';
        items.push({ name: key, size: size, modified: 'Unknown' });
      }
    }
    setFiles(items);
  }, []);

  const clearCache = () => {
    if (confirm('Are you sure you want to clear all local storage? This will reset your preferences.')) {
      localStorage.clear();
      setFiles([]);
    }
  };

  const deleteItem = (key: string) => {
    localStorage.removeItem(key);
    setFiles(prev => prev.filter(f => f.name !== key));
  };

  return (
    <div className="space-y-6">
      <DataSourceSelector />
      
      <div className={cn("p-6 rounded-xl border shadow-sm", theme.surface.default, theme.border.default)}>
        <div className="flex justify-between items-center mb-6">
          <h3 className={cn("text-lg font-semibold flex items-center gap-2", theme.text.primary)}>
            <HardDrive className="h-5 w-5 text-gray-500" /> Local File Storage
          </h3>
          <button 
            onClick={clearCache}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
          >
            Clear Cache
          </button>
        </div>
        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="w-full text-sm text-left">
            <thead className={cn("text-xs uppercase bg-gray-50 dark:bg-slate-800/50", theme.text.secondary)}>
              <tr>
                <th className="px-6 py-3 font-semibold">Key Name</th>
                <th className="px-6 py-3 font-semibold">Size</th>
                <th className="px-6 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {files.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                    No local storage items found.
                  </td>
                </tr>
              ) : (
                files.map((file, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className={cn("px-6 py-4 font-medium", theme.text.primary)}>{file.name}</td>
                    <td className={cn("px-6 py-4 font-mono text-xs", theme.text.secondary)}>{file.size}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        type="button"
                        onClick={() => deleteItem(file.name)}
                        className="p-2 rounded-lg hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition-colors"
                        aria-label={`Delete ${file.name}`}
                        title={`Delete ${file.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
