/**
 * Announcer.tsx
 * Screen reader announcement component for dynamic content changes
 * Uses ARIA live regions to announce updates to screen reader users
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// ============================================================================
// Types
// ============================================================================

export type AnnouncementPriority = 'polite' | 'assertive' | 'off';

export interface Announcement {
  id: string;
  message: string;
  priority: AnnouncementPriority;
  timestamp: number;
}

interface AnnouncerContextType {
  announce: (message: string, priority?: AnnouncementPriority) => void;
  clear: () => void;
}

// ============================================================================
// Context
// ============================================================================

const AnnouncerContext = createContext<AnnouncerContextType | undefined>(undefined);

// ============================================================================
// AnnouncerProvider Component
// ============================================================================

export interface AnnouncerProviderProps {
  children: ReactNode;
}

export const AnnouncerProvider: React.FC<AnnouncerProviderProps> = ({ children }) => {
  const [politeAnnouncements, setPoliteAnnouncements] = useState<Announcement[]>([]);
  const [assertiveAnnouncements, setAssertiveAnnouncements] = useState<Announcement[]>([]);

  // ============================================================================
  // Announce Function
  // ============================================================================

  const announce = useCallback((message: string, priority: AnnouncementPriority = 'polite') => {
    if (!message || priority === 'off') return;

    const announcement: Announcement = {
      id: `announcement-${Date.now()}-${Math.random()}`,
      message,
      priority,
      timestamp: Date.now(),
    };

    if (priority === 'assertive') {
      setAssertiveAnnouncements(prev => [...prev, announcement]);
      // Clear after a delay
      setTimeout(() => {
        setAssertiveAnnouncements(prev => prev.filter(a => a.id !== announcement.id));
      }, 3000);
    } else {
      setPoliteAnnouncements(prev => [...prev, announcement]);
      // Clear after a delay
      setTimeout(() => {
        setPoliteAnnouncements(prev => prev.filter(a => a.id !== announcement.id));
      }, 3000);
    }
  }, []);

  // ============================================================================
  // Clear Function
  // ============================================================================

  const clear = useCallback(() => {
    setPoliteAnnouncements([]);
    setAssertiveAnnouncements([]);
  }, []);

  const value: AnnouncerContextType = {
    announce,
    clear,
  };

  return (
    <AnnouncerContext.Provider value={value}>
      {children}
      <LiveRegion
        announcements={politeAnnouncements}
        priority="polite"
      />
      <LiveRegion
        announcements={assertiveAnnouncements}
        priority="assertive"
      />
    </AnnouncerContext.Provider>
  );
};

// ============================================================================
// LiveRegion Component
// ============================================================================

interface LiveRegionProps {
  announcements: Announcement[];
  priority: AnnouncementPriority;
}

const LiveRegion: React.FC<LiveRegionProps> = ({ announcements, priority }) => {
  return (
    <div
      role={priority === 'assertive' ? 'alert' : 'status'}
      aria-live={priority}
      aria-atomic="true"
      style={styles.liveRegion}
    >
      {announcements.map(announcement => (
        <div key={announcement.id}>
          {announcement.message}
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// useAnnouncer Hook
// ============================================================================

export function useAnnouncer() {
  const context = useContext(AnnouncerContext);

  if (!context) {
    throw new Error('useAnnouncer must be used within AnnouncerProvider');
  }

  return context;
}

// ============================================================================
// Announcer Component (standalone)
// ============================================================================

export interface AnnouncerProps {
  message?: string;
  priority?: AnnouncementPriority;
  children?: ReactNode;
}

export const Announcer: React.FC<AnnouncerProps> = ({
  message,
  priority = 'polite',
  children,
}) => {
  return (
    <div
      role={priority === 'assertive' ? 'alert' : 'status'}
      aria-live={priority}
      aria-atomic="true"
      style={styles.liveRegion}
    >
      {message || children}
    </div>
  );
};

// ============================================================================
// useAnnounceOnChange Hook
// ============================================================================

export function useAnnounceOnChange(
  value: any,
  getMessage: (value: any) => string,
  priority: AnnouncementPriority = 'polite'
) {
  const { announce } = useAnnouncer();

  React.useEffect(() => {
    const message = getMessage(value);
    if (message) {
      announce(message, priority);
    }
  }, [value, getMessage, priority, announce]);
}

// ============================================================================
// Announcement Presets
// ============================================================================

export const announceSuccess = (message: string) => {
  return `Success: ${message}`;
};

export const announceError = (message: string) => {
  return `Error: ${message}`;
};

export const announceWarning = (message: string) => {
  return `Warning: ${message}`;
};

export const announceInfo = (message: string) => {
  return `Information: ${message}`;
};

export const announceLoading = (message: string = 'Loading') => {
  return `${message}...`;
};

export const announceLoaded = (message: string = 'Content loaded') => {
  return message;
};

// ============================================================================
// useAnnounceStatus Hook (for async operations)
// ============================================================================

export function useAnnounceStatus() {
  const { announce } = useAnnouncer();

  const announceLoading = useCallback(
    (message: string = 'Loading') => {
      announce(`${message}...`, 'polite');
    },
    [announce]
  );

  const announceSuccess = useCallback(
    (message: string) => {
      announce(`Success: ${message}`, 'polite');
    },
    [announce]
  );

  const announceError = useCallback(
    (message: string) => {
      announce(`Error: ${message}`, 'assertive');
    },
    [announce]
  );

  return {
    announceLoading,
    announceSuccess,
    announceError,
  };
}

// ============================================================================
// VisuallyHidden Component (for screen reader only content)
// ============================================================================

export interface VisuallyHiddenProps {
  children: ReactNode;
  as?: keyof JSX.IntrinsicElements;
  focusable?: boolean;
}

export const VisuallyHidden: React.FC<VisuallyHiddenProps> = ({
  children,
  as: Component = 'span',
  focusable = false,
}) => {
  return (
    <Component
      style={focusable ? styles.visuallyHiddenFocusable : styles.visuallyHidden}
    >
      {children}
    </Component>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  liveRegion: {
    position: 'absolute',
    left: '-10000px',
    width: '1px',
    height: '1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
  },
  visuallyHidden: {
    position: 'absolute',
    left: '-10000px',
    width: '1px',
    height: '1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
  },
  visuallyHiddenFocusable: {
    position: 'absolute',
    left: '-10000px',
    width: '1px',
    height: '1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
  },
};

// Add focus styles for focusable visually hidden elements
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .visually-hidden-focusable:focus {
      position: static;
      width: auto;
      height: auto;
      overflow: visible;
      clip: auto;
      white-space: normal;
    }
  `;
  document.head.appendChild(style);
}

export default Announcer;
