/**
 * @module components/docket/DocketSheet
 * @category Docket Management
 * @description Main docket sheet view with filtering, search, and editing.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook indirectly through child components.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { Loader2, Radio } from 'lucide-react';
import { useEffect } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Components
import { DocketTableSkeleton } from '@/features/cases/ui/components/DocketSkeleton/DocketSkeleton';
import { ConfirmDialog } from '@/shared/ui/molecules/ConfirmDialog';
import { Modal } from '@/shared/ui/molecules/Modal';
import { DocketEntryBuilder } from './DocketEntryBuilder';
import { DocketEntryModal } from './DocketEntryModal';
import { DocketFilterPanel } from './DocketFilterPanel';
import { DocketStats } from './DocketStats';
import { DocketTable } from './DocketTable';
import { DocketToolbar } from './DocketToolbar';

// Internal Dependencies - Hooks & Context
import { useThemeContext } from '@/features/theme';
import { useWindow } from '@/providers';
import { useDocketSheet } from '@/features/cases/hooks/useDocketSheet';

// Internal Dependencies - Services & Utils
import { cn } from '@/shared/lib/cn';

// Types & Interfaces
import { CaseId, DocketEntry } from '@/types';

interface DocketSheetProps {
  filterType: 'all' | 'filings' | 'orders';
}

export const DocketSheet: React.FC<DocketSheetProps> = ({ filterType }) => {
  const { theme } = useThemeContext();
  const { openWindow, closeWindow } = useWindow();
  
  const {
      searchTerm, setSearchTerm,
      selectedCaseId, setSelectedCaseId,
      activeTab, setActiveTab,
      entries: docketEntries,
      isLoading,
      hasMore,
      isFetchingMore,
      cases,
      caseParties,
      addModal,
      deleteModal,
      handleLoadMore,
      handleSaveEntry,
      confirmDelete,
      liveModeToggle,
      liveFeedStatus,
      reconnectLiveFeed
  } = useDocketSheet(filterType);

  // Sync filter prop to internal state
  useEffect(() => {
    setActiveTab(filterType);
  }, [filterType, setActiveTab]);

  const openOrbitalEntry = (entry: DocketEntry) => {
    const winId = `docket-${entry.id}`;
    openWindow(
      winId,
      `Docket #${entry.sequenceNumber}`,
      <DocketEntryModal
        entry={entry}
        onClose={() => closeWindow(winId)}
        onViewOnTimeline={(id) => { closeWindow(winId); setSelectedCaseId(id); }}
        renderLinkedText={renderLinkedText}
        isOrbital={true}
      />
    );
  };

  const sortedEntries = docketEntries;
  const isSearching = isLoading;

  const renderLinkedText = (text: string) => {
    const parts = text.split(/(Docket #\d+|Motion|Order|Complaint|Exhibit|Answer)/g);
    return (
      <>
        {parts.map((part, i) => {
          if (part.match(/Docket #\d+/)) {
            return <span key={i} className={cn("font-medium cursor-pointer hover:underline px-1 rounded mx-0.5", theme.primary.text, theme.primary.light)} onClick={(e: React.MouseEvent) => { e.stopPropagation(); alert(`Navigating to ${part}`); }}>{part}</span>;
          }
          if (['Motion', 'Order', 'Complaint', 'Exhibit', 'Answer'].includes(part)) {
            return <span key={i} className={cn("font-bold border-b border-dashed cursor-help", theme.text.primary, theme.border.default)} title={`Legal Concept: ${part}`}>{part}</span>;
          }
          return part;
        })}
      </>
    );
  };

  // Show skeleton while loading
  if (isLoading) {
    return (
      <div className="flex flex-col h-full gap-6">
        {!selectedCaseId && <DocketStats />}
        <DocketTableSkeleton rows={15} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-6">
      {!selectedCaseId && <DocketStats />}

      <div className="flex justify-end px-1 gap-2">
        {liveModeToggle.isOpen && liveFeedStatus === 'error' && (
          <button
            onClick={reconnectLiveFeed}
            className={cn("text-xs px-2 py-1 rounded border", theme.status.error.bg, theme.status.error.border, theme.status.error.text)}
          >
            Reconnect Feed
          </button>
        )}
        <button
          onClick={liveModeToggle.toggle}
          className={cn(
            "text-xs flex items-center px-2 py-1 rounded border transition-colors",
            liveModeToggle.isOpen && liveFeedStatus === 'connected' ? "bg-red-50 border-red-200 text-red-600 animate-pulse" :
              liveModeToggle.isOpen && liveFeedStatus === 'connecting' ? "bg-yellow-50 border-yellow-200 text-yellow-600" :
                liveModeToggle.isOpen && liveFeedStatus === 'error' ? "bg-red-100 border-red-300 text-red-700" :
                  cn(theme.surface.default, theme.border.default, theme.text.secondary)
          )}
          title={liveModeToggle.isOpen ? `Status: ${liveFeedStatus}` : 'Enable live feed'}
        >
          <Radio className="h-3 w-3 mr-1" />
          {liveModeToggle.isOpen ?
            liveFeedStatus === 'connected' ? 'Live Feed Active' :
              liveFeedStatus === 'connecting' ? 'Connecting...' :
                liveFeedStatus === 'error' ? 'Connection Error' :
                  'Disconnected'
            : 'Enable Live Feed'}
        </button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
        <DocketFilterPanel
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          activeTab={activeTab} setActiveTab={setActiveTab}
          selectedCaseId={selectedCaseId} setSelectedCaseId={setSelectedCaseId}
          cases={cases}
        />

        <div className={cn("flex-1 rounded-lg border shadow-sm flex flex-col overflow-hidden relative", theme.surface.default, theme.border.default)}>
          {!selectedCaseId ? (
            <div className="flex-1 overflow-auto relative">
              {isSearching && <div className="absolute top-2 right-2 z-10"><Loader2 className={cn("animate-spin h-5 w-5", theme.text.link)} /></div>}
              <DocketTable
                entries={sortedEntries}
                onSelectEntry={openOrbitalEntry}
                onSelectCaseId={setSelectedCaseId}
                showCaseColumn={true}
                onLoadMore={handleLoadMore}
                hasMore={hasMore}
                isLoadingMore={isFetchingMore}
              />
            </div>
          ) : (
            <div className={cn("flex-1 overflow-auto p-0 flex flex-col", theme.surface.default)}>
              <DocketToolbar
                activeCaseTitle={activeCase?.title}
                onAddEntry={addModal.open}
              />

              <div className="flex-1 relative">
                {isSearching && <div className="absolute top-2 right-2 z-10"><Loader2 className={cn("animate-spin h-5 w-5", theme.text.link)} /></div>}
                <DocketTable
                  entries={sortedEntries}
                  onSelectEntry={openOrbitalEntry}
                  onSelectCaseId={() => { }}
                  showCaseColumn={false}
                  onLoadMore={handleLoadMore}
                  hasMore={hasMore}
                  isLoadingMore={isFetchingMore}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={confirmDelete}
        title="Delete Docket Entry"
        message="Are you sure you want to delete this docket entry? This affects the legal record and cannot be undone."
        variant="danger"
        confirmText="Delete Entry"
      />

      {addModal.isOpen && (
        <Modal isOpen={true} onClose={addModal.close} title="New Docket Entry" size="lg">
          <div className="p-6">
            <DocketEntryBuilder
              onSave={handleSaveEntry}
              onCancel={addModal.close}
              caseParties={caseParties}
              initialData={{ caseId: (selectedCaseId || '') as CaseId }}
            />
          </div>
        </Modal>
      )}
    </div>
  );
};
