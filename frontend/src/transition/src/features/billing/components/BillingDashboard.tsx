/**
 * BillingDashboard - Main billing dashboard component
 */

import { Button } from '../../../ui/components/Button';
import { Card } from '../../../ui/components/Card';

export function BillingDashboard() {
  return (
    <div className="billing-dashboard">
      <h1>Billing Dashboard</h1>
      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
        <Card title="Invoices">
          <p>Manage client invoices and payments.</p>
          <div style={{ marginTop: '1rem' }}>
            <Button variant="secondary" onClick={() => console.info('Nav to invoices')}>View Invoices</Button>
          </div>
        </Card>
        <Card title="Subscriptions">
          <p>Manage recurring billing and subscriptions.</p>
          <div style={{ marginTop: '1rem' }}>
            <Button variant="secondary" onClick={() => console.info('Nav to subscriptions')}>View Subscriptions</Button>
          </div>
        </Card>
        <Card title="Payment Methods">
          <p>Configure payment gateways and methods.</p>
          <div style={{ marginTop: '1rem' }}>
            <Button variant="secondary" onClick={() => console.info('Nav to methods')}>Manage Payments</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
