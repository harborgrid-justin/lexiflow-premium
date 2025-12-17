import React, { useState } from 'react';
import { 
  HardDrive, Database, Cloud, Plus, RefreshCw, Trash2, Settings, 
  Activity, CheckCircle, AlertTriangle, X, Play, Server, ShieldCheck, Power 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import { useQuery, useMutation, queryClient } from '../../../services/queryClient';
import { DataService } from '../../../services/dataService';
import { db } from '../../../db';
import { useDataSource } from '../../../context/DataSourceContext';

interface DataSourcesManagerProps {
  initialTab?: string;
}

export const DataSourcesManager: React.FC<DataSourcesManagerProps> = ({ initialTab }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState(initialTab || 'cloud');

  const tabs = [
    { id: 'cloud', label: 'Cloud Infrastructure', icon: Cloud },
    { id: 'local', label: 'Local Storage', icon: HardDrive },
    { id: 'indexeddb', label: 'IndexedDB Registry', icon: Database },
  ];

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto bg-gray-50/50 dark:bg-slate-900/50">
      <div className="mb-8">
        <h2 className={cn("text-3xl font-bold tracking-tight", theme.text.primary)}>Data Sources</h2>
        <p className={cn("text-base mt-2 max-w-2xl", theme.text.secondary)}>
          Manage your enterprise data landscape. Connect to cloud warehouses, monitor local storage, and synchronize replication streams in real-time.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-gray-200 dark:border-gray-800">
        {tabs.map(tab => (
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
          {activeTab === 'cloud' && <CloudDatabaseView />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const ConnectionCard = ({ connection, onSync, onDelete, onTest }: any) => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'syncing': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'error': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
            connection.status === 'error' ? "bg-rose-50 border-rose-200" : "bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700"
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
        <div className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5", getStatusColor(connection.status))}>
          {connection.status === 'syncing' && <RefreshCw className="h-3 w-3 animate-spin" />}
          {connection.status === 'active' && <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />}
          {connection.status}
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
          <div className={cn("font-mono text-sm font-medium", theme.text.primary)}>
            {connection.lastSync}
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

const CloudDatabaseView = () => {
  const { theme } = useTheme();
  const [isAdding, setIsAdding] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', host: '', region: 'us-east-1' });
  
  return (
    <div className="space-y-6">
      {/* Active Data Source Indicator */}
      <DataSourceSelector />
      
      {/* Backend API Service Coverage */}
      <ServiceCoverageIndicator />
      
      <CloudDatabaseContent 
        theme={theme}
        isAdding={isAdding}
        setIsAdding={setIsAdding}
        selectedProvider={selectedProvider}
        setSelectedProvider={setSelectedProvider}
        formData={formData}
        setFormData={setFormData}
      />
    </div>
  );
};

const CloudDatabaseContent = ({ theme, isAdding, setIsAdding, selectedProvider, setSelectedProvider, formData, setFormData }: any) => {
  
  const { data: connections = [], isLoading } = useQuery<any[]>(
    ['admin', 'sources', 'connections'],
    DataService.sources.getConnections
  );

  const addConnectionMutation = useMutation(
    DataService.sources.addConnection,
    {
      onSuccess: (newConnection) => {
        queryClient.setQueryData(['admin', 'sources', 'connections'], (old: any[] | undefined) => [...(old || []), newConnection]);
        setIsAdding(false);
        setSelectedProvider(null);
        setFormData({ name: '', host: '', region: 'us-east-1' });
      }
    }
  );

  const syncMutation = useMutation(DataService.sources.syncConnection, {
    onMutate: async (id) => {
      const previous = queryClient.getQueryState(['admin', 'sources', 'connections'])?.data;
      queryClient.setQueryData(['admin', 'sources', 'connections'], (old: any[] | undefined) => 
        old?.map(c => c.id === id ? { ...c, status: 'syncing' } : c)
      );
      return { previous };
    },
    onSuccess: (data, id) => {
      setTimeout(() => { // Simulate sync time completion for UX
        queryClient.setQueryData(['admin', 'sources', 'connections'], (old: any[] | undefined) => 
          old?.map(c => c.id === id ? { ...c, status: 'active', lastSync: 'Just now' } : c)
        );
      }, 2000);
    }
  });

  const deleteMutation = useMutation(DataService.sources.deleteConnection, {
    onSuccess: (_, id) => {
      queryClient.setQueryData(['admin', 'sources', 'connections'], (old: any[] | undefined) => 
        old?.filter(c => c.id !== id)
      );
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProvider) return;
    addConnectionMutation.mutate({
      ...formData,
      type: providers.find(p => p.id === selectedProvider)?.name,
      providerId: selectedProvider
    });
  };

  const providers = [
    { id: 'snowflake', name: 'Snowflake', icon: Database, color: 'text-blue-500' },
    { id: 'postgres', name: 'PostgreSQL', icon: Database, color: 'text-indigo-500' },
    { id: 'mongo', name: 'MongoDB', icon: HardDrive, color: 'text-green-500' },
    { id: 's3', name: 'Amazon S3', icon: Cloud, color: 'text-orange-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className={cn("text-sm font-medium", theme.text.secondary)}>
            {connections.length} Active Connections
          </span>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 shadow-sm",
            isAdding 
              ? "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-300"
              : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-500/25"
          )}
        >
          {isAdding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {isAdding ? 'Cancel' : 'New Connection'}
        </button>
      </div>

      {/* Add Connection Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className={cn("p-6 rounded-xl border border-blue-100 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-800 mb-6")}>
              {!selectedProvider ? (
                <>
                  <h4 className={cn("text-sm font-bold mb-4", theme.text.primary)}>Select Provider</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {providers.map(p => (
                      <button 
                        key={p.id} 
                        onClick={() => setSelectedProvider(p.id)}
                        className="group flex flex-col items-center justify-center p-6 rounded-xl border bg-white dark:bg-slate-800 hover:border-blue-500 hover:shadow-md transition-all gap-3"
                      >
                        <div className={cn("p-3 rounded-full bg-gray-50 dark:bg-slate-700 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors")}>
                          <p.icon className={cn("h-6 w-6", p.color)} />
                        </div>
                        <span className={cn("text-sm font-medium", theme.text.primary)}>{p.name}</span>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
                  <div className="flex items-center gap-2 mb-6">
                    <button 
                      type="button" 
                      onClick={() => setSelectedProvider(null)} 
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                      Providers
                    </button>
                    <span className="text-gray-400">/</span>
                    <span className={cn("text-sm font-bold", theme.text.primary)}>Configure {providers.find(p => p.id === selectedProvider)?.name}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Connection Name</label>
                      <input 
                        type="text" 
                        required
                        className={cn("w-full px-4 py-2.5 rounded-lg border text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all", theme.surface.default, theme.border.default, theme.text.primary)}
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        placeholder="e.g. Production Warehouse"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Host / Endpoint</label>
                      <input 
                        type="text" 
                        required
                        className={cn("w-full px-4 py-2.5 rounded-lg border text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all", theme.surface.default, theme.border.default, theme.text.primary)}
                        value={formData.host}
                        onChange={e => setFormData({...formData, host: e.target.value})}
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
                      disabled={addConnectionMutation.isLoading}
                      className="px-6 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95"
                    >
                      {addConnectionMutation.isLoading ? 'Connecting...' : 'Connect Source'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Connections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {connections.map((conn) => (
            <ConnectionCard 
              key={conn.id} 
              connection={conn} 
              onSync={(id: string) => syncMutation.mutate(id)}
              onDelete={(id: string) => deleteMutation.mutate(id)}
              onTest={(conn: any) => testMutation.mutate(conn.id)}
            />
          ))}
        </AnimatePresence>
        
        {/* Empty State */}
        {connections.length === 0 && !isLoading && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-200 rounded-xl">
            <div className="p-4 rounded-full bg-gray-50 mb-4">
              <Database className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className={cn("text-lg font-medium", theme.text.primary)}>No connections yet</h3>
            <p className={cn("text-sm text-gray-500 mt-1 max-w-sm")}>
              Connect your first data source to start syncing data across your enterprise.
            </p>
            <button 
              onClick={() => setIsAdding(true)}
              className="mt-4 text-blue-600 font-medium text-sm hover:underline"
            >
              Add your first connection
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const LocalStorageView = () => {
  const { theme } = useTheme();
  const [files, setFiles] = React.useState<any[]>([]);

  React.useEffect(() => {
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
      {/* Active Data Source Indicator */}
      <DataSourceSelector />
      
      <div className={cn("p-6 rounded-xl border shadow-sm", theme.surface.default, theme.border.default)}>
        <div className="flex justify-between items-center mb-6">
          <h3 className={cn("text-lg font-semibold flex items-center gap-2", theme.text.primary)}>
            <HardDrive className="h-5 w-5 text-gray-500" /> Local File Storage
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
                  <td colSpan={3} className="px-6 py-12 text-center text-gray-500">No local storage items found.</td>
                </tr>
              ) : (
                files.map((file, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className={cn("px-6 py-4 font-medium", theme.text.primary)}>{file.name}</td>
                    <td className={cn("px-6 py-4 font-mono text-xs", theme.text.secondary)}>{file.size}</td>
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
};

const ServiceCoverageIndicator = () => {
  const { theme } = useTheme();
  const { currentSource } = useDataSource();
  const [showDetails, setShowDetails] = useState(false);

  // Services that have backend API integration when PostgreSQL is active
  const backendEnabledServices = [
    'cases', 'docket', 'documents', 'evidence', 'billing', 'users',
    'pleadings', 'trustAccounts', 'billingAnalytics', 'reports', 
    'processingJobs', 'casePhases', 'caseTeams', 'motions', 'parties',
    'clauses', 'legalHolds', 'depositions', 'discoveryRequests', 
    'esiSources', 'privilegeLog', 'productions', 'custodianInterviews',
    'conflictChecks', 'ethicalWalls', 'auditLogs', 'permissions',
    'rlsPolicies', 'complianceReports', 'rateTables', 'feeAgreements',
    'custodians', 'examinations'
  ];

  const totalServices = 35; // Total number of services in DataService
  const backendServices = backendEnabledServices.length;
  const indexedDbOnlyServices = totalServices - backendServices;
  const coverage = currentSource === 'postgresql' ? backendServices : 0;

  return (
    <div className={cn("p-5 rounded-xl border shadow-sm", theme.surface.default, theme.border.default)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={cn("text-base font-semibold flex items-center gap-2", theme.text.primary)}>
          <Activity className="h-5 w-5 text-blue-500" /> Backend API Coverage
        </h3>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className={cn("text-xs font-medium px-3 py-1.5 rounded-lg border hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors", theme.border.default, theme.text.primary)}
        >
          {showDetails ? 'Hide' : 'Show'} Details
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className={cn("p-4 rounded-lg", currentSource === 'postgresql' ? "bg-blue-50 dark:bg-blue-900/20" : "bg-gray-50 dark:bg-slate-800")}>
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Backend API</div>
          <div className={cn("text-2xl font-bold", currentSource === 'postgresql' ? "text-blue-600 dark:text-blue-400" : theme.text.primary)}>
            {coverage}
          </div>
        </div>
        <div className="p-4 rounded-lg bg-gray-50 dark:bg-slate-800">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">IndexedDB Only</div>
          <div className={cn("text-2xl font-bold", theme.text.primary)}>
            {currentSource === 'postgresql' ? indexedDbOnlyServices : totalServices}
          </div>
        </div>
        <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Coverage</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {currentSource === 'postgresql' ? Math.round((coverage / totalServices) * 100) : 0}%
          </div>
        </div>
      </div>

      {currentSource !== 'postgresql' && (
        <div className={cn("p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-xs flex items-start gap-2", theme.text.primary)}>
          <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <span>Switch to PostgreSQL data source to enable backend API services.</span>
        </div>
      )}

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
          >
            <h4 className={cn("text-sm font-semibold mb-3", theme.text.primary)}>
              Backend-Enabled Services ({backendServices}):
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {backendEnabledServices.map((service) => (
                <div
                  key={service}
                  className={cn(
                    "px-3 py-2 rounded-lg text-xs font-mono flex items-center gap-2",
                    currentSource === 'postgresql' 
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300" 
                      : "bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-400"
                  )}
                >
                  {currentSource === 'postgresql' ? (
                    <CheckCircle className="h-3 w-3 text-blue-600" />
                  ) : (
                    <X className="h-3 w-3 text-gray-400" />
                  )}
                  {service}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DataSourceSelector = () => {
  const { theme } = useTheme();
  const { currentSource, switchDataSource } = useDataSource();
  const [isSwitching, setIsSwitching] = useState(false);

  const sources = [
    { id: 'indexeddb' as const, name: 'IndexedDB', desc: 'Client-side offline storage', icon: Database, color: 'blue' },
    { id: 'postgresql' as const, name: 'PostgreSQL', desc: 'Backend database (requires server)', icon: Server, color: 'purple' },
    { id: 'cloud' as const, name: 'Cloud Database', desc: 'External cloud provider', icon: Cloud, color: 'emerald' },
  ];

  const handleSwitch = async (sourceId: typeof currentSource) => {
    if (sourceId === currentSource) return;
    
    if (confirm(`Switch to ${sources.find(s => s.id === sourceId)?.name}? This will reload the application and clear all cached data.`)) {
      setIsSwitching(true);
      await switchDataSource(sourceId);
    }
  };

  return (
    <div className={cn("p-6 rounded-xl border shadow-sm", theme.surface.default, theme.border.default)}>
      <h3 className={cn("text-lg font-semibold mb-4 flex items-center gap-2", theme.text.primary)}>
        <Power className="h-5 w-5 text-emerald-500" /> Active Data Source
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sources.map((source) => {
          const isActive = currentSource === source.id;
          const Icon = source.icon;
          
          return (
            <button
              key={source.id}
              onClick={() => handleSwitch(source.id)}
              disabled={isActive || isSwitching}
              className={cn(
                "p-4 rounded-xl border-2 transition-all text-left",
                isActive 
                  ? `border-${source.color}-500 bg-${source.color}-50 dark:bg-${source.color}-900/20` 
                  : `border-gray-200 dark:border-gray-700 hover:border-${source.color}-300 dark:hover:border-${source.color}-700`,
                isActive || isSwitching ? "cursor-default" : "cursor-pointer hover:shadow-md"
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <Icon className={cn("h-5 w-5", isActive ? `text-${source.color}-600` : "text-gray-400")} />
                {isActive && (
                  <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    ACTIVE
                  </div>
                )}
              </div>
              <h4 className={cn("font-bold text-sm mb-1", theme.text.primary)}>{source.name}</h4>
              <p className={cn("text-xs", theme.text.secondary)}>{source.desc}</p>
            </button>
          );
        })}
      </div>
      {isSwitching && (
        <div className={cn("mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-sm flex items-center gap-2", theme.text.primary)}>
          <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
          Switching data source and reloading application...
        </div>
      )}
    </div>
  );
};

const IndexedDBView = () => {
  const { theme } = useTheme();
  const { data: stores = [], isLoading, refetch } = useQuery<any[]>(
    ['admin', 'registry'],
    DataService.catalog.getRegistryInfo
  );
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [storeData, setStoreData] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<any>(null);

  const loadStoreData = async (storeName: string) => {
    setIsLoadingData(true);
    try {
      const data = await db.getAll(storeName);
      console.log(`Loaded ${data?.length || 0} records from ${storeName}:`, data);
      setStoreData(data || []);
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

  const handleEdit = (item: any) => {
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
      {/* Active Data Source Indicator */}
      <DataSourceSelector />
      
      {/* Backend API Service Coverage */}
      <ServiceCoverageIndicator />
      
      <div className={cn("p-6 rounded-xl border shadow-sm", theme.surface.default, theme.border.default)}>
        <div className="flex justify-between items-center mb-6">
          <h3 className={cn("text-lg font-semibold flex items-center gap-2", theme.text.primary)}>
            <Database className="h-5 w-5 text-blue-500" /> 
            {selectedStore ? `${selectedStore} Data` : 'IndexedDB Stores'}
          </h3>
          <div className="flex items-center gap-2">
            {selectedStore && (
              <button 
                onClick={() => {
                  setSelectedStore(null);
                  setStoreData([]);
                  setSearchTerm('');
                }}
                className={cn("px-4 py-2 text-sm font-medium rounded-lg border flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors", theme.border.default, theme.text.primary)}
              >
                Back to Stores
              </button>
            )}
            <button 
              onClick={() => refetch()}
              className={cn("px-4 py-2 text-sm font-medium rounded-lg border flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors", theme.border.default, theme.text.primary)}
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} /> Refresh
            </button>
          </div>
        </div>

        {selectedStore ? (
          <>
            {/* Search Bar */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={cn("w-full px-4 py-2 rounded-lg border", theme.border.default, theme.surface.default, theme.text.primary)}
              />
            </div>

            {/* Data Table */}
            {isLoadingData ? (
              <div className="p-12 text-center text-gray-500">Loading data...</div>
            ) : filteredData.length === 0 ? (
              <div className="p-12 text-center text-gray-500">No records found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className={cn("border-b", theme.border.default)}>
                    <tr>
                      <th className={cn("text-left p-3 font-semibold", theme.text.secondary)}>ID</th>
                      <th className={cn("text-left p-3 font-semibold", theme.text.secondary)}>Data</th>
                      <th className={cn("text-right p-3 font-semibold", theme.text.secondary)}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item) => (
                      <tr key={item.id} className={cn("border-b hover:bg-gray-50 dark:hover:bg-slate-800/50", theme.border.default)}>
                        <td className={cn("p-3", theme.text.primary)}>
                          <code className="text-xs">{item.id}</code>
                        </td>
                        <td className={cn("p-3", theme.text.primary)}>
                          {editingId === item.id ? (
                            <textarea
                              value={JSON.stringify(editingData, null, 2)}
                              onChange={(e) => {
                                try {
                                  setEditingData(JSON.parse(e.target.value));
                                } catch (err) {
                                  // Keep previous value if invalid JSON
                                }
                              }}
                              className={cn("w-full p-2 rounded border font-mono text-xs", theme.border.default, theme.surface.default)}
                              rows={5}
                            />
                          ) : (
                            <pre className="text-xs overflow-x-auto max-w-2xl">
                              {JSON.stringify(item, null, 2)}
                            </pre>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          {editingId === item.id ? (
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={handleSave}
                                className={cn("px-3 py-1 text-xs rounded border bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100")}
                              >
                                Save
                              </button>
                              <button
                                onClick={handleCancel}
                                className={cn("px-3 py-1 text-xs rounded border", theme.border.default, theme.text.secondary)}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleEdit(item)}
                                className={cn("px-3 py-1 text-xs rounded border hover:bg-gray-100 dark:hover:bg-slate-700", theme.border.default, theme.text.secondary)}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className={cn("px-3 py-1 text-xs rounded border hover:bg-red-50 hover:text-red-600 hover:border-red-200", theme.border.default, theme.text.secondary)}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <>
            {isLoading ? (
              <div className="p-12 text-center text-gray-500">Loading store statistics...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stores.map((store) => (
                  <button
                    key={store.name}
                    onClick={() => handleStoreClick(store.name)}
                    className={cn("p-5 rounded-xl border hover:shadow-md transition-all duration-200 group text-left", theme.border.default, "hover:border-blue-300 dark:hover:border-blue-700")}
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
                        <span className={cn("text-lg font-bold", theme.text.primary)}>{store.records.toLocaleString()}</span>
                      </div>
                      <span className={cn("font-mono text-xs px-2 py-1 rounded bg-gray-100 dark:bg-slate-800", theme.text.secondary)}>{store.size}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DataSourcesManager;
