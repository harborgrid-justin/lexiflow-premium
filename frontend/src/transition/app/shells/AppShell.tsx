/**
 * AppShell - Auth-aware chrome skeleton
 * Navigation and sidebar placeholders
 * This shell appears while auth and main layout are loading
 */

export function AppShell() {
  return (
    <div className="app-shell">
      <header className="app-shell__header">
        <div className="app-shell__header-logo">
          <div className="skeleton skeleton--logo" />
        </div>

        <nav className="app-shell__header-nav">
          <div className="skeleton skeleton--nav-item" />
          <div className="skeleton skeleton--nav-item" />
          <div className="skeleton skeleton--nav-item" />
        </nav>

        <div className="app-shell__header-actions">
          <div className="skeleton skeleton--avatar" />
        </div>
      </header>

      <div className="app-shell__body">
        <aside className="app-shell__sidebar">
          <div className="skeleton skeleton--menu-item" />
          <div className="skeleton skeleton--menu-item" />
          <div className="skeleton skeleton--menu-item" />
          <div className="skeleton skeleton--menu-item" />
          <div className="skeleton skeleton--menu-item" />
        </aside>

        <main className="app-shell__content">
          <div className="skeleton skeleton--title" />
          <div className="skeleton skeleton--content-block" />
          <div className="skeleton skeleton--content-block" />
        </main>
      </div>

      <style>{`
        .app-shell {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background: var(--color-background);
        }

        .app-shell__header {
          display: flex;
          align-items: center;
          gap: 2rem;
          padding: 1rem 2rem;
          border-bottom: 1px solid var(--color-border);
          background: var(--color-surface);
        }

        .app-shell__header-nav {
          display: flex;
          gap: 1rem;
          flex: 1;
        }

        .app-shell__body {
          display: flex;
          flex: 1;
        }

        .app-shell__sidebar {
          width: 240px;
          padding: 1.5rem 1rem;
          border-right: 1px solid var(--color-border);
          background: var(--color-surface);
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .app-shell__content {
          flex: 1;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .skeleton {
          background: linear-gradient(
            90deg,
            var(--color-muted-200) 0%,
            var(--color-muted-100) 50%,
            var(--color-muted-200) 100%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
        }

        .skeleton--logo {
          width: 120px;
          height: 32px;
        }

        .skeleton--nav-item {
          width: 80px;
          height: 24px;
        }

        .skeleton--avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
        }

        .skeleton--menu-item {
          height: 36px;
        }

        .skeleton--title {
          width: 40%;
          height: 32px;
        }

        .skeleton--content-block {
          height: 200px;
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}
