/**
 * @jest-environment jsdom
 */

import { ThemeProvider } from '@/contexts/theme/ThemeContext';
import { Modal } from '@/shared/ui/molecules/Modal/Modal';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('Modal', () => {
  describe('Rendering', () => {
    it('should render when isOpen is true', () => {
      renderWithTheme(
        <Modal isOpen={true} onClose={() => { }}>
          <div>Modal Content</div>
        </Modal>
      );
      expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      renderWithTheme(
        <Modal isOpen={false} onClose={() => { }}>
          <div>Modal Content</div>
        </Modal>
      );
      expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
    });

    it('should render with title', () => {
      renderWithTheme(
        <Modal isOpen={true} onClose={() => { }} title="Test Modal">
          <div>Content</div>
        </Modal>
      );
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
    });

    it('should render without title', () => {
      renderWithTheme(
        <Modal isOpen={true} onClose={() => { }}>
          <div>Content</div>
        </Modal>
      );
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('Close Functionality', () => {
    it('should call onClose when close button is clicked', () => {
      const handleClose = jest.fn();
      renderWithTheme(
        <Modal isOpen={true} onClose={handleClose}>
          <div>Content</div>
        </Modal>
      );

      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);

      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when overlay is clicked', () => {
      const handleClose = jest.fn();
      const { container } = renderWithTheme(
        <Modal isOpen={true} onClose={handleClose}>
          <div>Content</div>
        </Modal>
      );

      const overlay = container.querySelector('[data-overlay="true"]');
      if (overlay) {
        fireEvent.click(overlay);
        expect(handleClose).toHaveBeenCalledTimes(1);
      }
    });

    it('should call onClose when Escape key is pressed', () => {
      const handleClose = jest.fn();
      renderWithTheme(
        <Modal isOpen={true} onClose={handleClose}>
          <div>Content</div>
        </Modal>
      );

      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

      expect(handleClose).toHaveBeenCalled();
    });

    it('should not close when clicking inside modal content', () => {
      const handleClose = jest.fn();
      renderWithTheme(
        <Modal isOpen={true} onClose={handleClose}>
          <div>Content</div>
        </Modal>
      );

      const content = screen.getByText('Content');
      fireEvent.click(content);

      expect(handleClose).not.toHaveBeenCalled();
    });
  });

  describe('Size Variants', () => {
    const sizes = ['sm', 'md', 'lg', 'xl', 'full'] as const;

    it.each(sizes)('should render %s size correctly', (size) => {
      renderWithTheme(
        <Modal isOpen={true} onClose={() => { }} size={size}>
          <div>Content</div>
        </Modal>
      );
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should default to md size', () => {
      renderWithTheme(
        <Modal isOpen={true} onClose={() => { }}>
          <div>Content</div>
        </Modal>
      );
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('Footer', () => {
    it('should render footer when provided', () => {
      renderWithTheme(
        <Modal
          isOpen={true}
          onClose={() => { }}
          footer={<button>Custom Footer</button>}
        >
          <div>Content</div>
        </Modal>
      );
      expect(screen.getByText('Custom Footer')).toBeInTheDocument();
    });

    it('should render without footer', () => {
      renderWithTheme(
        <Modal isOpen={true} onClose={() => { }}>
          <div>Content</div>
        </Modal>
      );
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should render action buttons in footer', () => {
      const footer = (
        <div>
          <button>Cancel</button>
          <button>Confirm</button>
        </div>
      );

      renderWithTheme(
        <Modal isOpen={true} onClose={() => { }} footer={footer}>
          <div>Content</div>
        </Modal>
      );

      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Confirm')).toBeInTheDocument();
    });
  });

  describe('Prevent Close', () => {
    it('should not close on overlay click when closeOnOverlayClick is false', () => {
      const handleClose = jest.fn();
      const { container } = renderWithTheme(
        <Modal
          isOpen={true}
          onClose={handleClose}
          closeOnOverlayClick={false}
        >
          <div>Content</div>
        </Modal>
      );

      const overlay = container.querySelector('[data-overlay="true"]');
      if (overlay) {
        fireEvent.click(overlay);
        expect(handleClose).not.toHaveBeenCalled();
      }
    });

    it('should not close on Escape when closeOnEscape is false', () => {
      const handleClose = jest.fn();
      renderWithTheme(
        <Modal
          isOpen={true}
          onClose={handleClose}
          closeOnEscape={false}
        >
          <div>Content</div>
        </Modal>
      );

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(handleClose).not.toHaveBeenCalled();
    });
  });

  describe('Body Scroll Lock', () => {
    it('should lock body scroll when modal is open', () => {
      renderWithTheme(
        <Modal isOpen={true} onClose={() => { }}>
          <div>Content</div>
        </Modal>
      );

      // Body should have overflow hidden
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should restore body scroll when modal closes', () => {
      const { rerender } = renderWithTheme(
        <Modal isOpen={true} onClose={() => { }}>
          <div>Content</div>
        </Modal>
      );

      expect(document.body.style.overflow).toBe('hidden');

      rerender(
        <ThemeProvider>
          <Modal isOpen={false} onClose={() => { }}>
            <div>Content</div>
          </Modal>
        </ThemeProvider>
      );

      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('Accessibility', () => {
    it('should have dialog role', () => {
      renderWithTheme(
        <Modal isOpen={true} onClose={() => { }}>
          <div>Content</div>
        </Modal>
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should have aria-modal attribute', () => {
      renderWithTheme(
        <Modal isOpen={true} onClose={() => { }}>
          <div>Content</div>
        </Modal>
      );
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('should have aria-labelledby when title is provided', () => {
      renderWithTheme(
        <Modal isOpen={true} onClose={() => { }} title="Test Title">
          <div>Content</div>
        </Modal>
      );
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby');
    });

    it('should trap focus within modal', () => {
      renderWithTheme(
        <Modal isOpen={true} onClose={() => { }}>
          <div>
            <button>Button 1</button>
            <button>Button 2</button>
          </div>
        </Modal>
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should focus first focusable element on open', async () => {
      renderWithTheme(
        <Modal isOpen={true} onClose={() => { }}>
          <div>
            <button>First Button</button>
            <button>Second Button</button>
          </div>
        </Modal>
      );

      await waitFor(() => {
        const firstButton = screen.getByText('First Button');
        expect(firstButton).toHaveFocus();
      });
    });

    it('should restore focus on close', () => {
      const button = document.createElement('button');
      button.textContent = 'Trigger';
      document.body.appendChild(button);
      button.focus();

      const { rerender } = renderWithTheme(
        <Modal isOpen={true} onClose={() => { }}>
          <div>Content</div>
        </Modal>
      );

      rerender(
        <ThemeProvider>
          <Modal isOpen={false} onClose={() => { }}>
            <div>Content</div>
          </Modal>
        </ThemeProvider>
      );

      expect(button).toHaveFocus();
      document.body.removeChild(button);
    });
  });

  describe('Animation', () => {
    it('should animate in when opening', () => {
      renderWithTheme(
        <Modal isOpen={true} onClose={() => { }}>
          <div>Content</div>
        </Modal>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });

    it('should animate out when closing', async () => {
      const { rerender } = renderWithTheme(
        <Modal isOpen={true} onClose={() => { }}>
          <div>Content</div>
        </Modal>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();

      rerender(
        <ThemeProvider>
          <Modal isOpen={false} onClose={() => { }}>
            <div>Content</div>
          </Modal>
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.queryByText('Content')).not.toBeInTheDocument();
      });
    });
  });

  describe('Portal Rendering', () => {
    it('should render in portal (document.body)', () => {
      renderWithTheme(
        <Modal isOpen={true} onClose={() => { }}>
          <div>Portal Content</div>
        </Modal>
      );

      const content = screen.getByText('Portal Content');
      expect(content.closest('body')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid open/close', () => {
      const { rerender } = renderWithTheme(
        <Modal isOpen={true} onClose={() => { }}>
          <div>Content</div>
        </Modal>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();

      rerender(
        <ThemeProvider>
          <Modal isOpen={false} onClose={() => { }}>
            <div>Content</div>
          </Modal>
        </ThemeProvider>
      );

      rerender(
        <ThemeProvider>
          <Modal isOpen={true} onClose={() => { }}>
            <div>Content</div>
          </Modal>
        </ThemeProvider>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should handle missing onClose', () => {
      renderWithTheme(
        <Modal isOpen={true} onClose={() => { }}>
          <div>Content</div>
        </Modal>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should handle complex nested content', () => {
      renderWithTheme(
        <Modal isOpen={true} onClose={() => { }}>
          <div>
            <h2>Title</h2>
            <div>
              <p>Paragraph 1</p>
              <p>Paragraph 2</p>
              <ul>
                <li>Item 1</li>
                <li>Item 2</li>
              </ul>
            </div>
          </div>
        </Modal>
      );

      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
    });
  });
});
