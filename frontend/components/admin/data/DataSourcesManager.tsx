import React, { useState } from 'react';
import { HardDrive, Database, Cloud } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import { LocalStorageView } from './data-sources/LocalStorageView';
import { IndexedDBView } from './data-sources/IndexedDBView';
import { CloudDatabaseContent } from './data-sources/CloudDatabaseContent';

interface DataSourcesManagerProps {
  initialTab?: string;
}

const TABS = [
  { id: 'cloud', label: 'Cloud Infrastructure', icon: Cloud },
  { id: 'local', label: 'Local Storage', icon: HardDrive },
  { id: 'indexeddb', label: 'IndexedDB Registry', icon: Database },
];

export const DataSourcesManager: React.FC<DataSourcesManagerProps> = ({ initialTab }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState(initialTab || 'cloud');

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto bg-gray-50/50 dark:bg-slate-900/50">
      <div className="mb-8">
        <h2 className={cn("text-3xl font-bold tracking-tight", theme.text.primary)}>
          Data Sources
        </h2>
        <p className={cn("text-base mt-2 max-w-2xl", theme.text.secondary)}>
          Manage your enterprise data landscape. Connect to cloud warehouses, monitor local storage, 
          and synchronize replication streams in real-time.
        </p>
      </div>

      <div className="flex gap-2 mb-8 border-b border-gray-200 dark:border-gray-800">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-all",
              activeTab === tab.id 
                ? "border-blue-600 text-blue-600 dark:text-blue-400" 
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'local' && <LocalStorageView />}
          {activeTab === 'indexeddb' && <IndexedDBView />}
          {activeTab === 'cloud' && <CloudDatabaseContent />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default DataSourcesManager;
