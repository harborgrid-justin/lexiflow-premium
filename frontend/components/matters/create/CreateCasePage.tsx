/**
 * CreateCasePage Component
 * 
 * Enterprise-grade full-page case creation experience.
 * Uses TabbedPageLayout pattern for consistency with Matter Management parent.
 * 
 * Features:
 * - Full-page layout with breadcrumb navigation
 * - Theme system integration (ThemeProvider)
 * - Proper scroll handling with flex layout
 * - Mobile-responsive design
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { FederalLitigationCaseForm } from '../list/FederalLitigationCaseForm';
import { DataService } from '../../../services/data/dataService';
import { Case } from '../../../types';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import { PageHeader } from '../../common/PageHeader';
import { Breadcrumbs } from '../../common/Breadcrumbs';
import { Button } from '../../common/Button';
import { LazyLoader } from '../../common/LazyLoader';

interface CreateCasePageProps {
  /** Optional case ID for editing existing case */
  caseId?: string;
  
  /** Callback when user navigates back */
  onBack?: () => void;
}

export const CreateCasePage: React.FC<CreateCasePageProps> = ({ caseId, onBack }) => {
  const { theme } = useTheme();
  const isEditMode = Boolean(caseId);
  const [existingCase, setExistingCase] = useState<Case | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(isEditMode);

  // Load existing case if in edit mode
  useEffect(() => {
    if (caseId) {
      setIsLoading(true);
      DataService.cases.getById(caseId)
        .then(setExistingCase)
        .catch((err: unknown) => console.error('Failed to load case:', err))
        .finally(() => setIsLoading(false));
    }
  }, [caseId]);

  const handleSubmit = useCallback(async (data: unknown) => {
    try {
      if (isEditMode && caseId) {
        await DataService.cases.update(caseId, data as Partial<Case>);
      } else {
        await DataService.cases.add(data as Case);
      }
      
      // Navigate back to case management hub
      if (onBack) {
        onBack();
      } else {
        window.location.hash = '#/case-management';
      }
    } catch (err) {
      console.error('Failed to save case:', err);
      throw err; // Let form handle error display
    }
  }, [isEditMode, caseId, onBack]);

  const handleCancel = useCallback(() => {
    if (onBack) {
      onBack();
    } else {
      window.location.hash = '#/case-management';
    }
  }, [onBack]);

  return (
    <div className={cn("h-full flex flex-col animate-fade-in", theme.background)}>
      {/* Header Section */}
      <div className="px-6 pt-6 shrink-0">
        {/* Breadcrumbs */}
        <Breadcrumbs 
          items={[
            { label: 'Matter Management', onClick: handleCancel },
            { label: isEditMode ? 'Edit Case' : 'New Federal Case' }
          ]}
        />

        {/* Page Header */}
        <PageHeader
          title={isEditMode ? 'Edit Federal Litigation Case' : 'Create New Federal Litigation Case'}
          subtitle={isEditMode 
            ? 'Update case details and court information'
            : 'Enter case details, court information, and party assignments'}
          actions={
            <Button
              variant="secondary"
              onClick={handleCancel}
            >
              Cancel
            </Button>
          }
        />
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-hidden px-6 pb-6 min-h-0">
        <div className="h-full overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <LazyLoader message="Loading case details..." />
            </div>
          ) : (
            <div className="max-w-7xl mx-auto space-y-6 py-6">
              {/* Form Container */}
              <div className={cn("rounded-lg border p-6", theme.surface.default, theme.border.default)}>
                <FederalLitigationCaseForm
                  case={existingCase}
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                />
              </div>

              {/* Help Panel */}
              <div className={cn(
                "rounded-lg border-l-4 p-6",
                "bg-blue-50 border-blue-500 dark:bg-blue-900/20 dark:border-blue-500"
              )}>
                <h3 className={cn("text-sm font-semibold mb-3", theme.text.primary)}>
                  Need help?
                </h3>
                <ul className={cn("space-y-2 text-sm", theme.text.secondary)}>
                  <li>• All fields marked with asterisk (*) are required</li>
                  <li>• Case number should follow your firm's naming convention</li>
                  <li>• Use autocomplete fields to link existing parties and courts</li>
                  <li>• Your progress is automatically saved as you type</li>
                  <li>• You can return to edit case details anytime after creation</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateCasePage;
