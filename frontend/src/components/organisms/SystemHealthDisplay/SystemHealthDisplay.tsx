import { CheckCircle, Cloud, XCircle } from 'lucide-react';
import React from 'react';

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
  // const { isBackendApiEnabled } = useDataSource();

  const totalServices = SERVICE_COVERAGE.length;
  const backendServices = SERVICE_COVERAGE.filter(s => s.hasBackend).length;
  const coveragePercent = Math.round((backendServices / totalServices) * 100);

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Cloud className="w-4 h-4 text-emerald-500" />
        <span className={cn("text-sm", theme.text.secondary)}>
          Backend: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{backendServices}/{totalServices}</span>
          <span className={cn("text-xs ml-1", theme.text.tertiary)}>({coveragePercent}%)</span>
        </span>
      </div>
    );
  }

  // Group services by category
  const categories = SERVICE_COVERAGE.reduce((acc: Record<string, { total: number; backend: number }>, service) => {
    if (!acc[service.category]) {
      acc[service.category] = { total: 0, backend: 0 };
    }
    const categoryStats = acc[service.category];
    if (categoryStats) {
      categoryStats.total++;
      if (service.hasBackend) categoryStats.backend++;
    }
    return acc;
  }, {} as Record<string, { total: number; backend: number }>);

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Backend Service Coverage
        </h3>
        <div className="flex items-center gap-2">
          <Cloud className="w-4 h-4 text-emerald-500" />
          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
            {backendServices}/{totalServices} ({coveragePercent}%)
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {Object.entries(categories).map(([category, stats]) => {
          const categoryPercent = Math.round((stats.backend / stats.total) * 100);
          return (
            <div key={category} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className={cn("font-medium", theme.text.primary)}>{category}</span>
                <span className={theme.text.secondary}>
                  {stats.backend}/{stats.total} ({categoryPercent}%)
                </span>
              </div>
              <div style={{ backgroundColor: 'var(--color-surfaceHover)' }} className="w-full rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${categoryPercent === 100 ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  style={{ width: `${categoryPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className={cn("pt-3", theme.border.default, "border-t")}>
        <p className={cn("text-xs italic", theme.text.tertiary)}>
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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={onClose}>
      <div
        style={{ backgroundColor: 'var(--color-surface)' }}
        className="rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto mx-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className={cn("text-xl font-bold", theme.text.primary)}>
              Service Coverage Report
            </h2>
            <button
              onClick={onClose}
              className={cn(theme.text.secondary, `hover:${theme.text.primary}`)}
            >
              ✕
            </button>
          </div>

          <ServiceCoverageBadge />

          <div className="mt-6 space-y-4">
            <h3 className={cn("text-sm font-semibold", theme.text.primary)}>
              Service Details
            </h3>

            {Object.entries(
              SERVICE_COVERAGE.reduce((acc: Record<string, ServiceInfo[]>, service) => {
                if (!acc[service.category]) acc[service.category] = [];
                const categoryServices = acc[service.category];
                if (categoryServices) {
                  categoryServices.push(service);
                }
                return acc;
              }, {} as Record<string, ServiceInfo[]>)
            ).map(([category, services]) => (
              <div key={category} className="space-y-2">
                <h4 className={cn("text-xs font-semibold uppercase tracking-wide", theme.text.primary)}>
                  {category}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {services.map(service => (
                    <div
                      key={service.name}
                      style={{ backgroundColor: 'var(--color-surfaceHover)' }}
                      className="flex items-center gap-2 text-xs py-1 px-2 rounded"
                    >
                      {service.hasBackend ? (
                        <CheckCircle className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      )}
                      <span className={service.hasBackend ? theme.text.primary : theme.text.tertiary}>
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
