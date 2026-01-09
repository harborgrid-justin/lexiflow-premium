'use client';

/**
 * Write-Off Detail Actions Component
 *
 * Client-side form actions for write-off approval/rejection workflow.
 */

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  Loader2,
  X,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  writeOffFormAction,
} from '../../write-off-actions';
import {
  type WriteOffRequest,
} from '../../write-off-types';
import type { ActionResult } from '../../types';

interface WriteOffActionsProps {
  writeOff: WriteOffRequest;
}

export function WriteOffActions({ writeOff }: WriteOffActionsProps) {
  const router = useRouter();
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [state, formAction, isPending] = useActionState(
    writeOffFormAction,
    { success: false } as ActionResult
  );

  // Handle successful action completion
  const successState = state.success;
  useEffect(() => {
    if (successState) {
      router.refresh();
    }
  }, [successState, router]);

  // Reset modals after success (using refs to avoid triggering render loop)
  useEffect(() => {
    if (successState) {
      // Use setTimeout to avoid synchronous setState in effect
      const timer = setTimeout(() => {
        setShowApproveModal(false);
        setShowRejectModal(false);
        setShowDeleteModal(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [successState]);

  // Only show actions for pending write-offs
  if (writeOff.status !== 'pending') {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Approve Button */}
      <button
        onClick={() => setShowApproveModal(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
      >
        <CheckCircle2 className="h-4 w-4" />
        Approve
      </button>

      {/* Reject Button */}
      <button
        onClick={() => setShowRejectModal(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
      >
        <XCircle className="h-4 w-4" />
        Reject
      </button>

      {/* Edit Button */}
      <button
        onClick={() => router.push(`/billing/write-offs/${writeOff.id}/edit`)}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
      >
        <Edit className="h-4 w-4" />
        Edit
      </button>

      {/* Delete Button */}
      <button
        onClick={() => setShowDeleteModal(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 dark:border-red-600 dark:bg-slate-700 dark:text-red-400"
      >
        <Trash2 className="h-4 w-4" />
        Cancel
      </button>

      {/* Error Display */}
      {state.error && (
        <span className="text-sm text-red-600">{state.error}</span>
      )}

      {/* Approve Modal */}
      {showApproveModal && (
        <ApproveModal
          writeOff={writeOff}
          onClose={() => setShowApproveModal(false)}
          formAction={formAction}
          isPending={isPending}
          state={state}
        />
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <RejectModal
          writeOff={writeOff}
          onClose={() => setShowRejectModal(false)}
          formAction={formAction}
          isPending={isPending}
          state={state}
        />
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <DeleteModal
          writeOff={writeOff}
          onClose={() => setShowDeleteModal(false)}
          formAction={formAction}
          isPending={isPending}
          state={state}
        />
      )}
    </div>
  );
}

// =============================================================================
// Modal Components
// =============================================================================

interface ModalProps {
  writeOff: WriteOffRequest;
  onClose: () => void;
  formAction: (payload: FormData) => void;
  isPending: boolean;
  state: ActionResult;
}

function ApproveModal({
  writeOff,
  onClose,
  formAction,
  isPending,
  state,
}: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Approve Write-Off
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 rounded-lg bg-emerald-50 p-4 dark:bg-emerald-900/20">
          <p className="text-sm text-emerald-800 dark:text-emerald-300">
            You are about to approve a write-off of{' '}
            <span className="font-semibold">
              ${writeOff.amount.toFixed(2)}
            </span>{' '}
            for invoice{' '}
            <span className="font-semibold">{writeOff.invoiceNumber}</span>.
          </p>
          <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-400">
            This will update the invoice balance and AR records.
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="intent" value="approve" />
          <input type="hidden" name="id" value={writeOff.id} />

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Approval Notes (Optional)
            </label>
            <textarea
              name="approverNotes"
              rows={3}
              placeholder="Add any notes about this approval..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            />
          </div>

          {state.error && (
            <p className="text-sm text-red-600">{state.error}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-white disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Approve Write-Off
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RejectModal({
  writeOff,
  onClose,
  formAction,
  isPending,
  state,
}: ModalProps) {
  const [reason, setReason] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Reject Write-Off
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-300">
            You are about to reject a write-off request of{' '}
            <span className="font-semibold">
              ${writeOff.amount.toFixed(2)}
            </span>{' '}
            for invoice{' '}
            <span className="font-semibold">{writeOff.invoiceNumber}</span>.
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="intent" value="reject" />
          <input type="hidden" name="id" value={writeOff.id} />

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              name="rejectionReason"
              rows={3}
              required
              minLength={10}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this write-off request is being rejected..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            />
            <p className="mt-1 text-xs text-slate-500">
              Minimum 10 characters required
            </p>
          </div>

          {state.error && (
            <p className="text-sm text-red-600">{state.error}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-white disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || reason.length < 10}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              Reject Write-Off
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteModal({
  writeOff,
  onClose,
  formAction,
  isPending,
  state,
}: ModalProps) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Cancel Write-Off Request
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 rounded-lg bg-amber-50 p-4 dark:bg-amber-900/20">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            Are you sure you want to cancel this write-off request? This action
            cannot be undone.
          </p>
          <div className="mt-2 text-sm text-amber-700 dark:text-amber-400">
            <p>
              <strong>Invoice:</strong> {writeOff.invoiceNumber}
            </p>
            <p>
              <strong>Amount:</strong> ${writeOff.amount.toFixed(2)}
            </p>
          </div>
        </div>

        <form
          action={async (formData) => {
            formAction(formData);
            // Navigate back after successful deletion
            if (!state.error) {
              router.push('/billing/write-offs');
            }
          }}
          className="space-y-4"
        >
          <input type="hidden" name="intent" value="delete" />
          <input type="hidden" name="id" value={writeOff.id} />

          {state.error && (
            <p className="text-sm text-red-600">{state.error}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-white disabled:opacity-50"
            >
              Keep Request
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Cancel Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
