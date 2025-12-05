
import React, { useState } from 'react';
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
import { useWindow } from '../../context/WindowContext';
import { Maximize2, Menu, X } from 'lucide-react';

export type PlatformView = string; // Relaxed type for sub-routes

export const AdminDatabaseControl: React.FC = () => {
  const { theme } = useTheme();
  const { openWindow } = useWindow();
  const [activeView, setActiveView] = useState<PlatformView>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderContent = () => {
    // Sub-module routing logic
    if (activeView.startsWith('quality')) return <DataQualityStudio initialTab={activeView.replace('quality-', '')} />;
    if (activeView.startsWith('lineage')) return <LineageGraph initialTab={activeView.replace('lineage-', '')} />;
    if (activeView.startsWith('governance')) return <GovernanceConsole initialTab={activeView.replace('governance-', '')} />;
    if (activeView.startsWith('catalog')) return <DataCatalog initialTab={activeView.replace('catalog-', '')} />;

    switch (activeView) {
      case 'overview': return <PlatformOverview />;
      case 'schema': return <SchemaArchitect />;
      case 'pipeline': return <PipelineMonitor />;
      case 'backup': return <BackupVault />;
      case 'query': return <QueryConsole />;
      case 'security': return <SecurityMatrix />;
      case 'api': return <ApiGateway />;
      case 'replication': return <ReplicationManager />;
      case 'cost': return <CostFinOps />;
      default: return <PlatformOverview />;
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
        <div className="md:hidden p-4 border-b flex justify-between items-center bg-inherit">
            <button onClick={() => setIsMobileMenuOpen(true)} className={cn("p-2 rounded-md", theme.surfaceHighlight)}>
                <Menu className={cn("h-5 w-5", theme.text.primary)} />
            </button>
            <span className={cn("font-bold text-sm", theme.text.primary)}>Data Platform</span>
            <div className="w-9"></div> {/* Spacer */}
        </div>

        <div className="absolute top-4 right-4 z-10 hidden md:block">
            <button onClick={handleUndock} className="p-2 bg-white/80 backdrop-blur border rounded-lg hover:bg-white shadow-sm transition-all text-slate-500 hover:text-blue-600" title="Open in Window">
                <Maximize2 className="h-4 w-4"/>
            </button>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};
