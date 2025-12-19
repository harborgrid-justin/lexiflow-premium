/**
 * @module hooks/useEvidenceVault
 * @category Hooks - Evidence Management
 * @description Evidence vault management hook with view routing, comprehensive filtering, chain of custody
 * updates, and intake workflow. Manages evidence inventory, detail views, tab navigation, and multi-field
 * filtering (search, type, admissibility, custodian, date range, location, tags, blockchain). Provides
 * mutations for add/update with cache invalidation and optimistic UI updates.
 * 
 * NO THEME USAGE: Business logic hook for evidence vault operations
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { useState, useMemo, useEffect } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { DataService } from '../services/data/dataService';
import { useQuery, useMutation, queryClient } from './useQueryHooks';
import { STORES } from '../services/data/db';

// Types
import { EvidenceItem, ChainOfCustodyEvent, CaseId } from '../types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
export type ViewMode = 
  'dashboard' | 'inventory' | 'custody' | 'intake' | 'detail' | 
  'authentication' | 'relevance' | 'hearsay' | 'experts' | 'originals';
  
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

// ============================================================================
// HOOK
// ============================================================================
export const useEvidenceVault = (caseId?: string) => {
  const [view, setView] = useState<ViewMode>('dashboard');
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [selectedItem, setSelectedItem] = useState<EvidenceItem | null>(null);
  
  // Enterprise Query: Fetch evidence. If caseId provided, filter at source or via selector.
  // Here we fetch all and filter client-side for the demo, but in prod this would be a specific API call.
  const { data: allEvidenceItems = [], isLoading } = useQuery<EvidenceItem[]>(
      [STORES.EVIDENCE, 'all'],
      DataService.evidence.getAll
  );

  const evidenceItems = useMemo(() => {
      if (!caseId) return allEvidenceItems;
      return allEvidenceItems.filter(e => e.caseId === caseId);
  }, [allEvidenceItems, caseId]);

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
    caseId: caseId || '', // Pre-fill filter if scoped
    custodian: '',
    dateFrom: '',
    dateTo: '',
    location: '',
    tags: '',
    collectedBy: '',
    hasBlockchain: false
  });

  // Ensure filter stays synced if caseId changes prop
  useEffect(() => {
      if(caseId) setFilters(f => ({ ...f, caseId }));
  }, [caseId]);

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
    // If we are in a scoped case view, ensure the new item belongs to it
    if (caseId) newItem.caseId = caseId as CaseId;
    
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
      // If caseId is passed as prop, we already filtered 'evidenceItems', so we can ignore the filter input for caseId or enforce it matches
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
    handleCustodyUpdate,
    isLoading
  };
};

