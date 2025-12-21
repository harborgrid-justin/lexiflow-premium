/**
 * @module hooks/useCaseOverview
 * @category Hooks - Case Management
 * @description Case overview management hook with time tracking, case linking, and appeal transfer workflows.
 * Manages time entry modal, linked cases modal, transfer modal states, loads related cases, and provides
 * handlers for time logging (with SyncEngine mutation), case linking, and appeal case creation with
 * automatic navigation prompt.
 * 
 * NO THEME USAGE: Business logic hook for case overview operations
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { useState, useEffect } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { DataService } from '../services/data/dataService';

// Hooks & Context
import { useSync } from './useSync';

// Types
import { Case, TimeEntry, TimeEntryPayload, UserId, UUID, CaseId } from '../types';

// ============================================================================
// HOOK
// ============================================================================
export const useCaseOverview = (caseData: Case, onTimeEntryAdded: (entry: TimeEntry) => void, onNavigateToCase?: (c: Case) => void) => {
    const { performMutation } = useSync();
    const [showTimeModal, setShowTimeModal] = useState(false);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);
    
    const [linkedCases, setLinkedCases] = useState<Case[]>([]);
    const [availableCases, setAvailableCases] = useState<Case[]>([]);

    useEffect(() => {
        const loadRelated = async () => {
            const allCases = await DataService.cases.getAll();
            const linked = allCases.filter(c => caseData.linkedCaseIds?.includes(c.id));
            setLinkedCases(linked);
            const available = allCases.filter(c => c.id !== caseData.id && !caseData.linkedCaseIds?.includes(c.id));
            setAvailableCases(available);
        };
        loadRelated();
    }, [caseData]);

    const handleSaveTime = (rawEntry: TimeEntryPayload) => {
        const newEntry: TimeEntry = { 
            ...rawEntry,
            id: `t-${Date.now()}` as UUID, 
            userId: 'current-user' as UserId,
            billable: true,
            caseId: caseData.id,
        };
        
        performMutation('BILLING_LOG', newEntry, () => DataService.billing.addTimeEntry(newEntry));
        
        onTimeEntryAdded(newEntry);
    };

    const handleLinkCase = (c: Case) => {
        if (linkedCases.find(lc => lc.id === c.id)) return;
        setLinkedCases([...linkedCases, c]);
        // Here you would also call a mutation to update the caseData in the DB
    };

    const handleTransferToAppeal = async () => {
        const appealCase: Case = {
            ...caseData,
            id: `APP-${Date.now()}` as CaseId,
            title: `Appeal: ${caseData.title}`,
            matterType: 'Appeal',
            status: 'Appeal' as any,
            jurisdiction: 'Appellate Court',
            court: 'Circuit Court of Appeals',
            filingDate: new Date().toISOString().split('T')[0],
            linkedCaseIds: [caseData.id, ...(caseData.linkedCaseIds || [])]
        };
        
        try {
            await DataService.cases.add(appealCase);
            setLinkedCases([...linkedCases, appealCase]);
            setShowTransferModal(false);
            if (confirm(`Appeal case created: ${appealCase.title}. Switch to new matter?`)) {
                if (onNavigateToCase) onNavigateToCase(appealCase);
            }
        } catch (e) {
            alert("Failed to create appeal case.");
        }
    };

    return {
        showTimeModal, setShowTimeModal,
        showLinkModal, setShowLinkModal,
        showTransferModal, setShowTransferModal,
        linkedCases,
        availableCases,
        handleSaveTime,
        handleLinkCase,
        handleTransferToAppeal
    };
};
