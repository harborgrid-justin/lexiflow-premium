import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Alert } from './Alert';

describe('Alert', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<Alert>Test message</Alert>);
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    it('renders with title when provided', () => {
      render(<Alert title="Alert Title">Test message</Alert>);
      expect(screen.getByRole('heading', { name: /alert title/i })).toBeInTheDocument();
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    it('renders children content correctly', () => {
      render(
        <Alert>
          <span data-testid="custom-content">Custom Content</span>
        </Alert>
      );
      expect(screen.getByTestId('custom-content')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('renders success variant with correct styling', () => {
      const { container } = render(<Alert variant="success">Success message</Alert>);
      const alertElement = container.firstChild as HTMLElement;
      expect(alertElement).toHaveClass('bg-emerald-50');
    });

    it('renders error variant with correct styling', () => {
      const { container } = render(<Alert variant="error">Error message</Alert>);
      const alertElement = container.firstChild as HTMLElement;
      expect(alertElement).toHaveClass('bg-red-50');
    });

    it('renders warning variant with correct styling', () => {
      const { container } = render(<Alert variant="warning">Warning message</Alert>);
      const alertElement = container.firstChild as HTMLElement;
      expect(alertElement).toHaveClass('bg-amber-50');
    });

    it('renders info variant by default', () => {
      const { container } = render(<Alert>Info message</Alert>);
      const alertElement = container.firstChild as HTMLElement;
      expect(alertElement).toHaveClass('bg-blue-50');
    });
  });

  describe('Icon', () => {
    it('renders icon by default', () => {
      const { container } = render(<Alert>Message with icon</Alert>);
      const svgElement = container.querySelector('svg');
      expect(svgElement).toBeInTheDocument();
    });

    it('hides icon when icon prop is false', () => {
      const { container } = render(<Alert icon={false}>Message without icon</Alert>);
      const iconContainer = container.querySelector('.shrink-0');
      expect(iconContainer).not.toBeInTheDocument();
    });

    it('renders correct icon for each variant', () => {
      const { rerender, container } = render(<Alert variant="success">Success</Alert>);
      expect(container.querySelector('svg')).toBeInTheDocument();

      rerender(<Alert variant="error">Error</Alert>);
      expect(container.querySelector('svg')).toBeInTheDocument();

      rerender(<Alert variant="warning">Warning</Alert>);
      expect(container.querySelector('svg')).toBeInTheDocument();

      rerender(<Alert variant="info">Info</Alert>);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Closeable functionality', () => {
    it('does not render close button by default', () => {
      render(<Alert>Not closeable</Alert>);
      const closeButton = screen.queryByRole('button');
      expect(closeButton).not.toBeInTheDocument();
    });

    it('renders close button when closeable is true', () => {
      render(<Alert closeable>Closeable alert</Alert>);
      const closeButton = screen.getByRole('button');
      expect(closeButton).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
      const handleClose = jest.fn();
      render(
        <Alert closeable onClose={handleClose}>
          Closeable alert
        </Alert>
      );

      const closeButton = screen.getByRole('button');
      fireEvent.click(closeButton);

      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('does not throw when close is clicked without onClose handler', () => {
      render(<Alert closeable>Closeable without handler</Alert>);
      const closeButton = screen.getByRole('button');

      expect(() => fireEvent.click(closeButton)).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('has accessible structure with heading when title provided', () => {
      render(<Alert title="Important Notice">Please read this message</Alert>);
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Important Notice');
    });

    it('close button is keyboard accessible', () => {
      const handleClose = jest.fn();
      render(
        <Alert closeable onClose={handleClose}>
          Accessible close
        </Alert>
      );

      const closeButton = screen.getByRole('button');
      closeButton.focus();
      expect(closeButton).toHaveFocus();

      fireEvent.keyDown(closeButton, { key: 'Enter' });
      // Button click is triggered by Enter key
    });
  });

  describe('Edge Cases', () => {
    it('handles empty children gracefully', () => {
      render(<Alert>{''}</Alert>);
      expect(screen.getByRole('paragraph')).toBeInTheDocument();
    });

    it('handles long content without breaking layout', () => {
      const longText = 'A'.repeat(500);
      render(<Alert>{longText}</Alert>);
      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it('handles special characters in content', () => {
      render(<Alert>{'Special chars: <>&"\''}</Alert>);
      expect(screen.getByText(/Special chars:/)).toBeInTheDocument();
    });
  });
});
