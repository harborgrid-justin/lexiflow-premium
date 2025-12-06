import React, { useState, useMemo, Suspense, lazy } from 'react';
import { Case, ParsedDocket, CaseStatus, AppView } from '../types';
import { 
  Briefcase, UserPlus, ShieldAlert, Users, Calendar, CheckSquare,
  DollarSign, Gavel, Mic2, FileCheck, Archive, FileInput,
  LayoutDashboard, Layers, Plus
} from 'lucide-react';
import { Button } from './common/Button';
import { useCaseList } from '../hooks/useCaseList';
import { DocketImportModal } from './DocketImportModal';
import { CreateCaseModal } from './case-list/CreateCaseModal';
import { DataService } from '../services/dataService';
import { useNotify } from '../hooks/useNotify';
import { useMutation, queryClient } from '../services/queryClient';
import { STORES } from '../services/db';
import { useSessionStorage } from '../hooks/useSessionStorage';
import { TabbedPageLayout, TabConfigItem } from './layout/TabbedPageLayout';
import { LazyLoader } from './common/LazyLoader';

// Lazy load sub-components for better performance
const CaseListActive = lazy(() => import('./case-list/CaseListActive').then(m => ({ default: m.CaseListActive })));
const CaseListIntake = lazy(() => import('./case-list/CaseListIntake').then(m => ({ default: m.CaseListIntake })));
const CaseListDocket = lazy(() => import('./case-list/CaseListDocket').then(m => ({ default: m.CaseListDocket })));
const CaseListTasks = lazy(() => import('./case-list/CaseListTasks').then(m => ({ default: m.CaseListTasks })));
const CaseListConflicts = lazy(() => import('./case-list/CaseListConflicts').then(m => ({ default: m.CaseListConflicts })));
const CaseListResources = lazy(() => import('./case-list/CaseListResources').then(m => ({ default: m.CaseListResources })));
const CaseListTrust = lazy(() => import('./case-list/CaseListTrust').then(m => ({ default: m.CaseListTrust })));
const CaseListExperts = lazy(() => import('./case-list/CaseListExperts').then(m => ({ default: m.CaseListExperts })));
const CaseListReporters = lazy(() => import('./case-list/CaseListReporters').then(m => ({ default: m.CaseListReporters })));
const CaseListClosing = lazy(() => import('./case-list/CaseListClosing').then(m => ({ default: m.CaseListClosing })));
const CaseListArchived = lazy(() => import('./case-list/CaseListArchived').then(m => ({ default: m.CaseListArchived })));


interface CaseListProps {
  onSelectCase: (c: Case) => void;
  initialTab?: string;
}

const TAB_CONFIG: TabConfigItem[] = [
  {
    id: 'work', label: 'Case Work', icon: Briefcase,
    subTabs: [
      { id: 'active', label: 'Matters', icon: LayoutDashboard },
      { id: 'docket', label: 'Docket', icon: Calendar },
      { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    ]
  },
  {
    id: 'pipeline', label: 'Pipeline', icon: Layers,
    subTabs: [
      { id: 'intake', label: 'Intake', icon: UserPlus },
      { id: 'conflicts', label: 'Conflicts', icon: ShieldAlert },
      { id: 'closing', label: 'Closing', icon: FileCheck },
    ]
  },
  {
    id: 'resources', label: 'Resources', icon: Users,
    subTabs: [
      { id: 'resources', label: 'Staffing', icon: Users },
      { id: 'experts', label: 'Experts', icon: Gavel },
      { id: 'reporters', label: 'Reporters', icon: Mic2 },
    ]
  },
  {
    id: 'admin', label: 'Admin', icon: DollarSign,
    subTabs: [
      { id: 'trust', label: 'Trust', icon: DollarSign },
      { id: 'archived', label: 'Archive', icon: Archive },
    ]
  }
];

export const CaseList: React.FC<CaseListProps> = ({ onSelectCase, initialTab }) => {
  const notify = useNotify();
  const { filteredCases, ...filterProps } = useCaseList();

  const [activeTab, setActiveTab] = useSessionStorage<string>('case_list_active_view', initialTab || 'active');
  const [isDocketModalOpen, setIsDocketModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { mutate: importDocketData } = useMutation(
    async (data: Partial<ParsedDocket>) => {
       const newCase: Case = {
           id: data.caseInfo?.id || `IMP-${Date.now()}`,
           title: data.caseInfo?.title || 'Imported Matter',
           matterType: 'Litigation', status: CaseStatus.Discovery, client: 'Imported Client', value: 0,
           description: 'Imported via Docket XML', filingDate: new Date().toISOString().split('T')[0],
           ...data.caseInfo
       };
       await DataService.cases.add(newCase);
       await DataService.cases.importDocket(newCase.id, data);
       return newCase;
    },
    {
        onSuccess: (newCase) => {
            notify.success(`Successfully imported case: ${newCase.title}`);
            queryClient.invalidate([STORES.CASES, 'all']);
            queryClient.invalidate([STORES.DOCKET, 'all']);
            setIsDocketModalOpen(false);
        },
        onError: () => notify.error("Failed to import docket data")
    }
  );

  const { mutate: createCase } = useMutation(
      DataService.cases.add,
      {
          onSuccess: () => {
              notify.success("New matter created successfully");
              queryClient.invalidate([STORES.CASES, 'all']);
              setIsCreateModalOpen(false);
          }
      }
  );

  const renderContent = () => {
    switch(activeTab) {
      case 'active': return <CaseListActive filteredCases={filteredCases} {...filterProps} onSelectCase={onSelectCase} />;
      case 'intake': return <CaseListIntake />;
      case 'docket': return <CaseListDocket onSelectCase={c => onSelectCase(c as Case)} />;
      case 'tasks': return <CaseListTasks onSelectCase={c => onSelectCase(c as Case)} />;
      case 'conflicts': return <CaseListConflicts onSelectCase={c => onSelectCase(c as Case)} />;
      case 'resources': return <CaseListResources />;
      case 'trust': return <CaseListTrust />;
      case 'experts': return <CaseListExperts />;
      case 'reporters': return <CaseListReporters />;
      case 'closing': return <CaseListClosing />;
      case 'archived': return <CaseListArchived onSelectCase={c => onSelectCase(c as Case)} />;
      default: return <CaseListActive filteredCases={filteredCases} {...filterProps} onSelectCase={onSelectCase} />;
    }
  };

  return (
    <>
      <TabbedPageLayout
        pageTitle="Case Management"
        pageSubtitle="Manage matters, intake, and firm operations."
        pageActions={
          <div className="flex gap-2">
            <Button variant="secondary" icon={FileInput} onClick={() => setIsDocketModalOpen(true)}>Import Docket</Button>
            <Button variant="primary" icon={Plus} onClick={() => setIsCreateModalOpen(true)}>New Matter</Button>
          </div>
        }
        tabConfig={TAB_CONFIG}
        activeTabId={activeTab}
        onTabChange={setActiveTab}
      >
        <Suspense fallback={<LazyLoader message="Loading Module..." />}>
          {renderContent()}
        </Suspense>
      </TabbedPageLayout>

      <DocketImportModal 
        isOpen={isDocketModalOpen} 
        onClose={() => setIsDocketModalOpen(false)} 
        onImport={importDocketData}
      />

      <CreateCaseModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={createCase}
      />
    </>
  );
};

export default CaseList;
