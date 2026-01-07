import React from 'react';
import { render, screen } from '@testing-library/react';
import { ManagerLayout } from './ManagerLayout';

// Mock providers
jest.mock('@/providers', () => ({
  useTheme: () => ({
    theme: {
      background: 'bg-white',
      surface: { default: 'bg-white' },
      border: { default: 'border-slate-200' },
    },
  }),
}));

// Mock cn utility
jest.mock('@/utils/cn', () => ({
  cn: (...classes: (string | undefined | false)[]) => classes.filter(Boolean).join(' '),
}));

// Mock PageHeader
jest.mock('@/components/organisms/PageHeader/PageHeader', () => ({
  PageHeader: ({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) => (
    <div data-testid="page-header">
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
      {actions && <div data-testid="header-actions">{actions}</div>}
    </div>
  ),
}));

describe('ManagerLayout', () => {
  const defaultProps = {
    title: 'Manager Title',
    children: <div data-testid="main-content">Main Content</div>,
  };

  describe('Rendering', () => {
    it('renders with required props', () => {
      render(<ManagerLayout {...defaultProps} />);
      expect(screen.getByText('Manager Title')).toBeInTheDocument();
      expect(screen.getByTestId('main-content')).toBeInTheDocument();
    });

    it('renders page header component', () => {
      render(<ManagerLayout {...defaultProps} />);
      expect(screen.getByTestId('page-header')).toBeInTheDocument();
    });

    it('renders title in heading', () => {
      render(<ManagerLayout {...defaultProps} />);
      expect(screen.getByRole('heading', { name: 'Manager Title' })).toBeInTheDocument();
    });
  });

  describe('Subtitle', () => {
    it('renders subtitle when provided', () => {
      render(<ManagerLayout {...defaultProps} subtitle="Manager Subtitle" />);
      expect(screen.getByText('Manager Subtitle')).toBeInTheDocument();
    });

    it('does not render subtitle when not provided', () => {
      render(<ManagerLayout {...defaultProps} />);
      expect(screen.queryByText(/subtitle/i)).not.toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('renders actions when provided', () => {
      render(
        <ManagerLayout {...defaultProps} actions={<button>Add New</button>} />
      );
      expect(screen.getByRole('button', { name: 'Add New' })).toBeInTheDocument();
    });

    it('renders multiple actions', () => {
      render(
        <ManagerLayout
          {...defaultProps}
          actions={
            <>
              <button>Export</button>
              <button>Import</button>
            </>
          }
        />
      );
      expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Import' })).toBeInTheDocument();
    });
  });

  describe('Filter Panel', () => {
    it('renders filter panel when provided', () => {
      render(
        <ManagerLayout
          {...defaultProps}
          filterPanel={<div data-testid="filter-panel">Filters</div>}
        />
      );
      expect(screen.getByTestId('filter-panel')).toBeInTheDocument();
    });

    it('does not render filter panel container when not provided', () => {
      const { container } = render(<ManagerLayout {...defaultProps} />);
      // Filter panel would be wrapped in a div with mb-4
      const filterContainer = container.querySelector('.mb-4');
      expect(filterContainer).not.toBeInTheDocument();
    });
  });

  describe('Sidebar', () => {
    it('renders sidebar when provided', () => {
      render(
        <ManagerLayout
          {...defaultProps}
          sidebar={<div data-testid="sidebar">Sidebar Content</div>}
        />
      );
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });

    it('does not render sidebar when not provided', () => {
      render(<ManagerLayout {...defaultProps} />);
      expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
    });

    it('sidebar is hidden on mobile by default', () => {
      const { container } = render(
        <ManagerLayout
          {...defaultProps}
          sidebar={<div>Sidebar</div>}
        />
      );
      const sidebarContainer = container.querySelector('.hidden.md\\:flex');
      expect(sidebarContainer).toBeInTheDocument();
    });
  });

  describe('Sidebar Width', () => {
    it('uses medium sidebar width by default', () => {
      const { container } = render(
        <ManagerLayout
          {...defaultProps}
          sidebar={<div>Sidebar</div>}
        />
      );
      const sidebarContainer = container.querySelector('.w-64');
      expect(sidebarContainer).toBeInTheDocument();
    });

    it('applies small sidebar width', () => {
      const { container } = render(
        <ManagerLayout
          {...defaultProps}
          sidebar={<div>Sidebar</div>}
          sidebarWidth="sm"
        />
      );
      const sidebarContainer = container.querySelector('.w-56');
      expect(sidebarContainer).toBeInTheDocument();
    });

    it('applies large sidebar width', () => {
      const { container } = render(
        <ManagerLayout
          {...defaultProps}
          sidebar={<div>Sidebar</div>}
          sidebarWidth="lg"
        />
      );
      const sidebarContainer = container.querySelector('.w-80');
      expect(sidebarContainer).toBeInTheDocument();
    });
  });

  describe('Custom className', () => {
    it('applies custom className', () => {
      const { container } = render(
        <ManagerLayout {...defaultProps} className="custom-manager" />
      );
      expect(container.firstChild).toHaveClass('custom-manager');
    });
  });

  describe('Layout Structure', () => {
    it('has full height flex column layout', () => {
      const { container } = render(<ManagerLayout {...defaultProps} />);
      expect(container.firstChild).toHaveClass('h-full', 'flex', 'flex-col');
    });

    it('has fade-in animation', () => {
      const { container } = render(<ManagerLayout {...defaultProps} />);
      expect(container.firstChild).toHaveClass('animate-fade-in');
    });

    it('applies theme background', () => {
      const { container } = render(<ManagerLayout {...defaultProps} />);
      expect(container.firstChild).toHaveClass('bg-white');
    });

    it('main content area is scrollable', () => {
      const { container } = render(<ManagerLayout {...defaultProps} />);
      const scrollableArea = container.querySelector('.overflow-y-auto.custom-scrollbar');
      expect(scrollableArea).toBeInTheDocument();
    });
  });

  describe('Complete ManagerLayout', () => {
    it('renders with all props', () => {
      render(
        <ManagerLayout
          title="Complete Manager"
          subtitle="With all features"
          actions={<button>Action</button>}
          filterPanel={<div data-testid="filters">Filters</div>}
          sidebar={<div data-testid="sidebar">Sidebar</div>}
          sidebarWidth="lg"
          className="complete-layout"
        >
          <div data-testid="content">Content</div>
        </ManagerLayout>
      );

      expect(screen.getByText('Complete Manager')).toBeInTheDocument();
      expect(screen.getByText('With all features')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
      expect(screen.getByTestId('filters')).toBeInTheDocument();
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });
  });

  describe('Use Cases', () => {
    it('works for user management page', () => {
      render(
        <ManagerLayout
          title="User Management"
          subtitle="Manage team members"
          actions={<button>Add User</button>}
          filterPanel={<input placeholder="Search users" />}
        >
          <ul>
            <li>User 1</li>
            <li>User 2</li>
          </ul>
        </ManagerLayout>
      );

      expect(screen.getByText('User Management')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search users')).toBeInTheDocument();
      expect(screen.getByText('User 1')).toBeInTheDocument();
    });

    it('works for document management with sidebar', () => {
      render(
        <ManagerLayout
          title="Documents"
          sidebar={
            <nav>
              <button>All Documents</button>
              <button>Recent</button>
              <button>Shared</button>
            </nav>
          }
        >
          <div>Document list</div>
        </ManagerLayout>
      );

      expect(screen.getByText('Documents')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'All Documents' })).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty title', () => {
      render(<ManagerLayout title="" children={<div>Content</div>} />);
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('handles complex children', () => {
      render(
        <ManagerLayout title="Complex">
          <section>
            <h2>Section 1</h2>
            <p>Paragraph 1</p>
          </section>
          <section>
            <h2>Section 2</h2>
            <p>Paragraph 2</p>
          </section>
        </ManagerLayout>
      );

      expect(screen.getByRole('heading', { name: 'Section 1' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Section 2' })).toBeInTheDocument();
    });
  });
});
