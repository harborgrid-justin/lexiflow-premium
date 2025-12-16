
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Maximize2, Menu, X } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import { DataPlatformSidebar } from './DataPlatformSidebar';
import { useWindow } from '../../../context/WindowContext';
import { Loader2 } from 'lucide-react';

export type PlatformView = string;

// Lazy Load All Sub-Modules
const PlatformOverview = lazy(() => import('./PlatformOverview').then(m => ({ default: m.PlatformOverview })));
const SchemaArchitect = lazy(() => import('./schema/SchemaArchitect').then(m => ({ default: m.SchemaArchitect })));
const GovernanceConsole = lazy(() => import('./GovernanceConsole').then(m => ({ default: m.GovernanceConsole })));
const PipelineMonitor = lazy(() => import('./PipelineMonitor').then(m => ({ default: m.PipelineMonitor })));
const BackupVault = lazy(() => import('./BackupVault').then(m => ({ default: m.BackupVault })));
const QueryConsole = lazy(() => import('./QueryConsole').then(m => ({ default: m.QueryConsole })));
const SecurityMatrix = lazy(() => import('./SecurityMatrix').then(m => ({ default: m.SecurityMatrix })));
const DataCatalog = lazy(() => import('./DataCatalog').then(m => ({ default: m.DataCatalog })));
const ApiGateway = lazy(() => import('./ApiGateway').then(m => ({ default: m.ApiGateway })));
const DataQualityStudio = lazy(() => import('./DataQualityStudio').then(m => ({ default: m.DataQualityStudio })));
const ReplicationManager = lazy(() => import('./ReplicationManager').then(m => ({ default: m.ReplicationManager })));
const LineageGraph = lazy(() => import('./LineageGraph').then(m => ({ default: m.LineageGraph })));
const CostFinOps = lazy(() => import('./CostFinOps').then(m => ({ default: m.CostFinOps })));
const DataLakeExplorer = lazy(() => import('./DataLakeExplorer').then(m => ({ default: m.DataLakeExplorer })));
const ShardingVisualizer = lazy(() => import('./ShardingVisualizer').then(m => ({ default: m.ShardingVisualizer })));
const DataSourcesManager = lazy(() => import('./DataSourcesManager').then(m => ({ default: m.DataSourcesManager })));

interface AdminDatabaseControlProps {
  initialTab?: string;
}

export const AdminDatabaseControl: React.FC<AdminDatabaseControlProps> = ({ initialTab }) => {
  const { theme } = useTheme();
  const { openWindow } = useWindow();
  const [activeView, setActiveView] = useState<PlatformView>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sync initialTab prop to state for deep linking
  useEffect(() => {
    if (initialTab) {
      setActiveView(initialTab);
    }
  }, [initialTab]);

  const renderContent = () => {
    // Dynamic routing helper to strip prefixes
    const getSubTab = (prefix: string) => activeView.startsWith(prefix + '-') ? activeView.replace(prefix + '-', '') : undefined;

    // Route Mapping
    if (activeView.startsWith('sources')) return <DataSourcesManager initialTab={getSubTab('sources')} />;
    if (activeView.startsWith('quality')) return <DataQualityStudio initialTab={getSubTab('quality')} />;
    if (activeView.startsWith('lineage')) return <LineageGraph initialTab={getSubTab('lineage')} />;
    if (activeView.startsWith('governance')) return <GovernanceConsole initialTab={getSubTab('governance')} />;
    if (activeView.startsWith('catalog')) return <DataCatalog initialTab={getSubTab('catalog')} />;
    if (activeView.startsWith('schema')) return <SchemaArchitect initialTab={getSubTab('schema')} />;
    if (activeView.startsWith('pipeline')) return <PipelineMonitor initialTab={getSubTab('pipeline')} />;
    if (activeView.startsWith('query')) return <QueryConsole initialTab={getSubTab('query')} />;
    if (activeView.startsWith('security')) return <SecurityMatrix initialTab={getSubTab('security')} />;

    // Direct Matches
    switch (activeView) {
      case 'overview': return <PlatformOverview />;
      case 'backup': return <BackupVault />;
      case 'api': return <ApiGateway />;
      case 'replication': return <ReplicationManager />;
      case 'cost': return <CostFinOps />;
      case 'lake': return <DataLakeExplorer />;
      case 'sharding': return <ShardingVisualizer />;
      default: return <PlatformOverview />;
    }
  };

  const handleUndock = () => {
    openWindow(
      `data-tool-${activeView}-${Date.now()}`,
      `Data Platform: ${activeView}`,
      <div className={cn("h-full flex flex-col overflow-hidden", theme.surface.default)}>{renderContent()}</div>
    );
  };

  return (
    <div className={cn("flex h-full rounded-lg border overflow-hidden relative", theme.border.default, theme.background)}>
      
      {/* Mobile Sidebar Overlay */}
      <div className={cn(
          "absolute inset-0 z-20 backdrop-blur-sm transition-opacity md:hidden",
          theme.backdrop,
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )} onClick={() => setIsMobileMenuOpen(false)} />

      {/* Sidebar Container */}
      <div className={cn(
          "absolute inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 md:relative md:translate-x-0 border-r shadow-xl md:shadow-none",
          theme.surface.default, 
          theme.border.default,
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
          <div className="absolute top-2 right-2 md:hidden">
              <button onClick={() => setIsMobileMenuOpen(false)} className={cn("p-1 rounded-full", theme.text.secondary)}>
                  <X className="h-5 w-5" />
              </button>
          </div>
          <DataPlatformSidebar activeView={activeView} onChange={(v) => { setActiveView(v); setIsMobileMenuOpen(false); }} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile Header Toggle */}
        <div className={cn("md:hidden p-4 border-b flex justify-between items-center", theme.background, theme.border.default)}>
            <button onClick={() => setIsMobileMenuOpen(true)} className={cn("p-2 rounded-md", theme.surface.highlight)}>
                <Menu className={cn("h-5 w-5", theme.text.primary)} />
            </button>
            <span className={cn("font-bold text-sm", theme.text.primary)}>Data Platform</span>
            <div className="w-9"></div> {/* Spacer */}
        </div>

        <div className="absolute top-4 right-4 z-10 hidden md:block">
            <button onClick={handleUndock} className={cn("p-2 backdrop-blur border rounded-lg shadow-sm transition-all", theme.surface.default, theme.border.default, theme.text.secondary, `hover:${theme.text.primary}`)} title="Open in Window">
                <Maximize2 className="h-4 w-4"/>
            </button>
        </div>
        
        <Suspense fallback={<div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-blue-600"/></div>}>
            {renderContent()}
        </Suspense>
      </div>
    </div>
  );
};
