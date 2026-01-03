/**
 * DocumentWorkflow Component
 *
 * Enterprise document workflow management with:
 * - Approval workflows
 * - Review assignments
 * - Status tracking
 * - Deadline alerts
 * - Workflow templates
 */

import type { LegalDocument } from '@/types/documents';
import { useState } from 'react';

type WorkflowStatus = 'draft' | 'pending_review' | 'in_review' | 'approved' | 'rejected' | 'completed';

interface WorkflowStep {
  id: string;
  name: string;
  type: 'review' | 'approval' | 'sign' | 'custom';
  assigneeId: string;
  assigneeName: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  dueDate?: string;
  completedAt?: string;
  comments?: string;
  order: number;
}

interface DocumentWorkflow {
  id: string;
  documentId: string;
  document?: LegalDocument;
  name: string;
  description?: string;
  status: WorkflowStatus;
  steps: WorkflowStep[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  completedAt?: string;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  steps: Omit<WorkflowStep, 'id' | 'status' | 'completedAt' | 'assigneeId' | 'assigneeName'>[];
}

interface DocumentWorkflowProps {
  workflow?: DocumentWorkflow;
  templates?: WorkflowTemplate[];
  availableReviewers?: Array<{ id: string; name: string; role: string }>;
  onWorkflowCreate?: (workflow: Partial<DocumentWorkflow>) => Promise<void>;
  onWorkflowUpdate?: (workflowId: string, updates: Partial<DocumentWorkflow>) => Promise<void>;
  onStepComplete?: (workflowId: string, stepId: string, comments?: string) => Promise<void>;
  onStepReject?: (workflowId: string, stepId: string, reason: string) => Promise<void>;
  onWorkflowCancel?: (workflowId: string) => Promise<void>;
}

export function DocumentWorkflow({
  workflow,
  templates = [],
  onStepComplete,
  onStepReject,
  onWorkflowCancel,
}: DocumentWorkflowProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [comment, setComment] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');

  // Get current active step
  const getCurrentStep = (): WorkflowStep | undefined => {
    if (!workflow) return undefined;
    return workflow.steps.find(step =>
      step.status === 'in_progress' ||
      (step.status === 'pending' && workflow.steps.filter(s => s.order < step.order).every(s => s.status === 'completed'))
    );
  };

  const currentStep = getCurrentStep();

  // Calculate workflow progress
  const getWorkflowProgress = (): number => {
    if (!workflow || workflow.steps.length === 0) return 0;
    const completedSteps = workflow.steps.filter(s => s.status === 'completed').length;
    return Math.round((completedSteps / workflow.steps.length) * 100);
  };

  // Check if deadline is approaching (within 2 days)
  const isDeadlineApproaching = (dueDate?: string): boolean => {
    if (!dueDate) return false;
    const deadline = new Date(dueDate);
    const now = new Date();
    const daysUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return daysUntilDeadline > 0 && daysUntilDeadline <= 2;
  };

  // Check if deadline is overdue
  const isOverdue = (dueDate?: string): boolean => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  // Handle step action
  const handleStepAction = (stepId: string, action: 'approve' | 'reject') => {
    setActiveStepId(stepId);
    setActionType(action);
    setShowCommentDialog(true);
  };

  // Submit step action
  const submitStepAction = async () => {
    if (!activeStepId) return;

    try {
      if (actionType === 'approve' && onStepComplete) {
        await onStepComplete(activeStepId, comment);
      } else if (actionType === 'reject' && onStepReject) {
        await onStepReject(activeStepId, comment);
      }
      setShowCommentDialog(false);
      setComment('');
    } catch (error) {
      console.error('Failed to submit step action:', error);
    }
  };

  // Submit step action
  const submitStepAction = async () => {
    if (!workflow || !activeStepId) return;

    try {
      if (actionType === 'approve') {
        await onStepComplete?.(workflow.id, activeStepId, comment);
      } else {
        await onStepReject?.(workflow.id, activeStepId, comment);
      }
      setShowCommentDialog(false);
      setComment('');
      setActiveStepId(null);
    } catch (error) {
      console.error('Failed to submit step action:', error);
      alert('Failed to submit action. Please try again.');
    }
  };

  // Get status badge color
  const getStatusColor = (status: WorkflowStatus | WorkflowStep['status']): string => {
    switch (status) {
      case 'completed':
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'in_progress':
      case 'in_review':
      case 'pending_review':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'pending':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Format date
  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {workflow ? 'Document Workflow' : 'Create Workflow'}
            </h2>
            {workflow && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {workflow.name}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!workflow && (
              <button
                onClick={() => setShowCreateDialog(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Workflow
              </button>
            )}
            {workflow && workflow.status !== 'completed' && (
              <button
                onClick={() => onWorkflowCancel?.(workflow.id)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
              >
                Cancel Workflow
              </button>
            )}
          </div>
        </div>

        {/* Workflow Status & Progress */}
        {workflow && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(workflow.status)}`}>
                  {workflow.status.replace('_', ' ').toUpperCase()}
                </span>
                {workflow.dueDate && (
                  <div className="flex items-center gap-1">
                    <svg
                      className={`h-4 w-4 ${isOverdue(workflow.dueDate) ? 'text-red-600' :
                        isDeadlineApproaching(workflow.dueDate) ? 'text-orange-600' :
                          'text-gray-400'
                        }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className={`text-sm ${isOverdue(workflow.dueDate) ? 'text-red-600 font-medium' :
                      isDeadlineApproaching(workflow.dueDate) ? 'text-orange-600 font-medium' :
                        'text-gray-600 dark:text-gray-400'
                      }`}>
                      Due: {formatDate(workflow.dueDate)}
                      {isOverdue(workflow.dueDate) && ' (Overdue)'}
                      {isDeadlineApproaching(workflow.dueDate) && !isOverdue(workflow.dueDate) && ' (Soon)'}
                    </span>
                  </div>
                )}
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {getWorkflowProgress()}% Complete
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getWorkflowProgress()}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        {workflow ? (
          <div className="space-y-6">
            {/* Current Step Alert */}
            {currentStep && (
              <div className={`p-4 rounded-lg border-l-4 ${isOverdue(currentStep.dueDate) ? 'bg-red-50 border-red-500 dark:bg-red-900/20' :
                isDeadlineApproaching(currentStep.dueDate) ? 'bg-orange-50 border-orange-500 dark:bg-orange-900/20' :
                  'bg-blue-50 border-blue-500 dark:bg-blue-900/20'
                }`}>
                <div className="flex items-start gap-3">
                  <svg
                    className={`h-6 w-6 flex-shrink-0 ${isOverdue(currentStep.dueDate) ? 'text-red-600' :
                      isDeadlineApproaching(currentStep.dueDate) ? 'text-orange-600' :
                        'text-blue-600'
                      }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <h3 className={`font-medium ${isOverdue(currentStep.dueDate) ? 'text-red-900 dark:text-red-100' :
                      isDeadlineApproaching(currentStep.dueDate) ? 'text-orange-900 dark:text-orange-100' :
                        'text-blue-900 dark:text-blue-100'
                      }`}>
                      Current Step: {currentStep.name}
                    </h3>
                    <p className={`text-sm mt-1 ${isOverdue(currentStep.dueDate) ? 'text-red-800 dark:text-red-200' :
                      isDeadlineApproaching(currentStep.dueDate) ? 'text-orange-800 dark:text-orange-200' :
                        'text-blue-800 dark:text-blue-200'
                      }`}>
                      Assigned to: {currentStep.assigneeName}
                      {currentStep.dueDate && ` • Due: ${formatDate(currentStep.dueDate)}`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Workflow Steps */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                Workflow Steps
              </h3>
              <div className="space-y-4">
                {workflow.steps.sort((a, b) => a.order - b.order).map((step) => {
                  const isActive = step.id === currentStep?.id;
                  const isCompleted = step.status === 'completed';

                  return (
                    <div
                      key={step.id}
                      className={`relative flex items-start gap-4 p-4 rounded-lg border ${isActive
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : isCompleted
                          ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                          : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                        }`}
                    >
                      {/* Timeline Line */}
                      {index < workflow.steps.length - 1 && (
                        <div className={`absolute left-8 top-14 bottom-0 w-0.5 ${isCompleted ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                          }`} />
                      )}

                      {/* Step Icon */}
                      <div className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full ${isCompleted
                        ? 'bg-green-600 text-white'
                        : isActive
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                        {isCompleted ? (
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span className="text-sm font-medium">{step.order}</span>
                        )}
                      </div>

                      {/* Step Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {step.name}
                            </h4>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                {step.assigneeName}
                              </span>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(step.status)}`}>
                                {step.status.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                          {step.dueDate && (
                            <div className="text-xs text-right">
                              <div className={`${isOverdue(step.dueDate) && !isCompleted ? 'text-red-600 font-medium' :
                                isDeadlineApproaching(step.dueDate) && !isCompleted ? 'text-orange-600 font-medium' :
                                  'text-gray-500 dark:text-gray-400'
                                }`}>
                                {formatDate(step.dueDate)}
                              </div>
                              {isOverdue(step.dueDate) && !isCompleted && (
                                <div className="text-red-600 font-medium">Overdue</div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Step Actions */}
                        {isActive && (
                          <div className="flex items-center gap-2 mt-3">
                            <button
                              onClick={() => handleStepAction(step.id, 'approve')}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              {step.type === 'approval' ? 'Approve' : 'Complete'}
                            </button>
                            {step.type === 'review' || step.type === 'approval' ? (
                              <button
                                onClick={() => handleStepAction(step.id, 'reject')}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                              >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Reject
                              </button>
                            ) : null}
                          </div>
                        )}

                        {/* Completion Info */}
                        {isCompleted && step.completedAt && (
                          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            Completed on {formatDate(step.completedAt)}
                            {step.comments && (
                              <div className="mt-1 text-gray-700 dark:text-gray-300">
                                Comment: {step.comments}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Workflow Metadata */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Workflow Details
              </h3>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Created By</dt>
                  <dd className="text-gray-900 dark:text-gray-100 mt-1">{workflow.createdBy}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Created</dt>
                  <dd className="text-gray-900 dark:text-gray-100 mt-1">{formatDate(workflow.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Last Updated</dt>
                  <dd className="text-gray-900 dark:text-gray-100 mt-1">{formatDate(workflow.updatedAt)}</dd>
                </div>
                {workflow.completedAt && (
                  <div>
                    <dt className="text-gray-500 dark:text-gray-400">Completed</dt>
                    <dd className="text-gray-900 dark:text-gray-100 mt-1">{formatDate(workflow.completedAt)}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <svg className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <p className="text-lg mb-2">No active workflow</p>
            <p className="text-sm">Create a workflow to get started</p>
          </div>
        )}
      </div>

      {/* Create Workflow Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-auto">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
              Create Workflow from Template
            </h3>
            <div className="space-y-3 mb-6">
              {templates.map(template => (
                <div
                  key={template.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => setSelectedTemplate(template)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">{template.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{template.description}</p>
                      <div className="text-xs text-gray-500 mt-2">
                        {template.steps.length} steps
                      </div>
                    </div>
                    {selectedTemplate?.id === template.id && (
                      <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                </div>
              ))}
              {templates.length === 0 && (
                <p className="text-center text-gray-500 py-8">No templates available</p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowCreateDialog(false);
                  setSelectedTemplate(null);
                }}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (selectedTemplate) {
                    // Create workflow logic here
                    setShowCreateDialog(false);
                    setSelectedTemplate(null);
                  }
                }}
                disabled={!selectedTemplate}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Workflow
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comment Dialog */}
      {showCommentDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
              {actionType === 'approve' ? 'Approve Step' : 'Reject Step'}
            </h3>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Comments {actionType === 'reject' && '(Required)'}
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                placeholder="Add your comments..."
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowCommentDialog(false);
                  setComment('');
                  setActiveStepId(null);
                }}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={submitStepAction}
                disabled={actionType === 'reject' && !comment.trim()}
                className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed ${actionType === 'approve'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
                  }`}
              >
                {actionType === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
