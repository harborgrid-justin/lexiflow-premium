
import React, { useMemo } from 'react';
import { EvidenceInventory } from './evidence/EvidenceInventory.tsx';
import { EvidenceDetail } from './evidence/EvidenceDetail.tsx';
import { EvidenceIntake } from './evidence/EvidenceIntake.tsx';
import { EvidenceDashboard } from './evidence/EvidenceDashboard.tsx';
import { EvidenceCustodyLog } from './evidence/EvidenceCustodyLog.tsx';
import { PageHeader } from './common/PageHeader.tsx';
import { Button } from './common/Button.tsx';
import { TabNavigation } from './common/TabNavigation.tsx';
import { LayoutDashboard, Box, Link, Plus, ScanLine } from 'lucide-react';
import { useEvidenceVault, ViewMode } from '../hooks/useEvidenceVault.ts';

interface EvidenceVaultProps {
  onNavigateToCase?: (caseId: string) => void;
}

export const EvidenceVault: React.FC<EvidenceVaultProps> = ({ onNavigateToCase }) => {
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
    deleteItem,
    updateItem
  } = useEvidenceVault();

  const tabs = useMemo(() => [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Master Inventory', icon: Box },
    { id: 'custody', label: 'Chain of Custody', icon: Link },
    { id: 'intake', label: 'Intake Wizard', icon: ScanLine },
  ], []);

  return (
    <div className="h-full flex flex-col bg-slate-50 animate-fade-in">
      {view !== 'detail' && (
        <div className="px-6 pt-6 pb-2 shrink-0">
            <PageHeader 
                title="Evidence Vault" 
                subtitle="Secure Chain of Custody & Forensic Asset Management."
                actions={
                    <Button variant="primary" icon={Plus} onClick={() => setView('intake')}>Log New Item</Button>
                }
            />
            <TabNavigation 
                tabs={tabs} 
                activeTab={view} 
                onTabChange={(v) => setView(v as ViewMode)} 
                className="bg-white rounded-lg border border-slate-200 p-1 shadow-sm"
            />
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto p-6 pt-4">
         <div className="max-w-[1920px] mx-auto h-full">
            {view === 'dashboard' && <EvidenceDashboard onNavigate={(v) => setView(v as ViewMode)} items={evidenceItems} />}
            {view === 'inventory' && (
                <EvidenceInventory 
                    filteredItems={filteredItems} 
                    filters={filters} 
                    setFilters={setFilters} 
                    onItemClick={handleItemClick} 
                    onIntakeClick={() => setView('intake')} 
                    onDelete={deleteItem}
                />
            )}
            {view === 'custody' && <EvidenceCustodyLog items={evidenceItems} />}
            {view === 'detail' && selectedItem && (
                <EvidenceDetail 
                    selectedItem={selectedItem} 
                    handleBack={handleBack} 
                    activeTab={activeTab} 
                    setActiveTab={setActiveTab} 
                    onNavigateToCase={onNavigateToCase} 
                    onCustodyUpdate={handleCustodyUpdate}
                    onUpdate={(updates) => updateItem(selectedItem.id, updates)}
                    onDelete={() => deleteItem(selectedItem.id)}
                />
            )}
            {view === 'intake' && <EvidenceIntake handleBack={handleBack} onComplete={handleIntakeComplete} />}
         </div>
      </div>
    </div>
  );
};
