/**
 * @module components/evidence/EvidenceVault
 * @category Evidence
 * @description Main container for the Evidence Vault module with chain of custody.
 *
 * THEME SYSTEM USAGE:
 * Uses theme indirectly through child components.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { Plus, Search } from 'lucide-react';
import React, { lazy, Suspense, useCallback, useEffect, useMemo } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Components
import { PageHeader } from '@/shared/ui/organisms/PageHeader/PageHeader';
import { Button } from '@/shared/ui/atoms/Button/Button';
import { LazyLoader } from '@/shared/ui/molecules/LazyLoader/LazyLoader';
import { EvidenceErrorBoundary } from './EvidenceErrorBoundary';
import { EvidenceDetailSkeleton, EvidenceInventorySkeleton } from './EvidenceSkeleton';
import { EvidenceVaultContent } from './EvidenceVaultContent';

// Context & Utils
import { useTheme } from '@/features/theme';
import { DetailTab, useEvidenceManager, ViewMode } from '@/hooks/useEvidenceManager';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { cn } from '@/shared/lib/cn';

// Config & Types
import { EVIDENCE_PARENT_TABS } from '@/config/tabs.config';

const EvidenceDetail = lazy(() => import('./EvidenceDetail').then(m => ({ default: m.EvidenceDetail })));

interface EvidenceVaultProps {
  onNavigateToCase?: (caseId: string) => void;
  initialTab?: ViewMode;
  caseId?: string;
}

const EvidenceVaultInternal: React.FC<EvidenceVaultProps> = ({ onNavigateToCase, initialTab, caseId }) => {
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
    handleCustodyUpdate,
    isLoading
  } = useEvidenceManager(caseId);

  useEffect(() => {
    if (initialTab) setView(initialTab);
  }, [initialTab, setView]);

  // Keyboard shortcuts for evidence operations
  useKeyboardShortcuts([
    {
      key: 'i',
      ctrlOrCmd: true,
      action: () => setView('inventory'),
      description: 'Go to inventory'
    },
    {
      key: 'n',
      ctrlOrCmd: true,
      action: () => setView('intake'),
      description: 'Log new evidence'
    },
    {
      key: 'Escape',
      action: handleBack,
      description: 'Go back'
    }
  ]);

  const handleParentTabChange = useCallback((parentId: string) => {
    const parent = EVIDENCE_PARENT_TABS.find(p => p.id === parentId);
    if (parent && parent.subTabs && parent.subTabs.length > 0) {
      setView(parent.subTabs[0]!.id as ViewMode);
    }
  }, [setView]);

  const activeParentTab = useMemo(() =>
    EVIDENCE_PARENT_TABS.find(p => p.subTabs?.some(s => s.id === view)) || EVIDENCE_PARENT_TABS[0],
    [view]);

  if (!activeParentTab) return null;

  if (view === 'detail' && selectedItem) {
    return (
      <Suspense fallback={<div className={cn("h-full p-6", theme.background)}><EvidenceDetailSkeleton /></div>}>
        <div className={cn("h-full flex flex-col animate-fade-in p-6 overflow-y-auto touch-auto", theme.background)}>
          <EvidenceDetail
            selectedItem={selectedItem}
            handleBack={handleBack}
            activeTab={activeTab}
            setActiveTab={(tab) => setActiveTab(tab as DetailTab)}
            onNavigateToCase={onNavigateToCase}
            onCustodyUpdate={handleCustodyUpdate}
          />
        </div>
      </Suspense>
    );
  }

  // Show skeleton during initial data load
  if (isLoading && view === 'inventory') {
    return (
      <div className={cn("h-full flex flex-col p-6", theme.background)}>
        <EvidenceInventorySkeleton />
      </div>
    );
  }

  const renderContent = () => {
    return (
      <EvidenceVaultContent
        view={view}
        evidenceItems={evidenceItems}
        filteredItems={filteredItems}
        filters={filters}
        setFilters={setFilters}
        onItemClick={handleItemClick}
        onIntakeClick={() => setView('intake')}
        onIntakeComplete={handleIntakeComplete}
        onNavigate={setView}
      />
    );
  };

  return (
    <div className={cn("h-full flex flex-col animate-fade-in", theme.background)}>
      <div className={cn("px-6 pt-6 shrink-0", caseId ? "pt-2" : "")}>
        {!caseId && (
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
        )}

        <div className={cn("hidden md:flex space-x-6 border-b mb-4", theme.border.default)}>
          {EVIDENCE_PARENT_TABS.map(parent => (
            <button
              key={parent.id}
              onClick={() => handleParentTabChange(parent.id)}
              className={cn(
                "flex items-center pb-3 px-1 text-sm font-medium transition-all border-b-2",
                activeParentTab?.id === parent.id
                  ? cn("border-current", theme.primary.text)
                  : cn("border-transparent", theme.text.secondary, `hover:${theme.text.primary}`)
              )}
            >
              <parent.icon className={cn("h-4 w-4 mr-2", activeParentTab?.id === parent.id ? theme.primary.text : theme.text.tertiary)} />
              {parent.label}
            </button>
          ))}
        </div>

        {activeParentTab?.subTabs && activeParentTab.subTabs.length > 0 && (
          <div className={cn("flex space-x-2 overflow-x-auto no-scrollbar py-3 px-4 md:px-6 rounded-lg border mb-4 touch-pan-x", theme.surface.highlight, theme.border.default)}>
            {activeParentTab.subTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setView(tab.id as ViewMode)}
                className={cn(
                  "flex-shrink-0 px-3 py-1.5 rounded-full font-medium text-xs md:text-sm transition-all duration-200 whitespace-nowrap flex items-center gap-2 border",
                  view === tab.id
                    ? cn(theme.surface.default, theme.primary.text, "shadow-sm border-transparent ring-1", theme.primary.border)
                    : cn("bg-transparent", theme.text.secondary, "border-transparent", `hover:${theme.surface.default}`)
                )}
              >
                <tab.icon className={cn("h-3.5 w-3.5", view === tab.id ? theme.primary.text : theme.text.tertiary)} />
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden px-6 pb-6 min-h-0">
        <div className="h-full overflow-y-auto custom-scrollbar">
          <Suspense fallback={<LazyLoader message="Loading Evidence Module..." />}>
            {renderContent()}
          </Suspense>
        </div>
      </div>
    </div>
  );
};

// Export with Error Boundary wrapper
export const EvidenceVault: React.FC<EvidenceVaultProps> = (props) => {
  return (
    <EvidenceErrorBoundary onReset={() => window.location.reload()}>
      <EvidenceVaultInternal {...props} />
    </EvidenceErrorBoundary>
  );
};

export default EvidenceVault;
