import React, { useMemo, useCallback, useState, useEffect, Suspense } from 'react';
import { EvidenceInventory } from './evidence/EvidenceInventory';
import { EvidenceDetail } from './evidence/EvidenceDetail';
import { EvidenceIntake } from './evidence/EvidenceIntake';
import { EvidenceDashboard } from './evidence/EvidenceDashboard';
import { EvidenceCustodyLog } from './evidence/EvidenceCustodyLog';
import { PageHeader } from './common/PageHeader';
import { Button } from './common/Button';
import { 
  LayoutDashboard, Box, Link, Plus, ScanLine, Search, ShieldCheck, Scale,
  Fingerprint, Filter as FilterIcon, FileWarning, UserCheck, Copy
} from 'lucide-react';
import { useEvidenceVault, ViewMode } from '../hooks/useEvidenceVault';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../utils/cn';
import { LazyLoader } from './common/LazyLoader';

// FRE Workbench Components
const AuthenticationManager = React.lazy(() => import('./evidence/fre/AuthenticationManager').then(m => ({ default: m.AuthenticationManager })));
const RelevanceAnalysis = React.lazy(() => import('./evidence/fre/RelevanceAnalysis').then(m => ({ default: m.RelevanceAnalysis })));
const HearsayAnalyzer = React.lazy(() => import('./evidence/fre/HearsayAnalyzer').then(m => ({ default: m.HearsayAnalyzer })));
const ExpertEvidenceManager = React.lazy(() => import('./evidence/fre/ExpertEvidenceManager').then(m => ({ default: m.ExpertEvidenceManager })));
const OriginalsManager = React.lazy(() => import('./evidence/fre/OriginalsManager').then(m => ({ default: m.OriginalsManager })));


interface EvidenceVaultProps {
  onNavigateToCase?: (caseId: string) => void;
  initialTab?: ViewMode;
}

const PARENT_TABS = [
  { id: 'vault', label: 'Vault', icon: Box,
    subTabs: [
      { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
      { id: 'inventory', label: 'Inventory Index', icon: Box },
      { id: 'intake', label: 'New Intake', icon: Plus },
    ]
  },
  { id: 'fre', label: 'FRE Workbench', icon: Scale,
    subTabs: [
      { id: 'authentication', label: 'Authentication (901/902)', icon: Fingerprint },
      { id: 'relevance', label: 'Relevance (401/403)', icon: FilterIcon },
      { id: 'hearsay', label: 'Hearsay Analysis (801)', icon: FileWarning },
      { id: 'experts', label: 'Expert Evidence (702)', icon: UserCheck },
      { id: 'originals', label: 'Originals (1002)', icon: Copy },
    ]
  },
  { id: 'chain', label: 'Chain of Custody', icon: Link,
    subTabs: [
      { id: 'custody', label: 'Custody Logs', icon: Link },
    ]
  }
];

export const EvidenceVault: React.FC<EvidenceVaultProps> = ({ onNavigateToCase, initialTab }) => {
  const { theme } = useTheme();
  const {
    view,
    setView,
    activeTab,
    setActiveTab,
    selectedItem,
    evidenceItems,
    filters,
    setFilters,
    filteredItems,
    handleItemClick,
    handleBack,
    handleIntakeComplete,
    handleCustodyUpdate
  } = useEvidenceVault();

  useEffect(() => {
      if (initialTab) setView(initialTab);
  }, [initialTab, setView]);

  // Determine active parent tab based on current view
  const activeParentTab = useMemo(() => 
    PARENT_TABS.find(p => p.subTabs.some(s => s.id === view)) || PARENT_TABS[0],
  [view]);

  const handleParentTabChange = useCallback((parentId: string) => {
    const parent = PARENT_TABS.find(p => p.id === parentId);
    if (parent && parent.subTabs.length > 0) {
      setView(parent.subTabs[0].id as ViewMode);
    }
  }, [setView]);

  // If viewing details, render full screen detail view
  if (view === 'detail' && selectedItem) {
    return (
      <div className={cn("h-full flex flex-col animate-fade-in p-6 overflow-y-auto touch-auto", theme.background)}>
         <EvidenceDetail 
            selectedItem={selectedItem}
            handleBack={handleBack}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onNavigateToCase={onNavigateToCase}
            onCustodyUpdate={handleCustodyUpdate}
          />
      </div>
    );
  }

  const renderContent = () => {
    switch (view) {
      case 'dashboard': return <EvidenceDashboard onNavigate={(v) => setView(v as ViewMode)} />;
      case 'inventory': return (
        <EvidenceInventory 
            items={evidenceItems} 
            filteredItems={filteredItems}
            filters={filters}
            setFilters={setFilters}
            onItemClick={handleItemClick}
            onIntakeClick={() => setView('intake')}
          />
      );
      case 'custody': return <EvidenceCustodyLog />;
      case 'intake': return (
        <EvidenceIntake 
            handleBack={handleBack}
            onComplete={handleIntakeComplete}
          />
      );
      case 'authentication': return <AuthenticationManager />;
      case 'relevance': return <RelevanceAnalysis />;
      case 'hearsay': return <HearsayAnalyzer />;
      case 'experts': return <ExpertEvidenceManager />;
      case 'originals': return <OriginalsManager />;
      default: return <EvidenceDashboard onNavigate={(v) => setView(v as ViewMode)} />;
    }
  };

  return (
    <div className={cn("h-full flex flex-col animate-fade-in", theme.background)}>
      <div className="px-6 pt-6 shrink-0">
        <PageHeader 
            title="Evidence Vault" 
            subtitle="Secure Chain of Custody & Forensic Asset Management."
            actions={
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                 <Button variant="secondary" icon={Search} onClick={() => setView('inventory')} className="w-full sm:w-auto justify-center">Search Vault</Button>
                 <Button variant="primary" icon={Plus} onClick={() => setView('intake')} className="w-full sm:w-auto justify-center">Log New Item</Button>
              </div>
            }
        />

        {/* Desktop Parent Navigation */}
        <div className={cn("hidden md:flex space-x-6 border-b mb-4", theme.border.default)}>
            {PARENT_TABS.map(parent => (
                <button
                    key={parent.id}
                    onClick={() => handleParentTabChange(parent.id)}
                    className={cn(
                        "flex items-center pb-3 px-1 text-sm font-medium transition-all border-b-2",
                        activeParentTab.id === parent.id 
                            ? cn("border-current", theme.primary.text)
                            : cn("border-transparent", theme.text.secondary, `hover:${theme.text.primary}`)
                    )}
                >
                    <parent.icon className={cn("h-4 w-4 mr-2", activeParentTab.id === parent.id ? theme.primary.text : theme.text.tertiary)}/>
                    {parent.label}
                </button>
            ))}
        </div>

        {/* Sub-Navigation (Pills) */}
        <div className={cn("flex space-x-2 overflow-x-auto no-scrollbar py-3 px-4 md:px-6 rounded-lg border mb-4 touch-pan-x", theme.surfaceHighlight, theme.border.default)}>
            {activeParentTab.subTabs.map(tab => (
                <button 
                    key={tab.id} 
                    onClick={() => setView(tab.id as ViewMode)} 
                    className={cn(
                        "flex-shrink-0 px-3 py-1.5 rounded-full font-medium text-xs md:text-sm transition-all duration-200 whitespace-nowrap flex items-center gap-2 border",
                        view === tab.id 
                            ? cn(theme.surface, theme.primary.text, "shadow-sm border-transparent ring-1", theme.primary.border) 
                            : cn("bg-transparent", theme.text.secondary, "border-transparent", `hover:${theme.surface}`)
                        )}
                    >
                        <tab.icon className={cn("h-3.5 w-3.5", view === tab.id ? theme.primary.text : theme.text.tertiary)}/>
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>

      <div className={cn("flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar touch-auto")}>
        <Suspense fallback={<LazyLoader message="Loading Module..." />}>
            {renderContent()}
        </Suspense>
      </div>
    </div>
  );
};

export default EvidenceVault;