/**
 * @fileoverview Enterprise-grade test suite for Step1TemplateSelection component
 * @module features/document-assembly/__tests__/Step1TemplateSelection.test
 *
 * Tests cover:
 * - Template grid rendering
 * - Template selection callbacks
 * - Loading state handling
 * - Query/caching behavior
 * - Accessibility compliance
 * - Theme integration
 */

import React from 'react';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Step1TemplateSelection } from '../Step1TemplateSelection';

// ============================================================================
// MOCK SETUP
// ============================================================================

// Mock theme context
const mockTheme = {
  text: {
    primary: 'text-gray-900',
    secondary: 'text-gray-600',
    tertiary: 'text-gray-500',
  },
  border: { default: 'border-gray-200' },
  surface: { raised: 'bg-white' },
};

jest.mock('@/providers', () => ({
  useTheme: () => ({ theme: mockTheme }),
}));

// Mock cn utility
jest.mock('@/utils/cn', () => ({
  cn: (...classes: (string | boolean | undefined)[]) =>
    classes.filter((c) => typeof c === 'string').join(' '),
}));

// Mock query hooks
let mockQueryData: any = null;
let mockIsLoading = false;

jest.mock('@/hooks/useQueryHooks', () => ({
  useQuery: (queryKey: any, queryFn: () => Promise<any>, options?: any) => {
    return {
      data: mockQueryData,
      isLoading: mockIsLoading,
      error: null,
    };
  },
}));

jest.mock('@/utils/queryKeys', () => ({
  queryKeys: {
    documents: {
      templates: () => ['documents', 'templates'],
    },
  },
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  FileText: () => <span data-testid="icon-file-text" />,
  Mail: () => <span data-testid="icon-mail" />,
  FileSignature: () => <span data-testid="icon-file-signature" />,
  Scale: () => <span data-testid="icon-scale" />,
  Building2: () => <span data-testid="icon-building" />,
  Users: () => <span data-testid="icon-users" />,
  BookOpen: () => <span data-testid="icon-book-open" />,
  Gavel: () => <span data-testid="icon-gavel" />,
  Loader2: ({ className }: { className?: string }) => (
    <span data-testid="loader" className={className} />
  ),
}));

// ============================================================================
// TEST FIXTURES
// ============================================================================

const defaultTemplates = [
  {
    name: 'Motion to Dismiss',
    description: 'Standard motion to dismiss with legal grounds and supporting arguments',
    icon: () => <span />,
    category: 'Motions',
  },
  {
    name: 'Discovery Request',
    description: 'Interrogatories, requests for production, or requests for admission',
    icon: () => <span />,
    category: 'Discovery',
  },
  {
    name: 'Demand Letter',
    description: 'Formal demand letter outlining claims and settlement demands',
    icon: () => <span />,
    category: 'Correspondence',
  },
];

// ============================================================================
// TEST HELPERS
// ============================================================================

const resetMocks = () => {
  mockQueryData = defaultTemplates;
  mockIsLoading = false;
};

const setLoading = (loading: boolean) => {
  mockIsLoading = loading;
};

const setTemplates = (templates: any[] | null) => {
  mockQueryData = templates;
};

// ============================================================================
// TEST SUITES
// ============================================================================

describe('Step1TemplateSelection Component', () => {
  beforeEach(() => {
    resetMocks();
  });

  // ==========================================================================
  // RENDERING TESTS
  // ==========================================================================

  describe('Rendering', () => {
    it('should render the component', () => {
      render(<Step1TemplateSelection onSelectTemplate={jest.fn()} />);

      expect(
        screen.getByText('Select Document Template')
      ).toBeInTheDocument();
    });

    it('should render section description', () => {
      render(<Step1TemplateSelection onSelectTemplate={jest.fn()} />);

      expect(
        screen.getByText(/choose a template to start generating/i)
      ).toBeInTheDocument();
    });

    it('should render tip section', () => {
      render(<Step1TemplateSelection onSelectTemplate={jest.fn()} />);

      expect(screen.getByText(/tip:/i)).toBeInTheDocument();
    });

    it('should render all templates', () => {
      render(<Step1TemplateSelection onSelectTemplate={jest.fn()} />);

      expect(screen.getByText('Motion to Dismiss')).toBeInTheDocument();
      expect(screen.getByText('Discovery Request')).toBeInTheDocument();
      expect(screen.getByText('Demand Letter')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // LOADING STATE TESTS
  // ==========================================================================

  describe('Loading State', () => {
    it('should show loading indicator when loading', () => {
      setLoading(true);

      render(<Step1TemplateSelection onSelectTemplate={jest.fn()} />);

      expect(screen.getByTestId('loader')).toBeInTheDocument();
      expect(screen.getByText(/loading templates/i)).toBeInTheDocument();
    });

    it('should have spinning animation on loader', () => {
      setLoading(true);

      render(<Step1TemplateSelection onSelectTemplate={jest.fn()} />);

      const loader = screen.getByTestId('loader');
      expect(loader).toHaveClass('animate-spin');
    });

    it('should not show templates when loading', () => {
      setLoading(true);

      render(<Step1TemplateSelection onSelectTemplate={jest.fn()} />);

      expect(screen.queryByText('Motion to Dismiss')).not.toBeInTheDocument();
    });

    it('should show templates after loading completes', () => {
      setLoading(false);

      render(<Step1TemplateSelection onSelectTemplate={jest.fn()} />);

      expect(screen.getByText('Motion to Dismiss')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // TEMPLATE CARD TESTS
  // ==========================================================================

  describe('Template Cards', () => {
    it('should render template names', () => {
      render(<Step1TemplateSelection onSelectTemplate={jest.fn()} />);

      defaultTemplates.forEach((template) => {
        expect(screen.getByText(template.name)).toBeInTheDocument();
      });
    });

    it('should render template descriptions', () => {
      render(<Step1TemplateSelection onSelectTemplate={jest.fn()} />);

      defaultTemplates.forEach((template) => {
        expect(screen.getByText(template.description)).toBeInTheDocument();
      });
    });

    it('should render template categories', () => {
      render(<Step1TemplateSelection onSelectTemplate={jest.fn()} />);

      expect(screen.getByText('Motions')).toBeInTheDocument();
      expect(screen.getByText('Discovery')).toBeInTheDocument();
      expect(screen.getByText('Correspondence')).toBeInTheDocument();
    });

    it('should render template as buttons', () => {
      render(<Step1TemplateSelection onSelectTemplate={jest.fn()} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(defaultTemplates.length);
    });

    it('should have proper card styling', () => {
      render(<Step1TemplateSelection onSelectTemplate={jest.fn()} />);

      const templateButton = screen.getByText('Motion to Dismiss').closest('button');
      expect(templateButton).toHaveClass('rounded-lg');
      expect(templateButton).toHaveClass('border');
    });
  });

  // ==========================================================================
  // SELECTION CALLBACK TESTS
  // ==========================================================================

  describe('Selection Callback', () => {
    it('should call onSelectTemplate when template is clicked', async () => {
      const onSelectTemplate = jest.fn();
      const user = userEvent.setup();

      render(<Step1TemplateSelection onSelectTemplate={onSelectTemplate} />);

      await user.click(screen.getByText('Motion to Dismiss').closest('button')!);

      expect(onSelectTemplate).toHaveBeenCalledWith('Motion to Dismiss');
    });

    it('should call with correct template name for each template', async () => {
      const onSelectTemplate = jest.fn();
      const user = userEvent.setup();

      render(<Step1TemplateSelection onSelectTemplate={onSelectTemplate} />);

      await user.click(screen.getByText('Discovery Request').closest('button')!);
      expect(onSelectTemplate).toHaveBeenCalledWith('Discovery Request');

      await user.click(screen.getByText('Demand Letter').closest('button')!);
      expect(onSelectTemplate).toHaveBeenCalledWith('Demand Letter');
    });

    it('should only call callback once per click', async () => {
      const onSelectTemplate = jest.fn();
      const user = userEvent.setup();

      render(<Step1TemplateSelection onSelectTemplate={onSelectTemplate} />);

      await user.click(screen.getByText('Motion to Dismiss').closest('button')!);

      expect(onSelectTemplate).toHaveBeenCalledTimes(1);
    });
  });

  // ==========================================================================
  // GRID LAYOUT TESTS
  // ==========================================================================

  describe('Grid Layout', () => {
    it('should use responsive grid layout', () => {
      const { container } = render(
        <Step1TemplateSelection onSelectTemplate={jest.fn()} />
      );

      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('grid-cols-1');
      expect(grid).toHaveClass('md:grid-cols-2');
    });

    it('should have proper gap between cards', () => {
      const { container } = render(
        <Step1TemplateSelection onSelectTemplate={jest.fn()} />
      );

      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('gap-4');
    });
  });

  // ==========================================================================
  // TIP SECTION TESTS
  // ==========================================================================

  describe('Tip Section', () => {
    it('should render tip header', () => {
      render(<Step1TemplateSelection onSelectTemplate={jest.fn()} />);

      expect(screen.getByText(/tip:/i)).toBeInTheDocument();
    });

    it('should render tip content', () => {
      render(<Step1TemplateSelection onSelectTemplate={jest.fn()} />);

      expect(
        screen.getByText(/after selecting a template/i)
      ).toBeInTheDocument();
    });

    it('should have info styling', () => {
      const { container } = render(
        <Step1TemplateSelection onSelectTemplate={jest.fn()} />
      );

      const tipSection = container.querySelector('.bg-blue-50');
      expect(tipSection).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // ACCESSIBILITY TESTS
  // ==========================================================================

  describe('Accessibility', () => {
    it('should have accessible heading', () => {
      render(<Step1TemplateSelection onSelectTemplate={jest.fn()} />);

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Select Document Template');
    });

    it('should have accessible template buttons', () => {
      render(<Step1TemplateSelection onSelectTemplate={jest.fn()} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toBeVisible();
      });
    });

    it('should support keyboard navigation', async () => {
      const onSelectTemplate = jest.fn();
      const user = userEvent.setup();

      render(<Step1TemplateSelection onSelectTemplate={onSelectTemplate} />);

      const firstButton = screen
        .getByText('Motion to Dismiss')
        .closest('button')!;

      firstButton.focus();
      expect(document.activeElement).toBe(firstButton);

      await user.keyboard('{Enter}');
      expect(onSelectTemplate).toHaveBeenCalledWith('Motion to Dismiss');
    });

    it('should have visible focus indicators', () => {
      render(<Step1TemplateSelection onSelectTemplate={jest.fn()} />);

      const button = screen.getByText('Motion to Dismiss').closest('button');
      expect(button).toHaveClass('hover:shadow-md');
    });
  });

  // ==========================================================================
  // ICON TESTS
  // ==========================================================================

  describe('Icons', () => {
    it('should render icons within template cards', () => {
      render(<Step1TemplateSelection onSelectTemplate={jest.fn()} />);

      // Icons are rendered based on template type
      const icons = document.querySelectorAll('[data-testid^="icon-"]');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should have proper icon container styling', () => {
      const { container } = render(
        <Step1TemplateSelection onSelectTemplate={jest.fn()} />
      );

      const iconContainers = container.querySelectorAll('.bg-blue-100');
      expect(iconContainers.length).toBeGreaterThan(0);
    });
  });

  // ==========================================================================
  // EMPTY STATE TESTS
  // ==========================================================================

  describe('Empty State', () => {
    it('should handle empty templates array gracefully', () => {
      setTemplates([]);

      render(<Step1TemplateSelection onSelectTemplate={jest.fn()} />);

      // Should still render the container
      expect(
        screen.getByText('Select Document Template')
      ).toBeInTheDocument();
    });

    it('should handle null templates', () => {
      setTemplates(null);

      render(<Step1TemplateSelection onSelectTemplate={jest.fn()} />);

      // Should use fallback templates
      expect(screen.getByText('Motion to Dismiss')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // EDGE CASES
  // ==========================================================================

  describe('Edge Cases', () => {
    it('should handle special characters in template names', () => {
      setTemplates([
        {
          name: "O'Brien & Associates Template",
          description: 'Template with special chars',
          icon: () => <span />,
          category: 'Legal',
        },
      ]);

      render(<Step1TemplateSelection onSelectTemplate={jest.fn()} />);

      expect(
        screen.getByText("O'Brien & Associates Template")
      ).toBeInTheDocument();
    });

    it('should handle very long template names', () => {
      const longName =
        'This is a very long template name that might cause layout issues if not handled properly';
      setTemplates([
        {
          name: longName,
          description: 'Description',
          icon: () => <span />,
          category: 'Test',
        },
      ]);

      render(<Step1TemplateSelection onSelectTemplate={jest.fn()} />);

      expect(screen.getByText(longName)).toBeInTheDocument();
    });

    it('should handle rapid clicks on same template', async () => {
      const onSelectTemplate = jest.fn();
      const user = userEvent.setup();

      render(<Step1TemplateSelection onSelectTemplate={onSelectTemplate} />);

      const button = screen.getByText('Motion to Dismiss').closest('button')!;

      await user.click(button);
      await user.click(button);
      await user.click(button);

      // Each click should trigger callback
      expect(onSelectTemplate).toHaveBeenCalledTimes(3);
    });

    it('should handle unicode characters in template content', () => {
      setTemplates([
        {
          name: '法律文件模板',
          description: 'テンプレートの説明',
          icon: () => <span />,
          category: '法律',
        },
      ]);

      render(<Step1TemplateSelection onSelectTemplate={jest.fn()} />);

      expect(screen.getByText('法律文件模板')).toBeInTheDocument();
      expect(screen.getByText('テンプレートの説明')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // SNAPSHOT TESTS
  // ==========================================================================

  describe('Snapshots', () => {
    it('should match snapshot for default state', () => {
      const { container } = render(
        <Step1TemplateSelection onSelectTemplate={jest.fn()} />
      );
      expect(container).toMatchSnapshot();
    });

    it('should match snapshot for loading state', () => {
      setLoading(true);
      const { container } = render(
        <Step1TemplateSelection onSelectTemplate={jest.fn()} />
      );
      expect(container).toMatchSnapshot();
    });
  });
});
