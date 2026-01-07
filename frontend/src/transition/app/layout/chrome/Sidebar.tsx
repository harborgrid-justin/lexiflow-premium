/**
 * Sidebar - Side navigation chrome
 */

import { routes } from '../../routing/routes';
import { useLayout } from '../LayoutProvider';

export function Sidebar() {
  const { sidebarOpen } = useLayout();

  if (!sidebarOpen) {
    return null;
  }

  return (
    <aside className="sidebar">
      <nav className="sidebar__nav">
        <div className="sidebar__section">
          <h3 className="sidebar__section-title">Main</h3>
          <a href={routes.dashboard} className="sidebar__link">
            Dashboard
          </a>
        </div>

        <div className="sidebar__section">
          <h3 className="sidebar__section-title">Features</h3>
          <a href={routes.billing.root} className="sidebar__link">
            Billing
          </a>
          <a href={routes.reporting.root} className="sidebar__link">
            Reporting
          </a>
          <a href={routes.admin.root} className="sidebar__link">
            Admin
          </a>
        </div>
      </nav>

      <style>{`
        .sidebar {
          width: 240px;
          border-right: 1px solid var(--color-border);
          background: var(--color-surface);
          padding: 1.5rem 1rem;
        }

        .sidebar__nav {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .sidebar__section {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .sidebar__section-title {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          color: var(--color-muted);
          margin: 0 0 0.5rem;
        }

        .sidebar__link {
          padding: 0.75rem 1rem;
          text-decoration: none;
          color: var(--color-foreground);
          border-radius: 4px;
          transition: background 0.2s;
        }

        .sidebar__link:hover {
          background: var(--color-hover);
        }
      `}</style>
    </aside>
  );
}
