// components/matter-management/MatterManagement.tsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, Plus, Search, Filter, ChevronDown, Archive, 
  FileText, Clock, AlertCircle, CheckCircle, Users, DollarSign,
  Building2, Gavel, Calendar, Tag, TrendingUp, Settings
} from 'lucide-react';
import { DataService } from '@/services/data/dataService';
import { useQuery } from '@/hooks/useQueryHooks';
import { queryKeys } from '@/utils/queryKeys';
import { Matter, MatterStatus, MatterPriority } from '../../../types';
import { PATHS } from '../../../config/paths.config';

interface MatterStatistics {
  total: number;
  byStatus: Record<string, number>;
  byMatterType: Record<string, number>;
  byPriority: Record<string, number>;
}

const MatterManagement: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // ✅ Migrated to backend API with queryKeys (2025-12-21)
  const { data: matters = [], isLoading: loading } = useQuery<Matter[]>(
    queryKeys.cases.matters.all(),
    () => DataService.matters.getAll()
  );

  const { data: statistics = null } = useQuery<MatterStatistics | null>(
    ['matters', 'statistics'],
    () => DataService.matters.getStatistics()
  );

  const filteredMatters = useMemo(() => {
    let filtered = [...matters];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(matter =>
        matter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        matter.matterNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (matter.clientName || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(matter => matter.status === selectedStatus);
    }

    // Filter by priority
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(matter => matter.priority === selectedPriority);
    }

    return filtered;
  }, [matters, searchTerm, selectedStatus, selectedPriority]);

  const handleCreateMatter = () => {
    navigate(`${PATHS.MATTERS}/new`);
  };

  const handleMatterClick = (matterId: string) => {
    navigate(`${PATHS.MATTERS}/${matterId}`);
  };

  const getStatusColor = (status: MatterStatus): string => {
    const colors: Record<MatterStatus, string> = {
      [MatterStatus.ACTIVE]: 'bg-green-100 text-green-800',
      [MatterStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
      [MatterStatus.ON_HOLD]: 'bg-orange-100 text-orange-800',
      [MatterStatus.CLOSED]: 'bg-gray-100 text-gray-800',
      [MatterStatus.ARCHIVED]: 'bg-slate-100 text-slate-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: MatterPriority): string => {
    const colors: Record<MatterPriority, string> = {
      [MatterPriority.LOW]: 'text-gray-600',
      [MatterPriority.MEDIUM]: 'text-blue-600',
      [MatterPriority.HIGH]: 'text-orange-600',
      [MatterPriority.URGENT]: 'text-red-600',
    };
    return colors[priority] || 'text-gray-600';
  };

  const getPriorityIcon = (priority: MatterPriority) => {
    const icons: Record<MatterPriority, React.ReactNode> = {
      [MatterPriority.LOW]: <TrendingUp className="h-4 w-4" />,
      [MatterPriority.MEDIUM]: <Clock className="h-4 w-4" />,
      [MatterPriority.HIGH]: <AlertCircle className="h-4 w-4" />,
      [MatterPriority.URGENT]: <AlertCircle className="h-4 w-4 animate-pulse" />,
    };
    return icons[priority] || <Clock className="h-4 w-4" />;
  };

  const formatCurrency = (amount: number | undefined): string => {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Briefcase className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Matter Management</h1>
              <p className="text-sm text-gray-600">Centralized case oversight and intake pipeline</p>
            </div>
          </div>
          <button
            onClick={handleCreateMatter}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>New Matter</span>
          </button>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Matters</p>
                  <p className="text-2xl font-bold text-blue-900">{statistics.total}</p>
                </div>
                <Briefcase className="h-8 w-8 text-blue-600 opacity-20" />
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Active</p>
                  <p className="text-2xl font-bold text-green-900">
                    {statistics.byStatus[MatterStatus.ACTIVE] || 0}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600 opacity-20" />
              </div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 font-medium">On Hold</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {statistics.byStatus[MatterStatus.ON_HOLD] || 0}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-600 opacity-20" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filters and Search */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, matter number, or client..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={selectedStatus}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value={MatterStatus.ACTIVE}>Active</option>
                <option value={MatterStatus.PENDING}>Pending</option>
                <option value={MatterStatus.ON_HOLD}>On Hold</option>
                <option value={MatterStatus.CLOSED}>Closed</option>
                <option value={MatterStatus.ARCHIVED}>Archived</option>
              </select>
            </div>

            <select
              value={selectedPriority}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Priority</option>
              <option value={MatterPriority.LOW}>Low</option>
              <option value={MatterPriority.MEDIUM}>Medium</option>
              <option value={MatterPriority.HIGH}>High</option>
              <option value={MatterPriority.URGENT}>Urgent</option>
            </select>

            <div className="flex items-center space-x-2 border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
              >
                List
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Matter List/Grid */}
      <div className="flex-1 overflow-auto p-6">
        {filteredMatters.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Briefcase className="h-16 w-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">No matters found</p>
            <p className="text-sm">Try adjusting your filters or create a new matter</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMatters.map((matter) => (
              <div
                key={matter.id}
                onClick={() => handleMatterClick(matter.id)}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xs font-mono text-gray-500">{matter.matterNumber}</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(matter.status)}`}>
                        {matter.status}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{matter.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{matter.description || 'No description'}</p>
                  </div>
                  <div className={`${getPriorityColor(matter.priority)}`}>
                    {getPriorityIcon(matter.priority)}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Building2 className="h-4 w-4" />
                    <span className="truncate">{matter.clientName}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Users className="h-4 w-4" />
                    <span className="truncate">{matter.leadAttorneyName}</span>
                  </div>
                  {matter.court && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Gavel className="h-4 w-4" />
                      <span className="truncate">{matter.court}</span>
                    </div>
                  )}
                  {matter.estimatedValue && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <DollarSign className="h-4 w-4" />
                      <span>{formatCurrency(matter.estimatedValue)}</span>
                    </div>
                  )}
                </div>

                {matter.tags && matter.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {matter.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                        {tag}
                      </span>
                    ))}
                    {matter.tags.length > 3 && (
                      <span className="px-2 py-1 text-xs text-gray-500">+{matter.tags.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Matter
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attorney
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMatters.map((matter) => (
                  <tr
                    key={matter.id}
                    onClick={() => handleMatterClick(matter.id)}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{matter.title}</div>
                        <div className="text-sm text-gray-500">{matter.matterNumber}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{matter.clientName}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{matter.leadAttorneyName}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(matter.status)}`}>
                        {matter.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center space-x-1 ${getPriorityColor(matter.priority)}`}>
                        {getPriorityIcon(matter.priority)}
                        <span className="text-sm capitalize">{matter.priority}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatCurrency(matter.estimatedValue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatterManagement;

