
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Case } from '../types';
import { 
  Briefcase, UserPlus, ShieldAlert, Users, Calendar, CheckSquare,
  DollarSign, Gavel, Mic2, FileCheck, Archive, FileInput,
  LayoutDashboard, Layers, Plus
} from 'lucide-react';
import { PageHeader } from './common/PageHeader';
import { Button } from './common/Button';
import { useCaseList } from '../hooks/useCaseList';
import { 
  CaseListActive, CaseListIntake, CaseListDocket, CaseListResources,
  CaseListTrust, CaseListExperts, CaseListConflicts, CaseListTasks,
  CaseListReporters, CaseListClosing, CaseListArchived
} from './case-list';
import { DocketImportModal } from './DocketImportModal';
import { CreateCaseModal } from './case-list/CreateCaseModal';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../utils/cn';
import { DataService } from '../services/dataService';
import { useNotify } from '../hooks/useNotify';
import { useMutation, queryClient } from '../services/queryClient';
import { STORES } from '../services/db';

interface CaseListProps {
  onSelectCase: (c: Case) => void;
  initialTab?: CaseView;
}

type CaseView = 
  'active' | 'docket' | 'tasks' | 'intake' | 'conflicts' | 
  'resources' | 'trust' | 'experts' | 'reporters' | 'closing' | 'archived';

const PARENT_TABS = [
  {
    id: 'work',
    label: 'Case Work',
    icon: Briefcase,
    subTabs: [
      { id: 'active', label: 'Matters', icon: LayoutDashboard },
      { id: 'docket', label: 'Docket', icon: Calendar },
      { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    ]
  },
  {
    id: 'pipeline',
    label: 'Pipeline',
    icon: Layers,
    subTabs: [
      { id: 'intake', label: 'Intake', icon: UserPlus },
      { id: 'conflicts', label: 'Conflicts', icon: ShieldAlert },
      { id: 'closing', label: 'Closing', icon: FileCheck },
    ]
  },
  {
    id: 'resources',
    label: 'Resources',
    icon: Users,
    subTabs: [
      { id: 'resources', label: 'Staffing', icon: Users },
      { id: 'experts', label: 'Experts', icon: Gavel },
      { id: 'reporters', label: 'Reporters', icon: Mic2 },
    ]
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: DollarSign,
    subTabs: [
      { id: 'trust', label: 'Trust', icon: DollarSign },
      { id: 'archived', label: 'Archive', icon: Archive },
    ]
  }
];

export const CaseList: React.FC<CaseListProps> = ({ onSelectCase, initialTab }) => {
  const { theme } = useTheme();
  const notify = useNotify();
  const {
    isModalOpen,
    setIsModalOpen,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    filteredCases,
    resetFilters
  } = useCaseList();

  const [view, setView] = useState<CaseView>('active');
  const [isDocketModalOpen, setIsDocketModalOpen] = useState(false);

  // Holographic Routing
  useEffect(() => {
      if (initialTab) setView(initialTab);
  }, [initialTab]);

  // Derived state for parent tab
  const activeParentTab = useMemo(() => 
    PARENT_TABS.find(p => p.subTabs.some(s => s.id === view)) || PARENT_TABS[0],
  [view]);

  const handleParentTabChange = useCallback((parentId: string) => {
    const parent = PARENT_TABS.find(p => p.id === parentId);
    if (parent && parent.subTabs.length > 0) {
      setView(parent.subTabs[0].id as CaseView);
    }
  }, []);

  const { mutate: importDocketData } = useMutation(
    async (data: any) => {
       // Assume new case is created from import
       const newCase: Case = {
           id: data.caseInfo?.id || `IMP-${Date.now()}`,
           title: data.caseInfo?.title || 'Imported Matter',
           matterType: 'Litigation',
           status: 'Discovery',
           client: 'Imported Client',
           value: 0,
           description: 'Imported via Docket XML',
           filingDate: new Date().toISOString().split('T')[0],
           ...data.caseInfo
       };
       await DataService.cases.add(newCase);
       // Import entries
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
              setIsModalOpen(false);
          }
      }
  );

  // Declarative view mapping for better organization and performance
  const viewContentMap = useMemo(() => ({
    active: (
      <CaseListActive 
        filteredCases={filteredCases}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        resetFilters={resetFilters}
        onSelectCase={onSelectCase}
      />
    ),
    intake: <CaseListIntake />,
    docket: <CaseListDocket onSelectCase={onSelectCase} />,
    tasks: <CaseListTasks onSelectCase={onSelectCase} />,
    conflicts: <CaseListConflicts onSelectCase={onSelectCase} />,
    resources: <CaseListResources />,
    trust: <CaseListTrust />,
    experts: <CaseListExperts />,
    reporters: <CaseListReporters />,
    closing: <CaseListClosing />,
    archived: <CaseListArchived onSelectCase={onSelectCase} />,
  }), [filteredCases, statusFilter, typeFilter, onSelectCase, resetFilters, setStatusFilter, setTypeFilter]);

  return (
    <div className={cn("flex flex-col h-full relative pb-20 md:pb-0", theme.background)}>
      <div className="px-6 pt-6 pb-2 shrink-0">
        <PageHeader 
          title="Case Management" 
          subtitle="Manage matters, intake, and firm operations."
          actions={
            <div className="flex gap-2">
              <Button variant="secondary" icon={FileInput} onClick={() => setIsDocketModalOpen(true)}>Import Docket</Button>
              <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>New Matter</Button>
            </div>
          }
        />

        {/* Desktop Parent Navigation */}
        <div className={cn("hidden md:flex space-x-6 border-b mb-4", theme.border.default)}>
            {PARENT_TABS.map(parent => (
                <button
                    key={parent.id}
                    onClick={() => handleParentTabChange(parent.id)}
                    className={cn(
                        "flex items-center pb-3 px-1 text-sm font-medium transition-all border-b-2",
                        activeParentTab.id === parent.id 
                            ? cn("border-current", theme.primary.text)
                            : cn("border-transparent", theme.text.secondary, `hover:${theme.text.primary}`)
                    )}
                >
                    <parent.icon className={cn("h-4 w-4 mr-2", activeParentTab.id === parent.id ? theme.primary.text : theme.text.tertiary)}/>
                    {parent.label}
                </button>
            ))}
        </div>

        {/* Sub-Navigation (Pills) - Touch Scroll */}
        <div className={cn("flex space-x-2 overflow-x-auto no-scrollbar py-3 px-4 md:px-6 rounded-lg border mb-4 touch-pan-x", theme.surfaceHighlight, theme.border.default)}>
            {activeParentTab.subTabs.map(tab => (
                <button 
                    key={tab.id} 
                    onClick={() => setView(tab.id as CaseView)} 
                    className={cn(
                        "flex-shrink-0 px-3 py-1.5 rounded-full font-medium text-xs md:text-sm transition-all duration-200 whitespace-nowrap flex items-center gap-2 border",
                        view === tab.id 
                            ? cn(theme.surface, theme.primary.text, "shadow-sm border-transparent ring-1", theme.primary.border) 
                            : cn("bg-transparent", theme.text.secondary, "border-transparent", `hover:${theme.surface}`)
                    )}
                >
                    <tab.icon className={cn("h-3.5 w-3.5", view === tab.id ? theme.primary.text : theme.text.tertiary)}/>
                    {tab.label}
                </button>
            ))}
        </div>
      </div>

      <div className="flex-1 overflow-hidden px-6 pb-6 min-h-0">
        <div className="h-full overflow-y-auto custom-scrollbar touch-auto">
            {viewContentMap[view]}
        </div>
      </div>

      <DocketImportModal 
        isOpen={isDocketModalOpen} 
        onClose={() => setIsDocketModalOpen(false)} 
        onImport={importDocketData}
      />

      <CreateCaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={createCase}
      />
    </div>
  );
};

export default CaseList;
