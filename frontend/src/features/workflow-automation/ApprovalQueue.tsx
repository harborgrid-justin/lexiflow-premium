import React, { useState, useEffect } from 'react';
import { ApprovalChain, ApprovalStatus, ApprovalType, Approver } from './types';

/**
 * ApprovalQueue Component
 * Displays pending approvals for the current user
 */
export const ApprovalQueue: React.FC = () => {
  const [approvals, setApprovals] = useState<ApprovalChain[]>([]);
  const [selectedApproval, setSelectedApproval] = useState<ApprovalChain | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState('');

  useEffect(() => {
    loadApprovals();
  }, []);

  const loadApprovals = async () => {
    try {
      setLoading(true);
      // API call would go here
      // const response = await fetch('/api/approvals/pending');
      // setApprovals(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load approvals:', error);
      setLoading(false);
    }
  };

  const handleApprove = async (chainId: string) => {
    try {
      // await fetch(`/api/approvals/${chainId}/approve`, {
      //   method: 'POST',
      //   body: { comments },
      // });
      alert('Approval submitted successfully');
      setComments('');
      loadApprovals();
      setSelectedApproval(null);
    } catch (error) {
      console.error('Failed to approve:', error);
      alert('Failed to submit approval');
    }
  };

  const handleReject = async (chainId: string) => {
    if (!comments) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      // await fetch(`/api/approvals/${chainId}/reject`, {
      //   method: 'POST',
      //   body: { comments },
      // });
      alert('Rejection submitted successfully');
      setComments('');
      loadApprovals();
      setSelectedApproval(null);
    } catch (error) {
      console.error('Failed to reject:', error);
      alert('Failed to submit rejection');
    }
  };

  const getApprovalTypeLabel = (type: ApprovalType) => {
    const labels = {
      [ApprovalType.SEQUENTIAL]: 'Sequential',
      [ApprovalType.PARALLEL]: 'Parallel',
      [ApprovalType.UNANIMOUS]: 'Unanimous',
      [ApprovalType.MAJORITY]: 'Majority',
    };
    return labels[type];
  };

  const getStatusColor = (status: ApprovalStatus) => {
    const colors = {
      [ApprovalStatus.PENDING]: 'bg-gray-100 text-gray-800',
      [ApprovalStatus.IN_REVIEW]: 'bg-blue-100 text-blue-800',
      [ApprovalStatus.APPROVED]: 'bg-green-100 text-green-800',
      [ApprovalStatus.REJECTED]: 'bg-red-100 text-red-800',
      [ApprovalStatus.CANCELLED]: 'bg-orange-100 text-orange-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Approval Queue</h1>
        <p className="mt-1 text-sm text-gray-600">
          Items pending your approval
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Approval List */}
        <div className="col-span-1 bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Pending Approvals ({approvals.length})</h3>
          </div>
          <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                Loading approvals...
              </div>
            ) : approvals.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>No pending approvals</p>
                <p className="text-xs mt-2">You're all caught up!</p>
              </div>
            ) : (
              approvals.map((approval) => (
                <div
                  key={approval.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${
                    selectedApproval?.id === approval.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedApproval(approval)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-medium text-gray-900">{approval.name}</div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(approval.status)}`}>
                      {approval.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>Type: {getApprovalTypeLabel(approval.approvalType)}</div>
                    <div>Progress: {approval.receivedApprovals}/{approval.requiredApprovals}</div>
                    {approval.deadline && (
                      <div className="text-red-600 mt-1">
                        Due: {new Date(approval.deadline).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Approval Details */}
        <div className="col-span-2 bg-white border border-gray-200 rounded-lg">
          {!selectedApproval ? (
            <div className="p-12 text-center text-gray-500">
              Select an approval to review
            </div>
          ) : (
            <div>
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedApproval.name}
                    </h3>
                    {selectedApproval.description && (
                      <p className="mt-1 text-sm text-gray-600">
                        {selectedApproval.description}
                      </p>
                    )}
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedApproval.status)}`}>
                    {selectedApproval.status}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Type</div>
                    <div className="font-medium text-gray-900">
                      {getApprovalTypeLabel(selectedApproval.approvalType)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Progress</div>
                    <div className="font-medium text-gray-900">
                      {selectedApproval.receivedApprovals} / {selectedApproval.requiredApprovals} approvals
                    </div>
                  </div>
                  {selectedApproval.deadline && (
                    <div>
                      <div className="text-gray-500">Deadline</div>
                      <div className="font-medium text-gray-900">
                        {new Date(selectedApproval.deadline).toLocaleString()}
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="text-gray-500">Requested By</div>
                    <div className="font-medium text-gray-900">
                      {selectedApproval.requestedBy}
                    </div>
                  </div>
                </div>

                {selectedApproval.requestReason && (
                  <div className="mt-4 p-3 bg-gray-50 rounded">
                    <div className="text-xs text-gray-500 mb-1">Request Reason</div>
                    <div className="text-sm text-gray-900">{selectedApproval.requestReason}</div>
                  </div>
                )}
              </div>

              {/* Approvers */}
              <div className="p-6 border-b border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-4">Approvers</h4>
                <div className="space-y-3">
                  {selectedApproval.approvers.map((approver, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded ${
                        approver.status === 'approved' ? 'bg-green-50' :
                        approver.status === 'rejected' ? 'bg-red-50' :
                        approver.status === 'skipped' ? 'bg-gray-50' :
                        'bg-blue-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium">
                          {approver.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{approver.userName}</div>
                          {approver.role && (
                            <div className="text-xs text-gray-600">{approver.role}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {approver.required && (
                          <span className="text-xs text-gray-500">Required</span>
                        )}
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          approver.status === 'approved' ? 'bg-green-100 text-green-800' :
                          approver.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          approver.status === 'skipped' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {approver.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              {selectedApproval.status === ApprovalStatus.PENDING ||
               selectedApproval.status === ApprovalStatus.IN_REVIEW ? (
                <div className="p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Your Decision</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Comments
                      </label>
                      <textarea
                        className="w-full rounded-md border border-gray-300 px-3 py-2"
                        rows={4}
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder="Add your comments (required for rejection)"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        className="flex-1 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
                        onClick={() => handleApprove(selectedApproval.id)}
                      >
                        Approve
                      </button>
                      <button
                        className="flex-1 px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
                        onClick={() => handleReject(selectedApproval.id)}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  This approval has been {selectedApproval.status}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApprovalQueue;
