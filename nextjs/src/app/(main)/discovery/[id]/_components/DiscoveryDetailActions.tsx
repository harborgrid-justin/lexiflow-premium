'use client';

/**
 * Discovery Detail Actions Component
 * Action buttons for the discovery detail page
 */

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import {
  Edit,
  Trash2,
  Send,
  FileText,
  MoreHorizontal,
  CheckCircle,
  AlertTriangle,
  Download,
} from 'lucide-react';
import {
  deleteDiscoveryRequest,
  serveDiscoveryRequest,
  respondToDiscoveryRequest,
  fileDiscoveryMotion,
} from '../../_actions';
import type { DiscoveryRequest } from '../../_types';

interface DiscoveryDetailActionsProps {
  request: DiscoveryRequest;
}

export function DiscoveryDetailActions({ request }: DiscoveryDetailActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showMenu, setShowMenu] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this discovery request?')) {
      return;
    }

    startTransition(async () => {
      const result = await deleteDiscoveryRequest(request.id);
      if (result.success) {
        router.push('/discovery');
      } else {
        alert(result.error || 'Failed to delete');
      }
    });
  };

  const handleServe = async () => {
    startTransition(async () => {
      const result = await serveDiscoveryRequest(request.id, 'email');
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error || 'Failed to serve');
      }
    });
  };

  const handleFileMotion = async (type: 'compel' | 'protective_order' | 'sanctions') => {
    startTransition(async () => {
      const result = await fileDiscoveryMotion(request.id, type);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error || 'Failed to file motion');
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      {/* Primary Action based on status */}
      {request.status === 'draft' && (
        <Button
          onClick={handleServe}
          disabled={isPending}
          icon={<Send className="h-4 w-4" />}
        >
          Serve Request
        </Button>
      )}

      {(request.status === 'served' || request.status === 'pending') && (
        <Button
          onClick={() => setShowResponseModal(true)}
          disabled={isPending}
          icon={<CheckCircle className="h-4 w-4" />}
        >
          Record Response
        </Button>
      )}

      {request.status === 'overdue' && (
        <Button
          onClick={() => handleFileMotion('compel')}
          disabled={isPending}
          variant="destructive"
          icon={<AlertTriangle className="h-4 w-4" />}
        >
          File Motion to Compel
        </Button>
      )}

      {/* Edit Button */}
      <Button
        variant="outline"
        onClick={() => router.push(`/discovery/${request.id}/edit`)}
        disabled={isPending}
        icon={<Edit className="h-4 w-4" />}
      >
        Edit
      </Button>

      {/* More Actions Dropdown */}
      <div className="relative">
        <Button
          variant="outline"
          onClick={() => setShowMenu(!showMenu)}
          disabled={isPending}
          icon={<MoreHorizontal className="h-4 w-4" />}
        />

        {showMenu && (
          <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-10">
            <button
              onClick={() => router.push(`/discovery/${request.id}/documents`)}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <FileText className="h-4 w-4" />
              View Documents
            </button>

            <button
              onClick={() => {/* Export functionality */}}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <Download className="h-4 w-4" />
              Export Request
            </button>

            <hr className="my-1 border-slate-200 dark:border-slate-700" />

            {request.status !== 'motion_filed' && (
              <>
                <button
                  onClick={() => handleFileMotion('compel')}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <AlertTriangle className="h-4 w-4" />
                  File Motion to Compel
                </button>

                <button
                  onClick={() => handleFileMotion('protective_order')}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <FileText className="h-4 w-4" />
                  File Protective Order
                </button>
              </>
            )}

            <hr className="my-1 border-slate-200 dark:border-slate-700" />

            <button
              onClick={handleDelete}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4" />
              Delete Request
            </button>
          </div>
        )}
      </div>

      {/* Response Modal */}
      {showResponseModal && (
        <ResponseModal
          requestId={request.id}
          onClose={() => setShowResponseModal(false)}
          onSuccess={() => {
            setShowResponseModal(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

interface ResponseModalProps {
  requestId: string;
  onClose: () => void;
  onSuccess: () => void;
}

function ResponseModal({ requestId, onClose, onSuccess }: ResponseModalProps) {
  const [response, setResponse] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (!response.trim()) {
      alert('Please enter a response');
      return;
    }

    startTransition(async () => {
      const result = await respondToDiscoveryRequest(requestId, response);
      if (result.success) {
        onSuccess();
      } else {
        alert(result.error || 'Failed to submit response');
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-lg w-full mx-4">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Record Response
          </h3>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Response Notes
            </label>
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter response details, objections, or notes..."
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending ? 'Submitting...' : 'Submit Response'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
