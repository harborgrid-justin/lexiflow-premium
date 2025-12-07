import { useState, useEffect } from 'react';
import { Case, TimeEntry, TimeEntryPayload, UserId, UUID, CaseId } from '../types';
import { DataService } from '../services/dataService';
import { useSync } from '../context/SyncContext';

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
// FIX: Cast string to branded types
        const newEntry: TimeEntry = { id: `t-${Date.now()}` as UUID, userId: 'current-user' as UserId, ...rawEntry };
        
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
// FIX: Cast string to branded type CaseId
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