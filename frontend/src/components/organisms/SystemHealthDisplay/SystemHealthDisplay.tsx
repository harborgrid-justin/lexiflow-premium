import { CheckCircle, Cloud, XCircle } from 'lucide-react';
import React from 'react';
import { useTheme } from '@/theme';
interface ServiceCoverageProps {
  className?: string;
  compact?: boolean;
}

interface ServiceInfo {
  name: string;
  category: string;
  hasBackend: boolean;
}

// Comprehensive list of services with backend integration status
const SERVICE_COVERAGE: ServiceInfo[] = [
  // Core Data (4/4 - 100%)
  { name: 'Cases', category: 'Core Data', hasBackend: true },
  { name: 'Docket', category: 'Core Data', hasBackend: true },
  { name: 'Evidence', category: 'Core Data', hasBackend: true },
  { name: 'Documents', category: 'Core Data', hasBackend: true },

  // Litigation (5/5 - 100%)
  { name: 'Pleadings', category: 'Litigation', hasBackend: true },
  { name: 'Motions', category: 'Litigation', hasBackend: true },
  { name: 'Parties', category: 'Litigation', hasBackend: true },
  { name: 'Clauses', category: 'Litigation', hasBackend: true },
  { name: 'Case Phases', category: 'Litigation', hasBackend: true },

  // Discovery (7/7 - 100%)
  { name: 'Legal Holds', category: 'Discovery', hasBackend: true },
  { name: 'Depositions', category: 'Discovery', hasBackend: true },
  { name: 'Discovery Requests', category: 'Discovery', hasBackend: true },
  { name: 'ESI Sources', category: 'Discovery', hasBackend: true },
  { name: 'Privilege Log', category: 'Discovery', hasBackend: true },
  { name: 'Productions', category: 'Discovery', hasBackend: true },
  { name: 'Custodian Interviews', category: 'Discovery', hasBackend: true },

  // Billing (9/9 - 100%)
  { name: 'Time Entries', category: 'Billing', hasBackend: true },
  { name: 'Invoices', category: 'Billing', hasBackend: true },
  { name: 'Expenses', category: 'Billing', hasBackend: true },
  { name: 'Trust Accounts', category: 'Billing', hasBackend: true },
  { name: 'Rate Tables', category: 'Billing', hasBackend: true },
  { name: 'Fee Agreements', category: 'Billing', hasBackend: true },
  { name: 'Billing Analytics', category: 'Billing', hasBackend: true },
  { name: 'Processing Jobs', category: 'Billing', hasBackend: true },
  { name: 'Reports', category: 'Billing', hasBackend: true },

  // Compliance (6/6 - 100%)
  { name: 'Conflict Checks', category: 'Compliance', hasBackend: true },
  { name: 'Ethical Walls', category: 'Compliance', hasBackend: true },
  { name: 'Audit Logs', category: 'Compliance', hasBackend: true },
  { name: 'Permissions', category: 'Compliance', hasBackend: true },
  { name: 'RLS Policies', category: 'Compliance', hasBackend: true },
  { name: 'Compliance Reports', category: 'Compliance', hasBackend: true },

  // Operations (7/7 - 100%)
  { name: 'Projects', category: 'Operations', hasBackend: true },
  { name: 'Communications', category: 'Operations', hasBackend: true },
  { name: 'Users', category: 'Operations', hasBackend: true },
  { name: 'Custodians', category: 'Operations', hasBackend: true },
  { name: 'Examinations', category: 'Operations', hasBackend: true },
  { name: 'Case Teams', category: 'Operations', hasBackend: true },
  { name: 'Time Entries (Extended)', category: 'Operations', hasBackend: true },

  // Workflow & Task Management (2/2 - 100%)
  { name: 'Tasks', category: 'Workflow', hasBackend: true },
  { name: 'Risks', category: 'Workflow', hasBackend: true },
  { name: 'Workflow Templates', category: 'Workflow', hasBackend: true },

  // HR & Administration (1/1 - 100%)
  { name: 'HR', category: 'HR', hasBackend: true },

  // Trial & Exhibits (2/2 - 100%)
  { name: 'Trial Management', category: 'Trial', hasBackend: true },
  { name: 'Exhibits', category: 'Trial', hasBackend: true },

  // Client Relationship Management (1/1 - 100%)
  { name: 'Clients', category: 'CRM', hasBackend: true },

  // Research & Knowledge (2/2 - 100%)
  { name: 'Citations', category: 'Research', hasBackend: true },
  { name: 'Knowledge Base', category: 'Research', hasBackend: true },

  // Collaboration & Communication (3/3 - 100%)
  { name: 'Calendar', category: 'Collaboration', hasBackend: true },
  { name: 'Messenger', category: 'Collaboration', hasBackend: true },
  { name: 'War Room', category: 'Collaboration', hasBackend: true },

  // Analytics & Reporting (1/1 - 100%)
  { name: 'Analytics Dashboard', category: 'Analytics', hasBackend: true },
];

/**
 * ServiceCoverageBadge - React 18 optimized with React.memo
 */
const ServiceCoverageBadge = React.memo<ServiceCoverageProps>(function ServiceCoverageBadge({ className = '', compact = false }) {
  const { theme, tokens } = useTheme();

  const totalServices = SERVICE_COVERAGE.length;
  const backendServices = SERVICE_COVERAGE.filter(s => s.hasBackend).length;
  const coveragePercent = Math.round((backendServices / totalServices) * 100);

  if (compact) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.compact.xs }} className={className}>
        <Cloud style={{ width: '1rem', height: '1rem', color: theme.status.success.text }} />
        <span style={{ fontSize: tokens.typography.fontSize.sm, color: theme.text.secondary }}>
          Backend: <span style={{ fontWeight: tokens.typography.fontWeight.semibold, color: theme.status.success.text }}>{backendServices}/{totalServices}</span>
          <span style={{ fontSize: tokens.typography.fontSize.xs, color: theme.text.muted, marginLeft: tokens.spacing.compact.xs }}>({coveragePercent}%)</span>
        </span>
      </div>
    );
  }

  // Group services by category
  const categories = SERVICE_COVERAGE.reduce((acc: Record<string, { total: number; backend: number }>, service) => {
    if (!acc[service.category]) {
      acc[service.category] = { total: 0, backend: 0 };
    }
    const cat = acc[service.category];
    if (cat) {
      cat.total++;
      if (service.hasBackend) cat.backend++;
    }
    return acc;
  }, {} as Record<string, { total: number; backend: number }>);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.normal.md }} className={className}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{
          fontSize: tokens.typography.fontSize.sm,
          fontWeight: tokens.typography.fontWeight.semibold,
          color: theme.text.primary
        }}>
          Backend Service Coverage
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.compact.xs }}>
          <Cloud style={{ width: '1rem', height: '1rem', color: theme.status.success.text }} />
          <span style={{
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.bold,
            color: theme.status.success.text
          }}>
            {backendServices}/{totalServices} ({coveragePercent}%)
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.compact.xs }}>
        {Object.entries(categories).map(([category, stats]) => {
          const categoryPercent = Math.round((stats.backend / stats.total) * 100);
          return (
            <div key={category} style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.compact.xs }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: tokens.typography.fontSize.xs
              }}>
                <span style={{ fontWeight: tokens.typography.fontWeight.medium, color: theme.text.secondary }}>{category}</span>
                <span style={{ color: theme.text.muted }}>
                  {stats.backend}/{stats.total} ({categoryPercent}%)
                </span>
              </div>
              <div style={{
                width: '100%',
                backgroundColor: theme.surface.muted,
                borderRadius: tokens.borderRadius.full,
                height: '0.5rem'
              }}>
                <div
                  style={{
                    height: '0.5rem',
                    borderRadius: tokens.borderRadius.full,
                    transition: 'all 0.3s',
                    backgroundColor: categoryPercent === 100 ? theme.status.success.bg : theme.status.warning.bg,
                    width: `${categoryPercent}%`
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        paddingTop: tokens.spacing.normal.md,
        borderTop: `1px solid ${theme.border.default}`
      }}>
        <p style={{
          fontSize: tokens.typography.fontSize.xs,
          color: theme.text.muted,
          fontStyle: 'italic'
        }}>
          When backend mode is enabled, {backendServices} services use PostgreSQL.
          {totalServices - backendServices > 0 && (
            <> {totalServices - backendServices} services still use local IndexedDB storage.</>
          )}
        </p>
      </div>
    </div>
  );
});

export const SystemHealthDisplay: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { theme, tokens } = useTheme();

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: theme.surface.base,
          borderRadius: tokens.borderRadius.lg,
          boxShadow: tokens.shadows.xl,
          maxWidth: '42rem',
          width: '100%',
          maxHeight: '80vh',
          overflowY: 'auto',
          margin: '0 1rem'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: tokens.spacing.normal['2xl'] }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: tokens.spacing.normal.lg
          }}>
            <h2 style={{
              fontSize: tokens.typography.fontSize.xl,
              fontWeight: tokens.typography.fontWeight.bold,
              color: theme.text.primary
            }}>
              Service Coverage Report
            </h2>
            <button
              onClick={onClose}
              style={{
                color: theme.text.muted,
                transition: 'color 0.2s',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: tokens.typography.fontSize.xl
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = theme.text.secondary}
              onMouseLeave={(e) => e.currentTarget.style.color = theme.text.muted}
            >
              ✕
            </button>
          </div>

          <ServiceCoverageBadge />

          <div className="mt-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Service Details
            </h3>

            {Object.entries(
              SERVICE_COVERAGE.reduce((acc: Record<string, ServiceInfo[]>, service) => {
                if (!acc[service.category]) acc[service.category] = [];
                acc[service.category]?.push(service);
                return acc;
              }, {} as Record<string, ServiceInfo[]>)
            ).map(([category, services]) => (
              <div key={category} className="space-y-2">
                <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  {category}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {services.map(service => (
                    <div
                      key={service.name}
                      className="flex items-center gap-2 text-xs py-1 px-2 rounded bg-gray-50 dark:bg-slate-700"
                    >
                      {service.hasBackend ? (
                        <CheckCircle className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      )}
                      <span className={service.hasBackend ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}>
                        {service.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCoverageBadge;
