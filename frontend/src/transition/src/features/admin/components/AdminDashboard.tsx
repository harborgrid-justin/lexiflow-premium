/**
 * AdminDashboard - Main admin dashboard
 */

import { Button } from '../../../ui/components/Button';
import { Card } from '../../../ui/components/Card';

export function AdminDashboard() {
  return (
    <div className="admin-dashboard">
      <h1>Admin Console</h1>
      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
        <Card title="User Management">
          <p>Manage system users, roles, and permissions.</p>
          <div style={{ marginTop: '1rem' }}>
            <Button variant="secondary" onClick={() => console.info('Nav to users')}>Manage Users</Button>
          </div>
        </Card>
        <Card title="System Settings">
          <p>Configure general, security, and email settings.</p>
          <div style={{ marginTop: '1rem' }}>
            <Button variant="secondary" onClick={() => console.info('Nav to settings')}>Configure</Button>
          </div>
        </Card>
        <Card title="Audit Logs">
          <p>View system activity and security logs.</p>
          <div style={{ marginTop: '1rem' }}>
            <Button variant="secondary" onClick={() => console.info('Nav to logs')}>View Logs</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
