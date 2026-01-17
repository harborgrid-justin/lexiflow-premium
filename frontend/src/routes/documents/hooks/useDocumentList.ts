import { useState } from 'react';

import { type LegalDocument } from '@/types/documents';

import { sortDocuments } from '../utils/documentUtils';

import { useSortableList } from './useSortableList';

export function useDocumentList(documents: LegalDocument[], viewMode: 'grid' | 'list') {
    const itemsPerPage = viewMode === 'grid' ? 12 : 20;
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const {
        paginatedItems,
        sortConfig,
        handleSort,
        currentPage,
        totalPages,
        setCurrentPage
    } = useSortableList(documents, 'lastModified', itemsPerPage, sortDocuments);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const toggleSelection = (id: string) => {
        const newSelection = new Set(selectedIds);
        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else {
            newSelection.add(id);
        }
        setSelectedIds(newSelection);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === documents.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(documents.map(d => d.id)));
        }
    };

    return {
        paginatedDocuments: paginatedItems,
        sortConfig,
        handleSort,
        currentPage,
        totalPages,
        setCurrentPage,
        startIndex,
        endIndex,
        selectedIds,
        setSelectedIds,
        toggleSelection,
        toggleSelectAll
    };
}
