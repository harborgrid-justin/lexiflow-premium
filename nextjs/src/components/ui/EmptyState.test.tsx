import React from 'react';
import { render, screen } from '@testing-library/react';
import { EmptyState } from './EmptyState';
import { Inbox, FileText } from 'lucide-react';

describe('EmptyState', () => {
  describe('Rendering', () => {
    it('renders with required title prop', () => {
      render(<EmptyState title="No items found" />);
      expect(screen.getByText('No items found')).toBeInTheDocument();
    });

    it('renders title as heading', () => {
      render(<EmptyState title="Empty Title" />);
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Empty Title');
    });

    it('centers content vertically and horizontally', () => {
      const { container } = render(<EmptyState title="Centered" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center');
    });
  });

  describe('Description', () => {
    it('renders description when provided', () => {
      render(
        <EmptyState
          title="No Data"
          description="Start by adding some items to your collection"
        />
      );
      expect(screen.getByText('Start by adding some items to your collection')).toBeInTheDocument();
    });

    it('does not render description when not provided', () => {
      render(<EmptyState title="Title Only" />);
      const paragraphs = document.querySelectorAll('p');
      // Only the h3's implicit paragraph-like container, not a description p
      expect(paragraphs).toHaveLength(0);
    });

    it('description is wrapped in paragraph with proper styling', () => {
      render(
        <EmptyState
          title="Title"
          description="Description text"
        />
      );
      const description = screen.getByText('Description text');
      expect(description.tagName).toBe('P');
      expect(description).toHaveClass('text-center');
    });
  });

  describe('Icon', () => {
    it('renders icon when provided', () => {
      render(
        <EmptyState
          title="No Messages"
          icon={<Inbox data-testid="inbox-icon" />}
        />
      );
      expect(screen.getByTestId('inbox-icon')).toBeInTheDocument();
    });

    it('does not render icon container when icon not provided', () => {
      const { container } = render(<EmptyState title="No Icon" />);
      const iconContainer = container.querySelector('.mb-4');
      expect(iconContainer).not.toBeInTheDocument();
    });

    it('applies correct styling to icon container', () => {
      const { container } = render(
        <EmptyState
          title="With Icon"
          icon={<FileText data-testid="file-icon" />}
        />
      );
      const iconContainer = container.querySelector('.text-slate-400');
      expect(iconContainer).toBeInTheDocument();
    });
  });

  describe('Action', () => {
    it('renders action when provided', () => {
      render(
        <EmptyState
          title="No Items"
          action={<button>Add Item</button>}
        />
      );
      expect(screen.getByRole('button', { name: 'Add Item' })).toBeInTheDocument();
    });

    it('does not render action container when action not provided', () => {
      const { container } = render(<EmptyState title="No Action" />);
      const actionContainer = container.querySelector('.mt-4');
      expect(actionContainer).not.toBeInTheDocument();
    });

    it('action container has proper margin', () => {
      const { container } = render(
        <EmptyState
          title="With Action"
          action={<button>Click Me</button>}
        />
      );
      const actionWrapper = screen.getByRole('button').parentElement;
      expect(actionWrapper).toHaveClass('mt-4');
    });

    it('renders complex action elements', () => {
      render(
        <EmptyState
          title="Complex Action"
          action={
            <div>
              <button>Primary Action</button>
              <button>Secondary Action</button>
            </div>
          }
        />
      );
      expect(screen.getByRole('button', { name: 'Primary Action' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Secondary Action' })).toBeInTheDocument();
    });
  });

  describe('Complete EmptyState', () => {
    it('renders with all props', () => {
      render(
        <EmptyState
          icon={<Inbox data-testid="icon" />}
          title="No Messages"
          description="Your inbox is empty. New messages will appear here."
          action={<button>Compose</button>}
        />
      );

      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(screen.getByText('No Messages')).toBeInTheDocument();
      expect(screen.getByText(/Your inbox is empty/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Compose' })).toBeInTheDocument();
    });

    it('maintains visual hierarchy', () => {
      const { container } = render(
        <EmptyState
          icon={<Inbox data-testid="icon" />}
          title="Hierarchy Test"
          description="Description comes after title"
          action={<button>Action</button>}
        />
      );

      const wrapper = container.firstChild as HTMLElement;
      const children = Array.from(wrapper.children);

      // Icon should be first
      expect(children[0]).toContainElement(screen.getByTestId('icon'));
      // Title should be second
      expect(children[1]).toHaveTextContent('Hierarchy Test');
      // Description should be third
      expect(children[2]).toHaveTextContent('Description comes after title');
      // Action should be last
      expect(children[3]).toContainElement(screen.getByRole('button'));
    });
  });

  describe('Styling', () => {
    it('has proper padding', () => {
      const { container } = render(<EmptyState title="Padded" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('py-12', 'px-4');
    });

    it('description has max-width for readability', () => {
      render(
        <EmptyState
          title="Title"
          description="Long description text"
        />
      );
      const description = screen.getByText('Long description text');
      expect(description).toHaveClass('max-w-md');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty string title', () => {
      render(<EmptyState title="" />);
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('');
    });

    it('handles very long title', () => {
      const longTitle = 'A'.repeat(100);
      render(<EmptyState title={longTitle} />);
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('handles very long description', () => {
      const longDescription = 'B'.repeat(500);
      render(<EmptyState title="Title" description={longDescription} />);
      expect(screen.getByText(longDescription)).toBeInTheDocument();
    });

    it('handles special characters in content', () => {
      render(
        <EmptyState
          title="<No Items>"
          description="You have 0 items & no data available"
        />
      );
      expect(screen.getByText('<No Items>')).toBeInTheDocument();
      expect(screen.getByText(/0 items & no data/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('title is a proper heading', () => {
      render(<EmptyState title="Accessible Title" />);
      expect(screen.getByRole('heading')).toHaveTextContent('Accessible Title');
    });

    it('action buttons are focusable', () => {
      render(
        <EmptyState
          title="Focus Test"
          action={<button>Focus Me</button>}
        />
      );
      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });
  });
});
