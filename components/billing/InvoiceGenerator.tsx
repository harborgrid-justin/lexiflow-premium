import React, { useState, useEffect } from 'react';
import { billingService, TimeEntry, Invoice, InvoiceItem } from '../../services/billingService';
import { errorHandler } from '../../utils/errorHandler';

interface InvoiceGeneratorProps {
  caseId: string;
  clientId: string;
  clientName: string;
  onSuccess?: (invoice: Invoice) => void;
  onCancel?: () => void;
}

export const InvoiceGenerator: React.FC<InvoiceGeneratorProps> = ({
  caseId,
  clientId,
  clientName,
  onSuccess,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [unbilledEntries, setUnbilledEntries] = useState<TimeEntry[]>([]);
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    paymentTerms: 'Net 30',
    taxRate: 0,
    discountAmount: 0,
    notes: '',
    billingAddress: '',
  });

  useEffect(() => {
    loadUnbilledEntries();

    // Set default due date to 30 days from now
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    setFormData(prev => ({
      ...prev,
      dueDate: dueDate.toISOString().split('T')[0],
    }));
  }, [caseId]);

  const loadUnbilledEntries = async () => {
    setLoadingEntries(true);
    try {
      const entries = await billingService.getUnbilledTimeEntries(caseId);
      setUnbilledEntries(entries);
      // Auto-select all approved entries
      const approvedIds = entries
        .filter(e => e.status === 'Approved')
        .map(e => e.id);
      setSelectedEntries(new Set(approvedIds));
    } catch (err) {
      errorHandler.logError(err as Error, 'InvoiceGenerator:loadUnbilledEntries');
    } finally {
      setLoadingEntries(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
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
    if (selectedEntries.size === unbilledEntries.length) {
      setSelectedEntries(new Set());
    } else {
      setSelectedEntries(new Set(unbilledEntries.map(e => e.id)));
    }
  };

  const calculateTotals = () => {
    const selectedEntriesData = unbilledEntries.filter(e => selectedEntries.has(e.id));
    const subtotal = selectedEntriesData.reduce(
      (sum, entry) => sum + (entry.discountedTotal || entry.total),
      0
    );
    const taxAmount = subtotal * (formData.taxRate / 100);
    const totalAmount = subtotal + taxAmount - formData.discountAmount;

    return {
      subtotal,
      taxAmount,
      totalAmount,
      itemCount: selectedEntriesData.length,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedEntries.size === 0) {
      alert('Please select at least one time entry to invoice');
      return;
    }

    setLoading(true);

    try {
      const selectedEntriesData = unbilledEntries.filter(e => selectedEntries.has(e.id));
      const { subtotal } = calculateTotals();

      // Create invoice items from selected time entries
      const items: Partial<InvoiceItem>[] = selectedEntriesData.map(entry => ({
        date: entry.date,
        description: entry.description,
        quantity: entry.duration,
        rate: entry.rate,
        amount: entry.discountedTotal || entry.total,
        type: 'Time' as const,
      }));

      const invoiceData = {
        caseId,
        clientId,
        clientName,
        invoiceDate: formData.invoiceDate,
        dueDate: formData.dueDate,
        subtotal,
        taxRate: formData.taxRate,
        discountAmount: formData.discountAmount,
        paymentTerms: formData.paymentTerms,
        notes: formData.notes,
        billingAddress: formData.billingAddress,
        items,
        status: 'Draft' as const,
      };

      const invoice = await billingService.createInvoice(invoiceData);

      // Bill the time entries
      const currentUserId = 'current-user-id'; // TODO: Get from auth context
      await Promise.all(
        selectedEntriesData.map(entry =>
          billingService.billTimeEntry(entry.id, invoice.id, currentUserId)
        )
      );

      onSuccess?.(invoice);
    } catch (error) {
      errorHandler.logError(error as Error, 'InvoiceGenerator:handleSubmit');
      alert('Failed to generate invoice. Please try again.');
    } finally {
      setLoading(false);
    }
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

  const totals = calculateTotals();

  return (
    <form onSubmit={handleSubmit} className="invoice-generator">
      <div className="form-header">
        <h2>Generate Invoice</h2>
        <p className="client-info">Client: {clientName}</p>
      </div>

      <div className="form-section">
        <h3>Invoice Details</h3>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="invoiceDate">Invoice Date *</label>
            <input
              type="date"
              id="invoiceDate"
              name="invoiceDate"
              value={formData.invoiceDate}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="dueDate">Due Date *</label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="paymentTerms">Payment Terms</label>
            <select
              id="paymentTerms"
              name="paymentTerms"
              value={formData.paymentTerms}
              onChange={handleChange}
              className="form-control"
            >
              <option value="Due on Receipt">Due on Receipt</option>
              <option value="Net 15">Net 15</option>
              <option value="Net 30">Net 30</option>
              <option value="Net 45">Net 45</option>
              <option value="Net 60">Net 60</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="taxRate">Tax Rate (%)</label>
            <input
              type="number"
              id="taxRate"
              name="taxRate"
              value={formData.taxRate}
              onChange={handleChange}
              step="0.01"
              min="0"
              max="100"
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="discountAmount">Discount Amount ($)</label>
            <input
              type="number"
              id="discountAmount"
              name="discountAmount"
              value={formData.discountAmount}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="form-control"
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="billingAddress">Billing Address</label>
            <textarea
              id="billingAddress"
              name="billingAddress"
              value={formData.billingAddress}
              onChange={handleChange}
              rows={3}
              className="form-control"
              placeholder="Enter client billing address..."
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              className="form-control"
              placeholder="Additional notes or instructions..."
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <div className="section-header">
          <h3>Select Time Entries</h3>
          <span className="entry-count">
            {selectedEntries.size} of {unbilledEntries.length} selected
          </span>
        </div>

        {loadingEntries ? (
          <div className="loading-state">Loading unbilled entries...</div>
        ) : unbilledEntries.length === 0 ? (
          <div className="empty-state">No unbilled time entries available</div>
        ) : (
          <div className="entries-table-container">
            <table className="entries-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selectedEntries.size === unbilledEntries.length}
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
                </tr>
              </thead>
              <tbody>
                {unbilledEntries.map(entry => (
                  <tr
                    key={entry.id}
                    className={selectedEntries.has(entry.id) ? 'selected' : ''}
                  >
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedEntries.has(entry.id)}
                        onChange={() => toggleSelection(entry.id)}
                      />
                    </td>
                    <td>{new Date(entry.date).toLocaleDateString()}</td>
                    <td className="description-cell">{entry.description}</td>
                    <td>{entry.activity}</td>
                    <td>{formatDuration(entry.duration)}</td>
                    <td>{formatCurrency(entry.rate)}/hr</td>
                    <td>{formatCurrency(entry.discountedTotal || entry.total)}</td>
                    <td>
                      <span className={`status-badge status-${entry.status.toLowerCase().replace(' ', '-')}`}>
                        {entry.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="invoice-summary">
        <h3>Invoice Summary</h3>
        <div className="summary-grid">
          <div className="summary-row">
            <span>Items:</span>
            <strong>{totals.itemCount}</strong>
          </div>
          <div className="summary-row">
            <span>Subtotal:</span>
            <strong>{formatCurrency(totals.subtotal)}</strong>
          </div>
          {formData.taxRate > 0 && (
            <div className="summary-row">
              <span>Tax ({formData.taxRate}%):</span>
              <strong>{formatCurrency(totals.taxAmount)}</strong>
            </div>
          )}
          {formData.discountAmount > 0 && (
            <div className="summary-row discount">
              <span>Discount:</span>
              <strong>-{formatCurrency(formData.discountAmount)}</strong>
            </div>
          )}
          <div className="summary-row total">
            <span>Total:</span>
            <strong>{formatCurrency(totals.totalAmount)}</strong>
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
          disabled={loading || selectedEntries.size === 0}
        >
          {loading ? 'Generating...' : 'Generate Invoice'}
        </button>
      </div>

      <style>{`
        .invoice-generator {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          max-width: 1200px;
          margin: 0 auto;
        }

        .form-header {
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #e9ecef;
        }

        .form-header h2 {
          margin: 0 0 0.5rem 0;
          color: #1a1a1a;
          font-size: 1.75rem;
        }

        .client-info {
          margin: 0;
          color: #6c757d;
          font-size: 1rem;
        }

        .form-section {
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid #e9ecef;
        }

        .form-section h3 {
          margin: 0 0 1rem 0;
          font-size: 1.25rem;
          color: #333;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .entry-count {
          color: #6c757d;
          font-size: 0.9rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
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

        .entries-table-container {
          overflow-x: auto;
          border: 1px solid #e9ecef;
          border-radius: 4px;
        }

        .entries-table {
          width: 100%;
          border-collapse: collapse;
        }

        .entries-table th {
          background: #f8f9fa;
          padding: 0.75rem;
          text-align: left;
          font-weight: 600;
          color: #495057;
          font-size: 0.875rem;
          border-bottom: 2px solid #dee2e6;
        }

        .entries-table td {
          padding: 0.75rem;
          border-bottom: 1px solid #e9ecef;
          font-size: 0.875rem;
        }

        .entries-table tr:hover {
          background: #f8f9fa;
        }

        .entries-table tr.selected {
          background: #e7f3ff;
        }

        .description-cell {
          max-width: 300px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-submitted {
          background: #fff3cd;
          color: #856404;
        }

        .status-approved {
          background: #d4edda;
          color: #155724;
        }

        .invoice-summary {
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 4px;
          margin-bottom: 2rem;
        }

        .invoice-summary h3 {
          margin: 0 0 1rem 0;
          font-size: 1.125rem;
        }

        .summary-grid {
          max-width: 400px;
          margin-left: auto;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          font-size: 0.95rem;
        }

        .summary-row.discount {
          color: #28a745;
        }

        .summary-row.total {
          margin-top: 0.5rem;
          padding-top: 0.75rem;
          border-top: 2px solid #dee2e6;
          font-size: 1.25rem;
          font-weight: 700;
        }

        .loading-state, .empty-state {
          padding: 2rem;
          text-align: center;
          color: #6c757d;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
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
