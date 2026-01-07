/**
 * GlobalShell - Minimal fallback for onShellReady
 * Themed, no auth, no data dependencies
 * This shell appears during initial HTML streaming before any content is ready
 */

export function GlobalShell() {
  return (
    <div className="global-shell">
      <div className="global-shell__container">
        <div className="global-shell__logo">
          {/* Company logo or brand */}
          <div className="logo-placeholder" />
        </div>

        <div className="global-shell__spinner">
          <Spinner size="large" />
        </div>

        <div className="global-shell__message">
          <p>Loading application...</p>
        </div>
      </div>

      <style>{`
        .global-shell {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: var(--color-background);
          color: var(--color-foreground);
        }

        .global-shell__container {
          text-align: center;
          max-width: 400px;
        }

        .logo-placeholder {
          width: 64px;
          height: 64px;
          margin: 0 auto 2rem;
          background: var(--color-primary);
          border-radius: 8px;
        }

        .global-shell__spinner {
          margin-bottom: 1.5rem;
        }

        .global-shell__message {
          color: var(--color-muted);
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
}

// Simple spinner component
function Spinner({ size = 'medium' }: { size?: 'small' | 'medium' | 'large' }) {
  const sizeMap = { small: '24px', medium: '32px', large: '48px' };
  const dimension = sizeMap[size];

  return (
    <div className="spinner" style={{ width: dimension, height: dimension }}>
      <div className="spinner__circle" />
      <style>{`
        .spinner {
          display: inline-block;
          position: relative;
        }

        .spinner__circle {
          width: 100%;
          height: 100%;
          border: 3px solid var(--color-border);
          border-top-color: var(--color-primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
