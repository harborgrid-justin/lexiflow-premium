import React, { useState, useEffect } from 'react';
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Lock,
  Unlock,
  Archive,
  FileX,
} from 'lucide-react';
import { RetentionPolicy } from '../types';
import { format } from 'date-fns';

interface RetentionPolicyManagerProps {
  onPolicyCreate?: (policy: Partial<RetentionPolicy>) => Promise<void>;
  onPolicyUpdate?: (policyId: string, updates: Partial<RetentionPolicy>) => Promise<void>;
  onPolicyDelete?: (policyId: string) => Promise<void>;
  onLegalHold?: (policyId: string, reason: string) => Promise<void>;
}

/**
 * RetentionPolicyManager Component
 *
 * Manage document retention policies and legal holds:
 * - Create/edit/delete policies
 * - Set retention periods and actions
 * - Configure auto-apply rules
 * - Place and release legal holds
 * - View policy statistics
 * - Monitor upcoming actions
 */
export const RetentionPolicyManager: React.FC<RetentionPolicyManagerProps> = ({
  onPolicyCreate,
  onPolicyUpdate,
  onPolicyDelete,
  onLegalHold,
}) => {
  const [policies, setPolicies] = useState<RetentionPolicy[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<RetentionPolicy | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockPolicies: RetentionPolicy[] = [
        {
          id: 'policy-1',
          name: 'Litigation Hold - Active Cases',
          description: '7-year retention for all active litigation documents',
          retentionDays: 2555, // ~7 years
          action: 'review',
          appliesTo: ['complaint', 'motion', 'brief', 'court_order'],
          status: 'active',
          priority: 100,
          isLegalHold: true,
          legalHoldReason: 'Ongoing litigation: Smith v. Corp',
          effectiveDate: new Date('2024-01-01'),
          documentsCount: 1250,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-15'),
        },
        {
          id: 'policy-2',
          name: 'Discovery Documents - Standard Retention',
          description: 'Retain discovery documents for 5 years, then archive',
          retentionDays: 1825, // 5 years
          action: 'archive',
          appliesTo: ['deposition', 'interrogatories', 'requests_for_production'],
          status: 'active',
          priority: 50,
          isLegalHold: false,
          effectiveDate: new Date('2023-01-01'),
          documentsCount: 850,
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-12-15'),
        },
        {
          id: 'policy-3',
          name: 'Contracts - Permanent Archive',
          description: 'Archive all contracts indefinitely',
          retentionDays: 36500, // 100 years (effectively permanent)
          action: 'archive',
          appliesTo: ['contract', 'agreement'],
          status: 'active',
          priority: 90,
          isLegalHold: false,
          effectiveDate: new Date('2020-01-01'),
          documentsCount: 3200,
          createdAt: new Date('2020-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ];

      setPolicies(mockPolicies);
    } catch (error) {
      console.error('Failed to load policies:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'delete':
        return <FileX className="w-4 h-4 text-red-500" />;
      case 'archive':
        return <Archive className="w-4 h-4 text-blue-500" />;
      case 'review':
        return <CheckCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      draft: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    };

    return (
      <span className={`px-2 py-1 text-xs rounded-full ${colors[status as keyof typeof colors]}`}>
        {status}
      </span>
    );
  };

  const formatRetentionDays = (days: number): string => {
    const years = Math.floor(days / 365);
    const months = Math.floor((days % 365) / 30);

    if (years >= 10) return `${years} years`;
    if (years > 0 && months > 0) return `${years}y ${months}m`;
    if (years > 0) return `${years} years`;
    if (months > 0) return `${months} months`;
    return `${days} days`;
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold">Retention Policies</h2>
          <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded-full">
            {policies.length} policies
          </span>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Policy
        </button>
      </div>

      {/* Statistics Summary */}
      <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {policies.filter((p) => p.status === 'active').length}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Active Policies</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {policies.filter((p) => p.isLegalHold).length}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Legal Holds</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {policies.reduce((sum, p) => sum + p.documentsCount, 0).toLocaleString()}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Documents</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {/* Mock upcoming actions count */}
            24
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Upcoming Actions</div>
        </div>
      </div>

      {/* Policy List */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        ) : policies.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Shield className="w-16 h-16 mb-2" />
            <p>No retention policies configured</p>
          </div>
        ) : (
          <div className="space-y-4">
            {policies.map((policy) => (
              <div
                key={policy.id}
                className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-colors"
              >
                {/* Policy Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{policy.name}</h3>
                      {getStatusBadge(policy.status)}
                      {policy.isLegalHold && (
                        <span className="flex items-center gap-1 px-2 py-1 text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full">
                          <Lock className="w-3 h-3" />
                          Legal Hold
                        </span>
                      )}
                    </div>
                    {policy.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {policy.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingPolicy(policy)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete this policy?')) {
                          onPolicyDelete?.(policy.id);
                        }
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Policy Details */}
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Retention Period
                    </div>
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <Clock className="w-4 h-4" />
                      {formatRetentionDays(policy.retentionDays)}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Action
                    </div>
                    <div className="flex items-center gap-1 text-sm font-medium capitalize">
                      {getActionIcon(policy.action)}
                      {policy.action}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Documents
                    </div>
                    <div className="text-sm font-medium">
                      {policy.documentsCount.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Applies To */}
                <div className="mb-3">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Applies To
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {policy.appliesTo.map((category) => (
                      <span
                        key={category}
                        className="px-2 py-1 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full"
                      >
                        {category.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Legal Hold Info */}
                {policy.isLegalHold && policy.legalHoldReason && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-xs font-medium text-red-900 dark:text-red-200 mb-1">
                        Legal Hold Reason
                      </div>
                      <div className="text-xs text-red-800 dark:text-red-300">
                        {policy.legalHoldReason}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm('Release legal hold on this policy?')) {
                          onPolicyUpdate?.(policy.id, { isLegalHold: false });
                        }
                      }}
                      className="flex items-center gap-1 px-2 py-1 text-xs text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40 rounded transition-colors"
                    >
                      <Unlock className="w-3 h-3" />
                      Release
                    </button>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                  <div>
                    Priority: {policy.priority}
                  </div>
                  <div>
                    Effective: {format(policy.effectiveDate, 'MMM d, yyyy')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RetentionPolicyManager;
