import React, { useState } from 'react';
import { Database, RefreshCw } from 'lucide-react';
import { useTheme } from '@/providers/ThemeContext';
import { cn } from '@/utils/cn';
import { useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/dataService';
import { DataSourceSelector } from './DataSourceSelector';
import { SystemHealthDisplay } from './SystemHealthDisplay';
import { IndexedDBStoreList } from './IndexedDBStoreList';
import { IndexedDBDataTable } from './IndexedDBDataTable';
import type { StoreInfo, StoreRecord } from './types';
import { db } from '@/services/data/db';

export const IndexedDBView: React.FC = () => {
  const { theme } = useTheme();
  const { data: stores = [], isLoading, refetch } = useQuery<StoreInfo[]>(
    ['admin', 'registry'],
    DataService.catalog.getRegistryInfo
  );
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [storeData, setStoreData] = useState<StoreRecord[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<StoreRecord | null>(null);

  const loadStoreData = async (storeName: string) => {
    setIsLoadingData(true);
    try {
      const data = await db.getAll(storeName);
      setStoreData((data as StoreRecord[]) || []);
    } catch (error) {
      console.error('Error loading store data:', error);
      setStoreData([]);
    }
    setIsLoadingData(false);
  };

  const handleStoreClick = (storeName: string) => {
    setSelectedStore(storeName);
    loadStoreData(storeName);
  };

  const handleBackToStores = () => {
    setSelectedStore(null);
    setStoreData([]);
    setSearchTerm('');
  };

  const handleEdit = (item: StoreRecord) => {
    setEditingId(item.id);
    setEditingData({ ...item });
  };

  const handleSave = async () => {
    if (!selectedStore || !editingData) return;
    try {
      await db.put(selectedStore, editingData);
      await loadStoreData(selectedStore);
      setEditingId(null);
      setEditingData(null);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!selectedStore || !confirm('Are you sure you want to delete this record?')) return;
    try {
      await db.delete(selectedStore, id);
      await loadStoreData(selectedStore);
    } catch (error) {
      console.error('Error deleting data:', error);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingData(null);
  };

  const filteredData = storeData.filter(item => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return Object.values(item).some(value =>
      String(value).toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <DataSourceSelector />
      <SystemHealthDisplay />

      <div className={cn("p-6 rounded-xl border shadow-sm", theme.surface.default, theme.border.default)}>
        <div className="flex justify-between items-center mb-6">
          <h3 className={cn("text-lg font-semibold flex items-center gap-2", theme.text.primary)}>
            <Database className="h-5 w-5 text-blue-500" />
            {selectedStore ? `${selectedStore} Data` : 'IndexedDB Stores'}
          </h3>
          <div className="flex items-center gap-2">
            {selectedStore && (
              <button
                onClick={handleBackToStores}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg border flex items-center gap-2",
                  "hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors",
                  theme.border.default,
                  theme.text.primary
                )}
              >
                Back to Stores
              </button>
            )}
            <button
              onClick={() => refetch()}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg border flex items-center gap-2",
                "hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors",
                theme.border.default,
                theme.text.primary
              )}
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
              Refresh
            </button>
          </div>
        </div>

        {selectedStore ? (
          <IndexedDBDataTable
            data={filteredData}
            isLoading={isLoadingData}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            editingId={editingId}
            editingData={editingData}
            setEditingData={setEditingData}
            onEdit={handleEdit}
            onSave={handleSave}
            onDelete={handleDelete}
            onCancel={handleCancel}
          />
        ) : (
          <IndexedDBStoreList
            stores={stores}
            isLoading={isLoading}
            onStoreClick={handleStoreClick}
          />
        )}
      </div>
    </div>
  );
};
