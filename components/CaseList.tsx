// components/CaseList.tsx
import React, { useState, Suspense, lazy, useTransition } from 'react';
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
import { cn } from '../utils/cn';
import { CASE_LIST_TAB_CONFIG } from '../config/caseListConfig'; // Updated import path
import { CaseListContent } from './case-list/CaseListContent'; // Updated import path

// FIX: Lazy load sub-components for better performance
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

// TAB_CONFIG was moved to config/caseListConfig.ts

export const CaseList: React.FC<CaseListProps> = ({ onSelectCase, initialTab }) => {
  const notify = useNotify();
  const { filteredCases, ...filterProps } = useCaseList();

  const [isPending, startTransition] = useTransition();
  const [activeTab, _setActiveTab] = useSessionStorage<string>('case_list_active_view', initialTab || 'active');
  const [isDocketModalOpen, setIsDocketModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const setActiveTab = (tab: string) => {
    startTransition(() => {
        _setActiveTab(tab);
    });
  };

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
    // Delegation to CaseListContent
    return <CaseListContent activeTab={activeTab} onSelectCase={onSelectCase} caseListProps={{ filteredCases, ...filterProps }} />;
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
        tabConfig={CASE_LIST_TAB_CONFIG}
        activeTabId={activeTab}
        onTabChange={setActiveTab}
      >
        <Suspense fallback={<LazyLoader message="Loading Module..." />}>
          <div className={cn(isPending && 'opacity-60 transition-opacity')}>
            {renderContent()}
          </div>
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