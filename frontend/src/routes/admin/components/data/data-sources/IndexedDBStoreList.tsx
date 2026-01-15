import { cn } from '@/lib/cn';
import { useTheme } from "@/hooks/useTheme";
import { Database } from 'lucide-react';
import type { StoreInfo } from './types';

interface IndexedDBStoreListProps {
  stores: StoreInfo[];
  isLoading: boolean;
  onStoreClick: (storeName: string) => void;
}

export function IndexedDBStoreList({
  stores,
  isLoading,
  onStoreClick
}: IndexedDBStoreListProps) {
  const { theme } = useTheme();

  if (isLoading) {
    return <div className="p-12 text-center text-gray-500">Loading store statistics...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {stores.map((store) => (
        <button
          key={store.name}
          onClick={() => onStoreClick(store.name)}
          className={cn(
            "p-5 rounded-xl border hover:shadow-md transition-all duration-200 group text-left",
            theme.border.default,
            "hover:border-blue-300 dark:hover:border-blue-700"
          )}
        >
          <div className="flex justify-between items-start mb-3">
            <h4 className={cn("font-bold text-sm", theme.text.primary)}>{store.name}</h4>
            <div className="p-1.5 rounded-md bg-gray-50 dark:bg-slate-800 text-gray-400 group-hover:text-blue-500 transition-colors">
              <Database className="h-4 w-4" />
            </div>
          </div>
          <div className="flex justify-between items-end mt-4">
            <div>
              <span className="text-xs text-gray-500 block mb-0.5">Records</span>
              <span className={cn("text-lg font-bold", theme.text.primary)}>
                {store.records.toLocaleString()}
              </span>
            </div>
            <span className={cn(
              "font-mono text-xs px-2 py-1 rounded bg-gray-100 dark:bg-slate-800",
              theme.text.secondary
            )}>
              {store.size}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
};
