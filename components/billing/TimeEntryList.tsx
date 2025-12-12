import React, { useState, useEffect } from 'react';
import { billingService, TimeEntry, TimeEntryFilter } from '../../services/billingService';
import { errorHandler } from '../../utils/errorHandler';

interface TimeEntryListProps {
  caseId?: string;
  userId?: string;
  onEdit?: (entry: TimeEntry) => void;
  onDelete?: (entryId: string) => void;
  showActions?: boolean;
}

export const TimeEntryList: React.FC<TimeEntryListProps> = ({
  caseId,
  userId,
  onEdit,
  onDelete,
  showActions = true,
}) => {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TimeEntryFilter>({
    caseId,
    userId,
    page: 1,
    limit: 50,
    sortBy: 'date',
    sortOrder: 'DESC',
  });
  const [total, setTotal] = useState(0);
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadEntries();
  }, [filter]);

  const loadEntries = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await billingService.getTimeEntries(filter);
      setEntries(result.data);
      setTotal(result.total);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load time entries';
      setError(message);
      errorHandler.logError(err as Error, 'TimeEntryList:loadEntries');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (entryId: string) => {
    if (!window.confirm('Are you sure you want to delete this time entry?')) {
      return;
    }

    try {
      await billingService.deleteTimeEntry(entryId);
      setEntries(prev => prev.filter(e => e.id !== entryId));
      onDelete?.(entryId);
    } catch (err) {
      errorHandler.logError(err as Error, 'TimeEntryList:handleDelete');
      alert('Failed to delete time entry');
    }
  };

  const handleApprove = async (entryId: string) => {
    try {
      const updated = await billingService.approveTimeEntry(entryId, 'current-user-id');
      setEntries(prev => prev.map(e => e.id === entryId ? updated : e));
    } catch (err) {
      errorHandler.logError(err as Error, 'TimeEntryList:handleApprove');
      alert('Failed to approve time entry');
    }
  };

  const toggleSelection = (entryId: string) => {
    setSelectedEntries(prev => {
      const next = new Set(prev);
      if (next.has(entryId)) {
        next.delete(entryId);
      } else {
        next.add(entryId);
      }
      return next;
    });
  };

  const selectAll = () => {
    if (selectedEntries.size === entries.length) {
      setSelectedEntries(new Set());
    } else {
      setSelectedEntries(new Set(entries.map(e => e.id)));
    }
  };

  const getStatusBadgeClass = (status: string) => {
    const statusMap: Record<string, string> = {
      'Draft': 'status-draft',
      'Submitted': 'status-submitted',
      'Approved': 'status-approved',
      'Billed': 'status-billed',
      'Written Off': 'status-written-off',
    };
    return statusMap[status] || 'status-default';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDuration = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const totalAmount = entries.reduce((sum, e) => sum + (e.discountedTotal || e.total), 0);
  const totalHours = entries.reduce((sum, e) => sum + e.duration, 0);

  if (loading && entries.length === 0) {
    return (
      <div className="time-entry-list loading">
        <div className="spinner">Loading time entries...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="time-entry-list error">
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={loadEntries} className="btn btn-primary">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="time-entry-list">
      <div className="list-header">
        <div className="summary">
          <h2>Time Entries</h2>
          <div className="summary-stats">
            <span className="stat">
              <strong>{entries.length}</strong> entries
            </span>
            <span className="stat">
              <strong>{formatDuration(totalHours)}</strong> total
            </span>
            <span className="stat">
              <strong>{formatCurrency(totalAmount)}</strong> value
            </span>
          </div>
        </div>

        {selectedEntries.size > 0 && (
          <div className="bulk-actions">
            <span>{selectedEntries.size} selected</span>
            <button className="btn btn-sm btn-primary">Bulk Approve</button>
            <button className="btn btn-sm btn-danger">Bulk Delete</button>
          </div>
        )}
      </div>

      <div className="table-container">
        <table className="time-entry-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedEntries.size === entries.length && entries.length > 0}
                  onChange={selectAll}
                />
              </th>
              <th>Date</th>
              <th>Description</th>
              <th>Activity</th>
              <th>Duration</th>
              <th>Rate</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Billable</th>
              {showActions && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {entries.map(entry => (
              <tr key={entry.id} className={selectedEntries.has(entry.id) ? 'selected' : ''}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedEntries.has(entry.id)}
                    onChange={() => toggleSelection(entry.id)}
                  />
                </td>
                <td>{new Date(entry.date).toLocaleDateString()}</td>
                <td className="description-cell">
                  <div className="description-text">{entry.description}</div>
                  {entry.internalNotes && (
                    <div className="internal-notes">{entry.internalNotes}</div>
                  )}
                </td>
                <td>{entry.activity}</td>
                <td>{formatDuration(entry.duration)}</td>
                <td>{formatCurrency(entry.rate)}/hr</td>
                <td>
                  <div className="amount-cell">
                    {formatCurrency(entry.discountedTotal || entry.total)}
                    {entry.discount && entry.discount > 0 && (
                      <span className="discount-badge">-{entry.discount}%</span>
                    )}
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${getStatusBadgeClass(entry.status)}`}>
                    {entry.status}
                  </span>
                </td>
                <td>
                  <span className={`billable-badge ${entry.billable ? 'billable' : 'non-billable'}`}>
                    {entry.billable ? 'Yes' : 'No'}
                  </span>
                </td>
                {showActions && (
                  <td className="actions-cell">
                    <div className="action-buttons">
                      {entry.status === 'Submitted' && (
                        <button
                          onClick={() => handleApprove(entry.id)}
                          className="btn btn-xs btn-success"
                          title="Approve"
                        >
                          Approve
                        </button>
                      )}
                      <button
                        onClick={() => onEdit?.(entry)}
                        className="btn btn-xs btn-secondary"
                        title="Edit"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="btn btn-xs btn-danger"
                        title="Delete"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {entries.length === 0 && (
        <div className="empty-state">
          <p>No time entries found</p>
        </div>
      )}

      <style>{`
        .time-entry-list {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .list-header {
          padding: 1.5rem;
          border-bottom: 1px solid #e9ecef;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .summary h2 {
          margin: 0 0 0.5rem 0;
          font-size: 1.5rem;
          color: #1a1a1a;
        }

        .summary-stats {
          display: flex;
          gap: 1.5rem;
          color: #6c757d;
        }

        .stat {
          font-size: 0.9rem;
        }

        .bulk-actions {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .table-container {
          overflow-x: auto;
        }

        .time-entry-table {
          width: 100%;
          border-collapse: collapse;
        }

        .time-entry-table th {
          background: #f8f9fa;
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: #495057;
          font-size: 0.875rem;
          border-bottom: 2px solid #dee2e6;
        }

        .time-entry-table td {
          padding: 1rem;
          border-bottom: 1px solid #e9ecef;
          font-size: 0.875rem;
        }

        .time-entry-table tr:hover {
          background: #f8f9fa;
        }

        .time-entry-table tr.selected {
          background: #e7f3ff;
        }

        .description-cell {
          max-width: 300px;
        }

        .description-text {
          margin-bottom: 0.25rem;
        }

        .internal-notes {
          font-size: 0.8rem;
          color: #6c757d;
          font-style: italic;
        }

        .amount-cell {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .discount-badge {
          background: #28a745;
          color: white;
          padding: 0.125rem 0.375rem;
          border-radius: 3px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-draft {
          background: #f0f0f0;
          color: #495057;
        }

        .status-submitted {
          background: #fff3cd;
          color: #856404;
        }

        .status-approved {
          background: #d4edda;
          color: #155724;
        }

        .status-billed {
          background: #d1ecf1;
          color: #0c5460;
        }

        .status-written-off {
          background: #f8d7da;
          color: #721c24;
        }

        .billable-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .billable-badge.billable {
          background: #d4edda;
          color: #155724;
        }

        .billable-badge.non-billable {
          background: #f8d7da;
          color: #721c24;
        }

        .actions-cell {
          white-space: nowrap;
        }

        .action-buttons {
          display: flex;
          gap: 0.25rem;
        }

        .btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-xs {
          padding: 0.25rem 0.5rem;
          font-size: 0.75rem;
        }

        .btn-sm {
          padding: 0.375rem 0.75rem;
          font-size: 0.8125rem;
        }

        .btn-primary {
          background: #4a90e2;
          color: white;
        }

        .btn-primary:hover {
          background: #357abd;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-secondary:hover {
          background: #5a6268;
        }

        .btn-success {
          background: #28a745;
          color: white;
        }

        .btn-success:hover {
          background: #218838;
        }

        .btn-danger {
          background: #dc3545;
          color: white;
        }

        .btn-danger:hover {
          background: #c82333;
        }

        .empty-state {
          padding: 3rem;
          text-align: center;
          color: #6c757d;
        }

        .loading, .error {
          padding: 3rem;
          text-align: center;
        }

        .spinner {
          color: #6c757d;
        }

        .error-message {
          max-width: 400px;
          margin: 0 auto;
        }

        .error-message h3 {
          color: #dc3545;
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
};
