import React from 'react';
import { render, screen } from '@testing-library/react';
import { PageHeader } from './PageHeader';

describe('PageHeader', () => {
  describe('Rendering', () => {
    it('renders with required title prop', () => {
      render(<PageHeader title="Page Title" />);
      expect(screen.getByText('Page Title')).toBeInTheDocument();
    });

    it('renders title as h1 heading', () => {
      render(<PageHeader title="Main Title" />);
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Main Title');
    });

    it('renders without crashing with minimal props', () => {
      const { container } = render(<PageHeader title="Minimal" />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Description', () => {
    it('renders description when provided', () => {
      render(
        <PageHeader
          title="Title"
          description="This is a description of the page"
        />
      );
      expect(screen.getByText('This is a description of the page')).toBeInTheDocument();
    });

    it('does not render description element when not provided', () => {
      render(<PageHeader title="Title Only" />);
      // Check that there's no paragraph element for description
      const paragraphs = document.querySelectorAll('p');
      expect(paragraphs).toHaveLength(0);
    });

    it('description has proper styling', () => {
      render(<PageHeader title="Title" description="Styled description" />);
      const description = screen.getByText('Styled description');
      expect(description).toHaveClass('text-lg', 'text-slate-600');
    });
  });

  describe('Actions', () => {
    it('renders actions when provided', () => {
      render(
        <PageHeader
          title="Title"
          actions={<button>Add New</button>}
        />
      );
      expect(screen.getByRole('button', { name: 'Add New' })).toBeInTheDocument();
    });

    it('renders multiple action buttons', () => {
      render(
        <PageHeader
          title="Title"
          actions={
            <>
              <button>Export</button>
              <button>Import</button>
              <button>Create</button>
            </>
          }
        />
      );
      expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Import' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
    });

    it('does not render actions container when not provided', () => {
      const { container } = render(<PageHeader title="No Actions" />);
      const actionsContainer = container.querySelector('.flex.items-center.gap-2');
      expect(actionsContainer).not.toBeInTheDocument();
    });

    it('actions container has proper styling', () => {
      const { container } = render(
        <PageHeader title="Title" actions={<button>Action</button>} />
      );
      const actionsContainer = container.querySelector('.flex.items-center.gap-2');
      expect(actionsContainer).toBeInTheDocument();
    });
  });

  describe('Children', () => {
    it('renders children content', () => {
      render(
        <PageHeader title="Title">
          <div data-testid="child-content">Additional content</div>
        </PageHeader>
      );
      expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });

    it('renders children after header content', () => {
      const { container } = render(
        <PageHeader title="Title" description="Description">
          <div data-testid="children">Children content</div>
        </PageHeader>
      );

      const wrapper = container.firstChild as HTMLElement;
      const children = Array.from(wrapper.children);
      // Children should be last
      expect(children[children.length - 1]).toContainElement(screen.getByTestId('children'));
    });

    it('can render complex children', () => {
      render(
        <PageHeader title="Title">
          <nav>
            <a href="/link1">Link 1</a>
            <a href="/link2">Link 2</a>
          </nav>
        </PageHeader>
      );
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Link 1' })).toBeInTheDocument();
    });
  });

  describe('Custom className', () => {
    it('applies custom className', () => {
      const { container } = render(
        <PageHeader title="Title" className="custom-header" />
      );
      expect(container.firstChild).toHaveClass('custom-header');
    });

    it('merges custom className with default classes', () => {
      const { container } = render(
        <PageHeader title="Title" className="my-custom-class" />
      );
      expect(container.firstChild).toHaveClass('my-custom-class');
      expect(container.firstChild).toHaveClass('mb-8');
    });
  });

  describe('Layout', () => {
    it('title and actions are in flex container', () => {
      const { container } = render(
        <PageHeader title="Title" actions={<button>Action</button>} />
      );
      const flexContainer = container.querySelector('.flex.items-start.justify-between');
      expect(flexContainer).toBeInTheDocument();
    });

    it('has proper spacing', () => {
      const { container } = render(<PageHeader title="Title" />);
      expect(container.firstChild).toHaveClass('mb-8');
    });

    it('title container has flex-1 for proper sizing', () => {
      const { container } = render(<PageHeader title="Title" />);
      const titleContainer = container.querySelector('.flex-1');
      expect(titleContainer).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('title has correct font styling', () => {
      render(<PageHeader title="Styled Title" />);
      const title = screen.getByRole('heading', { level: 1 });
      expect(title).toHaveClass('text-3xl', 'font-bold');
    });

    it('title has bottom margin when description present', () => {
      render(<PageHeader title="Title" description="Description" />);
      const title = screen.getByRole('heading', { level: 1 });
      expect(title).toHaveClass('mb-2');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty string title', () => {
      render(<PageHeader title="" />);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('');
    });

    it('handles very long title', () => {
      const longTitle = 'A'.repeat(200);
      render(<PageHeader title={longTitle} />);
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('handles special characters in title', () => {
      render(<PageHeader title="Title with <special> & 'characters'" />);
      expect(screen.getByText(/Title with <special> & 'characters'/)).toBeInTheDocument();
    });

    it('handles very long description', () => {
      const longDescription = 'B'.repeat(500);
      render(<PageHeader title="Title" description={longDescription} />);
      expect(screen.getByText(longDescription)).toBeInTheDocument();
    });
  });

  describe('Complete PageHeader', () => {
    it('renders with all props', () => {
      render(
        <PageHeader
          title="Complete Page Header"
          description="This is a complete example with all props"
          actions={
            <>
              <button>Action 1</button>
              <button>Action 2</button>
            </>
          }
          className="custom-class"
        >
          <div data-testid="breadcrumb">Breadcrumb component</div>
        </PageHeader>
      );

      expect(screen.getByRole('heading', { name: 'Complete Page Header' })).toBeInTheDocument();
      expect(screen.getByText(/This is a complete example/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action 1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action 2' })).toBeInTheDocument();
      expect(screen.getByTestId('breadcrumb')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('uses semantic heading element', () => {
      render(<PageHeader title="Accessible Title" />);
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('maintains proper document outline', () => {
      render(
        <PageHeader title="Main Heading">
          <h2>Subheading</h2>
        </PageHeader>
      );
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });

    it('action buttons are accessible', () => {
      render(
        <PageHeader
          title="Title"
          actions={<button aria-label="Add new item">+</button>}
        />
      );
      expect(screen.getByLabelText('Add new item')).toBeInTheDocument();
    });
  });
});
