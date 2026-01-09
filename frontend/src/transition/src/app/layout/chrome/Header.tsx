/**
 * Header - Top navigation chrome
 */

import { APP_NAME } from '@/config/app.config';
import { useAuth } from '../../../services/identity/AuthProvider';
import { useLayout } from '../LayoutProvider';

export function Header() {
  const { toggleSidebar } = useLayout();
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <button onClick={toggleSidebar} className="header__menu-toggle">
        ☰
      </button>

      <div className="header__logo">
        <h1>{APP_NAME}</h1>
      </div>

      <nav className="header__nav">
        <a href="/dashboard">Dashboard</a>
        <a href="/billing">Billing</a>
        <a href="/reporting">Reporting</a>
      </nav>

      <div className="header__actions">
        {user && (
          <>
            <span className="header__user">{user.name || user.email}</span>
            <button onClick={logout} className="header__logout">
              Logout
            </button>
          </>
        )}
      </div>

      <style>{`
        .header {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 1rem 2rem;
          border-bottom: 1px solid var(--color-border);
          background: var(--color-surface);
        }

        .header__menu-toggle {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.5rem;
        }

        .header__logo h1 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0;
        }

        .header__nav {
          display: flex;
          gap: 1.5rem;
          flex: 1;
        }

        .header__nav a {
          text-decoration: none;
          color: var(--color-foreground);
        }

        .header__actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .header__logout {
          padding: 0.5rem 1rem;
          background: var(--color-primary);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
      `}</style>
    </header>
  );
}
