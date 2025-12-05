
import { useState, useMemo } from 'react';
import { DataService } from '../services/dataService';
import { EvidenceItem, ChainOfCustodyEvent } from '../types';
import { useQuery, useMutation, queryClient } from '../services/queryClient';
import { STORES } from '../services/db';

export type ViewMode = 'dashboard' | 'inventory' | 'custody' | 'intake' | 'detail';
export type DetailTab = 'overview' | 'custody' | 'admissibility' | 'forensics';

export interface EvidenceFilters {
  search: string;
  type: string;
  admissibility: string;
  caseId: string;
  custodian: string;
  dateFrom: string;
  dateTo: string;
  location: string;
  tags: string;
  collectedBy: string;
  hasBlockchain: boolean;
}

export const useEvidenceVault = () => {
  const [view, setView] = useState<ViewMode>('dashboard');
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [selectedItem, setSelectedItem] = useState<EvidenceItem | null>(null);
  
  // Enterprise Query: Fetch evidence with caching
  const { data: evidenceItems = [] } = useQuery<EvidenceItem[]>(
      [STORES.EVIDENCE, 'all'],
      DataService.evidence.getAll
  );

  // Mutations for transactional integrity
  const { mutate: addEvidence } = useMutation(
      DataService.evidence.add,
      { invalidateKeys: [[STORES.EVIDENCE, 'all']] }
  );

  const { mutate: updateEvidence } = useMutation(
      (item: EvidenceItem) => DataService.evidence.update(item.id, item),
      { invalidateKeys: [[STORES.EVIDENCE, 'all']] }
  );
  
  const [filters, setFilters] = useState<EvidenceFilters>({
    search: '',
    type: '',
    admissibility: '',
    caseId: '',
    custodian: '',
    dateFrom: '',
    dateTo: '',
    location: '',
    tags: '',
    collectedBy: '',
    hasBlockchain: false
  });

  const handleItemClick = (item: EvidenceItem) => {
    setSelectedItem(item);
    setView('detail');
    setActiveTab('overview');
  };

  const handleBack = () => {
    setSelectedItem(null);
    setView('inventory');
  };

  const handleIntakeComplete = (newItem: EvidenceItem) => {
    addEvidence(newItem);
    alert("Item logged successfully."); 
    setView('inventory');
  };

  const handleCustodyUpdate = (newEvent: ChainOfCustodyEvent) => {
    if (!selectedItem) return;

    const updatedItem = {
      ...selectedItem,
      chainOfCustody: [newEvent, ...selectedItem.chainOfCustody]
    };
    
    // Update local selected item immediately for UI responsiveness
    setSelectedItem(updatedItem);
    // Persist update via mutation
    updateEvidence(updatedItem);
  };

  const filteredItems = useMemo(() => {
    return evidenceItems.filter(e => {
      const matchesSearch = !filters.search || e.title.toLowerCase().includes(filters.search.toLowerCase()) || e.description.toLowerCase().includes(filters.search.toLowerCase());
      const matchesType = !filters.type || e.type === filters.type;
      const matchesAdmissibility = !filters.admissibility || e.admissibility === filters.admissibility;
      const matchesCaseId = !filters.caseId || e.caseId.toLowerCase().includes(filters.caseId.toLowerCase());
      const matchesCustodian = !filters.custodian || e.custodian.toLowerCase().includes(filters.custodian.toLowerCase());
      const matchesDateFrom = !filters.dateFrom || e.collectionDate >= filters.dateFrom;
      const matchesDateTo = !filters.dateTo || e.collectionDate <= filters.dateTo;
      const matchesLocation = !filters.location || e.location.toLowerCase().includes(filters.location.toLowerCase());
      const matchesTags = !filters.tags || e.tags.some(t => t.toLowerCase().includes(filters.tags.toLowerCase()));
      const matchesCollectedBy = !filters.collectedBy || e.collectedBy.toLowerCase().includes(filters.collectedBy.toLowerCase());
      const matchesBlockchain = !filters.hasBlockchain || !!e.blockchainHash;

      return matchesSearch && matchesType && matchesAdmissibility && matchesCaseId && matchesCustodian && 
             matchesDateFrom && matchesDateTo && matchesLocation && matchesTags && matchesCollectedBy && matchesBlockchain;
    });
  }, [filters, evidenceItems]);

  return {
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
  };
};
