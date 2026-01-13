import React from 'react';
import { useEvidenceManager, ViewMode } from '@/hooks/useEvidenceManager';
import { EvidenceVaultContent } from './EvidenceVaultContent';
import { EvidenceDetail } from './EvidenceDetail';
import { LoadingSpinner } from '@/shared/ui/atoms/LoadingSpinner/LoadingSpinner';

export default function EvidenceVault() {
  const {
    view,
    evidenceItems,
    filteredItems,
    filters,
    setFilters,
    handleItemClick,
    handleIntakeComplete,
    setView,
    selectedItem,
    handleBack,
    isLoading,
    activeTab,
    setActiveTab,
    handleCustodyUpdate
  } = useEvidenceManager();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <LoadingSpinner text="Loading Evidence Vault..." />
      </div>
    );
  }

  // Handle detailed view which is not in EvidenceVaultContent
  if (view === 'detail' && selectedItem) {
    return (
      <EvidenceDetail
        selectedItem={selectedItem}
        handleBack={handleBack}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onCustodyUpdate={handleCustodyUpdate}
      />
    );
  }

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
      onNavigate={(v: ViewMode) => setView(v)}
    />
  );
}
