/**
 * SkipLinks.tsx
 * Skip navigation links for keyboard and screen reader users
 * Allows users to bypass repetitive navigation and jump to main content
 */

import React from 'react';

// ============================================================================
// Types
// ============================================================================

export interface SkipLink {
  id: string;
  label: string;
  target: string;
}

export interface SkipLinksProps {
  links?: SkipLink[];
  className?: string;
}

// ============================================================================
// Default Skip Links
// ============================================================================

const defaultLinks: SkipLink[] = [
  {
    id: 'skip-to-main',
    label: 'Skip to main content',
    target: '#main-content',
  },
  {
    id: 'skip-to-nav',
    label: 'Skip to navigation',
    target: '#main-navigation',
  },
  {
    id: 'skip-to-search',
    label: 'Skip to search',
    target: '#search',
  },
  {
    id: 'skip-to-footer',
    label: 'Skip to footer',
    target: '#footer',
  },
];

// ============================================================================
// SkipLinks Component
// ============================================================================

export const SkipLinks: React.FC<SkipLinksProps> = ({
  links = defaultLinks,
  className = '',
}) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    e.preventDefault();

    const element = document.querySelector(target);
    if (element) {
      // Focus the target element
      if (element instanceof HTMLElement) {
        element.focus();
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      // Update URL hash without scrolling
      window.history.pushState(null, '', target);
    }
  };

  return (
    <nav aria-label="Skip links" className={className} style={styles.container}>
      <ul style={styles.list}>
        {links.map(link => (
          <li key={link.id} style={styles.item}>
            <a
              href={link.target}
              onClick={e => handleClick(e, link.target)}
              style={styles.link}
              className="skip-link"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

// ============================================================================
// MainContent Component (with skip link target)
// ============================================================================

export interface MainContentProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
}

export const MainContent: React.FC<MainContentProps> = ({
  children,
  id = 'main-content',
  className = '',
}) => {
  return (
    <main
      id={id}
      tabIndex={-1}
      className={className}
      style={styles.mainContent}
    >
      {children}
    </main>
  );
};

// ============================================================================
// SkipTarget Component (custom skip link target)
// ============================================================================

export interface SkipTargetProps {
  id: string;
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
}

export const SkipTarget: React.FC<SkipTargetProps> = ({
  id,
  children,
  as: Component = 'div',
  className = '',
}) => {
  return (
    <Component
      id={id}
      tabIndex={-1}
      className={className}
      style={styles.skipTarget}
    >
      {children}
    </Component>
  );
};

// ============================================================================
// useSkipLink Hook
// ============================================================================

export function useSkipLink(targetId: string) {
  const scrollToTarget = React.useCallback(() => {
    const element = document.getElementById(targetId);
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [targetId]);

  return { scrollToTarget };
}

// ============================================================================
// Styles
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'absolute',
    top: '-1000px',
    left: 0,
    zIndex: 9999,
  },
  list: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },
  item: {
    margin: 0,
  },
  link: {
    position: 'absolute',
    left: '-10000px',
    top: 'auto',
    width: '1px',
    height: '1px',
    overflow: 'hidden',
    padding: '12px 24px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600',
    borderRadius: '4px',
    transition: 'all 0.2s',
    zIndex: 10000,
  },
  mainContent: {
    outline: 'none',
  },
  skipTarget: {
    outline: 'none',
  },
};

// Add focus styles via CSS
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .skip-link:focus {
      position: static !important;
      left: auto !important;
      width: auto !important;
      height: auto !important;
      overflow: visible !important;
      clip: auto !important;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .skip-link:focus-visible {
      outline: 2px solid #3b82f6;
      outline-offset: 2px;
    }
  `;
  document.head.appendChild(style);
}

export default SkipLinks;
