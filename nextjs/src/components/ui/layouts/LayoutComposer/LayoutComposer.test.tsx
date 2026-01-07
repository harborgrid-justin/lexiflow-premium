import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LayoutComposer, AppLayoutComposer, DashboardLayoutComposer, useLayoutContext } from './LayoutComposer';

// Mock providers
jest.mock('@/providers', () => ({
  useTheme: () => ({
    theme: {
      surface: { default: 'bg-white' },
      text: { primary: 'text-slate-900' },
    },
  }),
}));

// Mock cn utility
jest.mock('@/utils/cn', () => ({
  cn: (...classes: (string | undefined | false)[]) => classes.filter(Boolean).join(' '),
}));

describe('LayoutComposer', () => {
  const defaultSections = [
    { id: 'header', content: <div data-testid="header">Header</div> },
    { id: 'main', content: <div data-testid="main">Main Content</div> },
    { id: 'footer', content: <div data-testid="footer">Footer</div> },
  ];

  describe('Rendering', () => {
    it('renders all sections', () => {
      render(<LayoutComposer sections={defaultSections} />);
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('main')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('renders sections in order', () => {
      const { container } = render(<LayoutComposer sections={defaultSections} />);
      const flexContainer = container.querySelector('.flex');
      const sections = flexContainer?.querySelectorAll('section');
      expect(sections?.[0]).toContainElement(screen.getByTestId('header'));
      expect(sections?.[1]).toContainElement(screen.getByTestId('main'));
      expect(sections?.[2]).toContainElement(screen.getByTestId('footer'));
    });

    it('renders section with correct id attribute', () => {
      render(<LayoutComposer sections={defaultSections} />);
      expect(document.getElementById('header')).toBeInTheDocument();
      expect(document.getElementById('main')).toBeInTheDocument();
      expect(document.getElementById('footer')).toBeInTheDocument();
    });
  });

  describe('Direction', () => {
    it('uses vertical direction by default', () => {
      const { container } = render(<LayoutComposer sections={defaultSections} />);
      const flexContainer = container.querySelector('.flex');
      expect(flexContainer).toHaveClass('flex-col');
    });

    it('applies horizontal direction', () => {
      const { container } = render(
        <LayoutComposer sections={defaultSections} direction="horizontal" />
      );
      const flexContainer = container.querySelector('.flex');
      expect(flexContainer).toHaveClass('flex-row');
    });
  });

  describe('Gap', () => {
    it('uses medium gap by default', () => {
      const { container } = render(<LayoutComposer sections={defaultSections} />);
      const flexContainer = container.querySelector('.flex');
      expect(flexContainer).toHaveClass('gap-4');
    });

    it('applies no gap', () => {
      const { container } = render(
        <LayoutComposer sections={defaultSections} gap="none" />
      );
      expect(container.querySelector('.gap-0')).toBeInTheDocument();
    });

    it('applies small gap', () => {
      const { container } = render(
        <LayoutComposer sections={defaultSections} gap="sm" />
      );
      expect(container.querySelector('.gap-2')).toBeInTheDocument();
    });

    it('applies large gap', () => {
      const { container } = render(
        <LayoutComposer sections={defaultSections} gap="lg" />
      );
      expect(container.querySelector('.gap-6')).toBeInTheDocument();
    });
  });

  describe('Section Properties', () => {
    it('applies aria role to section', () => {
      const sections = [
        { id: 'nav', content: <div>Nav</div>, role: 'navigation' },
      ];
      render(<LayoutComposer sections={sections} />);
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('applies aria-label to section', () => {
      const sections = [
        { id: 'main', content: <div>Main</div>, role: 'main', ariaLabel: 'Main content' },
      ];
      render(<LayoutComposer sections={sections} />);
      expect(screen.getByLabelText('Main content')).toBeInTheDocument();
    });

    it('applies custom className to section', () => {
      const sections = [
        { id: 'custom', content: <div>Custom</div>, className: 'custom-section' },
      ];
      render(<LayoutComposer sections={sections} />);
      expect(document.getElementById('custom')).toHaveClass('custom-section');
    });

    it('applies flexGrow to section', () => {
      const sections = [
        { id: 'grow', content: <div>Grow</div>, flexGrow: 2 },
      ];
      const { container } = render(<LayoutComposer sections={sections} />);
      const section = document.getElementById('grow');
      expect(section?.style.flexGrow).toBe('2');
    });

    it('applies scrollable class to section', () => {
      const sections = [
        { id: 'scroll', content: <div>Scroll</div>, scrollable: true },
      ];
      render(<LayoutComposer sections={sections} />);
      expect(document.getElementById('scroll')).toHaveClass('overflow-y-auto');
    });

    it('applies print:hidden for non-printable sections', () => {
      const sections = [
        { id: 'no-print', content: <div>No Print</div>, printable: false },
      ];
      render(<LayoutComposer sections={sections} />);
      expect(document.getElementById('no-print')).toHaveClass('print:hidden');
    });
  });

  describe('Skip Links', () => {
    it('renders skip links by default for main sections', () => {
      const sections = [
        { id: 'nav', content: <div>Nav</div>, role: 'navigation', ariaLabel: 'Site navigation' },
        { id: 'main', content: <div>Main</div>, role: 'main', ariaLabel: 'Main content' },
      ];
      render(<LayoutComposer sections={sections} enableSkipLinks={true} />);
      // Skip links should be present but visually hidden
      const skipLinksContainer = document.querySelector('.sr-only.focus-within\\:not-sr-only');
      expect(skipLinksContainer).toBeInTheDocument();
    });

    it('does not render skip links when disabled', () => {
      const sections = [
        { id: 'main', content: <div>Main</div>, role: 'main' },
      ];
      render(<LayoutComposer sections={sections} enableSkipLinks={false} />);
      const skipLinksContainer = document.querySelector('.sr-only.focus-within\\:not-sr-only');
      expect(skipLinksContainer).not.toBeInTheDocument();
    });
  });

  describe('Custom className', () => {
    it('applies custom className to container', () => {
      const { container } = render(
        <LayoutComposer sections={defaultSections} className="custom-layout" />
      );
      expect(container.querySelector('.custom-layout')).toBeInTheDocument();
    });
  });

  describe('Context', () => {
    it('provides layout context to children', () => {
      const ContextConsumer = () => {
        const { direction } = useLayoutContext();
        return <div data-testid="direction">{direction}</div>;
      };

      const sections = [
        { id: 'test', content: <ContextConsumer /> },
      ];

      render(<LayoutComposer sections={sections} direction="horizontal" />);
      expect(screen.getByTestId('direction')).toHaveTextContent('horizontal');
    });

    it('throws error when useLayoutContext used outside provider', () => {
      const ContextConsumer = () => {
        useLayoutContext();
        return null;
      };

      // Suppress console error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => render(<ContextConsumer />)).toThrow(
        'useLayoutContext must be used within LayoutComposer'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty sections array', () => {
      const { container } = render(<LayoutComposer sections={[]} />);
      expect(container.querySelector('.flex')).toBeInTheDocument();
    });

    it('handles single section', () => {
      const sections = [{ id: 'single', content: <div data-testid="single">Single</div> }];
      render(<LayoutComposer sections={sections} />);
      expect(screen.getByTestId('single')).toBeInTheDocument();
    });

    it('handles many sections', () => {
      const sections = Array.from({ length: 10 }, (_, i) => ({
        id: `section-${i}`,
        content: <div data-testid={`section-${i}`}>Section {i}</div>,
      }));
      render(<LayoutComposer sections={sections} />);
      expect(screen.getByTestId('section-0')).toBeInTheDocument();
      expect(screen.getByTestId('section-9')).toBeInTheDocument();
    });
  });
});

describe('AppLayoutComposer', () => {
  it('renders header, main, and optional sidebar', () => {
    render(
      <AppLayoutComposer
        header={<div data-testid="app-header">Header</div>}
        main={<div data-testid="app-main">Main</div>}
        sidebar={<div data-testid="app-sidebar">Sidebar</div>}
      />
    );

    expect(screen.getByTestId('app-header')).toBeInTheDocument();
    expect(screen.getByTestId('app-main')).toBeInTheDocument();
    expect(screen.getByTestId('app-sidebar')).toBeInTheDocument();
  });

  it('renders without sidebar', () => {
    render(
      <AppLayoutComposer
        header={<div data-testid="app-header">Header</div>}
        main={<div data-testid="app-main">Main</div>}
      />
    );

    expect(screen.getByTestId('app-header')).toBeInTheDocument();
    expect(screen.getByTestId('app-main')).toBeInTheDocument();
    expect(screen.queryByTestId('app-sidebar')).not.toBeInTheDocument();
  });
});

describe('DashboardLayoutComposer', () => {
  it('renders header, sidebar, and main', () => {
    render(
      <DashboardLayoutComposer
        header={<div data-testid="dash-header">Header</div>}
        sidebar={<div data-testid="dash-sidebar">Sidebar</div>}
        main={<div data-testid="dash-main">Main</div>}
      />
    );

    expect(screen.getByTestId('dash-header')).toBeInTheDocument();
    expect(screen.getByTestId('dash-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('dash-main')).toBeInTheDocument();
  });
});
