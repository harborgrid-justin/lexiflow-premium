import { cn } from '@/lib/cn';
import { useTheme } from "@/hooks/useTheme";
import { motion } from 'framer-motion';
import { Cloud, Database, HardDrive } from 'lucide-react';
import type { CloudProvider } from './types';

// interface ConnectionFormProps {
//   isAdding: boolean;
//   setIsAdding: (value: boolean) => void;
//   selectedProvider: string | null;
//   setSelectedProvider: (value: string | null) => void;
//   formData: ConnectionFormData;
//   setFormData: (value: ConnectionFormData) => void;
//   onSubmit: (e: React.FormEvent) => void;
//   isLoading: boolean;
// }
// }

const PROVIDERS: CloudProvider[] = [
  { id: 'snowflake', name: 'Snowflake', icon: Database, color: 'text-blue-500' },
  { id: 'postgres', name: 'PostgreSQL', icon: Database, color: 'text-indigo-500' },
  { id: 'mongo', name: 'MongoDB', icon: HardDrive, color: 'text-green-500' },
  { id: 's3', name: 'Amazon S3', icon: Cloud, color: 'text-orange-500' },
];

export function ConnectionForm({
  isAdding,
  setIsAdding,
  selectedProvider,
  setSelectedProvider,
  formData,
  setFormData,
  onSubmit,
  isLoading
}) {
  const { theme } = useTheme();

  if (!isAdding) return null;

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="overflow-hidden"
    >
      <div className={cn(
        "p-6 rounded-xl border border-blue-100 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-800 mb-6"
      )}>
        {!selectedProvider ? (
          <>
            <h4 className={cn("text-sm font-bold mb-4", theme.text.primary)}>Select Provider</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {PROVIDERS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProvider(p.id)}
                  className="group flex flex-col items-center justify-center p-6 rounded-xl border bg-white dark:bg-slate-800 hover:border-blue-500 hover:shadow-md transition-all gap-3"
                >
                  <div className={cn(
                    "p-3 rounded-full bg-gray-50 dark:bg-slate-700 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors"
                  )}>
                    <p.icon className={cn("h-6 w-6", p.color)} />
                  </div>
                  <span className={cn("text-sm font-medium", theme.text.primary)}>{p.name}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-2 mb-6">
              <button
                type="button"
                onClick={() => setSelectedProvider(null)}
                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
              >
                ← Providers
              </button>
              <span className="text-gray-400">/</span>
              <span className={cn("text-sm font-bold", theme.text.primary)}>
                Configure {PROVIDERS.find(p => p.id === selectedProvider)?.name}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                  Connection Name
                </label>
                <input
                  type="text"
                  required
                  className={cn(
                    "w-full px-4 py-2.5 rounded-lg border text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all",
                    theme.surface.default,
                    theme.border.default,
                    theme.text.primary
                  )}
                  value={formData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Production Warehouse"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                  Host / Endpoint
                </label>
                <input
                  type="text"
                  required
                  className={cn(
                    "w-full px-4 py-2.5 rounded-lg border text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all",
                    theme.surface.default,
                    theme.border.default,
                    theme.text.primary
                  )}
                  value={formData.host}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, host: e.target.value })}
                  placeholder="e.g. xy12345.us-east-1.snowflakecomputing.com"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => { setIsAdding(false); setSelectedProvider(null); }}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95"
              >
                {isLoading ? 'Connecting...' : 'Connect Source'}
              </button>
            </div>
          </form>
        )}
      </div>
    </motion.div>
  );
};
