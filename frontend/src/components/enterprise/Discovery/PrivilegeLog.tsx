/**
 * @module enterprise/Discovery/PrivilegeLog
 * @category Enterprise eDiscovery
 * @description Privilege log management with batch tagging and export to court format
 */

import { Button } from '@/components/ui/atoms/Button/Button';
import { useTheme } from '@/contexts/theme/ThemeContext';
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle2,
  CheckSquare,
  Download,
  Edit,
  Eye,
  Filter,
  Plus,
  Search,
  Shield,
  Square,
  Trash2,
  Upload,
  XCircle
} from 'lucide-react';
import React, { useState } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface PrivilegeEntry {
  id: string;
  documentId: string;
  batesNumber: string;
  documentDate: Date;
  author: string;
  recipients: string[];
  subject: string;
  description: string;
  privilegeType: 'attorney-client' | 'work-product' | 'both' | 'trade-secret' | 'other';
  basis: string;
  reviewedBy: string;
  reviewDate: Date;
  status: 'pending' | 'reviewed' | 'challenged' | 'upheld' | 'waived';
  notes?: string;
}

export interface PrivilegeLogProps {
  caseId?: string;
  onNavigate?: (view: string, id?: string) => void;
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const PrivilegeLog: React.FC<PrivilegeLogProps> = ({
  className,
  caseId
}) => {
  const { theme } = useTheme();
  // Initialize with empty array for production
  const [entries, setEntries] = useState<PrivilegeEntry[]>([]);
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPrivilegeLog = async () => {
      try {
        const data = await DataService.discovery.getPrivilegeLog();
        // Transform to local type or cast if compatible
        setEntries((data || []) as unknown as PrivilegeEntry[]);
      } catch (err) {
        console.warn('Failed to load privilege log', err);
      }
    };
    fetchPrivilegeLog();
  }, [caseId]);
  const [filterType, setFilterType] = useState<string>('all');
  const [showBatchActions, setShowBatchActions] = useState(false);

  // Filter entries
  const filteredEntries = entries.filter(entry => {
    const matchesSearch = !searchQuery ||
      entry.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.batesNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.author.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filterType === 'all' || entry.privilegeType === filterType;

    return matchesSearch && matchesFilter;
  });

  const toggleSelectEntry = (id: string) => {
    const newSelected = new Set(selectedEntries);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedEntries(newSelected);
    setShowBatchActions(newSelected.size > 0);
  };

  const toggleSelectAll = () => {
    if (selectedEntries.size === filteredEntries.length) {
      setSelectedEntries(new Set());
      setShowBatchActions(false);
    } else {
      setSelectedEntries(new Set(filteredEntries.map(e => e.id)));
      setShowBatchActions(true);
    }
  };

  const handleBatchTag = (privilegeType: PrivilegeEntry['privilegeType']) => {
    setEntries(entries.map(entry =>
      selectedEntries.has(entry.id)
        ? { ...entry, privilegeType }
        : entry
    ));
    setSelectedEntries(new Set());
    setShowBatchActions(false);
  };

  const handleExportToCourtFormat = () => {
    // In real implementation, this would generate a formatted privilege log
    alert('Exporting privilege log in court-approved format...');
  };

  const getStatusIcon = (status: PrivilegeEntry['status']) => {
    switch (status) {
      case 'reviewed':
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-amber-600" />;
      case 'challenged':
        return <XCircle className="h-4 w-4 text-rose-600" />;
      case 'upheld':
        return <Shield className="h-4 w-4 text-blue-600" />;
      case 'waived':
        return <XCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: PrivilegeEntry['status']) => {
    switch (status) {
      case 'reviewed':
      case 'upheld':
        return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'pending':
        return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400';
      case 'challenged':
      case 'waived':
        return 'text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400';
    }
  };

  const getPrivilegeTypeColor = (type: PrivilegeEntry['privilegeType']) => {
    switch (type) {
      case 'attorney-client':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400';
      case 'work-product':
        return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400';
      case 'both':
        return 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400';
      case 'trade-secret':
        return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'other':
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={cn('text-2xl font-bold flex items-center gap-2', theme.text.primary)}>
            <Shield className="h-7 w-7 text-blue-600" />
            Privilege Log
          </h2>
          <p className={cn('text-sm mt-1', theme.text.secondary)}>
            Manage privileged documents and export court-formatted logs
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={Upload}>
            Import
          </Button>
          <Button variant="secondary" icon={Download} onClick={handleExportToCourtFormat}>
            Export Court Format
          </Button>
          <Button variant="primary" icon={Plus}>
            Add Entry
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Entries', value: entries.length, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
          { label: 'Attorney-Client', value: entries.filter(e => e.privilegeType === 'attorney-client' || e.privilegeType === 'both').length, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
          { label: 'Work Product', value: entries.filter(e => e.privilegeType === 'work-product' || e.privilegeType === 'both').length, color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
          { label: 'Pending Review', value: entries.filter(e => e.status === 'pending').length, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
          { label: 'Challenged', value: entries.filter(e => e.status === 'challenged').length, color: 'text-rose-600', bg: 'bg-rose-100 dark:bg-rose-900/30' }
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn('p-4 rounded-lg border', theme.surface.default, theme.border.default)}
          >
            <p className={cn('text-xs font-medium mb-1', theme.text.secondary)}>{stat.label}</p>
            <p className={cn('text-2xl font-bold', stat.color)}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className={cn('absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4', theme.text.tertiary)} />
          <input
            type="text"
            placeholder="Search by Bates number, subject, or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              'w-full pl-10 pr-4 py-2 rounded-lg border',
              theme.surface.input,
              theme.border.default
            )}
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className={cn(
              'px-4 py-2 rounded-lg border',
              theme.surface.input,
              theme.border.default
            )}
          >
            <option value="all">All Types</option>
            <option value="attorney-client">Attorney-Client</option>
            <option value="work-product">Work Product</option>
            <option value="both">Both</option>
            <option value="trade-secret">Trade Secret</option>
            <option value="other">Other</option>
          </select>
          <Button variant="secondary" icon={Filter}>
            More Filters
          </Button>
        </div>
      </div>

      {/* Batch Actions Bar */}
      {showBatchActions && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn('p-4 rounded-lg border', theme.surface.default, theme.border.default)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={cn('text-sm font-medium', theme.text.primary)}>
                {selectedEntries.size} selected
              </span>
              <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
              <span className={cn('text-xs', theme.text.secondary)}>Batch Actions:</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleBatchTag('attorney-client')}
              >
                Tag as Attorney-Client
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleBatchTag('work-product')}
              >
                Tag as Work Product
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleBatchTag('both')}
              >
                Tag as Both
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={Trash2}
              >
                Delete
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Privilege Log Table */}
      <div className={cn('rounded-lg border overflow-hidden', theme.border.default)}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={cn('border-b', theme.background, theme.border.default)}>
              <tr>
                <th className="px-4 py-3 text-left">
                  <button onClick={toggleSelectAll}>
                    {selectedEntries.size === filteredEntries.length ? (
                      <CheckSquare className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Square className={cn('h-5 w-5', theme.text.tertiary)} />
                    )}
                  </button>
                </th>
                <th className={cn('px-6 py-3 text-left text-xs font-medium uppercase tracking-wider', theme.text.secondary)}>
                  Bates Number
                </th>
                <th className={cn('px-6 py-3 text-left text-xs font-medium uppercase tracking-wider', theme.text.secondary)}>
                  Date
                </th>
                <th className={cn('px-6 py-3 text-left text-xs font-medium uppercase tracking-wider', theme.text.secondary)}>
                  Author
                </th>
                <th className={cn('px-6 py-3 text-left text-xs font-medium uppercase tracking-wider', theme.text.secondary)}>
                  Recipients
                </th>
                <th className={cn('px-6 py-3 text-left text-xs font-medium uppercase tracking-wider', theme.text.secondary)}>
                  Subject
                </th>
                <th className={cn('px-6 py-3 text-left text-xs font-medium uppercase tracking-wider', theme.text.secondary)}>
                  Privilege Type
                </th>
                <th className={cn('px-6 py-3 text-left text-xs font-medium uppercase tracking-wider', theme.text.secondary)}>
                  Status
                </th>
                <th className={cn('px-6 py-3 text-left text-xs font-medium uppercase tracking-wider', theme.text.secondary)}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={cn('divide-y', theme.surface.default, theme.border.default)}>
              {filteredEntries.map((entry) => (
                <motion.tr
                  key={entry.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={cn('hover:bg-gray-50 dark:hover:bg-gray-800/50')}
                >
                  <td className="px-4 py-4">
                    <button onClick={() => toggleSelectEntry(entry.id)}>
                      {selectedEntries.has(entry.id) ? (
                        <CheckSquare className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Square className={cn('h-5 w-5', theme.text.tertiary)} />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn('text-sm font-mono font-medium', theme.text.primary)}>
                      {entry.batesNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn('text-sm', theme.text.secondary)}>
                      {entry.documentDate.toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn('text-sm', theme.text.primary)}>{entry.author}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {entry.recipients.slice(0, 2).map((recipient, idx) => (
                        <span
                          key={idx}
                          className={cn('text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700', theme.text.secondary)}
                        >
                          {recipient}
                        </span>
                      ))}
                      {entry.recipients.length > 2 && (
                        <span className={cn('text-xs px-2 py-1', theme.text.tertiary)}>
                          +{entry.recipients.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <p className={cn('text-sm font-medium truncate', theme.text.primary)}>
                        {entry.subject}
                      </p>
                      <p className={cn('text-xs truncate', theme.text.tertiary)}>
                        {entry.description}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getPrivilegeTypeColor(entry.privilegeType))}>
                      {entry.privilegeType.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(entry.status)}
                      <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getStatusColor(entry.status))}>
                        {entry.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className={cn('p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700', theme.text.secondary)}>
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className={cn('p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700', theme.text.secondary)}>
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className={cn('p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-rose-600')}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredEntries.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={cn('p-12 rounded-lg border text-center', theme.surface.default, theme.border.default)}
        >
          <Shield className={cn('h-16 w-16 mx-auto mb-4 opacity-20', theme.text.primary)} />
          <h3 className={cn('text-lg font-semibold mb-2', theme.text.primary)}>
            No Privilege Entries Found
          </h3>
          <p className={cn('text-sm', theme.text.secondary)}>
            {searchQuery || filterType !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Start by adding your first privilege log entry'
            }
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default PrivilegeLog;
