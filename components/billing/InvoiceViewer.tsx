import React, { useState, useEffect } from 'react';
import { billingService, Invoice, InvoiceItem } from '../../services/billingService';
import { errorHandler } from '../../utils/errorHandler';

interface InvoiceViewerProps {
  invoiceId: string;
  onClose?: () => void;
  onEdit?: (invoice: Invoice) => void;
}

export const InvoiceViewer: React.FC<InvoiceViewerProps> = ({
  invoiceId,
  onClose,
  onEdit,
}) => {
  const [invoice, setInvoice] = useState<(Invoice & { items: InvoiceItem[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentReference, setPaymentReference] = useState('');

  useEffect(() => {
    loadInvoice();
  }, [invoiceId]);

  const loadInvoice = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await billingService.getInvoice(invoiceId);
      setInvoice(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load invoice';
      setError(message);
      errorHandler.logError(err as Error, 'InvoiceViewer:loadInvoice');
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvoice = async () => {
    if (!invoice) return;

    if (!window.confirm('Send this invoice to the client?')) {
      return;
    }

    try {
      const currentUserId = 'current-user-id'; // TODO: Get from auth context
      const updated = await billingService.sendInvoice(invoice.id, currentUserId);
      setInvoice({ ...invoice, ...updated });
      alert('Invoice sent successfully!');
    } catch (err) {
      errorHandler.logError(err as Error, 'InvoiceViewer:handleSendInvoice');
      alert('Failed to send invoice');
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    if (amount > invoice.balanceDue) {
      alert('Payment amount cannot exceed balance due');
      return;
    }

    try {
      const updated = await billingService.recordPayment(invoice.id, {
        amount,
        paymentMethod: paymentMethod || undefined,
        paymentReference: paymentReference || undefined,
      });
      setInvoice({ ...invoice, ...updated });
      setShowPaymentModal(false);
      setPaymentAmount('');
      setPaymentMethod('');
      setPaymentReference('');
      alert('Payment recorded successfully!');
    } catch (err) {
      errorHandler.logError(err as Error, 'InvoiceViewer:handleRecordPayment');
      alert('Failed to record payment');
    }
  };

  const handleGeneratePDF = async () => {
    if (!invoice) return;

    try {
      const { url } = await billingService.generateInvoicePDF(invoice.id);
      window.open(url, '_blank');
    } catch (err) {
      errorHandler.logError(err as Error, 'InvoiceViewer:handleGeneratePDF');
      alert('Failed to generate PDF');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusBadgeClass = (status: string) => {
    const statusMap: Record<string, string> = {
      'Draft': 'status-draft',
      'Sent': 'status-sent',
      'Paid': 'status-paid',
      'Partial': 'status-partial',
      'Overdue': 'status-overdue',
      'Written Off': 'status-written-off',
    };
    return statusMap[status] || 'status-default';
  };

  if (loading) {
    return (
      <div className="invoice-viewer loading">
        <div className="spinner">Loading invoice...</div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="invoice-viewer error">
        <div className="error-message">
          <h3>Error</h3>
          <p>{error || 'Invoice not found'}</p>
          <button onClick={onClose} className="btn btn-primary">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="invoice-viewer">
      <div className="viewer-header no-print">
        <div className="header-left">
          <h2>Invoice #{invoice.invoiceNumber}</h2>
          <span className={`status-badge ${getStatusBadgeClass(invoice.status)}`}>
            {invoice.status}
          </span>
        </div>
        <div className="header-actions">
          {invoice.status === 'Draft' && (
            <>
              <button onClick={() => onEdit?.(invoice)} className="btn btn-secondary">
                Edit
              </button>
              <button onClick={handleSendInvoice} className="btn btn-primary">
                Send Invoice
              </button>
            </>
          )}
          {(invoice.status === 'Sent' || invoice.status === 'Partial' || invoice.status === 'Overdue') && (
            <button onClick={() => setShowPaymentModal(true)} className="btn btn-success">
              Record Payment
            </button>
          )}
          <button onClick={handleGeneratePDF} className="btn btn-secondary">
            Download PDF
          </button>
          <button onClick={handlePrint} className="btn btn-secondary">
            Print
          </button>
          {onClose && (
            <button onClick={onClose} className="btn btn-secondary">
              Close
            </button>
          )}
        </div>
      </div>

      <div className="invoice-document">
        <div className="invoice-header">
          <div className="firm-info">
            <h1>LexiFlow Law Firm</h1>
            <p>123 Legal Street</p>
            <p>New York, NY 10001</p>
            <p>Phone: (555) 123-4567</p>
            <p>Email: billing@lexiflow.com</p>
          </div>
          <div className="invoice-meta">
            <h2>INVOICE</h2>
            <div className="meta-row">
              <span className="label">Invoice #:</span>
              <span className="value">{invoice.invoiceNumber}</span>
            </div>
            <div className="meta-row">
              <span className="label">Date:</span>
              <span className="value">{new Date(invoice.invoiceDate).toLocaleDateString()}</span>
            </div>
            <div className="meta-row">
              <span className="label">Due Date:</span>
              <span className="value">{new Date(invoice.dueDate).toLocaleDateString()}</span>
            </div>
            {invoice.paymentTerms && (
              <div className="meta-row">
                <span className="label">Terms:</span>
                <span className="value">{invoice.paymentTerms}</span>
              </div>
            )}
          </div>
        </div>

        <div className="invoice-parties">
          <div className="bill-to">
            <h3>Bill To:</h3>
            <p className="client-name">{invoice.clientName}</p>
            {invoice.billingAddress && (
              <p className="address">{invoice.billingAddress}</p>
            )}
          </div>
        </div>

        <div className="invoice-items">
          <table className="items-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Type</th>
                <th className="qty">Qty</th>
                <th className="rate">Rate</th>
                <th className="amount">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items && invoice.items.map((item, index) => (
                <tr key={index}>
                  <td>{new Date(item.date).toLocaleDateString()}</td>
                  <td className="description">{item.description}</td>
                  <td>{item.type}</td>
                  <td className="qty">{item.quantity}</td>
                  <td className="rate">{formatCurrency(item.rate)}</td>
                  <td className="amount">{formatCurrency(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="invoice-totals">
          <div className="totals-grid">
            <div className="total-row">
              <span>Subtotal:</span>
              <strong>{formatCurrency(invoice.subtotal)}</strong>
            </div>
            {invoice.taxRate > 0 && (
              <div className="total-row">
                <span>Tax ({invoice.taxRate}%):</span>
                <strong>{formatCurrency(invoice.taxAmount)}</strong>
              </div>
            )}
            {invoice.discountAmount > 0 && (
              <div className="total-row discount">
                <span>Discount:</span>
                <strong>-{formatCurrency(invoice.discountAmount)}</strong>
              </div>
            )}
            <div className="total-row grand-total">
              <span>Total:</span>
              <strong>{formatCurrency(invoice.totalAmount)}</strong>
            </div>
            {invoice.paidAmount > 0 && (
              <>
                <div className="total-row paid">
                  <span>Paid:</span>
                  <strong>-{formatCurrency(invoice.paidAmount)}</strong>
                </div>
                <div className="total-row balance-due">
                  <span>Balance Due:</span>
                  <strong>{formatCurrency(invoice.balanceDue)}</strong>
                </div>
              </>
            )}
          </div>
        </div>

        {invoice.notes && (
          <div className="invoice-notes">
            <h3>Notes:</h3>
            <p>{invoice.notes}</p>
          </div>
        )}

        <div className="invoice-footer">
          <p>Thank you for your business!</p>
          <p>Please remit payment to the address above.</p>
        </div>
      </div>

      {showPaymentModal && (
        <div className="modal-overlay no-print">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Record Payment</h3>
              <button onClick={() => setShowPaymentModal(false)} className="close-btn">&times;</button>
            </div>
            <form onSubmit={handleRecordPayment}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="paymentAmount">Payment Amount *</label>
                  <input
                    type="number"
                    id="paymentAmount"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    step="0.01"
                    min="0.01"
                    max={invoice.balanceDue}
                    required
                    className="form-control"
                    placeholder={`Max: ${formatCurrency(invoice.balanceDue)}`}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="paymentMethod">Payment Method</label>
                  <select
                    id="paymentMethod"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="form-control"
                  >
                    <option value="">Select method</option>
                    <option value="Check">Check</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Wire Transfer">Wire Transfer</option>
                    <option value="ACH">ACH</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="paymentReference">Reference/Transaction ID</label>
                  <input
                    type="text"
                    id="paymentReference"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    className="form-control"
                    placeholder="Check number, transaction ID, etc."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowPaymentModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-success">
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .invoice-viewer {
          background: white;
          min-height: 100vh;
        }

        .viewer-header {
          padding: 1.5rem 2rem;
          background: #f8f9fa;
          border-bottom: 2px solid #e9ecef;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .header-left h2 {
          margin: 0;
          font-size: 1.5rem;
          color: #1a1a1a;
        }

        .header-actions {
          display: flex;
          gap: 0.5rem;
        }

        .invoice-document {
          max-width: 8.5in;
          margin: 2rem auto;
          padding: 1in;
          background: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .invoice-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #333;
        }

        .firm-info h1 {
          margin: 0 0 0.5rem 0;
          font-size: 1.75rem;
          color: #1a1a1a;
        }

        .firm-info p {
          margin: 0.25rem 0;
          color: #495057;
        }

        .invoice-meta h2 {
          margin: 0 0 1rem 0;
          font-size: 2rem;
          color: #1a1a1a;
          text-align: right;
        }

        .meta-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .meta-row .label {
          font-weight: 600;
          color: #495057;
        }

        .invoice-parties {
          margin-bottom: 2rem;
        }

        .bill-to h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1rem;
          color: #6c757d;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .client-name {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 0.25rem 0;
        }

        .address {
          margin: 0;
          color: #495057;
          white-space: pre-line;
        }

        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 2rem;
        }

        .items-table thead {
          background: #f8f9fa;
        }

        .items-table th {
          padding: 0.75rem;
          text-align: left;
          font-weight: 600;
          color: #495057;
          border-bottom: 2px solid #dee2e6;
        }

        .items-table th.qty,
        .items-table th.rate,
        .items-table th.amount {
          text-align: right;
          width: 100px;
        }

        .items-table td {
          padding: 0.75rem;
          border-bottom: 1px solid #e9ecef;
        }

        .items-table td.description {
          max-width: 400px;
        }

        .items-table td.qty,
        .items-table td.rate,
        .items-table td.amount {
          text-align: right;
        }

        .invoice-totals {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 2rem;
        }

        .totals-grid {
          min-width: 300px;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          font-size: 1rem;
        }

        .total-row.discount {
          color: #28a745;
        }

        .total-row.paid {
          color: #28a745;
        }

        .total-row.grand-total {
          margin-top: 0.5rem;
          padding-top: 0.75rem;
          border-top: 2px solid #333;
          font-size: 1.25rem;
          font-weight: 700;
        }

        .total-row.balance-due {
          font-size: 1.125rem;
          font-weight: 700;
          color: #dc3545;
        }

        .invoice-notes {
          margin-bottom: 2rem;
          padding: 1rem;
          background: #f8f9fa;
          border-left: 4px solid #4a90e2;
        }

        .invoice-notes h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1rem;
          color: #495057;
        }

        .invoice-notes p {
          margin: 0;
          color: #495057;
          white-space: pre-line;
        }

        .invoice-footer {
          text-align: center;
          padding-top: 2rem;
          border-top: 1px solid #e9ecef;
          color: #6c757d;
        }

        .invoice-footer p {
          margin: 0.25rem 0;
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

        .status-sent {
          background: #d1ecf1;
          color: #0c5460;
        }

        .status-paid {
          background: #d4edda;
          color: #155724;
        }

        .status-partial {
          background: #fff3cd;
          color: #856404;
        }

        .status-overdue {
          background: #f8d7da;
          color: #721c24;
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

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 8px;
          width: 90%;
          max-width: 500px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        }

        .modal-header {
          padding: 1.5rem;
          border-bottom: 1px solid #e9ecef;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 1.25rem;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #6c757d;
          line-height: 1;
        }

        .modal-body {
          padding: 1.5rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #333;
          font-size: 0.9rem;
        }

        .form-control {
          width: 100%;
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

        .modal-footer {
          padding: 1rem 1.5rem;
          border-top: 1px solid #e9ecef;
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
        }

        .loading, .error {
          padding: 3rem;
          text-align: center;
        }

        .error-message {
          max-width: 400px;
          margin: 0 auto;
        }

        .error-message h3 {
          color: #dc3545;
          margin-bottom: 1rem;
        }

        @media print {
          .no-print {
            display: none !important;
          }

          .invoice-document {
            box-shadow: none;
            margin: 0;
          }

          body {
            background: white;
          }
        }
      `}</style>
    </div>
  );
};
