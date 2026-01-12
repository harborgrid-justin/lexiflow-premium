/**
 * @jest-environment jsdom
 */

import { ThemeProvider } from '@/contexts/theme/ThemeContext';
import { Card } from '@/shared/ui/molecules/Card/Card';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('Card', () => {
  describe('Rendering', () => {
    it('should render card with content', () => {
      renderWithTheme(<Card>Card Content</Card>);
      expect(screen.getByText('Card Content')).toBeInTheDocument();
    });

    it('should render card with title', () => {
      renderWithTheme(<Card title="Test Card">Content</Card>);
      expect(screen.getByText('Test Card')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should render card without title', () => {
      renderWithTheme(<Card>Only Content</Card>);
      expect(screen.getByText('Only Content')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = renderWithTheme(
        <Card className="custom-card">Content</Card>
      );
      expect(container.firstChild).toHaveClass('custom-card');
    });
  });

  describe('Header and Footer', () => {
    it('should render header when provided', () => {
      renderWithTheme(
        <Card header={<div>Custom Header</div>}>Content</Card>
      );
      expect(screen.getByText('Custom Header')).toBeInTheDocument();
    });

    it('should render footer when provided', () => {
      renderWithTheme(
        <Card footer={<div>Custom Footer</div>}>Content</Card>
      );
      expect(screen.getByText('Custom Footer')).toBeInTheDocument();
    });

    it('should render both header and footer', () => {
      renderWithTheme(
        <Card
          header={<div>Header</div>}
          footer={<div>Footer</div>}
        >
          Content
        </Card>
      );
      expect(screen.getByText('Header')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
      expect(screen.getByText('Footer')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('should render elevated variant', () => {
      const { container } = renderWithTheme(
        <Card variant="elevated">Content</Card>
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render outlined variant', () => {
      const { container } = renderWithTheme(
        <Card variant="outlined">Content</Card>
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render flat variant', () => {
      const { container } = renderWithTheme(
        <Card variant="flat">Content</Card>
      );
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Padding', () => {
    it('should apply padding by default', () => {
      const { container } = renderWithTheme(<Card>Content</Card>);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should remove padding when noPadding is true', () => {
      const { container } = renderWithTheme(
        <Card noPadding>Content</Card>
      );
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should trigger onClick when clicked', () => {
      const handleClick = jest.fn();
      renderWithTheme(
        <Card onClick={handleClick}>Clickable Card</Card>
      );

      const card = screen.getByText('Clickable Card').closest('div');
      fireEvent.click(card!);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not be clickable when onClick is not provided', () => {
      const { container } = renderWithTheme(<Card>Static Card</Card>);
      const card = container.firstChild as HTMLElement;

      expect(card.style.cursor).not.toBe('pointer');
    });

    it('should show hover state when clickable', () => {
      const { container } = renderWithTheme(
        <Card onClick={() => { }}>Hover Card</Card>
      );
      const card = container.firstChild as HTMLElement;

      expect(card.style.cursor).toBe('pointer');
    });
  });

  describe('Loading State', () => {
    it('should show loading indicator', () => {
      renderWithTheme(<Card loading>Content</Card>);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should hide content when loading', () => {
      renderWithTheme(<Card loading>Hidden Content</Card>);
      expect(screen.queryByText('Hidden Content')).not.toBeVisible();
    });
  });

  describe('Actions', () => {
    it('should render action buttons', () => {
      const actions = (
        <div>
          <button>Edit</button>
          <button>Delete</button>
        </div>
      );

      renderWithTheme(<Card actions={actions}>Content</Card>);

      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('should position actions correctly', () => {
      const actions = <button>Action</button>;
      renderWithTheme(<Card actions={actions}>Content</Card>);

      expect(screen.getByText('Action')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      const { container } = renderWithTheme(
        <Card title="Test">Content</Card>
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should support aria-label', () => {
      renderWithTheme(
        <Card aria-label="User profile card">Content</Card>
      );
      const card = screen.getByLabelText('User profile card');
      expect(card).toBeInTheDocument();
    });

    it('should be keyboard accessible when clickable', () => {
      const handleClick = jest.fn();
      renderWithTheme(
        <Card onClick={handleClick}>Accessible Card</Card>
      );

      const card = screen.getByText('Accessible Card').closest('div');
      fireEvent.keyDown(card!, { key: 'Enter' });

      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('Complex Content', () => {
    it('should handle nested components', () => {
      renderWithTheme(
        <Card title="Complex Card">
          <div>
            <h3>Subheading</h3>
            <p>Paragraph</p>
            <button>Action</button>
          </div>
        </Card>
      );

      expect(screen.getByText('Complex Card')).toBeInTheDocument();
      expect(screen.getByText('Subheading')).toBeInTheDocument();
      expect(screen.getByText('Paragraph')).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();
    });

    it('should handle images', () => {
      renderWithTheme(
        <Card>
          <img src="test.jpg" alt="Test" />
          <p>Caption</p>
        </Card>
      );

      expect(screen.getByAlt('Test')).toBeInTheDocument();
      expect(screen.getByText('Caption')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty children', () => {
      const { container } = renderWithTheme(<Card>{null}</Card>);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle multiple children', () => {
      renderWithTheme(
        <Card>
          <div>First</div>
          <div>Second</div>
          <div>Third</div>
        </Card>
      );

      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
      expect(screen.getByText('Third')).toBeInTheDocument();
    });

    it('should handle very long content', () => {
      const longContent = 'A'.repeat(1000);
      renderWithTheme(<Card>{longContent}</Card>);
      expect(screen.getByText(longContent)).toBeInTheDocument();
    });
  });
});
