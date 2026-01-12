/**
 * NewMatter Component (Default Export)
 *
 * Unified matter/case creation and editing form combining general matter intake
 * with federal litigation case fields. Supports full CRUD operations.
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

import React, { useState, useCallback } from 'react';
import { PageHeader } from '@/shared/ui/organisms/PageHeader';
import { Button } from '@/shared/ui/atoms/Button';
import { Breadcrumbs } from '@/shared/ui/molecules/Breadcrumbs';
import { PATHS } from '@/config/paths.config';
import { useTheme } from '@/features/theme';
import { useNotify } from '@/hooks/useNotify';
import { useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/dataService';
import { Case, Matter } from '@/types';
import { cn } from '@/shared/lib/cn';
import { queryKeys } from '@/utils/queryKeys';
import { Save, Trash2, FileText, Scale, Users, DollarSign, Link2 } from 'lucide-react';

// Types
import { NewMatterProps, TabId } from './types/newCaseTypes';

// Hooks
import { useNewCaseForm } from './hooks/useNewCaseForm';
import { useNewCaseMutations } from './hooks/useNewCaseMutations';
import { useConflictCheck } from './hooks/useConflictCheck';
import { useRelatedCases } from './hooks/useRelatedCases';
import { useFormValidation } from './hooks/useFormValidation';

// Components
import { TabBar } from './components/TabBar';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { ConflictWarning } from './components/ConflictWarning';
import { GlobalErrors } from './components/GlobalErrors';

// Tab Components
import { IntakeTab } from './tabs/IntakeTab';
import { CourtTab } from './tabs/CourtTab';
import { PartiesTab } from './tabs/PartiesTab';
import { FinancialTab } from './tabs/FinancialTab';
import { RelatedCasesTab } from './tabs/RelatedCasesTab';

const NewMatter: React.FC<NewMatterProps> = ({ id, onBack, onSaved, currentUser }) => {
  const { theme } = useTheme();
  const notify = useNotify();
  const isEditMode = Boolean(id);

  // UI State
  const [activeTab, setActiveTab] = useState<TabId>('intake');
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Data Fetching
  const { data: existingMatters = [] } = useQuery<Matter[]>(
    queryKeys.cases.matters.all(),
    () => DataService.cases.getAll(),
    { staleTime: 60000 }
  );

  // Form Management Hook
  const { formData, setFormData, handleChange, loadFormData, generatedNumber } = useNewCaseForm(
    existingMatters.length
  );

  // Conflict Checking Hook
  const { conflictStatus } = useConflictCheck(formData.clientName, existingMatters, id);

  // Form Validation Hook
  const { errors, validate, clearFieldError } = useFormValidation(formData, conflictStatus);

  // Related Cases Management Hook
  const { addRelatedCase, removeRelatedCase, updateRelatedCase } = useRelatedCases(
    formData.relatedCases,
    (cases) => setFormData(prev => ({ ...prev, relatedCases: cases }))
  );

  // Mutations Hook
  const { createMatter, updateMatter, deleteMatter, isDeleting } = useNewCaseMutations(
    id,
    onSaved,
    onBack
  );

  // Load existing matter/case if editing
  const { isLoading } = useQuery<Matter | Case | null>(
    id ? queryKeys.cases.matters.detail(id) : ['no-matter'],
    () => {
      if (!id) return Promise.resolve(null);
      return DataService.cases.getById(id);
    },
    {
      staleTime: 30000,
      enabled: !!id,
      onSuccess: (data: Matter | Case | null) => {
        if (data) {
          loadFormData(data);
        }
      }
    }
  );

  // Handlers
  const handleFieldChange = useCallback((field: keyof typeof formData, value: unknown) => {
    handleChange(field, value);
    if (errors[field]) {
      clearFieldError(field);
    }
  }, [handleChange, errors, clearFieldError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      notify.error('Please fix validation errors');
      return;
    }

    setSaving(true);
    try {
      const dataToSave = {
        ...formData,
        matterNumber: generatedNumber,
        caseNumber: generatedNumber,
        id: id || crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: currentUser?.id || 'current-user',
      } as Matter & Case;

      if (isEditMode && id) {
        await updateMatter(id, dataToSave);
      } else {
        await createMatter(dataToSave as Matter);
      }
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = useCallback(async () => {
    if (!id) return;
    await deleteMatter(id);
    setShowDeleteConfirm(false);
  }, [id, deleteMatter]);

  const handleCancel = useCallback(() => {
    if (onBack) {
      onBack();
    } else {
      window.location.hash = `#/${PATHS.MATTERS}`;
    }
  }, [onBack]);

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
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
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

          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
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
