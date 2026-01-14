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
import {
  Clock, LayoutTemplate
} from 'lucide-react';
import { Suspense, useState, useTransition } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks
import { useSessionStorage } from '@/hooks/core';

// Components
import { TabbedPageLayout } from '@/components/layouts';
import { Button } from '@/shared/ui/atoms/Button/Button';
import { LazyLoader } from '@/shared/ui/molecules/LazyLoader/LazyLoader';
import { Modal } from '@/shared/ui/molecules/Modal/Modal';
import { DocumentGenerator } from '@/features/drafting/components/DocumentGenerator';
import { DocumentManagerContent } from './DocumentManagerContent';

// Utils & Config
import { DOCUMENT_MANAGER_TAB_CONFIG, DocView } from '@/config/tabs.config';
import { cn } from '@/shared/lib/cn';

// Types
import { UserRole } from '@/types';
import type { GeneratedDocument } from '@/api/domains/drafting';

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

export function DocumentManager({ currentUserRole = 'Associate', initialTab }: DocumentManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [activeTab, _setActiveTab] = useSessionStorage<string>('docs_active_tab', initialTab || 'browse');
  const [showDraftModal, setShowDraftModal] = useState(false);

  const setActiveTab = (tab: string) => {
    startTransition(() => {
      _setActiveTab(tab);
    });
  };

  const handleNewDraft = () => {
    setShowDraftModal(true);
  };

  const handleDraftComplete = (document: GeneratedDocument) => {
    console.log('[DocumentManager] Draft completed:', document);
    setShowDraftModal(false);
    // Optionally refresh the document list or navigate to the new document
    setActiveTab('browse');
  };

  const handleDraftCancel = () => {
    setShowDraftModal(false);
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
          <Button variant="outline" icon={LayoutTemplate} onClick={handleNewDraft}>New Draft</Button>
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

      {showDraftModal && (
        <Modal
          isOpen={showDraftModal}
          onClose={handleDraftCancel}
          title="Create New Draft"
          size="xl"
        >
          <DocumentGenerator
            onComplete={handleDraftComplete}
            onCancel={handleDraftCancel}
          />
        </Modal>
      )}
    </TabbedPageLayout>
  );
}

export default DocumentManager;
