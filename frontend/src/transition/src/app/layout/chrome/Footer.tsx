/**
 * Footer - Bottom chrome
 */

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__content">
        <p className="footer__copyright">
          © {new Date().getFullYear()} LexiFlow. All rights reserved.
        </p>

        <nav className="footer__nav">
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="/support">Support</a>
        </nav>
      </div>

      <style>{`
        .footer {
          border-top: 1px solid var(--color-border);
          background: var(--color-surface);
          padding: 1.5rem 2rem;
          margin-top: auto;
        }

        .footer__content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .footer__copyright {
          margin: 0;
          font-size: 0.875rem;
          color: var(--color-muted);
        }

        .footer__nav {
          display: flex;
          gap: 1.5rem;
        }

        .footer__nav a {
          text-decoration: none;
          color: var(--color-foreground);
          font-size: 0.875rem;
        }
      `}</style>
    </footer>
  );
}
