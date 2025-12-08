

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Server, ChevronDown, ChevronRight, Maximize2, Menu, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { DataPlatformSidebar } from './data/DataPlatformSidebar';
import { PlatformOverview } from './data/PlatformOverview';
import { SchemaArchitect } from './data/SchemaArchitect';
import { GovernanceConsole } from './data/GovernanceConsole';
import { PipelineMonitor } from './data/PipelineMonitor';
import { BackupVault } from './data/BackupVault';
import { QueryConsole } from './data/QueryConsole';
import { SecurityMatrix } from './data/SecurityMatrix';
import { DataCatalog } from './data/DataCatalog';
import { ApiGateway } from './data/ApiGateway';
import { DataQualityStudio } from './data/DataQualityStudio';
import { ReplicationManager } from './data/ReplicationManager';
import { LineageGraph } from './data/LineageGraph';
import { CostFinOps } from './data/CostFinOps';
import { DataLakeExplorer } from './data/DataLakeExplorer';
import { useWindow } from '../../context/WindowContext';
import { TabStrip } from '../common/RefactoredCommon';
import { ShardingVisualizer } from './data/ShardingVisualizer';

export type PlatformView = string;

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
    // Sub-module routing logic
    if (activeView.startsWith('quality')) return <Suspense fallback={null}><DataQualityStudio initialTab={activeView.replace('quality-', '')} /></Suspense>;
    if (activeView.startsWith('lineage')) return <Suspense fallback={null}><LineageGraph initialTab={activeView.replace('lineage-', '')} /></Suspense>;
    if (activeView.startsWith('governance')) return <Suspense fallback={null}><GovernanceConsole initialTab={activeView.replace('governance-', '')} /></Suspense>;
    if (activeView.startsWith('catalog')) return <Suspense fallback={null}><DataCatalog initialTab={activeView.replace('catalog-', '')} /></Suspense>;
    if (activeView.startsWith('schema')) return <Suspense fallback={null}><SchemaArchitect initialTab={activeView.replace('schema-', '')} /></Suspense>;
    if (activeView.startsWith('pipeline')) return <Suspense fallback={null}><PipelineMonitor initialTab={activeView.replace('pipeline-', '')} /></Suspense>;
    if (activeView.startsWith('query')) return <Suspense fallback={null}><QueryConsole initialTab={activeView.replace('query-', '')} /></Suspense>;
    if (activeView.startsWith('security')) return <Suspense fallback={null}><SecurityMatrix initialTab={activeView.replace('security-', '')} /></Suspense>;

    switch (activeView) {
      case 'overview': return <Suspense fallback={null}><PlatformOverview /></Suspense>;
      case 'backup': return <Suspense fallback={null}><BackupVault /></Suspense>;
      case 'api': return <Suspense fallback={null}><ApiGateway /></Suspense>;
      case 'replication': return <Suspense fallback={null}><ReplicationManager /></Suspense>;
      case 'cost': return <Suspense fallback={null}><CostFinOps /></Suspense>;
      case 'lake': return <Suspense fallback={null}><DataLakeExplorer /></Suspense>;
      case 'sharding': return <Suspense fallback={null}><ShardingVisualizer /></Suspense>;
      default: return <Suspense fallback={null}><PlatformOverview /></Suspense>;
    }
  };

  const handleUndock = () => {
    openWindow(
      `data-tool-${activeView}-${Date.now()}`,
      `Data Platform: ${activeView}`,
      <div className="h-full flex flex-col bg-white overflow-hidden">{renderContent()}</div>
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
          theme.surface, 
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
            <button onClick={() => setIsMobileMenuOpen(true)} className={cn("p-2 rounded-md", theme.surfaceHighlight)}>
                <Menu className={cn("h-5 w-5", theme.text.primary)} />
            </button>
            <span className={cn("font-bold text-sm", theme.text.primary)}>Data Platform</span>
            <div className="w-9"></div> {/* Spacer */}
        </div>

        <div className="absolute top-4 right-4 z-10 hidden md:block">
            <button onClick={handleUndock} className={cn("p-2 backdrop-blur border rounded-lg shadow-sm transition-all", theme.surface, theme.border.default, theme.text.secondary, `hover:${theme.text.primary}`)} title="Open in Window">
                <Maximize2 className="h-4 w-4"/>
            </button>
        </div>
        
        {renderContent()}
      </div>
    </div>
  );
};
