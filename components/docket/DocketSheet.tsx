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
import React, { useState, useMemo, useEffect } from 'react';
import { Loader2, Radio } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Components
import { Modal } from '../common/Modal';
import { DocketStats } from './DocketStats';
import { DocketFilterPanel } from './DocketFilterPanel';
import { DocketEntryModal } from './DocketEntryModal';
import { DocketEntryBuilder } from './DocketEntryBuilder';
import { DocketTable } from './DocketTable';
import { DocketToolbar } from './DocketToolbar';

// Internal Dependencies - Hooks & Context
import { useTheme } from '../../context/ThemeContext';
import { useWindow } from '../../context/WindowContext';
import { useWorkerSearch } from '../../hooks/useWorkerSearch';
import { useInterval } from '../../hooks/useInterval';
import { useQuery, useMutation } from '../../services/queryClient';

// Internal Dependencies - Services & Utils
import { DataService } from '../../services/dataService';
import { cn } from '../../utils/cn';
import { STORES } from '../../services/db';

// Types & Interfaces
import { DocketEntry, Case, DocketId, CaseId } from '../../types';

interface DocketSheetProps {
  filterType: 'all' | 'filings' | 'orders';
}

export const DocketSheet: React.FC<DocketSheetProps> = ({ filterType }) => {
  const { theme } = useTheme();
  const { openWindow, closeWindow } = useWindow();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'filings' | 'orders'>(filterType);
  const [isLiveMode, setIsLiveMode] = useState(false);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // --- ENTERPRISE DATA ACCESS ---
  const { data: docketEntries = [], refetch } = useQuery<DocketEntry[]>(
      [STORES.DOCKET, 'all'],
      DataService.docket.getAll
  );

  const { data: cases = [] } = useQuery<Case[]>(
      [STORES.CASES, 'all'],
      DataService.cases.getAll
  );

  // Helper to get parties for the builder
  const activeCase = cases.find(c => c.id === selectedCaseId);
  const caseParties = activeCase?.parties?.map(p => p.name) || [];

  const { mutate: addEntry } = useMutation(
      DataService.docket.add,
      { 
          invalidateKeys: [[STORES.DOCKET, 'all']],
          onSuccess: () => {
              setIsAddModalOpen(false);
          }
      }
  );

  // Live Mode Simulator
  useInterval(() => {
      if (isLiveMode) {
          const randomCase = cases[Math.floor(Math.random() * cases.length)];
          if (randomCase) {
              const entry: DocketEntry = {
                  id: `dk-live-${Date.now()}` as DocketId,
                  sequenceNumber: docketEntries.length + 100,
                  caseId: randomCase.id,
                  date: new Date().toISOString().split('T')[0],
                  type: 'Notice',
                  title: 'LIVE: Notice of Electronic Filing',
                  description: 'System generated notice for simulated live feed activity.',
                  filedBy: 'Court',
                  isSealed: false
              };
              addEntry(entry);
          }
      }
  }, isLiveMode ? 4000 : null);

  const { mutate: deleteEntry } = useMutation(
      DataService.docket.delete,
      {
          invalidateKeys: [[STORES.DOCKET, 'all']]
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

  const handleDeleteEntry = (id: string) => {
      if(confirm("Are you sure you want to delete this docket entry? This affects the legal record.")) {
          deleteEntry(id);
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

  const contextFiltered = useMemo(() => {
    let data = selectedCaseId 
      ? docketEntries.filter(e => e.caseId === selectedCaseId)
      : docketEntries;

    return data.filter(entry => {
      const matchesTab = 
        activeTab === 'all' ? true :
        activeTab === 'orders' ? entry.type === 'Order' :
        activeTab === 'filings' ? entry.type === 'Filing' : true;
      return matchesTab;
    });
  }, [activeTab, selectedCaseId, docketEntries]);

  const { filteredItems: filteredEntries, isSearching } = useWorkerSearch({
      items: contextFiltered,
      query: searchTerm,
      fields: ['title', 'description', 'caseId', 'filedBy']
  });

  const sortedEntries = useMemo(() => {
      return [...filteredEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [filteredEntries]);

  const renderLinkedText = (text: string) => {
    const parts = text.split(/(Docket #\d+|Motion|Order|Complaint|Exhibit|Answer)/g);
    return (
      <>
      {parts.map((part, i) => {
        if (part.match(/Docket #\d+/)) {
          return <span key={i} className={cn("font-medium cursor-pointer hover:underline px-1 rounded mx-0.5", theme.primary.text, theme.primary.light)} onClick={(e) => { e.stopPropagation(); alert(`Navigating to ${part}`); }}>{part}</span>;
        }
        if (['Motion', 'Order', 'Complaint', 'Exhibit', 'Answer'].includes(part)) {
          return <span key={i} className={cn("font-bold border-b border-dashed cursor-help", theme.text.primary, theme.border.default)} title={`Legal Concept: ${part}`}>{part}</span>;
        }
        return part;
      })}
      </>
    );
  };

  return (
    <div className="flex flex-col h-full gap-6">
      {!selectedCaseId && <DocketStats />}
      
      <div className="flex justify-end px-1">
          <button 
            onClick={() => setIsLiveMode(!isLiveMode)}
            className={cn(
                "text-xs flex items-center px-2 py-1 rounded border transition-colors",
                isLiveMode ? "bg-red-50 border-red-200 text-red-600 animate-pulse" : cn(theme.surface.default, theme.border.default, theme.text.secondary)
            )}
          >
              <Radio className="h-3 w-3 mr-1"/> {isLiveMode ? 'Live Feed Active' : 'Enable Live Feed'}
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
               {isSearching && <div className="absolute top-2 right-2 z-10"><Loader2 className={cn("animate-spin h-5 w-5", theme.text.link)}/></div>}
              <DocketTable 
                entries={sortedEntries} 
                onSelectEntry={openOrbitalEntry} 
                onSelectCaseId={setSelectedCaseId} 
                showCaseColumn={true}
              />
            </div>
          ) : (
            <div className={cn("flex-1 overflow-auto p-0 flex flex-col", theme.surface.default)}>
                <DocketToolbar 
                    activeCaseTitle={activeCase?.title}
                    onAddEntry={() => setIsAddModalOpen(true)}
                />
                
                <div className="flex-1 relative">
                    {isSearching && <div className="absolute top-2 right-2 z-10"><Loader2 className={cn("animate-spin h-5 w-5", theme.text.link)}/></div>}
                    <DocketTable 
                        entries={sortedEntries} 
                        onSelectEntry={openOrbitalEntry} 
                        onSelectCaseId={() => {}} 
                        showCaseColumn={false}
                    />
                </div>
            </div>
          )}
        </div>
      </div>

      {isAddModalOpen && (
          <Modal isOpen={true} onClose={() => setIsAddModalOpen(false)} title="New Docket Entry" size="lg">
              <div className="p-6">
                <DocketEntryBuilder 
                    onSave={handleSaveEntry}
                    onCancel={() => setIsAddModalOpen(false)}
                    caseParties={caseParties}
                    initialData={{ caseId: (selectedCaseId || '') as CaseId }}
                />
              </div>
          </Modal>
      )}
    </div>
  );
};
