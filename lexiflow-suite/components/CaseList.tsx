
import React, { useState, useTransition, useMemo } from 'react';
import { Case } from '../types.ts';
import { 
  Plus, Briefcase, UserPlus, ShieldAlert, Users, Calendar, CheckSquare,
  DollarSign, Gavel, Mic2, FileCheck, Archive, FileInput
} from 'lucide-react';
import { PageHeader } from './common/PageHeader.tsx';
import { Button } from './common/Button.tsx';
import { Modal } from './common/Modal.tsx';
import { TabNavigation } from './common/TabNavigation.tsx';
import { CaseListActive } from './case-list/CaseListActive.tsx';
import { CaseListIntake } from './case-list/CaseListIntake.tsx';
import { CaseListDocket } from './case-list/CaseListDocket.tsx';
import { CaseListResources } from './case-list/CaseListResources.tsx';
import { CaseListTrust } from './case-list/CaseListTrust.tsx';
import { CaseListExperts } from './case-list/CaseListExperts.tsx';
import { 
  CaseListConflicts, CaseListTasks, CaseListReporters, 
  CaseListClosing, CaseListArchived 
} from './case-list/CaseListMisc.tsx';
import { DocketImportModal } from './DocketImportModal.tsx';
import { useData } from '../hooks/useData.ts';

interface CaseListProps {
  onSelectCase: (c: Case) => void;
}

type CaseView = 
  'active' | 'docket' | 'tasks' | 'intake' | 'conflicts' | 
  'resources' | 'trust' | 'experts' | 'reporters' | 'closing' | 'archived';

export const CaseList: React.FC<CaseListProps> = ({ onSelectCase }) => {
  const cases = useData(s => s.cases);
  const isLoading = useData(s => s.isLoading);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [view, setView] = useState<CaseView>('active');
  const [isDocketModalOpen, setIsDocketModalOpen] = useState(false);
  
  const [isPending, startTransition] = useTransition();

  const handleDocketImport = (data: any) => {
    alert(`Successfully imported case: ${data.caseInfo?.title}. Created ${data.parties?.length} parties and ${data.docketEntries?.length} docket entries.`);
  };

  const handleViewChange = (newView: string) => {
      startTransition(() => {
          setView(newView as CaseView);
      });
  };

  const menuItems = useMemo(() => [
    { id: 'active', label: 'Matters', icon: Briefcase },
    { id: 'docket', label: 'Docket', icon: Calendar },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'intake', label: 'Intake', icon: UserPlus },
    { id: 'conflicts', label: 'Conflicts', icon: ShieldAlert },
    { id: 'resources', label: 'Staffing', icon: Users },
    { id: 'trust', label: 'Trust', icon: DollarSign },
    { id: 'experts', label: 'Experts', icon: Gavel },
    { id: 'reporters', label: 'Reporters', icon: Mic2 },
    { id: 'closing', label: 'Closing', icon: FileCheck },
    { id: 'archived', label: 'Archive', icon: Archive },
  ], []);

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-fade-in relative group/container">
      {/* Component ID */}
      <div className="absolute top-2 right-6 z-50">
        <span className="bg-slate-900 text-blue-400 font-mono text-[10px] font-black px-2 py-1 rounded border border-slate-700 shadow-xl opacity-0 group-hover/container:opacity-100 transition-opacity">
          CM-01
        </span>
      </div>

      <div className="shrink-0 px-6 pt-6 pb-2">
        <PageHeader 
            title="Case Management" 
            subtitle="Manage matters, intake, and firm operations."
            actions={
            <div className="flex gap-3">
                <Button variant="secondary" icon={FileInput} onClick={() => setIsDocketModalOpen(true)}>Import Docket</Button>
                <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} className="shadow-lg shadow-blue-500/20">New Matter</Button>
            </div>
            }
        />

        <TabNavigation 
            tabs={menuItems} 
            activeTab={view} 
            onTabChange={handleViewChange}
            className="bg-white rounded-lg border border-slate-200 p-1 shadow-sm"
        />
      </div>

      <div className={`flex-1 min-h-0 overflow-y-auto p-6 pt-4 transition-opacity duration-300 ${isPending ? 'opacity-60' : 'opacity-100'}`}>
        {view === 'active' && (
          <CaseListActive 
            cases={cases}
            onSelectCase={onSelectCase}
            isLoading={isLoading}
          />
        )}
        {view === 'intake' && <CaseListIntake isLoading={isLoading} />}
        {view === 'docket' && <CaseListDocket isLoading={isLoading} />}
        {view === 'resources' && <CaseListResources isLoading={isLoading} />}
        {view === 'trust' && <CaseListTrust isLoading={isLoading} />}
        {view === 'experts' && <CaseListExperts isLoading={isLoading} />}
        {view === 'conflicts' && <CaseListConflicts />}
        {view === 'tasks' && <CaseListTasks isLoading={isLoading} />}
        {view === 'reporters' && <CaseListReporters />}
        {view === 'closing' && <CaseListClosing />}
        {view === 'archived' && <CaseListArchived />}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Matter Wizard" size="sm">
        <div className="p-8">
          <p className="text-sm text-slate-500 mb-6">Select a practice area to apply the correct workflow template.</p>
          <div className="space-y-3">
            {['Litigation', 'M&A', 'IP', 'Real Estate'].map((type) => (
              <button key={type} onClick={() => setIsModalOpen(false)} 
                className="w-full text-left p-4 border-2 border-slate-100 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-all flex items-center group">
                <div className="p-2 bg-white rounded-lg border border-slate-100 group-hover:border-blue-200 mr-4 shadow-sm">
                  <Briefcase className="h-5 w-5 text-slate-400 group-hover:text-blue-500" />
                </div>
                <span className="font-bold text-slate-700 group-hover:text-blue-700">{type} Protocol</span>
              </button>
            ))}
          </div>
        </div>
      </Modal>

      <DocketImportModal 
        isOpen={isDocketModalOpen} 
        onClose={() => setIsDocketModalOpen(false)} 
        onImport={handleDocketImport}
      />
    </div>
  );
};
