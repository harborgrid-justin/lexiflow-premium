import React, { useState, useEffect } from 'react';
import { billingService, TimeEntry } from '../../services/billingService';
import { errorHandler } from '../../utils/errorHandler';

interface TimeEntryFormProps {
  caseId?: string;
  userId?: string;
  entry?: TimeEntry;
  onSuccess?: (entry: TimeEntry) => void;
  onCancel?: () => void;
}

export const TimeEntryForm: React.FC<TimeEntryFormProps> = ({
  caseId,
  userId,
  entry,
  onSuccess,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    caseId: entry?.caseId || caseId || '',
    userId: entry?.userId || userId || '',
    date: entry?.date || new Date().toISOString().split('T')[0],
    duration: entry?.duration || 0,
    description: entry?.description || '',
    activity: entry?.activity || '',
    ledesCode: entry?.ledesCode || '',
    rate: entry?.rate || 0,
    billable: entry?.billable !== undefined ? entry.billable : true,
    taskCode: entry?.taskCode || '',
    phaseCode: entry?.phaseCode || '',
    discount: entry?.discount || 0,
    internalNotes: entry?.internalNotes || '',
    status: entry?.status || 'Draft',
  });

  const activities = [
    'Research',
    'Legal Writing',
    'Court Appearance',
    'Client Meeting',
    'Case Management',
    'Document Review',
    'Discovery',
    'Negotiation',
    'Strategy Session',
    'Administrative',
    'Travel',
    'Other',
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const calculateTotal = () => {
    const total = formData.duration * formData.rate;
    const discountedTotal = formData.discount > 0
      ? total * (1 - formData.discount / 100)
      : total;
    return { total, discountedTotal };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { total, discountedTotal } = calculateTotal();
      const payload = {
        ...formData,
        total,
        discountedTotal,
      };

      const result = entry?.id
        ? await billingService.updateTimeEntry(entry.id, payload)
        : await billingService.createTimeEntry(payload);

      onSuccess?.(result);
    } catch (error) {
      errorHandler.logError(error as Error, 'TimeEntryForm:handleSubmit');
      alert('Failed to save time entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const { total, discountedTotal } = calculateTotal();

  return (
    <form onSubmit={handleSubmit} className="time-entry-form">
      <div className="form-header">
        <h2>{entry ? 'Edit Time Entry' : 'New Time Entry'}</h2>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="date">Date *</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="duration">Duration (hours) *</label>
          <input
            type="number"
            id="duration"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            step="0.25"
            min="0"
            required
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="rate">Rate ($/hour) *</label>
          <input
            type="number"
            id="rate"
            name="rate"
            value={formData.rate}
            onChange={handleChange}
            step="0.01"
            min="0"
            required
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="activity">Activity *</label>
          <select
            id="activity"
            name="activity"
            value={formData.activity}
            onChange={handleChange}
            required
            className="form-control"
          >
            <option value="">Select Activity</option>
            {activities.map(act => (
              <option key={act} value={act}>{act}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="taskCode">Task Code</label>
          <input
            type="text"
            id="taskCode"
            name="taskCode"
            value={formData.taskCode}
            onChange={handleChange}
            className="form-control"
            placeholder="e.g., L110, L120"
          />
        </div>

        <div className="form-group">
          <label htmlFor="phaseCode">Phase Code</label>
          <input
            type="text"
            id="phaseCode"
            name="phaseCode"
            value={formData.phaseCode}
            onChange={handleChange}
            className="form-control"
            placeholder="e.g., Discovery, Trial"
          />
        </div>

        <div className="form-group">
          <label htmlFor="ledesCode">LEDES Code</label>
          <input
            type="text"
            id="ledesCode"
            name="ledesCode"
            value={formData.ledesCode}
            onChange={handleChange}
            className="form-control"
            placeholder="e.g., L110"
          />
        </div>

        <div className="form-group">
          <label htmlFor="discount">Discount (%)</label>
          <input
            type="number"
            id="discount"
            name="discount"
            value={formData.discount}
            onChange={handleChange}
            step="0.01"
            min="0"
            max="100"
            className="form-control"
          />
        </div>

        <div className="form-group full-width">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={3}
            className="form-control"
            placeholder="Describe the work performed..."
          />
        </div>

        <div className="form-group full-width">
          <label htmlFor="internalNotes">Internal Notes</label>
          <textarea
            id="internalNotes"
            name="internalNotes"
            value={formData.internalNotes}
            onChange={handleChange}
            rows={2}
            className="form-control"
            placeholder="Private notes (not visible on invoices)..."
          />
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="billable"
              checked={formData.billable}
              onChange={handleChange}
            />
            <span>Billable</span>
          </label>
        </div>

        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="form-control"
          >
            <option value="Draft">Draft</option>
            <option value="Submitted">Submitted</option>
            <option value="Approved">Approved</option>
          </select>
        </div>

        <div className="form-group total-display">
          <div className="total-info">
            <div className="total-row">
              <span>Subtotal:</span>
              <strong>${total.toFixed(2)}</strong>
            </div>
            {formData.discount > 0 && (
              <>
                <div className="total-row discount">
                  <span>Discount ({formData.discount}%):</span>
                  <strong>-${(total - discountedTotal).toFixed(2)}</strong>
                </div>
                <div className="total-row grand-total">
                  <span>Total:</span>
                  <strong>${discountedTotal.toFixed(2)}</strong>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Saving...' : entry ? 'Update Entry' : 'Create Entry'}
        </button>
      </div>

      <style>{`
        .time-entry-form {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .form-header h2 {
          margin: 0 0 1.5rem 0;
          color: #1a1a1a;
          font-size: 1.5rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-group label {
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #333;
          font-size: 0.9rem;
        }

        .form-control {
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        .form-control:focus {
          outline: none;
          border-color: #4a90e2;
          box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
        }

        textarea.form-control {
          resize: vertical;
          font-family: inherit;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          cursor: pointer;
          margin-top: 1.5rem;
        }

        .checkbox-label input[type="checkbox"] {
          margin-right: 0.5rem;
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .total-display {
          grid-column: 1 / -1;
          background: #f8f9fa;
          padding: 1rem;
          border-radius: 4px;
        }

        .total-info {
          max-width: 300px;
          margin-left: auto;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          font-size: 0.95rem;
        }

        .total-row.discount {
          color: #28a745;
        }

        .total-row.grand-total {
          margin-top: 0.5rem;
          padding-top: 0.5rem;
          border-top: 2px solid #dee2e6;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e9ecef;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-primary {
          background: #4a90e2;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #357abd;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #5a6268;
        }
      `}</style>
    </form>
  );
};
