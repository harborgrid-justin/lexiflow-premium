import { useTheme } from '@/theme';
import { useModalState } from '@/hooks/useModalState';
import { useNotify } from '@/hooks/useNotify';
import { queryClient, useMutation } from '@/hooks/useQueryHooks';
import { useSort } from '@/hooks/useSort';
import { DataService } from '@/services/data/dataService';
import { useToggle } from '@/shared/hooks/useToggle';
import { Case } from '@/types';
import { queryKeys } from '@/utils/queryKeys';
import React, { useCallback } from 'react';

export const useCaseListActive = (filteredCases: Case[]) => {
    const { theme } = useTheme();
    const notify = useNotify();
    const { isOpen: showFilters, toggle: toggleFilters } = useToggle(false);
    const archiveModal = useModalState();
    const [archiveCaseData, setArchiveCaseData] = React.useState<Case | null>(null);

    const { items: sortedCases, requestSort, sortConfig } = useSort(filteredCases as unknown as Record<string, unknown>[], 'filingDate', 'desc');

    const { mutate: archiveCase } = useMutation(
        DataService.cases.archive,
        {
            onSuccess: () => {
                notify.success("Case archived successfully");
                queryClient.invalidate(queryKeys.cases.all());
            }
        }
    );

    const { mutate: flagCase } = useMutation(
        DataService.cases.flag,
        {
            onSuccess: () => {
                notify.warning("Case flagged for risk review");
            }
        }
    );

    const prefetchCaseDetails = useCallback((caseId: string) => {
        try {
            if (DataService.documents?.getByCaseId) {
                queryClient.fetch(['documents', caseId], () => DataService.documents.getByCaseId(caseId));
            }
        } catch {
            // Silently fail
        }
    }, []);

    const handleArchiveCase = (c: Case) => {
        setArchiveCaseData(c);
        archiveModal.open();
    };

    const confirmArchive = () => {
        if (archiveCaseData) {
            archiveCase(archiveCaseData.id);
            setArchiveCaseData(null);
        }
    };

    const handleFlagCase = (c: Case) => {
        flagCase(c.id);
    };

    return {
        theme,
        showFilters,
        toggleFilters,
        archiveModal,
        archiveCaseData,
        sortedCases: sortedCases as unknown as Case[],
        requestSort,
        sortConfig,
        prefetchCaseDetails,
        handleArchiveCase,
        confirmArchive,
        handleFlagCase
    };
};
