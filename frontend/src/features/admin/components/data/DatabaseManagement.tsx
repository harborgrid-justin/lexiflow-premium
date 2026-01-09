import { ConfirmDialog } from '@/components/ui/molecules/ConfirmDialog/ConfirmDialog';
import { useModalState } from '@/hooks/core';
import { useQuery } from '@/hooks/backend';
import { useTheme } from '@/contexts/theme/ThemeContext';
import { DataService } from '@/services/data/dataService';
import { QUERY_KEYS } from '@/services/data/queryKeys';
import { cn } from '@/utils/cn';
import { AlertTriangle, CheckCircle, Database, Info, Plus, RefreshCw, Trash2 } from 'lucide-react';
import React, { useState } from 'react';


export const DatabaseManagement: React.FC = () => {
  const { theme } = useTheme();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const incrementModal = useModalState();
  const resetModal = useModalState();

  // Note: getDbInfo, incrementVersion, resetDatabase methods need to be implemented in DatabaseManager
  const { data: dbInfo, refetch } = useQuery(QUERY_KEYS.DB.INFO, () => {
    // Uses DataService facade which routes to Backend implementation
    return DataService.admin.getDbInfo();
  });

  const handleIncrementVersion = async () => {
    setIsProcessing(true);
    try {
      await DataService.admin.incrementVersion();
      setMessage({ type: 'success', text: 'Database version incremented successfully.' });
      refetch();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to increment database version.' });
    } finally {
      setIsProcessing(false);
      incrementModal.close();
    }
  };

  const handleResetDatabase = async () => {
    setIsProcessing(true);
    try {
      await DataService.admin.resetDatabase();
      setMessage({ type: 'success', text: 'Database reset successfully.' });
      refetch();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to reset database.' });
    } finally {
      setIsProcessing(false);
      resetModal.close();
    }
  };

  const handleForceReload = () => {
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Alert Message */}
      {message && (
        <div className={cn(
          "p-4 rounded-lg border flex items-start gap-3",
          message.type === 'success' && "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300",
          message.type === 'error' && "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300",
          message.type === 'info' && "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300"
        )}>
          {message.type === 'success' && <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />}
          {message.type === 'error' && <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />}
          {message.type === 'info' && <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      {/* Database Info Card */}
      <div className={cn("p-6 rounded-xl border shadow-sm", theme.surface.default, theme.border.default)}>
        <div className="flex justify-between items-center mb-6">
          <h3 className={cn("text-lg font-semibold flex items-center gap-2", theme.text.primary)}>
            <Database className="h-5 w-5 text-blue-500" /> Database Information
          </h3>
          <button
            onClick={() => refetch()}
            disabled={isProcessing}
            className={cn("px-3 py-1.5 text-sm font-medium rounded-lg border flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50", theme.border.default, theme.text.primary)}
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>

        {dbInfo && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={cn("p-4 rounded-lg border", theme.border.default)}>
                <div className="text-xs text-gray-500 mb-1">Database Name</div>
                <div className={cn("font-bold", theme.text.primary)}>{dbInfo.name}</div>
              </div>
              <div className={cn("p-4 rounded-lg border", theme.border.default)}>
                <div className="text-xs text-gray-500 mb-1">Version</div>
                <div className={cn("font-bold text-blue-600 dark:text-blue-400")}>{dbInfo.version}</div>
              </div>
              <div className={cn("p-4 rounded-lg border", theme.border.default)}>
                <div className="text-xs text-gray-500 mb-1">Mode</div>
                <div className={cn("font-bold", theme.text.primary)}>{dbInfo.mode}</div>
              </div>
              <div className={cn("p-4 rounded-lg border", theme.border.default)}>
                <div className="text-xs text-gray-500 mb-1">Total Stores</div>
                <div className={cn("font-bold", theme.text.primary)}>{dbInfo.totalStores}</div>
              </div>
            </div>

            {/* Store Statistics */}
            <div>
              <h4 className={cn("text-sm font-semibold mb-3", theme.text.primary)}>Store Statistics</h4>
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className={cn("border-b sticky top-0", theme.border.default, theme.surface.default)}>
                    <tr>
                      <th className={cn("text-left p-2 font-semibold", theme.text.secondary)}>Store Name</th>
                      <th className={cn("text-right p-2 font-semibold", theme.text.secondary)}>Records</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dbInfo.stores.map((store) => (
                      <tr key={store.name} className={cn("border-b", theme.border.default)}>
                        <td className={cn("p-2", theme.text.primary)}>{store.name}</td>
                        <td className={cn("p-2 text-right font-mono", theme.text.primary)}>{store.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Database Actions */}
      <div className={cn("p-6 rounded-xl border shadow-sm", theme.surface.default, theme.border.default)}>
        <h3 className={cn("text-lg font-semibold mb-4", theme.text.primary)}>Database Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={incrementModal.open}
            disabled={isProcessing}
            className={cn("p-4 rounded-lg border text-left hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20 dark:hover:border-blue-700 transition-all disabled:opacity-50", theme.border.default)}
          >
            <Plus className="h-5 w-5 text-blue-500 mb-2" />
            <div className={cn("font-semibold mb-1", theme.text.primary)}>Increment Version</div>
            <div className="text-xs text-gray-500">Increase DB version to force schema upgrade</div>
          </button>

          <button
            onClick={handleForceReload}
            disabled={isProcessing}
            className={cn("p-4 rounded-lg border text-left hover:bg-green-50 hover:border-green-300 dark:hover:bg-green-900/20 dark:hover:border-green-700 transition-all disabled:opacity-50", theme.border.default)}
          >
            <RefreshCw className="h-5 w-5 text-green-500 mb-2" />
            <div className={cn("font-semibold mb-1", theme.text.primary)}>Force Reload</div>
            <div className="text-xs text-gray-500">Reload the application to apply changes</div>
          </button>

          <button
            onClick={resetModal.open}
            disabled={isProcessing}
            className={cn("p-4 rounded-lg border text-left hover:bg-red-50 hover:border-red-300 dark:hover:bg-red-900/20 dark:hover:border-red-700 transition-all disabled:opacity-50", theme.border.default)}
          >
            <Trash2 className="h-5 w-5 text-red-500 mb-2" />
            <div className={cn("font-semibold mb-1", theme.text.primary)}>Reset Database</div>
            <div className="text-xs text-gray-500">⚠️ Delete all data and reinitialize</div>
          </button>
        </div>
      </div>

      {/* Info Panel */}
      <div className={cn("p-6 rounded-xl border bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800", theme.text.primary)}>
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm space-y-2">
            <p className="font-semibold text-blue-900 dark:text-blue-300">Database Version Management</p>
            <ul className="list-disc list-inside text-blue-800 dark:text-blue-400 space-y-1">
              <li>Version mismatches occur when the browser has a different version than the code expects</li>
              <li>Incrementing version forces IndexedDB to run the upgrade handler</li>
              <li>The version number is saved in localStorage and persists across sessions</li>
              <li>Reset database to completely remove all data and start fresh</li>
            </ul>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={incrementModal.isOpen}
        onClose={incrementModal.close}
        onConfirm={handleIncrementVersion}
        title="Increment Database Version"
        message="Increment database version? This will force a schema upgrade on next reload."
        confirmText="Increment Version"
        variant="warning"
      />

      <ConfirmDialog
        isOpen={resetModal.isOpen}
        onClose={resetModal.close}
        onConfirm={handleResetDatabase}
        title="Reset Database"
        message="⚠️ WARNING: This will DELETE ALL DATA in IndexedDB! This action cannot be undone. Are you absolutely sure?"
        confirmText="Yes, Delete All Data"
        variant="danger"
      />
    </div>
  );
};
