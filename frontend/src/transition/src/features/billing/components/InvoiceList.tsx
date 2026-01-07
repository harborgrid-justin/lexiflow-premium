/**
 * InvoiceList - Display list of invoices
 */

import type { Invoice } from '../../../services/data/api/gateways/billingGateway';
import { Button } from '../../../ui/components/Button';
import { Table, type Column } from '../../../ui/components/Table';
import { useBillingData } from '../hooks/useBillingData';

export function InvoiceList() {
  const { invoices, loading, error, refresh } = useBillingData();

  const columns: Column<Invoice>[] = [
    { key: 'number', header: 'Invoice #' },
    { key: 'clientId', header: 'Client' },
    {
      key: 'amount',
      header: 'Amount',
      render: (i) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(i.amount)
    },
    {
      key: 'status',
      header: 'Status',
      render: (i) => (
        <span className={`status-badge status-${i.status}`}>
          {i.status.charAt(0).toUpperCase() + i.status.slice(1)}
        </span>
      )
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: (i) => new Date(i.dueDate).toLocaleDateString()
    }
  ];

  if (loading) return <div>Loading invoices...</div>;

  if (error) return (
    <div className="error-state">
      <p>{error}</p>
      <Button onClick={refresh}>Retry</Button>
    </div>
  );

  return (
    <div className="invoice-list">
      <div className="header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h2>Invoices</h2>
        <Button onClick={() => console.info('Create invoice')}>Create Invoice</Button>
      </div>

      {invoices.length === 0 ? (
        <div className="empty-state" style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#f5f5f5' }}>
          <p>No invoices found.</p>
          <Button variant="secondary" onClick={() => console.info('Create invoice')}>
            Create First Invoice
          </Button>
        </div>
      ) : (
        <Table
          data={invoices}
          columns={columns}
          keyExtractor={(i) => i.id}
        />
      )}
    </div>
  );
}
