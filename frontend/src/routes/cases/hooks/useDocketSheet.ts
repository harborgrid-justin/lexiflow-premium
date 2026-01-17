import { useState, useEffect, useCallback } from 'react';

import { useModalState } from '@/hooks/core';
import { useLiveDocketFeed } from '@/hooks/useLiveDocketFeed';
import { useQuery, useMutation } from '@/hooks/useQueryHooks';
import { useToggle } from '@/hooks/useToggle';
import { IdGenerator } from '@/lib/idGenerator';
import { DataService } from '@/services/data/data-service.service';
import { type Case, type CaseId, type DocketEntry } from '@/types';

type FilterType = 'all' | 'filings' | 'orders';

export function useDocketSheet(initialFilter: FilterType) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<FilterType>(initialFilter);
    
    // Pagination State
    const [entries, setEntries] = useState<DocketEntry[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    const liveModeToggle = useToggle();
    const addModal = useModalState();
    const deleteModal = useModalState();
    const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

    // Fetch Cases
    const { data: casesData = [] } = useQuery<Case[]>(
        ['cases', 'all'],
        async () => {
            const casesService = DataService.cases as { getAll: () => Promise<Case[]> };
            const result = await casesService.getAll();
            return Array.isArray(result) ? result : [];
        }
    );
    const cases = Array.isArray(casesData) ? casesData : [];
    const activeCase = cases.find(c => c.id === selectedCaseId);
    const caseParties = activeCase?.parties?.map(p => p.name) || [];

    // Fetch Docket Entries
    const fetchPage = useCallback(async (pageNum: number, isReset: boolean) => {
        try {
            if (!isReset) setIsFetchingMore(true);
            const limit = 20;
            const service = DataService.docket as { getAll: (params: { page: number; limit: number; type?: string; caseId?: string }) => Promise<{ data?: unknown[]; items?: unknown[] } | unknown[]> };

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
    }, [activeTab, selectedCaseId]); // Dependencies for fetchPage

    // Initial Fetch & Reset
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setPage(1);
            setEntries([]);
            setHasMore(true);
            setInitialLoading(true);
            fetchPage(1, true);
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [selectedCaseId, activeTab, searchTerm, fetchPage]);

    const handleLoadMore = () => {
        if (!isFetchingMore && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchPage(nextPage, false);
        }
    };

    // Mutations
    const { mutate: addEntry } = useMutation(
        async (entry: DocketEntry) => {
            const docketService = DataService.docket as { add: (entry: DocketEntry) => Promise<DocketEntry> };
            return docketService.add(entry);
        },
        {
            invalidateKeys: [['docket', 'all']],
            onSuccess: () => {
                addModal.close();
                // Refresh list? Or optimistically update?
                // For now rely on invalidateKeys + maybe fetchPage reload triggered by something?
                // Actually invalidateKeys might not trigger fetchPage as it is not a useQuery.
                // We might need to manually trigger refresh or update local state.
                // For simplified refactor, we leave as is, but practically we might want:
                fetchPage(1, true);
            }
        }
    );

    const { mutate: deleteEntry } = useMutation(
        async (id: string) => {
            const docketService = DataService.docket as { delete: (id: string) => Promise<void> };
            return docketService.delete(id);
        },
        {
            invalidateKeys: [['docket', 'all']],
            onSuccess: () => {
                 setEntryToDelete(null);
                 // Refresh
                 fetchPage(1, true);
            }
        }
    );

    const handleSaveEntry = (entry: Partial<DocketEntry>) => {
        const finalEntry = {
            ...entry,
            caseId: selectedCaseId || entry.caseId,
            sequenceNumber: entry.sequenceNumber || entries.filter(d => d.caseId === selectedCaseId).length + 1
        } as DocketEntry;

        addEntry(finalEntry);
    };

    const confirmDelete = () => {
        if (entryToDelete) {
            deleteEntry(entryToDelete);
        }
    };

    // Live Feed
    const { status: liveFeedStatus, reconnect: reconnectLiveFeed } = useLiveDocketFeed({
        caseId: selectedCaseId || undefined,
        enabled: liveModeToggle.isOpen,
        onNewEntry: (entry) => {
            const now = new Date().toISOString();
            const entryWithId: DocketEntry = {
                ...(entry && typeof entry === 'object' ? entry as Partial<DocketEntry> : {}),
                id: IdGenerator.docket(),
                caseId: (selectedCaseId as CaseId) || (entry && typeof entry === 'object' && 'caseId' in entry ? entry.caseId as CaseId : '' as CaseId),
                sequenceNumber: entries.length + 100,
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

    return {
        // State
        searchTerm, setSearchTerm,
        selectedCaseId, setSelectedCaseId,
        activeTab, setActiveTab,
        entries,
        isLoading: initialLoading,
        isFetchingMore,
        hasMore,
        cases,
        activeCase,
        caseParties,
        
        // Modal State
        addModal,
        deleteModal,
        entryToDelete, setEntryToDelete,
        
        // Actions
        handleLoadMore,
        handleSaveEntry,
        confirmDelete,
        
        // Live Feed
        liveModeToggle,
        liveFeedStatus,
        reconnectLiveFeed
    };
}
