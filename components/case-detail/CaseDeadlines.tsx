import React, { useState, useEffect } from 'react';
import caseService from '../../services/caseService';

interface Deadline {
  id: string;
  motionId: string;
  type: string;
  title: string;
  description?: string;
  dueDate: Date;
  status: 'Upcoming' | 'Due Soon' | 'Overdue' | 'Completed' | 'Cancelled';
  assignedToUserId?: string;
  assignedToUserName?: string;
  completedDate?: Date;
}

interface DeadlineAlert {
  deadline: Deadline;
  daysUntilDue: number;
  severity: 'critical' | 'warning' | 'info';
  message: string;
}

interface CaseDeadlinesProps {
  caseId: string;
}

export const CaseDeadlines: React.FC<CaseDeadlinesProps> = ({ caseId }) => {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [alerts, setAlerts] = useState<DeadlineAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'overdue' | 'completed'>('all');

  useEffect(() => {
    loadDeadlines();
    loadAlerts();
  }, [caseId]);

  const loadDeadlines = async () => {
    try {
      const data = await caseService.getCaseDeadlines(caseId);
      setDeadlines(data);
    } catch (error) {
      console.error('Failed to load deadlines:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAlerts = async () => {
    try {
      const data = await caseService.getDeadlineAlerts(undefined, 30);
      setAlerts(data.filter((alert: DeadlineAlert) =>
        deadlines.some(d => d.id === alert.deadline.id)
      ));
    } catch (error) {
      console.error('Failed to load alerts:', error);
    }
  };

  const handleCompleteDeadline = async (deadlineId: string) => {
    try {
      await caseService.completeDeadline(deadlineId, 'current-user-id', 'Completed via UI');
      loadDeadlines();
      loadAlerts();
    } catch (error) {
      console.error('Failed to complete deadline:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'Due Soon':
        return 'bg-yellow-100 text-yellow-800';
      case 'Overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-500 bg-red-50';
      case 'warning':
        return 'border-yellow-500 bg-yellow-50';
      default:
        return 'border-blue-500 bg-blue-50';
    }
  };

  const filteredDeadlines = deadlines.filter(deadline => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return deadline.status === 'Upcoming' || deadline.status === 'Due Soon';
    if (filter === 'overdue') return deadline.status === 'Overdue';
    if (filter === 'completed') return deadline.status === 'Completed';
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Deadline Alerts</h3>
          {alerts.map((alert) => (
            <div
              key={alert.deadline.id}
              className={`border-l-4 p-4 rounded-r-lg ${getSeverityColor(alert.severity)}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{alert.message}</p>
                  <p className="text-sm text-gray-600 mt-1">{alert.deadline.title}</p>
                </div>
                {alert.deadline.status !== 'Completed' && (
                  <button
                    onClick={() => handleCompleteDeadline(alert.deadline.id)}
                    className="ml-4 px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Complete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {(['all', 'upcoming', 'overdue', 'completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`${
                filter === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Deadlines List */}
      <div className="space-y-4">
        {filteredDeadlines.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No deadlines found for this filter.</p>
          </div>
        ) : (
          filteredDeadlines.map((deadline) => (
            <div
              key={deadline.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="text-lg font-semibold text-gray-900">{deadline.title}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(deadline.status)}`}>
                      {deadline.status}
                    </span>
                    <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                      {deadline.type}
                    </span>
                  </div>

                  {deadline.description && (
                    <p className="text-sm text-gray-600 mt-2">{deadline.description}</p>
                  )}

                  <div className="mt-3 flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Due: {new Date(deadline.dueDate).toLocaleDateString()}</span>
                    </div>

                    {deadline.assignedToUserName && (
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Assigned to: {deadline.assignedToUserName}</span>
                      </div>
                    )}

                    {deadline.completedDate && (
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Completed: {new Date(deadline.completedDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {deadline.status !== 'Completed' && deadline.status !== 'Cancelled' && (
                  <button
                    onClick={() => handleCompleteDeadline(deadline.id)}
                    className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Mark Complete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CaseDeadlines;
