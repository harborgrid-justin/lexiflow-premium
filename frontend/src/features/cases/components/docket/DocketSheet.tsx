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
import React, { useEffect, useState } from 'react';

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
import { useTheme } from '@/contexts/theme/ThemeContext';
import { useModalState } from '@/hooks/core';
import { useLiveDocketFeed } from '@/hooks/useLiveDocketFeed';
import { useMutation, useQuery } from '@/hooks/useQueryHooks';
import { useToggle } from '@/shared/hooks/useToggle';
import { useWindow } from '@/providers';

// Internal Dependencies - Services & Utils
import { DataService } from '@/services/data/dataService';
import { cn } from '@/shared/lib/cn';
import { IdGenerator } from '@/shared/lib/idGenerator';

// Types & Interfaces
import { Case, CaseId, DocketEntry } from '@/types';

interface DocketSheetProps {
  filterType: 'all' | 'filings' | 'orders';
}

export const DocketSheet: React.FC<DocketSheetProps> = ({ filterType }) => {
  const { theme } = useTheme();
  const { openWindow, closeWindow } = useWindow();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'filings' | 'orders'>(filterType);
  const liveModeToggle = useToggle();

  // Defer search term for better typing responsiveness
  // const deferredSearchTerm = useDeferredValue(searchTerm);

  const addModal = useModalState();
  const deleteModal = useModalState();
  const [entryToDelete, setEntryToDelete] = React.useState<string | null>(null);

  // --- PAGINATION STATE ---
  const [entries, setEntries] = useState<DocketEntry[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Fetch logic
  const fetchPage = async (pageNum: number, isReset: boolean) => {
    try {
      if (!isReset) setIsFetchingMore(true);
      const limit = 20;
      const service = DataService.docket as { getAll: (params: { page: number; limit: number; type?: string; caseId?: string }) => Promise<{ data?: unknown[]; items?: unknown[] } | unknown[]> };

      // Determine type filter
      let typeFilter: string | undefined = undefined;
      if (activeTab === 'orders') typeFilter = 'Order';
      else if (activeTab === 'filings') typeFilter = 'Filing';

      const result = await service.getAll({
        page: pageNum,
        limit,
        caseId: selectedCaseId || undefined,
        type: typeFilter
      });

      const newEntries = Array.isArray(result) ? result : (result.data || []);

      setEntries(prev => isReset ? (newEntries as DocketEntry[]) : [...prev, ...(newEntries as DocketEntry[])]);
      setHasMore(newEntries.length === limit);
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetchingMore(false);
      setInitialLoading(false);
    }
  };

  // Reset and fetch when filters change
  useEffect(() => {
    // Debounce search slightly or just fire. For now direct effect.
    const timeoutId = setTimeout(() => {
      setPage(1);
      setEntries([]);
      setHasMore(true);
      setInitialLoading(true);
      fetchPage(1, true);
    }, 300);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCaseId, activeTab, searchTerm]);

  const handleLoadMore = () => {
    if (!isFetchingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPage(nextPage, false);
    }
  };

  const docketEntries = entries; // Compatibility alias
  const isLoading = initialLoading; // Compatibility alias

  const { data: casesData = [] } = useQuery<Case[]>(
    ['cases', 'all'],
    async () => {
      const casesService = DataService.cases as { getAll: () => Promise<Case[]> };
      const result = await casesService.getAll();
      return Array.isArray(result) ? result : [];
    }
  );

  // Ensure cases is always an array
  const cases = Array.isArray(casesData) ? casesData : [];

  // Helper to get parties for the builder
  const activeCase = cases.find(c => c.id === selectedCaseId);
  const caseParties = activeCase?.parties?.map(p => p.name) || [];

  const { mutate: addEntry } = useMutation(
    async (entry: DocketEntry) => {
      const docketService = DataService.docket as { add: (entry: DocketEntry) => Promise<DocketEntry> };
      return docketService.add(entry);
    },
    {
      invalidateKeys: [['docket', 'all']],
      onSuccess: () => {
        addModal.close();
      }
    }
  );

  // Live Feed with WebSocket connection management
  const { status: liveFeedStatus, reconnect: reconnectLiveFeed } = useLiveDocketFeed({
    caseId: selectedCaseId || undefined,
    enabled: liveModeToggle.isOpen,
    onNewEntry: (entry) => {
      // Use type-safe ID generation and ensure all required fields are present
      const now = new Date().toISOString();
      const entryWithId: DocketEntry = {
        ...(entry && typeof entry === 'object' ? entry as Partial<DocketEntry> : {}),
        id: IdGenerator.docket(),
        caseId: (selectedCaseId as CaseId) || (entry && typeof entry === 'object' && 'caseId' in entry ? entry.caseId as CaseId : '' as CaseId),
        sequenceNumber: docketEntries.length + 100,
        dateFiled: now.split('T')[0],
        entryDate: now.split('T')[0],
        description: entry && typeof entry === 'object' && 'description' in entry ? String(entry.description) : 'New Entry',
        type: entry && typeof entry === 'object' && 'type' in entry ? entry.type as DocketEntry['type'] : 'Notice',
        createdAt: now,
        updatedAt: now
      } as DocketEntry;
      addEntry(entryWithId);
    },
    reconnectInterval: 5000,
    maxReconnectAttempts: 5
  });

  const { mutate: deleteEntry } = useMutation(
    async (id: string) => {
      const docketService = DataService.docket as { delete: (id: string) => Promise<void> };
      return docketService.delete(id);
    },
    {
      invalidateKeys: [['docket', 'all']]
    }
  );

  // Sync filter prop to internal state
  useEffect(() => {
    setActiveTab(filterType);
  }, [filterType]);

  const handleSaveEntry = (entry: Partial<DocketEntry>) => {
    const finalEntry = {
      ...entry,
      caseId: selectedCaseId || entry.caseId,
      sequenceNumber: entry.sequenceNumber || docketEntries.filter(d => d.caseId === selectedCaseId).length + 1
    } as DocketEntry;

    addEntry(finalEntry);
  };

  const confirmDelete = () => {
    if (entryToDelete) {
      deleteEntry(entryToDelete);
      setEntryToDelete(null);
    }
  };

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

  // Filters are now handled server-side in fetchPage
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
