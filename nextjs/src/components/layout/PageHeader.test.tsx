/**
 * @fileoverview Enterprise-grade tests for PageHeader component
 * @module components/layout/PageHeader.test
 *
 * Tests title, description, breadcrumbs, and action slots rendering.
 */

import { render, screen } from '@testing-library/react';
import { PageHeader } from './PageHeader';
import { BreadcrumbItem } from './Breadcrumb';

// ============================================================================
// TEST DATA FIXTURES
// ============================================================================

const mockBreadcrumbs: BreadcrumbItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Cases', href: '/cases' },
  { label: 'Smith v. Jones' },
];

// ============================================================================
// BASIC RENDERING TESTS
// ============================================================================

describe('PageHeader', () => {
  describe('Basic Rendering', () => {
    it('renders title', () => {
      render(<PageHeader title="Page Title" />);
      expect(screen.getByRole('heading', { name: 'Page Title' })).toBeInTheDocument();
    });

    it('renders title with correct level', () => {
      render(<PageHeader title="Test Title" />);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Test Title');
    });

    it('renders without description when not provided', () => {
      render(<PageHeader title="Title Only" />);
      expect(screen.queryByText(/description/i)).not.toBeInTheDocument();
    });

    it('renders without breadcrumbs when not provided', () => {
      render(<PageHeader title="Title Only" />);
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // DESCRIPTION TESTS
  // ============================================================================

  describe('Description', () => {
    it('renders description when provided', () => {
      render(
        <PageHeader
          title="Test Title"
          description="This is a page description"
        />
      );
      expect(screen.getByText('This is a page description')).toBeInTheDocument();
    });

    it('description is inside paragraph element', () => {
      render(
        <PageHeader
          title="Test Title"
          description="Description text"
        />
      );
      const description = screen.getByText('Description text');
      expect(description.tagName).toBe('P');
    });

    it('applies correct styling to description', () => {
      render(
        <PageHeader
          title="Test Title"
          description="Description text"
        />
      );
      const description = screen.getByText('Description text');
      expect(description).toHaveClass('mt-2', 'text-slate-600');
    });
  });

  // ============================================================================
  // BREADCRUMBS TESTS
  // ============================================================================

  describe('Breadcrumbs', () => {
    it('renders breadcrumbs when provided', () => {
      render(
        <PageHeader
          title="Test Title"
          breadcrumbs={mockBreadcrumbs}
        />
      );
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('renders all breadcrumb items', () => {
      render(
        <PageHeader
          title="Test Title"
          breadcrumbs={mockBreadcrumbs}
        />
      );
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Cases')).toBeInTheDocument();
      expect(screen.getByText('Smith v. Jones')).toBeInTheDocument();
    });

    it('renders breadcrumb links', () => {
      render(
        <PageHeader
          title="Test Title"
          breadcrumbs={mockBreadcrumbs}
        />
      );
      expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
      expect(screen.getByRole('link', { name: 'Cases' })).toHaveAttribute('href', '/cases');
    });

    it('breadcrumbs container has margin bottom', () => {
      render(
        <PageHeader
          title="Test Title"
          breadcrumbs={mockBreadcrumbs}
        />
      );
      const breadcrumbContainer = screen.getByRole('navigation').parentElement;
      expect(breadcrumbContainer).toHaveClass('mb-4');
    });

    it('does not render breadcrumbs when empty array provided', () => {
      render(
        <PageHeader
          title="Test Title"
          breadcrumbs={[]}
        />
      );
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // ACTIONS TESTS
  // ============================================================================

  describe('Actions', () => {
    it('renders actions when provided', () => {
      render(
        <PageHeader
          title="Test Title"
          actions={<button>Action Button</button>}
        />
      );
      expect(screen.getByRole('button', { name: 'Action Button' })).toBeInTheDocument();
    });

    it('renders multiple action elements', () => {
      render(
        <PageHeader
          title="Test Title"
          actions={
            <>
              <button>Action 1</button>
              <button>Action 2</button>
            </>
          }
        />
      );
      expect(screen.getByRole('button', { name: 'Action 1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action 2' })).toBeInTheDocument();
    });

    it('actions container has correct styling', () => {
      render(
        <PageHeader
          title="Test Title"
          actions={<button data-testid="action">Action</button>}
        />
      );
      const actionsContainer = screen.getByTestId('action').parentElement;
      expect(actionsContainer).toHaveClass('flex', 'items-center', 'gap-3');
    });

    it('does not render actions container when not provided', () => {
      const { container } = render(<PageHeader title="Title Only" />);
      const actionContainers = container.querySelectorAll('.gap-3');
      expect(actionContainers.length).toBe(0);
    });
  });

  // ============================================================================
  // CHILDREN TESTS
  // ============================================================================

  describe('Children', () => {
    it('renders children content', () => {
      render(
        <PageHeader title="Test Title">
          <div data-testid="child-content">Child Content</div>
        </PageHeader>
      );
      expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });

    it('renders complex children', () => {
      render(
        <PageHeader title="Test Title">
          <div className="tabs">
            <button>Tab 1</button>
            <button>Tab 2</button>
          </div>
        </PageHeader>
      );
      expect(screen.getByRole('button', { name: 'Tab 1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Tab 2' })).toBeInTheDocument();
    });
  });

  // ============================================================================
  // COMPLETE COMPONENT TESTS
  // ============================================================================

  describe('Complete Component', () => {
    it('renders all props together', () => {
      render(
        <PageHeader
          title="Full Test"
          description="Complete description"
          breadcrumbs={mockBreadcrumbs}
          actions={<button>Action</button>}
        >
          <div data-testid="children">Extra content</div>
        </PageHeader>
      );

      expect(screen.getByRole('heading', { name: 'Full Test' })).toBeInTheDocument();
      expect(screen.getByText('Complete description')).toBeInTheDocument();
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
      expect(screen.getByTestId('children')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // STYLING TESTS
  // ============================================================================

  describe('Styling', () => {
    it('container has margin bottom', () => {
      const { container } = render(<PageHeader title="Test" />);
      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('mb-8');
    });

    it('title has correct font styling', () => {
      render(<PageHeader title="Test Title" />);
      const title = screen.getByRole('heading', { name: 'Test Title' });
      expect(title).toHaveClass('text-3xl', 'font-bold');
    });

    it('header content uses flex layout', () => {
      render(
        <PageHeader
          title="Test"
          actions={<button>Action</button>}
        />
      );
      const headerContent = screen.getByRole('heading', { name: 'Test' }).parentElement?.parentElement;
      expect(headerContent).toHaveClass('flex', 'items-start', 'justify-between');
    });

    it('title container is flexible', () => {
      render(<PageHeader title="Test" />);
      const titleContainer = screen.getByRole('heading', { name: 'Test' }).parentElement;
      expect(titleContainer).toHaveClass('flex-1');
    });
  });

  // ============================================================================
  // DARK MODE TESTS
  // ============================================================================

  describe('Dark Mode Support', () => {
    it('applies dark mode classes to title', () => {
      render(<PageHeader title="Test Title" />);
      const title = screen.getByRole('heading', { name: 'Test Title' });
      expect(title).toHaveClass('dark:text-slate-50');
    });

    it('applies dark mode classes to description', () => {
      render(
        <PageHeader
          title="Test"
          description="Description"
        />
      );
      const description = screen.getByText('Description');
      expect(description).toHaveClass('dark:text-slate-400');
    });
  });

  // ============================================================================
  // GAP AND SPACING TESTS
  // ============================================================================

  describe('Gap and Spacing', () => {
    it('header content has gap between title and actions', () => {
      render(
        <PageHeader
          title="Test"
          actions={<button>Action</button>}
        />
      );
      const headerContent = screen.getByRole('heading', { name: 'Test' }).parentElement?.parentElement;
      expect(headerContent).toHaveClass('gap-4');
    });
  });
});
