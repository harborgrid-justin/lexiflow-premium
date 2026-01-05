
import { useState, useMemo, useDeferredValue } from 'react';
import { MOCK_EVIDENCE } from '../data/mockEvidence.ts';
import { EvidenceItem, ChainOfCustodyEvent } from '../types.ts';

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

export const useEvidenceVault = (initialItems: EvidenceItem[] = MOCK_EVIDENCE) => {
  const [view, setView] = useState<ViewMode>('dashboard');
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [selectedItem, setSelectedItem] = useState<EvidenceItem | null>(null);
  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>(initialItems);
  
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

  const deferredFilters = useDeferredValue(filters);

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
    setEvidenceItems(prev => [newItem, ...prev]);
    setView('inventory');
  };

  const deleteItem = (id: string) => {
    if (confirm('Are you sure you want to permanently delete this evidence item? This action will archive the chain of custody.')) {
        setEvidenceItems(prev => prev.filter(item => item.id !== id));
        if (selectedItem?.id === id) {
            setSelectedItem(null);
            setView('inventory');
        }
    }
  };

  const updateItem = (id: string, updates: Partial<EvidenceItem>) => {
    setEvidenceItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    if (selectedItem?.id === id) {
        setSelectedItem(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const handleCustodyUpdate = (newEvent: ChainOfCustodyEvent) => {
    if (!selectedItem) return;

    const updatedItem = {
      ...selectedItem,
      chainOfCustody: [newEvent, ...selectedItem.chainOfCustody]
    };

    updateItem(selectedItem.id, updatedItem);
  };

  const filteredItems = useMemo(() => {
    return evidenceItems.filter(e => {
      const term = deferredFilters.search.toLowerCase();
      const matchesSearch = !term || e.title.toLowerCase().includes(term) || e.description.toLowerCase().includes(term) || e.id.toLowerCase().includes(term);
      const matchesType = !deferredFilters.type || e.type === deferredFilters.type;
      const matchesAdmissibility = !deferredFilters.admissibility || e.admissibility === deferredFilters.admissibility;
      const matchesCaseId = !deferredFilters.caseId || e.caseId.toLowerCase().includes(deferredFilters.caseId.toLowerCase());
      const matchesCustodian = !deferredFilters.custodian || e.custodian.toLowerCase().includes(deferredFilters.custodian.toLowerCase());
      const matchesDateFrom = !deferredFilters.dateFrom || e.collectionDate >= deferredFilters.dateFrom;
      const matchesDateTo = !deferredFilters.dateTo || e.collectionDate <= deferredFilters.dateTo;
      const matchesLocation = !deferredFilters.location || e.location.toLowerCase().includes(deferredFilters.location.toLowerCase());
      const matchesTags = !deferredFilters.tags || e.tags.some(t => t.toLowerCase().includes(deferredFilters.tags.toLowerCase()));
      const matchesCollectedBy = !deferredFilters.collectedBy || e.collectedBy.toLowerCase().includes(deferredFilters.collectedBy.toLowerCase());
      const matchesBlockchain = !deferredFilters.hasBlockchain || !!e.blockchainHash;

      return matchesSearch && matchesType && matchesAdmissibility && matchesCaseId && matchesCustodian && 
             matchesDateFrom && matchesDateTo && matchesLocation && matchesTags && matchesCollectedBy && matchesBlockchain;
    });
  }, [deferredFilters, evidenceItems]);

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
    handleCustodyUpdate,
    deleteItem,
    updateItem
  };
};
