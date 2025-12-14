/**
 * @module components/documents/DocumentManager
 * @category Document Management
 * @description Main document manager with explorer, templates, and assembly.
 *
 * THEME SYSTEM USAGE:
 * Uses theme indirectly through child components.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { Suspense, lazy, useTransition } from 'react';
import {
  Folder, Clock, Star, FileText, LayoutTemplate,
  PenTool, Share2, CheckCircle, FileSignature, Edit, Eraser, Cpu
} from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks
import { useSessionStorage } from '../../hooks/useSessionStorage';

// Components
import { Button } from '../common/Button';
import { TabbedPageLayout, TabConfigItem } from '../layout/TabbedPageLayout';
import { LazyLoader } from '../common/LazyLoader';
import { DocumentManagerContent } from './DocumentManagerContent';

// Utils & Config
import { cn } from '../../utils/cn';
import { DOCUMENT_MANAGER_TAB_CONFIG, DocView } from '../../config/documentManagerConfig';

// Types
import { UserRole } from '../../types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface DocumentManagerProps {
  /** Current user's role for permission checks. */
  currentUserRole?: UserRole;
  /** Optional initial tab to display. */
  initialTab?: DocView;
}

// ============================================================================
// COMPONENT
// ============================================================================

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
