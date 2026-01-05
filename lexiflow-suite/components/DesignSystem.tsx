
import React, { useState, useTransition, useMemo } from 'react';
import { 
  Palette, Command, LayoutTemplate, FormInput, 
  Download, BarChart3, Box, PenTool, Table, Calendar, Database, Clock, Scale, AlertTriangle, Move, DollarSign, Briefcase, FileText
} from 'lucide-react';

import { PageHeader } from './common/PageHeader.tsx';
import { TabNavigation } from './common/TabNavigation.tsx';
import { Button } from './common/Button.tsx';

// Design Component Imports
import { DesignIntro } from './design/DesignIntro.tsx';
import { DesignColors } from './design/DesignColors.tsx';
import { DesignTypography } from './design/DesignTypography.tsx';
import { DesignInputs } from './design/DesignInputs.tsx';
import { DesignLayouts } from './design/DesignLayouts.tsx';
import { DesignCards } from './design/DesignCards.tsx';
import { DesignFeedback } from './design/DesignFeedback.tsx';
import { DesignVisualizations } from './design/DesignVisualizations.tsx';
import { DesignDataGrid } from './design/DesignDataGrid.tsx';
import { DesignNavigation } from './design/DesignNavigation.tsx';
import { DesignWorkflow } from './design/DesignWorkflow.tsx';
import { DesignCalendar } from './design/DesignCalendar.tsx';
import { DesignDataManagement } from './design/DesignDataManagement.tsx';
import { DesignTimeline } from './design/DesignTimeline.tsx';
import { DesignDocEditing } from './design/DesignDocEditing.tsx';
import { DesignProjectManagement } from './design/DesignProjectManagement.tsx';
import { DesignFinance } from './design/DesignFinance.tsx';
import { DesignLegal } from './design/DesignLegal.tsx';
import { DesignDragDrop } from './design/DesignDragDrop.tsx';
import { DesignDocuments } from './design/DesignDocuments.tsx';

type DesignPage = 
  | 'intro' | 'layouts' | 'inputs' | 'colors' | 'typography' | 'cards' | 'feedback' 
  | 'visualizations' | 'datagrid' | 'navigation' | 'workflow' | 'calendar' 
  | 'data' | 'timeline' | 'editor' | 'project' | 'finance' | 'legal' | 'dnd' | 'documents';

export const DesignSystem: React.FC = () => {
  const [activePage, setActivePage] = useState<DesignPage>('intro');
  const [isPending, startTransition] = useTransition();

  const handleNavigate = (page: string) => {
      startTransition(() => {
          setActivePage(page as DesignPage);
      });
  };

  const MENU_ITEMS = useMemo(() => [
    { id: 'intro', label: 'Intro', icon: Command },
    { id: 'colors', label: 'Colors', icon: Palette },
    { id: 'typography', label: 'Type', icon: FormInput },
    { id: 'inputs', label: 'Inputs', icon: FormInput },
    { id: 'layouts', label: 'Layouts', icon: LayoutTemplate },
    { id: 'cards', label: 'Cards', icon: Box },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'feedback', label: 'Feedback', icon: AlertTriangle },
    { id: 'visualizations', label: 'Charts', icon: BarChart3 },
    { id: 'datagrid', label: 'Tables', icon: Table },
    { id: 'navigation', label: 'Nav', icon: Move },
    { id: 'workflow', label: 'Workflow', icon: Box }, 
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'data', label: 'Data', icon: Database },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'editor', label: 'Editor', icon: PenTool },
    { id: 'project', label: 'Project', icon: Briefcase },
    { id: 'finance', label: 'Finance', icon: DollarSign },
    { id: 'legal', label: 'Legal', icon: Scale },
    { id: 'dnd', label: 'Drag/Drop', icon: Move },
  ], []);

  const renderContent = () => {
      switch(activePage) {
          case 'intro': return <DesignIntro onNavigate={handleNavigate} />;
          case 'colors': return <DesignColors />;
          case 'typography': return <DesignTypography />;
          case 'inputs': return <DesignInputs />;
          case 'layouts': return <DesignLayouts />;
          case 'cards': return <DesignCards />;
          case 'documents': return <DesignDocuments />;
          case 'feedback': return <DesignFeedback />;
          case 'visualizations': return <DesignVisualizations />;
          case 'datagrid': return <DesignDataGrid />;
          case 'navigation': return <DesignNavigation />;
          case 'workflow': return <DesignWorkflow />;
          case 'calendar': return <DesignCalendar />;
          case 'data': return <DesignDataManagement />;
          case 'timeline': return <DesignTimeline />;
          case 'editor': return <DesignDocEditing />;
          case 'project': return <DesignProjectManagement />;
          case 'finance': return <DesignFinance />;
          case 'legal': return <DesignLegal />;
          case 'dnd': return <DesignDragDrop />;
          default: return <DesignIntro onNavigate={handleNavigate} />;
      }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 animate-fade-in">
      <div className="px-6 pt-6 pb-2 shrink-0">
        <PageHeader 
            title="Design System" 
            subtitle="Enterprise visual language, atomic primitives, and molecular patterns."
            actions={
                <div className="flex gap-2">
                    <Button variant="secondary" icon={Download}>Export Assets</Button>
                    <Button variant="primary" icon={Palette}>Theme Settings</Button>
                </div>
            }
        />

        <TabNavigation 
            tabs={MENU_ITEMS} 
            activeTab={activePage} 
            onTabChange={(id) => handleNavigate(id)} 
            className="bg-white rounded-lg border border-slate-200 p-1 shadow-sm"
        />
      </div>

      <div className={`flex-1 overflow-y-auto min-h-0 p-6 pt-4 transition-opacity duration-300 ${isPending ? 'opacity-60' : 'opacity-100'}`}>
        <div className="max-w-[1920px] mx-auto h-full">
            {renderContent()}
        </div>
      </div>
    </div>
  );
};
