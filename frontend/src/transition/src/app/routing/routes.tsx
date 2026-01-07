/**
 * Application Routes
 * Defines all routes and their components
 */

import type { RouteConfig } from './types';

// Simple placeholder components for features
function BillingDashboard() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>
        💰 Billing Dashboard
      </h1>
      <p style={{ color: 'var(--text-secondary)' }}>
        Manage invoices, payments, and billing operations.
      </p>
      <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
        <h3 style={{ marginBottom: '0.5rem' }}>Recent Activity</h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          No recent billing activity to display.
        </p>
      </div>
    </div>
  );
}

function InvoiceList() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>
        📄 Invoices
      </h1>
      <p style={{ color: 'var(--text-secondary)' }}>
        View and manage all invoices.
      </p>
      <div style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
          No invoices found.
        </p>
      </div>
    </div>
  );
}

function ReportingDashboard() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>
        📊 Reporting Dashboard
      </h1>
      <p style={{ color: 'var(--text-secondary)' }}>
        Analytics, insights, and business intelligence.
      </p>
      <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Total Cases</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '600' }}>0</div>
        </div>
        <div style={{ padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Active Matters</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '600' }}>0</div>
        </div>
        <div style={{ padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Revenue</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '600' }}>$0</div>
        </div>
      </div>
    </div>
  );
}

function AdminDashboard() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>
        ⚙️ Admin Dashboard
      </h1>
      <p style={{ color: 'var(--text-secondary)' }}>
        System administration and configuration.
      </p>
      <div style={{ marginTop: '2rem', display: 'grid', gap: '1rem' }}>
        <div style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>System Status</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-success)' }}>✓ All systems operational</p>
        </div>
      </div>
    </div>
  );
}

function UserManagement() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>
        👥 User Management
      </h1>
      <p style={{ color: 'var(--text-secondary)' }}>
        Manage users, roles, and permissions.
      </p>
      <div style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
          No users found.
        </p>
      </div>
    </div>
  );
}

function Home() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
        Welcome to LexiFlow AI Legal Suite
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Enterprise Legal OS combining Case Management, Discovery, Legal Research, and Firm Operations.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
        <a href="/billing" style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', textDecoration: 'none', color: 'inherit', transition: 'all var(--transition-base)' }}>
          <h3 style={{ marginBottom: '0.5rem', color: 'var(--color-primary)' }}>💰 Billing</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Manage invoices, payments, and billing operations</p>
        </a>
        <a href="/reporting" style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', textDecoration: 'none', color: 'inherit', transition: 'all var(--transition-base)' }}>
          <h3 style={{ marginBottom: '0.5rem', color: 'var(--color-primary)' }}>📊 Reporting</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Analytics, insights, and business intelligence</p>
        </a>
        <a href="/admin" style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', textDecoration: 'none', color: 'inherit', transition: 'all var(--transition-base)' }}>
          <h3 style={{ marginBottom: '0.5rem', color: 'var(--color-primary)' }}>⚙️ Admin</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>User management and system settings</p>
        </a>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', textAlign: 'center', padding: '2rem' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>404</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Page not found</p>
      <a href="/" style={{ color: 'var(--color-primary)', textDecoration: 'none', padding: '0.5rem 1rem', border: '1px solid var(--color-primary)', borderRadius: 'var(--radius-md)', transition: 'all var(--transition-base)' }}>Go Home</a>
    </div>
  );
}

export const routes: RouteConfig[] = [
  { path: '/', element: <Home />, public: true },
  { path: '/billing', element: <BillingDashboard />, public: false },
  { path: '/billing/invoices', element: <InvoiceList />, public: false },
  { path: '/reporting', element: <ReportingDashboard />, public: false },
  { path: '/admin', element: <AdminDashboard />, public: false, requiredRoles: ['admin'] },
  { path: '/admin/users', element: <UserManagement />, public: false, requiredRoles: ['admin'] },
  { path: '*', element: <NotFound />, public: true },
];

export const PATHS = {
  dashboard: '/',
  billing: { root: '/billing', invoices: '/billing/invoices' },
  reporting: { root: '/reporting' },
  admin: { root: '/admin', users: '/admin/users' }
};
