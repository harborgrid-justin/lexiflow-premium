import { RefreshCw, AlertTriangle, X, Database, Cloud, Server, ShieldCheck, Trash2, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '@/features/theme';
import { cn } from '@/shared/lib/cn';
import type { DataConnection } from './types';

interface ConnectionCardProps {
  connection: DataConnection;
  onSync: (id: string) => void;
  onDelete: (id: string) => void;
  onTest: (connection: DataConnection) => void;
}

export function ConnectionCard({
  connection,
  onSync,
  onDelete,
  onTest
}) => {
  const { theme } = useTheme();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'syncing': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'degraded': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'error': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
      case 'disconnected': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Healthy';
      case 'syncing': return 'Syncing';
      case 'degraded': return 'Degraded';
      case 'error': return 'Error';
      case 'disconnected': return 'Not Connected';
      default: return status;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "relative p-5 rounded-xl border transition-all duration-300 group",
        theme.surface.default,
        theme.border.default,
        "hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700"
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-4">
          <div className={cn(
            "p-3 rounded-lg shadow-sm border transition-colors",
            connection.status === 'error'
              ? "bg-rose-50 border-rose-200"
              : "bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700"
          )}>
            {connection.type === 'Snowflake' ? <Database className="h-6 w-6 text-blue-600" /> :
              connection.type === 'S3' ? <Cloud className="h-6 w-6 text-orange-500" /> :
                <Server className="h-6 w-6 text-purple-600" />}
          </div>
          <div>
            <h4 className={cn("font-bold text-base", theme.text.primary)}>{connection.name}</h4>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              <span>{connection.type}</span>
              <span>•</span>
              <span>{connection.region}</span>
            </div>
          </div>
        </div>
        <div className={cn(
          "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5",
          getStatusColor(connection.status)
        )}>
          {connection.status === 'syncing' && <RefreshCw className="h-3 w-3 animate-spin" />}
          {connection.status === 'active' && <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />}
          {connection.status === 'degraded' && <AlertTriangle className="h-3 w-3" />}
          {connection.status === 'error' && <X className="h-3 w-3" />}
          {connection.status === 'disconnected' && <div className="h-1.5 w-1.5 rounded-full bg-gray-400" />}
          {getStatusLabel(connection.status)}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 py-3 border-t border-b border-dashed border-gray-200 dark:border-gray-700">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Latency</span>
          <div className={cn("font-mono text-sm font-medium flex items-center gap-1", theme.text.primary)}>
            <Activity className="h-3 w-3 text-emerald-500" />
            {connection.status === 'active' ? '45ms' : '-'}
          </div>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Last Sync</span>
          <div className={cn("text-xs font-medium", theme.text.primary)}>
            {connection.lastSync ? `${new Date(connection.lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ago` : 'Never'}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onSync(connection.id)}
          disabled={connection.status === 'syncing'}
          className={cn(
            "flex-1 py-2 text-xs font-semibold rounded-lg border transition-all flex items-center justify-center gap-2",
            connection.status === 'syncing'
              ? "bg-blue-50 text-blue-600 border-blue-200"
              : "hover:bg-gray-50 dark:hover:bg-slate-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"
          )}
        >
          <RefreshCw className={cn("h-3.5 w-3.5", connection.status === 'syncing' && "animate-spin")} />
          {connection.status === 'syncing' ? 'Syncing...' : 'Sync Now'}
        </button>

        <button
          onClick={() => onTest(connection)}
          className={cn("p-2 rounded-lg border hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-gray-500", theme.border.default)}
          title="Test Connection"
        >
          <ShieldCheck className="h-4 w-4" />
        </button>

        <button
          onClick={() => onDelete(connection.id)}
          className={cn("p-2 rounded-lg border hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors text-gray-400", theme.border.default)}
          title="Delete Connection"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
};
