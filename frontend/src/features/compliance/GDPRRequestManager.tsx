import React, { useState, useEffect } from 'react';
import { FileText, Clock, CheckCircle, XCircle, AlertCircle, Download } from 'lucide-react';

interface GDPRRequest {
  id: string;
  type: string;
  requesterEmail: string;
  requesterName: string;
  status: string;
  priority: string;
  receivedAt: string;
  dueDate: string;
  completedAt: string | null;
  recordsFound: number;
  recordsProcessed: number;
}

export default function GDPRRequestManager() {
  const [requests, setRequests] = useState<GDPRRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [showNewRequestForm, setShowNewRequestForm] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/compliance/gdpr-requests?status=${filter}`);
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error('Failed to fetch GDPR requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      received: 'bg-blue-100 text-blue-800',
      verified: 'bg-indigo-100 text-indigo-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityBadge = (priority: string) => {
    const styles = {
      urgent: 'bg-red-600 text-white',
      high: 'bg-orange-600 text-white',
      normal: 'bg-blue-600 text-white',
      low: 'bg-gray-600 text-white',
    };
    return styles[priority as keyof typeof styles] || 'bg-gray-600 text-white';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'access':
        return <FileText className="w-5 h-5" />;
      case 'erasure':
        return <XCircle className="w-5 h-5" />;
      case 'portability':
        return <Download className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const isOverdue = (dueDate: string, status: string) => {
    return new Date(dueDate) < new Date() && !['completed', 'rejected'].includes(status);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">GDPR Request Manager</h1>
          <p className="text-gray-600 mt-1">Manage data subject access requests and rights</p>
        </div>
        <button
          onClick={() => setShowNewRequestForm(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          New Request
        </button>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 bg-white p-4 rounded-lg shadow-md border border-gray-200">
        {['all', 'received', 'in_progress', 'completed', 'overdue'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg transition ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status.replace('_', ' ').toUpperCase()}
          </button>
        ))}
      </div>

      {/* Requests Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          requests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    {getTypeIcon(request.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 capitalize">
                      {request.type.replace('_', ' ')} Request
                    </h3>
                    <p className="text-sm text-gray-600">{request.requesterName}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getPriorityBadge(request.priority)}`}>
                    {request.priority}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusBadge(request.status)}`}>
                    {request.status}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{request.requesterEmail}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Received:</span>
                  <span className="font-medium">{new Date(request.receivedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Due Date:</span>
                  <span className={`font-medium ${isOverdue(request.dueDate, request.status) ? 'text-red-600' : ''}`}>
                    {new Date(request.dueDate).toLocaleDateString()}
                    {isOverdue(request.dueDate, request.status) && (
                      <span className="ml-2 text-xs">(OVERDUE)</span>
                    )}
                  </span>
                </div>
                {request.completedAt && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Completed:</span>
                    <span className="font-medium text-green-600">
                      {new Date(request.completedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Records Found:</span>
                    <span className="font-medium">{request.recordsFound}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-gray-600">Records Processed:</span>
                    <span className="font-medium">{request.recordsProcessed}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm">
                  View Details
                </button>
                {request.status === 'received' && (
                  <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm">
                    Process
                  </button>
                )}
                {request.status === 'completed' && request.type === 'access' && (
                  <button className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm">
                    Download Export
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
