/**
 * CaseManagementHub Component
 * 
 * Enterprise-grade SaaS case management hub that centralizes all case-related operations.
 * 
 * Features:
 * - Unified case listing with advanced filtering
 * - Quick case creation with specialized forms
 * - Real-time search and sorting
 * - Bulk operations and exports
 * - Case analytics and metrics
 * - Role-based access control
 * - Mobile-responsive design
 * 
 * @module components/case-management/CaseManagementHub
 * @category Case Management - Enterprise Hub
 */

import React, { useState, useMemo, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Download,
  MoreVertical,
  Grid,
  List,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Scale,
  FileText,
  Calendar,
  Building2,
  Eye,
  Edit,
  Trash2,
  Archive
} from 'lucide-react';
import { DataService } from '@/services/data/dataService';
import { useQuery } from '@/hooks/useQueryHooks';
import { queryKeys } from '@/utils/queryKeys';
import { Case, CaseStatus, MatterType } from '../../../types';

type ViewMode = 'grid' | 'list';
type FilterPanel = 'none' | 'simple' | 'advanced';

interface CaseManagementHubProps {
  /** Initial view mode */
  defaultViewMode?: ViewMode;
  
  /** Enable bulk operations */
  enableBulkOps?: boolean;
  
  /** Enable analytics dashboard */
  showAnalytics?: boolean;
}

export const CaseManagementHub: React.FC<CaseManagementHubProps> = ({
  defaultViewMode = 'list',
  enableBulkOps = true,
  showAnalytics = true,
}) => {
  // ========================================
  // STATE MANAGEMENT
  // ========================================
  const [viewMode, setViewMode] = useState<ViewMode>(defaultViewMode);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPanel, setFilterPanel] = useState<FilterPanel>('none');
  const [selectedCases, setSelectedCases] = useState<Set<string>>(new Set());
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<MatterType | 'all'>('all');
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null);
  const [assignedAttorney, setAssignedAttorney] = useState<string>('all');

  // ========================================
  // DATA FETCHING
  // ========================================
  const { data: cases = [], isLoading, error, refetch } = useQuery<Case[]>(
    queryKeys.cases.all(),
    () => DataService.cases.getAll()
  );

  // ========================================
  // COMPUTED DATA & FILTERING
  // ========================================
  const filteredCases = useMemo(() => {
    let filtered = [...cases];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(term) ||
        c.caseNumber?.toLowerCase().includes(term) ||
        c.description?.toLowerCase().includes(term) ||
        c.court?.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(c => c.type === (typeFilter as unknown as string));
    }

    // Date range filter
    if (dateRange) {
      filtered = filtered.filter(c => {
        const dateValue = c.filingDate || c.createdAt;
        if (!dateValue) return false;
        const caseDate = new Date(dateValue);
        const start = new Date(dateRange.start);
        const end = new Date(dateRange.end);
        return caseDate >= start && caseDate <= end;
      });
    }

    // Attorney filter
    if (assignedAttorney !== 'all') {
      filtered = filtered.filter(c => c.leadAttorneyId === assignedAttorney);
    }

    return filtered;
  }, [cases, searchTerm, statusFilter, typeFilter, dateRange, assignedAttorney]);

  // Analytics metrics
  const metrics = useMemo(() => ({
    total: cases.length,
    active: cases.filter(c => c.status === CaseStatus.Active).length,
    closed: cases.filter(c => c.status === CaseStatus.Closed).length,
    pending: cases.filter(c => c.status === CaseStatus.Open).length,
    thisMonth: cases.filter(c => {
      if (!c.createdAt) return false;
      const date = new Date(c.createdAt);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length,
  }), [cases]);

  // ========================================
  // EVENT HANDLERS
  // ========================================
  const handleSelectCase = useCallback((caseId: string) => {
    setSelectedCases(prev => {
      const newSet = new Set(prev);
      if (newSet.has(caseId)) {
        newSet.delete(caseId);
      } else {
        newSet.add(caseId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedCases.size === filteredCases.length) {
      setSelectedCases(new Set());
    } else {
      setSelectedCases(new Set(filteredCases.map(c => c.id)));
    }
  }, [filteredCases, selectedCases.size]);

  const handleCreateCase = useCallback(() => {
    // Navigate to create case page by updating session storage
    sessionStorage.setItem('lexiflow_active_view', JSON.stringify('cases/create'));
    window.location.hash = '#/cases/create';
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  }, []);

  const handleViewCase = useCallback((caseItem: Case) => {
    // Navigate to case detail view
    sessionStorage.setItem('lexiflow_selected_case_id', JSON.stringify(caseItem.id));
    sessionStorage.setItem('lexiflow_active_view', JSON.stringify('cases'));
    window.location.hash = `#/cases/${caseItem.id}`;
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  }, []);

  const handleEditCase = useCallback((caseItem: Case) => {
    // Navigate to edit page
    sessionStorage.setItem('lexiflow_selected_case_id', JSON.stringify(caseItem.id));
    sessionStorage.setItem('lexiflow_active_view', JSON.stringify('cases/create'));
    window.location.hash = `#/cases/${caseItem.id}/edit`;
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  }, []);

  const handleDeleteCase = useCallback(async (caseId: string) => {
    if (confirm('Are you sure you want to delete this case?')) {
      try {
        await DataService.cases.delete(caseId);
        await refetch();
      } catch (err) {
        console.error('Failed to delete case:', err);
      }
    }
  }, [refetch]);

  const handleBulkDelete = useCallback(async () => {
    if (confirm(`Delete ${selectedCases.size} cases?`)) {
      try {
        await Promise.all(
          Array.from(selectedCases).map(id => DataService.cases.delete(id))
        );
        await refetch();
        setSelectedCases(new Set());
      } catch (err) {
        console.error('Bulk delete failed:', err);
      }
    }
  }, [selectedCases, refetch]);

  const handleExport = useCallback(() => {
    const dataStr = JSON.stringify(filteredCases, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cases-export-${new Date().toISOString()}.json`;
    link.click();
  }, [filteredCases]);

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================
  const getStatusBadge = (status: CaseStatus) => {
    const configs: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
      [CaseStatus.Active]: { icon: CheckCircle, color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
      [CaseStatus.Open]: { icon: Clock, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
      [CaseStatus.Closed]: { icon: Archive, color: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300' },
      [CaseStatus.Settled]: { icon: CheckCircle, color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
      [CaseStatus.OnHold]: { icon: AlertCircle, color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' },
    };
    
    const config = configs[status] ?? configs[CaseStatus.Open];
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </span>
    );
  };

  // ========================================
  // RENDER
  // ========================================
  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Failed to load cases
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Scale className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Case Management
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Enterprise legal case operations center
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleExport}
                className="inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              
              <button
                onClick={handleCreateCase}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
                aria-label="Create new case"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Case
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Dashboard */}
      {showAnalytics && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <MetricCard
              label="Total Cases"
              value={metrics.total}
              icon={FileText}
              color="blue"
            />
            <MetricCard
              label="Active Cases"
              value={metrics.active}
              icon={CheckCircle}
              color="emerald"
            />
            <MetricCard
              label="Pending"
              value={metrics.pending}
              icon={Clock}
              color="amber"
            />
            <MetricCard
              label="Closed"
              value={metrics.closed}
              icon={Archive}
              color="slate"
            />
            <MetricCard
              label="This Month"
              value={metrics.thisMonth}
              icon={TrendingUp}
              color="purple"
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Toolbar */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search cases by title, number, court..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* View Controls */}
            <div className="flex items-center space-x-2">
              {enableBulkOps && selectedCases.size > 0 && (
                <>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {selectedCases.size} selected
                  </span>
                  <button
                    onClick={handleBulkDelete}
                    className="px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    aria-label="Delete selected cases"
                    title="Delete selected cases"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
              
              <button
                onClick={() => setFilterPanel(filterPanel === 'simple' ? 'none' : 'simple')}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  filterPanel !== 'none'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
                aria-label="Toggle filters"
                title="Toggle filters"
              >
                <Filter className="w-4 h-4" />
              </button>
              
              <div className="flex border border-slate-300 dark:border-slate-600 rounded-lg">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 rounded-l-lg ${
                    viewMode === 'list'
                      ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                  aria-label="List view"
                  title="List view"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 rounded-r-lg ${
                    viewMode === 'grid'
                      ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                  aria-label="Grid view"
                  title="Grid view"
                >
                  <Grid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Filter Panel */}
          {filterPanel !== 'none' && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="case-status-filter" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    id="case-status-filter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as CaseStatus | 'all')}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  >
                    <option value="all">All Statuses</option>
                    <option value={CaseStatus.Active}>Active</option>
                    <option value={CaseStatus.Open}>Open</option>
                    <option value={CaseStatus.Closed}>Closed</option>
                    <option value={CaseStatus.Settled}>Settled</option>
                    <option value={CaseStatus.OnHold}>On Hold</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="case-type-filter" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Type
                  </label>
                  <select
                    id="case-type-filter"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as MatterType | 'all')}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  >
                    <option value="all">All Types</option>
                    <option value={MatterType.LITIGATION}>Litigation</option>
                    <option value={MatterType.TRANSACTIONAL}>Transactional</option>
                    <option value={MatterType.ADVISORY}>Advisory</option>
                    <option value={MatterType.CORPORATE}>Corporate</option>
                    <option value={MatterType.INTELLECTUAL_PROPERTY}>Intellectual Property</option>
                    <option value={MatterType.EMPLOYMENT}>Employment</option>
                    <option value={MatterType.REAL_ESTATE}>Real Estate</option>
                  </select>
                </div>

                <div className="md:col-span-2 flex items-end">
                  <button
                    onClick={() => {
                      setStatusFilter('all');
                      setTypeFilter('all');
                      setDateRange(null);
                      setAssignedAttorney('all');
                      setSearchTerm('');
                    }}
                    className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Case List */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">Loading cases...</p>
            </div>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center">
            <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              No cases found
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {searchTerm || filterPanel !== 'none'
                ? 'Try adjusting your filters or search terms'
                : 'Get started by creating your first case'}
            </p>
            <button
              onClick={handleCreateCase}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Case
            </button>
          </div>
        ) : viewMode === 'list' ? (
          <CaseListView
            cases={filteredCases}
            selectedCases={selectedCases}
            onSelectCase={handleSelectCase}
            onSelectAll={handleSelectAll}
            onViewCase={handleViewCase}
            onEditCase={handleEditCase}
            onDeleteCase={handleDeleteCase}
            getStatusBadge={getStatusBadge}
            enableBulkOps={enableBulkOps}
          />
        ) : (
          <CaseGridView
            cases={filteredCases}
            onViewCase={handleViewCase}
            onEditCase={handleEditCase}
            onDeleteCase={handleDeleteCase}
            getStatusBadge={getStatusBadge}
          />
        )}
      </div>
    </div>
  );
};

// ========================================
// CHILD COMPONENTS
// ========================================

interface MetricCardProps {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'emerald' | 'amber' | 'slate' | 'purple';
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    slate: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

interface CaseListViewProps {
  cases: Case[];
  selectedCases: Set<string>;
  onSelectCase: (id: string) => void;
  onSelectAll: () => void;
  onViewCase: (caseItem: Case) => void;
  onEditCase: (caseItem: Case) => void;
  onDeleteCase: (id: string) => void;
  getStatusBadge: (status: CaseStatus) => React.ReactNode;
  enableBulkOps: boolean;
}

const CaseListView: React.FC<CaseListViewProps> = ({
  cases,
  selectedCases,
  onSelectCase,
  onSelectAll,
  onViewCase,
  onEditCase,
  onDeleteCase,
  getStatusBadge,
  enableBulkOps,
}) => (
  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
      <thead className="bg-slate-50 dark:bg-slate-900/50">
        <tr>
          {enableBulkOps && (
            <th className="px-6 py-3 text-left w-12">
              <input
                type="checkbox"
                checked={selectedCases.size === cases.length && cases.length > 0}
                onChange={onSelectAll}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                aria-label="Select all cases"
                title="Select all cases"
              />
            </th>
          )}
          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Case
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Status
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Type
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Court
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Filed
          </th>
          <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
        {cases.map((caseItem) => (
          <tr
            key={caseItem.id}
            className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            {enableBulkOps && (
              <td className="px-6 py-4">
                <input
                  type="checkbox"
                  checked={selectedCases.has(caseItem.id)}
                  onChange={() => onSelectCase(caseItem.id)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  aria-label={`Select case ${caseItem.title}`}
                  title={`Select case ${caseItem.title}`}
                />
              </td>
            )}
            <td className="px-6 py-4">
              <div>
                <button
                  onClick={() => onViewCase(caseItem)}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {caseItem.title}
                </button>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {caseItem.caseNumber}
                </p>
              </div>
            </td>
            <td className="px-6 py-4">
              {getStatusBadge(caseItem.status)}
            </td>
            <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-100">
              {caseItem.type}
            </td>
            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
              {caseItem.court || '—'}
            </td>
            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
              {caseItem.filingDate
                ? new Date(caseItem.filingDate).toLocaleDateString()
                : '—'}
            </td>
            <td className="px-6 py-4 text-right">
              <div className="flex items-center justify-end space-x-2">
                <button
                  onClick={() => onViewCase(caseItem)}
                  className="p-1 text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                  title="View"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onEditCase(caseItem)}
                  className="p-1 text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeleteCase(caseItem.id)}
                  className="p-1 text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

interface CaseGridViewProps {
  cases: Case[];
  onViewCase: (caseItem: Case) => void;
  onEditCase: (caseItem: Case) => void;
  onDeleteCase: (id: string) => void;
  getStatusBadge: (status: CaseStatus) => React.ReactNode;
}

const CaseGridView: React.FC<CaseGridViewProps> = ({
  cases,
  onViewCase,
  onEditCase,
  onDeleteCase: _onDeleteCase,
  getStatusBadge,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {cases.map((caseItem) => (
      <div
        key={caseItem.id}
        className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow"
      >
        <div className="flex items-start justify-between mb-4">
          {getStatusBadge(caseItem.status)}
          <button 
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            aria-label="More options"
            title="More options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
        
        <button
          onClick={() => onViewCase(caseItem)}
          className="block text-left w-full"
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2 hover:text-blue-600 dark:hover:text-blue-400">
            {caseItem.title}
          </h3>
        </button>
        
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          {caseItem.caseNumber}
        </p>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center text-slate-600 dark:text-slate-400">
            <Building2 className="w-4 h-4 mr-2" />
            {caseItem.court || 'No court assigned'}
          </div>
          <div className="flex items-center text-slate-600 dark:text-slate-400">
            <Calendar className="w-4 h-4 mr-2" />
            {caseItem.filingDate
              ? new Date(caseItem.filingDate).toLocaleDateString()
              : 'Not filed'}
          </div>
        </div>
        
        <div className="mt-6 flex items-center space-x-2">
          <button
            onClick={() => onViewCase(caseItem)}
            className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
          >
            View
          </button>
          <button
            onClick={() => onEditCase(caseItem)}
            className="flex-1 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
          >
            Edit
          </button>
        </div>
      </div>
    ))}
  </div>
);

export default CaseManagementHub;
