/**
 * @module components/layouts/LayoutComposer
 * @category Layouts - Composition
 * @description Advanced layout composition utility for creating complex nested layouts
 * with automatic spacing, responsive behavior, and accessibility features.
 *
 * FEATURES:
 * - Declarative layout composition
 * - Automatic ARIA landmarks
 * - Responsive breakpoint handling
 * - Skip-to-content navigation
 * - Focus management
 * - Print-friendly layouts
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { cn } from '@/lib/cn';
import { useTheme } from '@/contexts/ThemeContext';
import React, { ReactNode, createContext, useContext, useMemo } from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface LayoutSection {
  /** Unique identifier for the section */
  id: string;
  /** Content to render in this section */
  content: ReactNode;
  /** ARIA role for accessibility */
  role?: string;
  /** ARIA label */
  ariaLabel?: string;
  /** CSS class names */
  className?: string;
  /** Flex grow factor */
  flexGrow?: number;
  /** Whether section is scrollable */
  scrollable?: boolean;
  /** Whether to show in print mode */
  printable?: boolean;
}

interface LayoutComposerProps {
  /** Layout sections to compose */
  sections: LayoutSection[];
  /** Layout direction */
  direction?: 'vertical' | 'horizontal';
  /** Gap between sections */
  gap?: 'none' | 'sm' | 'md' | 'lg';
  /** Whether to add skip links */
  enableSkipLinks?: boolean;
  /** Custom container class */
  className?: string;
}

interface LayoutContextValue {
  /** Current layout direction */
  direction: 'vertical' | 'horizontal';
  /** Current theme */
  theme: ReturnType<typeof useTheme>['theme'];
}

// ============================================================================
// CONTEXT
// ============================================================================
const LayoutContext = createContext<LayoutContextValue | null>(null);

export const useLayoutContext = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayoutContext must be used within LayoutComposer');
  }
  return context;
};

// ============================================================================
// UTILITIES
// ============================================================================
const gapClasses = {
  none: 'gap-0',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
};

const directionClasses = {
  vertical: 'flex-col',
  horizontal: 'flex-row',
};

// ============================================================================
// SKIP LINK COMPONENT
// ============================================================================
interface SkipLinkProps {
  targetId: string;
  label: string;
}

const SkipLink = function SkipLink({ targetId, label }: SkipLinkProps) {
  const { theme } = useTheme();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // HYDRATION-SAFE: Only access document in browser
    if (typeof document === 'undefined') return;

    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className={cn(
        "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50",
        "px-4 py-2 rounded-md font-medium transition-colors",
        theme.text.primary,
        "focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      )}
    >
      {label}
    </a>
  );
};

// ============================================================================
// SECTION COMPONENT
// ============================================================================
interface SectionProps {
  section: LayoutSection;
}

const Section = function Section({ section }: SectionProps) {
  const { theme } = useTheme();
  const { id, content, role, ariaLabel, className, flexGrow, scrollable, printable = true } = section;

  return (
    <section
      id={id}
      role={role}
      aria-label={ariaLabel}
      tabIndex={-1} // Make focusable for skip links
      className={cn(
        "outline-none transition-all",
        scrollable && "overflow-y-auto custom-scrollbar",
        !printable && "print:hidden",
        theme.surface.default,
        className
      )}
      style={{
        flexGrow: flexGrow || 1,
      }}
    >
      {content}
    </section>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
/**
 * LayoutComposer enables declarative composition of complex layouts with
 * automatic accessibility features and responsive behavior.
 *
 * @example
 * ```tsx
 * <LayoutComposer
 *   direction="vertical"
 *   gap="md"
 *   enableSkipLinks={true}
 *   sections={[
 *     {
 *       id: 'header',
 *       content: <Header />,
 *       role: 'banner',
 *       ariaLabel: 'Site header',
 *       flexGrow: 0,
 *     },
 *     {
 *       id: 'main',
 *       content: <MainContent />,
 *       role: 'main',
 *       ariaLabel: 'Main content',
 *       scrollable: true,
 *       flexGrow: 1,
 *     },
 *     {
 *       id: 'sidebar',
 *       content: <Sidebar />,
 *       role: 'complementary',
 *       ariaLabel: 'Sidebar navigation',
 *       flexGrow: 0,
 *     },
 *   ]}
 * />
 * ```
 */
export function LayoutComposer({
  sections,
  direction = 'vertical',
  gap = 'md',
  enableSkipLinks = true,
  className,
}: LayoutComposerProps) {
  const { theme } = useTheme();

  const contextValue = useMemo<LayoutContextValue>(
    () => ({ direction, theme }),
    [direction, theme]
  );

  // Generate skip links for main sections
  const skipLinks = useMemo(() => {
    if (!enableSkipLinks) return null;

    const mainSections = sections.filter(s => s.role === 'main' || s.role === 'navigation');
    if (mainSections.length === 0) return null;

    return (
      <div className="sr-only focus-within:not-sr-only">
        {mainSections.map(section => (
          <SkipLink
            key={section.id}
            targetId={section.id}
            label={`Skip to ${section.ariaLabel || section.id}`}
          />
        ))}
      </div>
    );
  }, [enableSkipLinks, sections]);

  return (
    <LayoutContext.Provider value={contextValue}>
      {skipLinks}
      <div
        className={cn(
          "flex h-full w-full",
          directionClasses[direction],
          gapClasses[gap],
          className
        )}
      >
        {sections.map(section => (
          <Section key={section.id} section={section} />
        ))}
      </div>
    </LayoutContext.Provider>
  );
};

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

/**
 * Pre-configured LayoutComposer for standard app layout (header + main + sidebar)
 */
export const AppLayoutComposer: React.FC<{
  header: ReactNode;
  main: ReactNode;
  sidebar?: ReactNode;
}> = ({ header, main, sidebar }) => {
  const sections: LayoutSection[] = [
    {
      id: 'app-header',
      content: header,
      role: 'banner',
      ariaLabel: 'Application header',
      flexGrow: 0,
      printable: false,
    },
    {
      id: 'app-main',
      content: main,
      role: 'main',
      ariaLabel: 'Main application content',
      scrollable: true,
      flexGrow: 1,
    },
  ];

  if (sidebar) {
    sections.push({
      id: 'app-sidebar',
      content: sidebar,
      role: 'complementary',
      ariaLabel: 'Sidebar',
      flexGrow: 0,
      printable: false,
    });
  }

  return (
    <LayoutComposer
      sections={sections}
      direction="vertical"
      gap="none"
      enableSkipLinks={true}
    />
  );
};

/**
 * Pre-configured LayoutComposer for dashboard layout (header + sidebar + main)
 */
export function DashboardLayoutComposer({
  header,
  sidebar,
  main,
}: {
  header: ReactNode;
  sidebar: ReactNode;
  main: ReactNode;
}) {
  return (
    <LayoutComposer
      sections={[
        {
          id: 'dashboard-header',
          content: header,
          role: 'banner',
          flexGrow: 0,
          printable: false,
        },
        {
          id: 'dashboard-container',
          content: (
            <LayoutComposer
              direction="horizontal"
              gap="md"
              enableSkipLinks={false}
              sections={[
                {
                  id: 'dashboard-sidebar',
                  content: sidebar,
                  role: 'navigation',
                  ariaLabel: 'Dashboard navigation',
                  flexGrow: 0,
                  printable: false,
                },
                {
                  id: 'dashboard-main',
                  content: main,
                  role: 'main',
                  ariaLabel: 'Dashboard content',
                  scrollable: true,
                  flexGrow: 1,
                },
              ]}
            />
          ),
          flexGrow: 1,
          scrollable: false,
        },
      ]}
      direction="vertical"
      gap="none"
      enableSkipLinks={true}
    />
  );
};
