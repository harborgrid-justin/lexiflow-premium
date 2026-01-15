/**
 * Local Storage View Component
 *
 * Displays and manages browser localStorage items.
 * Provides functionality to view, delete individual items, or clear all storage.
 */

import React, { useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/cn';
import { HardDrive, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { DataSourceSelector } from './DataSourceSelector';
import { useLocalStorageFiles } from './hooks';

/**
 * Component for viewing and managing localStorage - React 18 optimized with React.memo
 */
export const LocalStorageView = React.memo(function LocalStorageView() {
  const { theme } = useTheme();
  const { files, loadFiles, clearCache, deleteItem } = useLocalStorageFiles();

  // Effect for synchronization with localStorage (Principle #6)
  // Strict Mode ready: loadFiles is idempotent (Principle #7)
  useEffect(() => {
    loadFiles();
    // No cleanup needed - read-only operation
  }, [loadFiles]);

  return (
    <div className="space-y-6">
      <DataSourceSelector />

      <div className={cn("p-6 rounded-xl border shadow-sm", theme.surface.default, theme.border.default)}>
        <div className="flex justify-between items-center mb-6">
          <h3 className={cn("text-lg font-semibold flex items-center gap-2", theme.text.primary)}>
            <HardDrive className="h-5 w-5 text-gray-500" />
            Local File Storage
          </h3>
          <button
            onClick={clearCache}
            className={cn("px-4 py-2 text-sm font-medium rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors")}
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
                  <tr
                    key={`storage-file-${file.name}-${index}`}
                    className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className={cn("px-6 py-4 font-medium", theme.text.primary)}>
                      {file.name}
                    </td>
                    <td className={cn("px-6 py-4 font-mono text-xs", theme.text.secondary)}>
                      {file.size}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => deleteItem(file.name)}
                        className={cn("p-2 rounded-lg hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition-colors")}
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
});

LocalStorageView.displayName = 'LocalStorageView';
