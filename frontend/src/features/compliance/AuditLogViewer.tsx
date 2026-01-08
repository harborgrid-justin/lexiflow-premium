import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, RefreshCw, Eye, AlertCircle, CheckCircle } from 'lucide-react';

interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  ipAddress: string;
  method: string;
  endpoint: string;
  statusCode: number;
  result: string;
  description: string;
  duration: number;
  severity: string;
}

interface FilterOptions {
  startDate: string;
  endDate: string;
  userId: string;
  action: string;
  entityType: string;
  result: string;
  onlyFailures: boolean;
  securityEventsOnly: boolean;
}

export default function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<FilterOptions>({
    startDate: '',
    endDate: '',
    userId: '',
    action: '',
    entityType: '',
    result: '',
    onlyFailures: false,
    securityEventsOnly: false,
  });

  useEffect(() => {
    fetchAuditLogs();
  }, [page, filters]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '' && value !== false)
        ),
      });

      const response = await fetch(`/api/compliance/audit-logs?${queryParams}`);
      const result = await response.json();
      setLogs(result.data);
      setTotalPages(Math.ceil(result.total / 50));
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      const queryParams = new URLSearchParams({
        format,
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== '')),
      });

      const response = await fetch(`/api/compliance/audit-logs/export?${queryParams}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString()}.${format}`;
      a.click();
    } catch (error) {
      console.error('Failed to export audit logs:', error);
    }
  };

  const getResultBadge = (result: string) => {
    const colors = {
      success: 'bg-green-100 text-green-800',
      failure: 'bg-red-100 text-red-800',
      warning: 'bg-yellow-100 text-yellow-800',
      info: 'bg-blue-100 text-blue-800',
    };
    return colors[result as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      critical: 'bg-red-600 text-white',
      high: 'bg-orange-600 text-white',
      medium: 'bg-yellow-600 text-white',
      low: 'bg-blue-600 text-white',
      info: 'bg-gray-600 text-white',
    };
    return colors[severity as keyof typeof colors] || 'bg-gray-600 text-white';
  };

  const filteredLogs = logs.filter((log) =>
    searchTerm === '' ||
    log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.entityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Log Viewer</h1>
          <p className="text-gray-600 mt-1">Comprehensive audit trail of all system activities</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={() => handleExport('json')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Download className="w-4 h-4" />
            Export JSON
          </button>
          <button
            onClick={fetchAuditLogs}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search logs by user, action, entity type, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              showFilters ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="datetime-local"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="datetime-local"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
              <select
                value={filters.action}
                onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">All Actions</option>
                <option value="create">Create</option>
                <option value="read">Read</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
                <option value="access">Access</option>
                <option value="export">Export</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Result</label>
              <select
                value={filters.result}
                onChange={(e) => setFilters({ ...filters, result: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">All Results</option>
                <option value="success">Success</option>
                <option value="failure">Failure</option>
                <option value="warning">Warning</option>
              </select>
            </div>
            <div className="flex items-center gap-4 col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.onlyFailures}
                  onChange={(e) => setFilters({ ...filters, onlyFailures: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">Only Failures</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.securityEventsOnly}
                  onChange={(e) => setFilters({ ...filters, securityEventsOnly: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">Security Events Only</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Entity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Result
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Severity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 cursor-pointer">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{log.userName}</div>
                        <div className="text-xs text-gray-500">{log.ipAddress}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{log.entityType}</div>
                        <div className="text-xs text-gray-500">{log.entityId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getResultBadge(log.result)}`}>
                          {log.result}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getSeverityBadge(log.severity)}`}>
                          {log.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Audit Log Details</h3>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Timestamp</label>
                  <p className="text-gray-900">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">User</label>
                  <p className="text-gray-900">{selectedLog.userName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Action</label>
                  <p className="text-gray-900">{selectedLog.action}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Entity Type</label>
                  <p className="text-gray-900">{selectedLog.entityType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">IP Address</label>
                  <p className="text-gray-900">{selectedLog.ipAddress}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Duration</label>
                  <p className="text-gray-900">{selectedLog.duration}ms</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="text-gray-900 mt-1">{selectedLog.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
