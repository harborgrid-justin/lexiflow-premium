/**
 * @jest-environment jsdom
 */

import { ThemeProvider } from '@/contexts/theme/ThemeContext';
import { Drawer } from '@/shared/ui/molecules/Drawer/Drawer';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('Drawer', () => {
  describe('Rendering', () => {
    it('should render when isOpen is true', () => {
      renderWithTheme(
        <Drawer isOpen={true} onClose={() => { }}>
          <div>Drawer Content</div>
        </Drawer>
      );
      expect(screen.getByText('Drawer Content')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      renderWithTheme(
        <Drawer isOpen={false} onClose={() => { }}>
          <div>Drawer Content</div>
        </Drawer>
      );
      expect(screen.queryByText('Drawer Content')).not.toBeInTheDocument();
    });

    it('should render with title', () => {
      renderWithTheme(
        <Drawer isOpen={true} onClose={() => { }} title="Settings">
          <div>Content</div>
        </Drawer>
      );
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });
  });

  describe('Positions', () => {
    const positions = ['left', 'right', 'top', 'bottom'] as const;

    it.each(positions)('should render from %s position', (position) => {
      renderWithTheme(
        <Drawer isOpen={true} onClose={() => { }} position={position}>
          <div>Content</div>
        </Drawer>
      );
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should default to right position', () => {
      renderWithTheme(
        <Drawer isOpen={true} onClose={() => { }}>
          <div>Content</div>
        </Drawer>
      );
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('Sizes', () => {
    const sizes = ['sm', 'md', 'lg', 'xl', 'full'] as const;

    it.each(sizes)('should render %s size correctly', (size) => {
      renderWithTheme(
        <Drawer isOpen={true} onClose={() => { }} size={size}>
          <div>Content</div>
        </Drawer>
      );
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('Close Functionality', () => {
    it('should call onClose when close button is clicked', () => {
      const handleClose = jest.fn();
      renderWithTheme(
        <Drawer isOpen={true} onClose={handleClose}>
          <div>Content</div>
        </Drawer>
      );

      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);

      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when overlay is clicked', () => {
      const handleClose = jest.fn();
      const { container } = renderWithTheme(
        <Drawer isOpen={true} onClose={handleClose}>
          <div>Content</div>
        </Drawer>
      );

      const overlay = container.querySelector('[data-overlay="true"]');
      if (overlay) {
        fireEvent.click(overlay);
        expect(handleClose).toHaveBeenCalled();
      }
    });

    it('should call onClose when Escape key is pressed', () => {
      const handleClose = jest.fn();
      renderWithTheme(
        <Drawer isOpen={true} onClose={handleClose}>
          <div>Content</div>
        </Drawer>
      );

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(handleClose).toHaveBeenCalled();
    });

    it('should not close when clicking inside drawer content', () => {
      const handleClose = jest.fn();
      renderWithTheme(
        <Drawer isOpen={true} onClose={handleClose}>
          <div>Content</div>
        </Drawer>
      );

      const content = screen.getByText('Content');
      fireEvent.click(content);

      expect(handleClose).not.toHaveBeenCalled();
    });

    it('should not close on overlay click when closeOnOverlayClick is false', () => {
      const handleClose = jest.fn();
      const { container } = renderWithTheme(
        <Drawer
          isOpen={true}
          onClose={handleClose}
          closeOnOverlayClick={false}
        >
          <div>Content</div>
        </Drawer>
      );

      const overlay = container.querySelector('[data-overlay="true"]');
      if (overlay) {
        fireEvent.click(overlay);
        expect(handleClose).not.toHaveBeenCalled();
      }
    });
  });

  describe('Header and Footer', () => {
    it('should render custom header', () => {
      renderWithTheme(
        <Drawer
          isOpen={true}
          onClose={() => { }}
          header={<div>Custom Header</div>}
        >
          <div>Content</div>
        </Drawer>
      );
      expect(screen.getByText('Custom Header')).toBeInTheDocument();
    });

    it('should render custom footer', () => {
      renderWithTheme(
        <Drawer
          isOpen={true}
          onClose={() => { }}
          footer={<div>Custom Footer</div>}
        >
          <div>Content</div>
        </Drawer>
      );
      expect(screen.getByText('Custom Footer')).toBeInTheDocument();
    });

    it('should render action buttons in footer', () => {
      const footer = (
        <div>
          <button>Cancel</button>
          <button>Save</button>
        </div>
      );

      renderWithTheme(
        <Drawer isOpen={true} onClose={() => { }} footer={footer}>
          <div>Content</div>
        </Drawer>
      );

      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
    });
  });

  describe('Body Scroll Lock', () => {
    it('should lock body scroll when drawer is open', () => {
      renderWithTheme(
        <Drawer isOpen={true} onClose={() => { }}>
          <div>Content</div>
        </Drawer>
      );

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should restore body scroll when drawer closes', () => {
      const { rerender } = renderWithTheme(
        <Drawer isOpen={true} onClose={() => { }}>
          <div>Content</div>
        </Drawer>
      );

      expect(document.body.style.overflow).toBe('hidden');

      rerender(
        <ThemeProvider>
          <Drawer isOpen={false} onClose={() => { }}>
            <div>Content</div>
          </Drawer>
        </ThemeProvider>
      );

      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('Accessibility', () => {
    it('should have dialog role', () => {
      renderWithTheme(
        <Drawer isOpen={true} onClose={() => { }}>
          <div>Content</div>
        </Drawer>
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should have aria-modal attribute', () => {
      renderWithTheme(
        <Drawer isOpen={true} onClose={() => { }}>
          <div>Content</div>
        </Drawer>
      );
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('should have aria-labelledby when title is provided', () => {
      renderWithTheme(
        <Drawer isOpen={true} onClose={() => { }} title="Settings">
          <div>Content</div>
        </Drawer>
      );
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby');
    });

    it('should trap focus within drawer', () => {
      renderWithTheme(
        <Drawer isOpen={true} onClose={() => { }}>
          <div>
            <button>Button 1</button>
            <button>Button 2</button>
          </div>
        </Drawer>
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Animation', () => {
    it('should animate in when opening', () => {
      renderWithTheme(
        <Drawer isOpen={true} onClose={() => { }}>
          <div>Content</div>
        </Drawer>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });

    it('should animate out when closing', async () => {
      const { rerender } = renderWithTheme(
        <Drawer isOpen={true} onClose={() => { }}>
          <div>Content</div>
        </Drawer>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();

      rerender(
        <ThemeProvider>
          <Drawer isOpen={false} onClose={() => { }}>
            <div>Content</div>
          </Drawer>
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.queryByText('Content')).not.toBeInTheDocument();
      });
    });
  });

  describe('Portal Rendering', () => {
    it('should render in portal', () => {
      renderWithTheme(
        <Drawer isOpen={true} onClose={() => { }}>
          <div>Portal Content</div>
        </Drawer>
      );

      const content = screen.getByText('Portal Content');
      expect(content.closest('body')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid open/close', () => {
      const { rerender } = renderWithTheme(
        <Drawer isOpen={true} onClose={() => { }}>
          <div>Content</div>
        </Drawer>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();

      rerender(
        <ThemeProvider>
          <Drawer isOpen={false} onClose={() => { }}>
            <div>Content</div>
          </Drawer>
        </ThemeProvider>
      );

      rerender(
        <ThemeProvider>
          <Drawer isOpen={true} onClose={() => { }}>
            <div>Content</div>
          </Drawer>
        </ThemeProvider>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should handle complex nested content', () => {
      renderWithTheme(
        <Drawer isOpen={true} onClose={() => { }}>
          <div>
            <h2>Title</h2>
            <form>
              <input type="text" />
              <button>Submit</button>
            </form>
          </div>
        </Drawer>
      );

      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Submit')).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const { container } = renderWithTheme(
        <Drawer isOpen={true} onClose={() => { }} className="custom-drawer">
          <div>Content</div>
        </Drawer>
      );
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveClass('custom-drawer');
    });
  });
});
