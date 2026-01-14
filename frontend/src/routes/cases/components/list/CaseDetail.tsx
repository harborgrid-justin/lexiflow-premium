/**
 * CaseDetail.tsx
 *
 * Detailed view of a single case/matter with CRUD operations and comprehensive
 * information display.
 *
 * REACT V18 CONTEXT CONSUMPTION COMPLIANCE:
 * - Guideline 21: Pure render logic with React Query data fetching
 * - Guideline 28: Theme usage is pure function for detail view styling
 * - Guideline 34: useTheme() is side-effect free read (if used)
 * - Guideline 33: Ready for isPendingThemeChange integration
 */

import { ConfirmDialog } from '@/shared/ui/molecules/ConfirmDialog/ConfirmDialog';
import { useModalState } from '@/hooks/useModalState';
import { useMutation, useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/data-service.service';
import { queryClient } from '@/services/infrastructure/queryClient';
import { Matter, MatterPriority, MatterStatus } from '@/types';
import { queryKeys } from '@/utils/queryKeys';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle,
  DollarSign,
  Edit,
  FileText,
  Scale,
  Trash2,
  Users
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { MatterForm } from './matter-form';
import { useCaseNavigation } from '@/routes/cases/hooks/useCaseNavigation';

export const CaseDetail: React.FC = () => {
  const { matterId, backToMatters, isValidMatter } = useCaseNavigation();

  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const deleteModal = useModalState();

  // ✅ Migrated to backend API with queryKeys (2025-12-21)
  const { data: matter, isLoading: loading, error } = useQuery<Matter | null>(
    queryKeys.cases.matters.detail(matterId!),
    () => DataService.cases.getById(matterId!),
    { enabled: isValidMatter }
  );

  const updateMutation = useMutation(
    (data: Partial<Matter>) => DataService.cases.update(matterId!, data),
    {
      onSuccess: () => {
        queryClient.invalidate(queryKeys.cases.matters.detail(matterId!));
        queryClient.invalidate(queryKeys.cases.matters.all());
        setEditing(false);
      }
    }
  );

  const deleteMutation = useMutation(
    () => DataService.cases.delete(matterId!),
    {
      onSuccess: () => {
        backToMatters();
      }
    }
  );

  // Navigate to matters list if invalid - moved before conditional return
  useEffect(() => {
    if (!isValidMatter || error || (!loading && !matter)) {
      if (!isValidMatter && matterId) {
        console.error(`[MatterDetail] Invalid UUID format: ${matterId}`);
      }
      backToMatters();
    }
  }, [isValidMatter, error, loading, matter, matterId, backToMatters]);

  // PREDICTABLE ERROR STATE: Render structured error view instead of null
  // Prevents hydration mismatch and provides user feedback
  if (!isValidMatter || error || (!loading && !matter)) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-amber-500" />
          <h3 className="text-lg font-semibold mb-2">Matter Not Found</h3>
          <p className="text-sm text-slate-600">Redirecting to matters list...</p>
        </div>
      </div>
    );
  }

  const handleSave = async (matterData: Partial<Matter>) => {
    await updateMutation.mutateAsync(matterData);
  };

  const handleDelete = async () => {
    setDeleting(true);
    await deleteMutation.mutateAsync(matterId!);
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date?: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusIcon = (status: MatterStatus) => {
    switch (status) {
      case MatterStatus.ACTIVE:
        return <CheckCircle className="w-5 h-5" />;
      case MatterStatus.CLOSED:
        return <CheckCircle className="w-5 h-5" />;
      case MatterStatus.ON_HOLD:
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: MatterStatus) => {
    switch (status) {
      case MatterStatus.ACTIVE:
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200';
      case MatterStatus.CLOSED:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-200';
      case MatterStatus.ON_HOLD:
        return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-200';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading matter...</p>
        </div>
      </div>
    );
  }

  if (!matter) {
    return null;
  }

  if (editing) {
    return (
      <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
        <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
          <button
            onClick={() => setEditing(false)}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          >
            <ArrowLeft className="w-5 h-5" />
            Cancel Editing
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-5xl mx-auto">
            <MatterForm
              matter={matter}
              onSave={handleSave}
              onCancel={() => setEditing(false)}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={backToMatters}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Matters
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={deleteModal.open}
              disabled={deleting}
              className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {matter.title}
              </h1>
              <span className="text-slate-500 dark:text-slate-400">
                {matter.matterNumber}
              </span>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(matter.status)}`}>
                {getStatusIcon(matter.status)}
                {matter.status.replace(/_/g, ' ')}
              </span>
            </div>
            {matter.description && (
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                {matter.description}
              </p>
            )}
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <FileText className="w-4 h-4" />
                <span>{(matter.type || matter.matterType)?.replace(/_/g, ' ') || '-'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Scale className="w-4 h-4" />
                <span>{matter.practiceArea?.replace(/_/g, ' ') || '-'}</span>
              </div>
              <div className={`flex items-center gap-2 font-medium ${matter.priority === MatterPriority.URGENT ? 'text-rose-600 dark:text-rose-400' :
                matter.priority === MatterPriority.HIGH ? 'text-orange-600 dark:text-orange-400' :
                  'text-blue-600 dark:text-blue-400'
                }`}>
                <span>{matter.priority} Priority</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Client Information */}
          <section className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              Client Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Client Name</label>
                <p className="text-slate-900 dark:text-slate-100 mt-1">{matter.clientName || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Contact Person</label>
                <p className="text-slate-900 dark:text-slate-100 mt-1">{matter.clientContact || '-'}</p>
              </div>
            </div>
          </section>


          {/* Risk Management */}
          <section className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Risk Assessment
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Risk Level</label>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase
                      ${matter.riskLevel === 'critical' ? 'bg-red-100 text-red-800' :
                      matter.riskLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                        matter.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'}`}>
                    {matter.riskLevel || 'Not Assessed'}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Ethical Wall</label>
                <p className="text-slate-900 dark:text-slate-100 mt-1">
                  {matter.customFields?.ethicalWallRequired ? 'Required' : 'Not Required'}
                </p>
              </div>
              {matter.riskNotes && (
                <div className="col-span-2">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Compliance Notes</label>
                  <p className="text-slate-900 dark:text-slate-100 mt-1 text-sm bg-slate-50 dark:bg-slate-900 p-3 rounded">
                    {matter.riskNotes}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Attorney Assignment */}
          <section className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Team
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Responsible Attorney</label>
                <p className="text-slate-900 dark:text-slate-100 mt-1">{matter.responsibleAttorneyName || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Originating Attorney</label>
                <p className="text-slate-900 dark:text-slate-100 mt-1">{matter.originatingAttorneyName || '-'}</p>
              </div>
            </div>
          </section>

          {/* Conflict Check */}
          <section className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Conflict Check
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Status</label>
                <p className="text-slate-900 dark:text-slate-100 mt-1 capitalize">
                  {matter.conflictCheckStatus || 'Pending'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Check Date</label>
                <p className="text-slate-900 dark:text-slate-100 mt-1">
                  {formatDate(matter.conflictCheckDate)}
                </p>
              </div>
              <div className="col-span-3">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Notes</label>
                <p className="text-slate-900 dark:text-slate-100 mt-1">
                  {matter.conflictCheckNotes || '-'}
                </p>
              </div>
            </div>
          </section>

          {/* Important Dates */}
          <section className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Important Dates
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Intake Date</label>
                <p className="text-slate-900 dark:text-slate-100 mt-1">{formatDate(matter.intakeDate)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Opened Date</label>
                <p className="text-slate-900 dark:text-slate-100 mt-1">{formatDate(matter.openedDate)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Statute of Limitations</label>
                <p className="text-slate-900 dark:text-slate-100 mt-1">
                  {formatDate(matter.statute_of_limitations)}
                </p>
              </div>
            </div>
          </section>

          {/* Financial Information */}
          <section className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Financial Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Billing Arrangement</label>
                <p className="text-slate-900 dark:text-slate-100 mt-1 capitalize">
                  {matter.billingArrangement?.replace(/_/g, ' ') || '-'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Hourly Rate</label>
                <p className="text-slate-900 dark:text-slate-100 mt-1">
                  {matter.hourlyRate ? formatCurrency(matter.hourlyRate) : '-'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Retainer Amount</label>
                <p className="text-slate-900 dark:text-slate-100 mt-1">
                  {formatCurrency(matter.retainerAmount)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Budget Amount</label>
                <p className="text-slate-900 dark:text-slate-100 mt-1">
                  {formatCurrency(matter.budgetAmount)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Estimated Value</label>
                <p className="text-slate-900 dark:text-slate-100 mt-1">
                  {formatCurrency(matter.estimatedValue)}
                </p>
              </div>
            </div>
          </section>

          {/* Court Information */}
          {(matter.courtName || matter.judgeAssigned) && (
            <section className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Court Information
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Court Name</label>
                  <p className="text-slate-900 dark:text-slate-100 mt-1">{matter.courtName || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Judge Assigned</label>
                  <p className="text-slate-900 dark:text-slate-100 mt-1">{matter.judgeAssigned || '-'}</p>
                </div>
              </div>
            </section>
          )}

          {/* Tags */}
          {matter.tags && matter.tags.length > 0 && (
            <section className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Tags
              </h2>
              <div className="flex flex-wrap gap-2">
                {matter.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={handleDelete}
        title="Delete Matter"
        message="Are you sure you want to delete this matter? This action cannot be undone."
        confirmText="Delete Matter"
        variant="danger"
      />
    </div>
  );
};
