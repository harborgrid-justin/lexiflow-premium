
// components/DocumentManager.tsx
import React, { Suspense, lazy, useTransition } from 'react';
import {
  Folder, Clock, Star, FileText, LayoutTemplate,
  PenTool, Share2, CheckCircle, FileSignature, Edit, Eraser, Cpu
} from 'lucide-react';
import { Button } from '../common/Button';
import { UserRole } from '../../types';
import { useSessionStorage } from '../../hooks/useSessionStorage';
import { TabbedPageLayout, TabConfigItem } from '../layout/TabbedPageLayout';
import { LazyLoader } from '../common/LazyLoader';
import { cn } from '../../utils/cn';
import { DOCUMENT_MANAGER_TAB_CONFIG, DocView } from '../../config/documentManagerConfig';
import { DocumentManagerContent } from './DocumentManagerContent';

interface DocumentManagerProps {
  currentUserRole?: UserRole;
  initialTab?: DocView;
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({ currentUserRole = 'Associate', initialTab }) => {
  const [isPending, startTransition] = useTransition();
  const [activeTab, _setActiveTab] = useSessionStorage<string>('docs_active_tab', initialTab || 'browse');

  const setActiveTab = (tab: string) => {
    startTransition(() => {
        _setActiveTab(tab);
    });
  };

  const renderContent = () => {
      // Delegation to DocumentManagerContent
      return <DocumentManagerContent activeTab={activeTab as DocView} currentUserRole={currentUserRole} />;
  };

  return (
    <TabbedPageLayout
      pageTitle="Document Management"
      pageSubtitle="Centralized DMS, Version Control, and Automated Drafting."
      pageActions={
        <div className="flex gap-2">
            <Button variant="secondary" icon={Clock} onClick={() => setActiveTab('recent')}>History</Button>
            <Button variant="outline" icon={LayoutTemplate} onClick={() => setActiveTab('templates')}>New Draft</Button>
        </div>
      }
      tabConfig={DOCUMENT_MANAGER_TAB_CONFIG}
      activeTabId={activeTab}
      onTabChange={setActiveTab}
    >
      <Suspense fallback={<LazyLoader message="Loading Document Module..." />}>
        <div className={cn(isPending && 'opacity-60 transition-opacity')}>
            {renderContent()}
        </div>
      </Suspense>
    </TabbedPageLayout>
  );
};

export default DocumentManager;
