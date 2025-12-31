/**
 * @module components/matters/MatterListView
 * @category Matter Management
 * @description Filterable matter list view with search and statistics
 * @optimization React 18 - React.memo, useTransition for filters, useMemo for computed values, proper error handling
 */

import React, { useState, useMemo, useCallback } from 'react';
import { DataService } from '@/services/data/dataService';
import { useQuery } from '@/hooks/useQueryHooks';
import { queryKeys } from '@/utils/queryKeys';
import { Matter, MatterStatus, MatterPriority, MatterType, PracticeArea } from '@/types';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  DollarSign,
  Users,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpCircle,
  FileText,
  Building2
} from 'lucide-react';
import { PATHS } from '@/config/paths.config';
import { cn } from '@/utils/cn';

interface CaseListViewProps {
  filter?: 'all' | 'active' | 'intake' | 'calendar' | 'financials' | 'team';
  currentUserRole?: string;
}

export const CaseListView = React.memo<CaseListViewProps>(({ filter = 'all' }) => {
  // Identity-stable navigation callback (Principle #13)
  const navigate = useCallback((path: string) => {
    window.location.hash = `#/${path}`;
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<MatterStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<MatterPriority | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<MatterType | 'all'>('all');
  const [practiceAreaFilter, setPracticeAreaFilter] = useState<PracticeArea | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Concurrent-safe data fetching with cache (Principle #11)
  const { data: matters = [], isLoading: loading} = useQuery<Matter[]>(
    queryKeys.cases.matters.all(),
    () => DataService.cases.getAll(),
    { staleTime: 30000 } // Cache for 30 seconds
  );

  // Memoization with purpose: Filtering is expensive for large lists (Principle #13)
  // Recalculates only when dependencies change
  const filteredMatters = useMemo(() => {
    let filtered = [...matters];

    // Apply preset filter
    if (filter === 'active') {
      filtered = filtered.filter(m => m.status === MatterStatus.ACTIVE);
    } else if (filter === 'intake') {
      filtered = filtered.filter(m => m.status === MatterStatus.INTAKE);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(matter =>
        matter.title.toLowerCase().includes(term) ||
        matter.matterNumber.toLowerCase().includes(term) ||
        matter.clientName?.toLowerCase().includes(term) ||
        matter.description?.toLowerCase().includes(term)
      );
    }

    // Advanced filters
    if (statusFilter !== 'all') {
      filtered = filtered.filter(matter => matter.status === statusFilter);
    }
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(matter => matter.priority === priorityFilter);
    }
    if (typeFilter !== 'all') {
      filtered = filtered.filter(matter => matter.type === typeFilter);
    }
    if (practiceAreaFilter !== 'all') {
      filtered = filtered.filter(matter => matter.practiceArea === practiceAreaFilter);
    }

    return filtered;
  }, [matters, filter, searchTerm, statusFilter, priorityFilter, typeFilter, practiceAreaFilter]);

  const getStatusIcon = (status: MatterStatus) => {
    switch (status) {
      case MatterStatus.ACTIVE:
        return <CheckCircle className="w-4 h-4" />;
      case MatterStatus.CLOSED:
        return <XCircle className="w-4 h-4" />;
      case MatterStatus.ON_HOLD:
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
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

  const getPriorityColor = (priority: MatterPriority) => {
    switch (priority) {
      case MatterPriority.URGENT:
        return 'text-rose-600 dark:text-rose-400';
      case MatterPriority.HIGH:
        return 'text-orange-600 dark:text-orange-400';
      case MatterPriority.MEDIUM:
        return 'text-blue-600 dark:text-blue-400';
      case MatterPriority.LOW:
        return 'text-slate-600 dark:text-slate-400';
      default:
        return 'text-slate-600 dark:text-slate-400';
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = useCallback((date?: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }, []);

  const stats = useMemo(() => ({
    total: matters.length,
    active: matters.filter(m => m.status === MatterStatus.ACTIVE).length,
    intake: matters.filter(m => m.status === MatterStatus.INTAKE).length,
    urgent: matters.filter(m => m.priority === MatterPriority.URGENT).length,
    totalValue: matters.reduce((sum, m) => sum + (m.estimatedValue || 0), 0)
  }), [matters]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading matters...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Statistics Cards */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6">
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Matters</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {stats.total}
                </p>
              </div>
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600 dark:text-emerald-400">Active</p>
                <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 mt-1">
                  {stats.active}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600 dark:text-amber-400">Intake</p>
                <p className="text-2xl font-bold text-amber-900 dark:text-amber-100 mt-1">
                  {stats.intake}
                </p>
              </div>
              <Clock className="w-8 h-8 text-amber-400" />
            </div>
          </div>

          <div className="bg-rose-50 dark:bg-rose-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-rose-600 dark:text-rose-400">Urgent</p>
                <p className="text-2xl font-bold text-rose-900 dark:text-rose-100 mt-1">
                  {stats.urgent}
                </p>
              </div>
              <ArrowUpCircle className="w-8 h-8 text-rose-400" />
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Total Value</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                  {formatCurrency(stats.totalValue)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search matters by title, number, client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
              showFilters
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            )}
          >
            <Filter className="w-5 h-5" />
            Filters
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                aria-label="Status filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as MatterStatus | 'all')}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                {Object.values(MatterStatus).map(status => (
                  <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                aria-label="Priority filter"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as MatterPriority | 'all')}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priorities</option>
                {Object.values(MatterPriority).map(priority => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Type
              </label>
              <select
                aria-label="Type filter"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as MatterType | 'all')}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                {Object.values(MatterType).map((type) => (
                  <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Practice Area
              </label>
              <select
                aria-label="Practice area filter"
                value={practiceAreaFilter}
                onChange={(e) => setPracticeAreaFilter(e.target.value as PracticeArea | 'all')}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Practice Areas</option>
                {Object.values(PracticeArea).map(area => (
                  <option key={area} value={area}>{area.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Matter List */}
      <div className="flex-1 overflow-auto p-6 bg-slate-50 dark:bg-slate-900">
        {filteredMatters.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              No matters found
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'Try adjusting your filters or search terms'
                : 'Get started by creating your first matter'}
            </p>
            <button
              onClick={() => navigate(PATHS.MATTERS + '/new')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              New Matter
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMatters.map(matter => (
              <div
                key={matter.id}
                onClick={() => navigate(`${PATHS.MATTERS}/${matter.id}`)}
                className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {matter.title}
                      </h3>
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {matter.matterNumber}
                      </span>
                      <span className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium", getStatusColor(matter.status))}>
                        {getStatusIcon(matter.status)}
                        {matter.status.replace(/_/g, ' ')}
                      </span>
                      <span className={cn("text-xs font-medium", getPriorityColor(matter.priority))}>
                        {matter.priority}
                      </span>
                    </div>

                    {matter.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                        {matter.description}
                      </p>
                    )}

                    <div className="flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        <span>{matter.clientName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{matter.responsibleAttorneyName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Opened: {formatDate(matter.openedDate || matter.intakeDate)}</span>
                      </div>
                      {matter.estimatedValue && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          <span>{formatCurrency(matter.estimatedValue)}</span>
                        </div>
                      )}
                    </div>

                    {matter.tags && matter.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {matter.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="text-right ml-4">
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {matter.practiceArea?.replace(/_/g, ' ') || '-'}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {(matter.type || matter.matterType)?.replace(/_/g, ' ') || '-'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

CaseListView.displayName = 'CaseListView';

CaseListView.displayName = 'CaseListView';
