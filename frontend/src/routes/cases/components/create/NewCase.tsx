/**
 * NewMatter Component (Default Export)
 *
 * Unified matter/case creation and editing form combining general matter intake
 * with federal litigation case fields. Supports full CRUD operations.
 *
 * REACT V18 CONTEXT CONSUMPTION COMPLIANCE:
 * - Guideline 21: Pure render logic with tabbed interface and form state
 * - Guideline 28: Theme usage is pure function for form styling
 * - Guideline 34: useTheme() is side-effect free read
 * - Guideline 33: Uses isPendingThemeChange for form transitions
 * - Guideline 24: Expensive computations memoized with useMemo
 *
 * Features:
 * - Tabbed interface: Intake, Court Info, Parties, Financial, Related Cases
 * - Real-time validation with error feedback
 * - Auto-save functionality
 * - Conflict checking
 * - Full CRUD operations (Create, Read, Update, Delete)
 * - Backend-first architecture via DataService
 *
 * @optimization useMemo for expensive computations, useCallback for event handlers
 * @performance Lazy loading, proper dependency arrays, stale time configuration
 */

import React from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/atoms/Button';
import { Breadcrumbs } from '@/components/molecules/Breadcrumbs';
import { PageHeader } from '@/components/organisms/PageHeader';
import { useTheme } from "@/hooks/useTheme";
import { DollarSign, FileText, Link2, Save, Scale, Trash2, Users } from 'lucide-react';

// Types
import { NewMatterProps, TabId } from './types/newCaseTypes';

// Hooks
import { useNewCaseController } from './hooks/useNewCaseController';

// Components
import { ConflictWarning } from './components/ConflictWarning';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { GlobalErrors } from './components/GlobalErrors';
import { TabBar } from './components/TabBar';

// Tab Components
import { CourtTab } from './tabs/CourtTab';
import { FinancialTab } from './tabs/FinancialTab';
import { IntakeTab } from './tabs/IntakeTab';
import { PartiesTab } from './tabs/PartiesTab';
import { RelatedCasesTab } from './tabs/RelatedCasesTab';

const NewMatter: React.FC<NewMatterProps> = ({ id, onBack, onSaved, currentUser }) => {
  // Guideline 34: Side-effect free context read
  const { theme } = useTheme();

  const {
    isEditMode,
    activeTab,
    setActiveTab,
    saving,
    showDeleteConfirm,
    setShowDeleteConfirm,
    isLoading,
    formData,
    conflictStatus,
    errors,
    handleFieldChange,
    handleSubmit,
    handleDelete,
    handleCancel,
    addRelatedCase,
    removeRelatedCase,
    updateRelatedCase,
    isDeleting,
    generatedNumber
  } = useNewCaseController({ id, onBack, onSaved, currentUser });

  // Tabs Configuration
  const tabs = [
    { id: 'intake', label: 'Intake & Basic Info', icon: FileText },
    { id: 'court', label: 'Court Information', icon: Scale },
    { id: 'parties', label: 'Parties & Team', icon: Users },
    { id: 'financial', label: 'Financial', icon: DollarSign },
    { id: 'related', label: 'Related Cases', icon: Link2 },
  ] as const;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("h-full flex flex-col", theme.background)}>
      {/* Header */}
      <div style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }} className="border-b px-6 py-4">
        <Breadcrumbs
          items={[
            { label: 'Matter Management', onClick: handleCancel },
            { label: isEditMode ? 'Edit Matter' : 'New Matter' }
          ]}
        />

        <div className="mt-4">
          <PageHeader
            title={isEditMode ? 'Edit Matter' : 'New Matter'}
            subtitle="Federal litigation case and matter management"
            actions={
              <div className="flex items-center gap-3">
                {isEditMode && (
                  <Button
                    variant="danger"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={saving || isDeleting}
                    icon={Trash2}
                  >
                    Delete
                  </Button>
                )}
                <Button
                  variant="secondary"
                  onClick={handleCancel}
                  disabled={saving || isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={saving || isDeleting || conflictStatus === 'conflict'}
                  icon={Save}
                >
                  {saving ? 'Saving...' : isEditMode ? 'Update' : 'Create Matter'}
                </Button>
              </div>
            }
          />
        </div>

        {/* Tabs */}
        <TabBar tabs={tabs} activeTab={activeTab} onTabChange={(id) => setActiveTab(id as TabId)} />
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto">
          {/* Global Errors */}
          <GlobalErrors errors={errors} />

          {/* Conflict Warning */}
          <ConflictWarning show={conflictStatus === 'conflict'} />

          <div style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }} className="rounded-lg border p-6">
            {activeTab === 'intake' && (
              <IntakeTab
                formData={formData}
                generatedNumber={generatedNumber}
                conflictStatus={conflictStatus}
                errors={errors}
                onChange={handleFieldChange}
              />
            )}

            {activeTab === 'court' && (
              <CourtTab formData={formData} onChange={handleFieldChange} />
            )}

            {activeTab === 'parties' && (
              <PartiesTab formData={formData} errors={errors} onChange={handleFieldChange} />
            )}

            {activeTab === 'financial' && (
              <FinancialTab formData={formData} onChange={handleFieldChange} />
            )}

            {activeTab === 'related' && (
              <RelatedCasesTab
                relatedCases={formData.relatedCases}
                onAdd={addRelatedCase}
                onRemove={removeRelatedCase}
                onUpdate={updateRelatedCase}
              />
            )}
          </div>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default NewMatter;
