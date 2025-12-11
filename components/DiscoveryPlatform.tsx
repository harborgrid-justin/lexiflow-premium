
// components/DiscoveryPlatform.tsx
import React, { Suspense } from 'react';
import { PageHeader } from './common/PageHeader';
import { Button } from './common/Button';
import { Plus, Clock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../utils/cn';
import { LazyLoader } from './common/LazyLoader';
import { DiscoveryNavigation } from './discovery/layout/DiscoveryNavigation';
import { DiscoveryContentRenderer } from './discovery/DiscoveryContentRenderer';
import { useDiscoveryPlatform, DiscoveryView } from '../hooks/useDiscoveryPlatform';

interface DiscoveryPlatformProps {
    initialTab?: DiscoveryView;
    caseId?: string;
}

export const DiscoveryPlatform: React.FC<DiscoveryPlatformProps> = ({ initialTab, caseId }) => {
  const { theme } = useTheme();
  
  const {
    activeTab,
    contextId,
    requests,
    isSyncing,
    activeParentTab,
    syncDeadlines,
    handleParentTabChange,
    handleNavigate,
    handleBack,
    handleSaveResponse,
    setActiveTab
  } = useDiscoveryPlatform(initialTab, caseId);

  return (
    <div className={cn("h-full flex flex-col animate-fade-in", theme.background)}>
      <div className={cn("px-6 pt-6 shrink-0", caseId ? "pt-2" : "")}>
        {!caseId && (
            <PageHeader 
                title="Discovery Center" 
                subtitle="Manage Requests, Legal Holds, and FRCP Compliance."
                actions={
                <div className="flex gap-2">
                    <Button variant="secondary" icon={Clock} onClick={() => syncDeadlines(undefined)} isLoading={isSyncing}>Sync Deadlines</Button>
                    <Button variant="primary" icon={Plus} onClick={() => alert("New Request Wizard")}>Create Request</Button>
                </div>
                }
            />
        )}
        
        <DiscoveryNavigation 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            activeParentTabId={activeParentTab.id}
            onParentTabChange={handleParentTabChange}
        />
      </div>

      <div className="flex-1 overflow-hidden px-6 pb-6 min-h-0">
        <div className="h-full overflow-y-auto custom-scrollbar">
            <Suspense fallback={<LazyLoader message="Loading Discovery Module..." />}>
                <DiscoveryContentRenderer
                    activeTab={activeTab}
                    requests={requests}
                    contextId={contextId}
                    onNavigate={handleNavigate}
                    onBack={handleBack}
                    onSaveResponse={handleSaveResponse}
                    onCreateProduction={() => setActiveTab('production_wizard')}
                />
            </Suspense>
        </div>
      </div>
    </div>
  );
};
