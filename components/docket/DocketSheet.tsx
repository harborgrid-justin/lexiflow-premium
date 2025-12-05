
import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Trash2, Lock, Eye, CheckSquare, Layers, Calendar as CalendarIcon, FileText, Gavel } from 'lucide-react';
import { Button } from '../common/Button';
import { DataService } from '../../services/dataService';
import { DocketEntry, DocketEntryType, Case } from '../../types';
import { DocketStats } from './DocketStats';
import { DocketFilterPanel } from './DocketFilterPanel';
import { DocketEntryModal } from './DocketEntryModal';
import { DocketEntryBuilder } from './DocketEntryBuilder';
import { DocketTable } from './DocketTable';
import { Modal } from '../common/Modal';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { useQuery, useMutation } from '../../services/queryClient';
import { STORES } from '../../services/db';
import { useWindow } from '../../context/WindowContext';

interface DocketSheetProps {
  filterType: 'all' | 'filings' | 'orders';
}

export const DocketSheet: React.FC<DocketSheetProps> = ({ filterType }) => {
  const { theme } = useTheme();
  const { openWindow, closeWindow } = useWindow();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'filings' | 'orders'>(filterType);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // --- ENTERPRISE DATA ACCESS ---
  const { data: docketEntries = [] } = useQuery<DocketEntry[]>(
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
      // Ensure we have a case ID
      const finalEntry = {
          ...entry,
          caseId: selectedCaseId || entry.caseId,
          // Calculate internal seq if not provided
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

  const filteredEntries = useMemo(() => {
    let data = selectedCaseId 
      ? docketEntries.filter(e => e.caseId === selectedCaseId)
      : docketEntries;

    return data.filter(entry => {
      const matchesSearch = 
        entry.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        entry.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.caseId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTab = 
        activeTab === 'all' ? true :
        activeTab === 'orders' ? entry.type === 'Order' :
        activeTab === 'filings' ? entry.type === 'Filing' : true;
      return matchesSearch && matchesTab;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [searchTerm, activeTab, selectedCaseId, docketEntries]);

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

      <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
        <DocketFilterPanel 
          searchTerm={searchTerm} setSearchTerm={setSearchTerm} 
          activeTab={activeTab} setActiveTab={setActiveTab} 
          selectedCaseId={selectedCaseId} setSelectedCaseId={setSelectedCaseId} 
          cases={cases}
        />

        <div className={cn("flex-1 rounded-lg border shadow-sm flex flex-col overflow-hidden relative", theme.surface, theme.border.default)}>
          {!selectedCaseId ? (
            <div className="flex-1 overflow-auto relative">
              <DocketTable 
                entries={filteredEntries} 
                onSelectEntry={openOrbitalEntry} 
                onSelectCaseId={setSelectedCaseId} 
                showCaseColumn={true}
              />
            </div>
          ) : (
            <div className={cn("flex-1 overflow-auto p-0", theme.surfaceHighlight)}>
                <div className={cn("p-4 border-b flex justify-between items-center bg-white sticky top-0 z-10", theme.border.default)}>
                    <div>
                        <h3 className={cn("font-bold text-lg", theme.text.primary)}>Case Docket</h3>
                        <p className={cn("text-xs", theme.text.secondary)}>Viewing: {activeCase?.title}</p>
                    </div>
                    <Button size="sm" variant="primary" icon={Plus} onClick={() => setIsAddModalOpen(true)}>Add Entry</Button>
                </div>
                
                <DocketTable 
                    entries={filteredEntries} 
                    onSelectEntry={openOrbitalEntry} 
                    onSelectCaseId={() => {}} // No-op, already selected
                    showCaseColumn={false}
                />
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
                    initialData={{ caseId: selectedCaseId || '' }}
                />
              </div>
          </Modal>
      )}
    </div>
  );
};
