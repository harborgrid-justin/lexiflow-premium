
import React, { useState, useEffect } from 'react';
import { Case, TimeEntry, TimeEntryPayload, Party } from '../../../types';
import { Users } from 'lucide-react';
import { Button } from '../../common/Button';
import { MatterInfo } from './MatterInfo';
import { ActiveWorkstreams } from './ActiveWorkstreams';
import { OverviewSidebar } from './OverviewSidebar';
import { CaseOverviewStats } from './CaseOverviewStats';
import { CaseOverviewModals } from './CaseOverviewModals';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../common/Table';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import { DataService } from '../../../services/dataService';
import { useSync } from '../../../context/SyncContext';
import { useQuery } from '../../../services/queryClient';
import { STORES } from '../../../services/db';

interface CaseOverviewProps {
  caseData: Case;
  onTimeEntryAdded: (entry: TimeEntry) => void;
  onNavigateToCase?: (c: Case) => void;
}

export const CaseOverview: React.FC<CaseOverviewProps> = ({ caseData, onTimeEntryAdded, onNavigateToCase }) => {
  const { theme } = useTheme();
  const { performMutation } = useSync();
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  
  const [linkedCases, setLinkedCases] = useState<Case[]>([]);
  const [availableCases, setAvailableCases] = useState<Case[]>([]);
  
  const { data: parties = [] } = useQuery<Party[]>(
      [STORES.CASES, caseData.id, 'parties'],
      () => DataService.cases.getParties(caseData.id),
      { initialData: caseData.parties || [] }
  );

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

  const activeProjects = caseData.projects?.filter(p => p.status === 'Active') || [];
  
  const handleSaveTime = (rawEntry: TimeEntryPayload) => {
      const newEntry: TimeEntry = { id: `t-${Date.now()}`, userId: 'current-user', ...rawEntry };
      
      // Use SyncContext for offline-tolerant submission
      performMutation(
          'BILLING_LOG',
          newEntry,
          () => DataService.billing.addTimeEntry(newEntry)
      );
      
      // Optimistically update UI immediately
      onTimeEntryAdded(newEntry);
  };

  const handleLinkCase = (c: Case) => {
      if (linkedCases.find(lc => lc.id === c.id)) return;
      setLinkedCases([...linkedCases, c]);
  };

  const handleTransferToAppeal = async () => {
      const appealCase: Case = {
          ...caseData,
          id: `APP-${Date.now()}`,
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

  return (
    <div className="space-y-6">
      <CaseOverviewModals 
          caseData={caseData}
          showTimeModal={showTimeModal} setShowTimeModal={setShowTimeModal}
          showLinkModal={showLinkModal} setShowLinkModal={setShowLinkModal}
          showTransferModal={showTransferModal} setShowTransferModal={setShowTransferModal}
          availableCases={availableCases}
          onSaveTime={handleSaveTime}
          onLinkCase={handleLinkCase}
          onTransfer={handleTransferToAppeal}
      />
      
      <CaseOverviewStats />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2 space-y-6">
            <MatterInfo caseData={caseData} />
            <ActiveWorkstreams activeProjects={activeProjects} />
            
            <div className={cn("p-6 rounded-lg shadow-sm border", theme.surface, theme.border.default)}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className={cn("text-lg font-bold flex items-center", theme.text.primary)}>
                        <Users className={cn("h-5 w-5 mr-2", theme.text.secondary)}/> Key Parties
                    </h3>
                    <Button variant="ghost" size="sm" className={theme.primary.text}>View All</Button>
                </div>
                <TableContainer responsive="card" className="shadow-none border-0 rounded-none">
                    <TableHeader><TableHead>Role</TableHead><TableHead>Entity Name</TableHead><TableHead>Type</TableHead></TableHeader>
                    <TableBody>
                        {parties.slice(0, 4).map(p => (
                            <TableRow key={p.id}>
                                <TableCell className={cn("text-sm font-medium", theme.text.primary)}>{p.role}</TableCell>
                                <TableCell className={cn("text-sm", theme.text.secondary)}>{p.name}</TableCell>
                                <TableCell><span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium", theme.surfaceHighlight, theme.text.secondary)}>{p.type}</span></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </TableContainer>
                {(!parties || parties.length === 0) && <div className={cn("text-center py-4 italic text-sm", theme.text.tertiary)}>No parties listed.</div>}
            </div>
        </div>

        <div className="space-y-6">
            <OverviewSidebar 
                caseData={caseData} 
                linkedCases={linkedCases}
                onShowTimeModal={() => setShowTimeModal(true)}
                onShowLinkModal={() => setShowLinkModal(true)}
                onShowTransferModal={() => setShowTransferModal(true)}
                onNavigateToCase={onNavigateToCase}
            />
        </div>
      </div>
    </div>
  );
};