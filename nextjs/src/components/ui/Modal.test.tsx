import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from './Modal';

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    children: <div>Modal Content</div>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders when isOpen is true', () => {
      render(<Modal {...defaultProps} />);
      expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
      render(<Modal {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
    });

    it('renders children content', () => {
      render(
        <Modal {...defaultProps}>
          <p>Child paragraph</p>
          <button>Child button</button>
        </Modal>
      );
      expect(screen.getByText('Child paragraph')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Child button' })).toBeInTheDocument();
    });
  });

  describe('Title', () => {
    it('renders title when provided', () => {
      render(<Modal {...defaultProps} title="Modal Title" />);
      expect(screen.getByText('Modal Title')).toBeInTheDocument();
    });

    it('title is rendered as heading', () => {
      render(<Modal {...defaultProps} title="Heading Title" />);
      expect(screen.getByRole('heading', { name: 'Heading Title' })).toBeInTheDocument();
    });

    it('does not render title when not provided', () => {
      render(<Modal {...defaultProps} />);
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });
  });

  describe('Close Button', () => {
    it('renders close button by default', () => {
      render(<Modal {...defaultProps} />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('calls onClose when close button clicked', () => {
      const handleClose = jest.fn();
      render(<Modal {...defaultProps} title="Title" onClose={handleClose} />);

      // Find the close button (has X icon)
      const closeButton = screen.getAllByRole('button')[0];
      fireEvent.click(closeButton);

      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('does not render close button when closeButton is false', () => {
      render(<Modal {...defaultProps} closeButton={false} />);
      // Only buttons from children should exist
      const buttons = screen.queryAllByRole('button');
      // If there are buttons, they should only be from content
      expect(buttons.length).toBe(0);
    });
  });

  describe('Backdrop', () => {
    it('renders backdrop when modal is open', () => {
      const { container } = render(<Modal {...defaultProps} />);
      const backdrop = container.querySelector('.bg-black\\/50');
      expect(backdrop).toBeInTheDocument();
    });

    it('calls onClose when backdrop is clicked', () => {
      const handleClose = jest.fn();
      const { container } = render(<Modal {...defaultProps} onClose={handleClose} />);

      const backdrop = container.querySelector('.bg-black\\/50');
      fireEvent.click(backdrop!);

      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('does not close when modal content is clicked', () => {
      const handleClose = jest.fn();
      render(<Modal {...defaultProps} onClose={handleClose} />);

      fireEvent.click(screen.getByText('Modal Content'));

      expect(handleClose).not.toHaveBeenCalled();
    });
  });

  describe('Sizes', () => {
    it('renders small size', () => {
      const { container } = render(<Modal {...defaultProps} size="sm" />);
      const modal = container.querySelector('.max-w-sm');
      expect(modal).toBeInTheDocument();
    });

    it('renders medium size by default', () => {
      const { container } = render(<Modal {...defaultProps} />);
      const modal = container.querySelector('.max-w-md');
      expect(modal).toBeInTheDocument();
    });

    it('renders large size', () => {
      const { container } = render(<Modal {...defaultProps} size="lg" />);
      const modal = container.querySelector('.max-w-lg');
      expect(modal).toBeInTheDocument();
    });

    it('renders extra large size', () => {
      const { container } = render(<Modal {...defaultProps} size="xl" />);
      const modal = container.querySelector('.max-w-2xl');
      expect(modal).toBeInTheDocument();
    });
  });

  describe('Footer', () => {
    it('renders footer when provided', () => {
      render(
        <Modal
          {...defaultProps}
          footer={
            <>
              <button>Cancel</button>
              <button>Confirm</button>
            </>
          }
        />
      );
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    });

    it('does not render footer section when not provided', () => {
      const { container } = render(<Modal {...defaultProps} />);
      // Footer has border-t class
      const footer = container.querySelector('.border-t.border-slate-200');
      expect(footer).not.toBeInTheDocument();
    });

    it('footer has proper styling for buttons', () => {
      const { container } = render(
        <Modal {...defaultProps} footer={<button>Action</button>} />
      );
      const footerContainer = container.querySelector('.flex.gap-3.justify-end');
      expect(footerContainer).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('modal is positioned with fixed positioning', () => {
      const { container } = render(<Modal {...defaultProps} />);
      const modalWrapper = container.querySelector('.fixed.inset-0');
      expect(modalWrapper).toBeInTheDocument();
    });

    it('modal has high z-index for overlay', () => {
      const { container } = render(<Modal {...defaultProps} />);
      const modalWrapper = container.querySelector('.z-50');
      expect(modalWrapper).toBeInTheDocument();
    });

    it('modal content stops propagation to prevent backdrop click', () => {
      const handleClose = jest.fn();
      render(
        <Modal {...defaultProps} onClose={handleClose}>
          <button onClick={() => {}}>Inner Button</button>
        </Modal>
      );

      fireEvent.click(screen.getByRole('button', { name: 'Inner Button' }));
      expect(handleClose).not.toHaveBeenCalled();
    });
  });

  describe('Styling', () => {
    it('modal has rounded corners', () => {
      const { container } = render(<Modal {...defaultProps} />);
      const modal = container.querySelector('.rounded-lg');
      expect(modal).toBeInTheDocument();
    });

    it('modal has shadow', () => {
      const { container } = render(<Modal {...defaultProps} />);
      const modal = container.querySelector('.shadow-xl');
      expect(modal).toBeInTheDocument();
    });

    it('modal has border styling', () => {
      const { container } = render(<Modal {...defaultProps} />);
      const modal = container.querySelector('.border.border-slate-200');
      expect(modal).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid open/close toggling', () => {
      const handleClose = jest.fn();
      const { rerender } = render(<Modal {...defaultProps} onClose={handleClose} />);

      expect(screen.getByText('Modal Content')).toBeInTheDocument();

      rerender(<Modal {...defaultProps} isOpen={false} onClose={handleClose} />);
      expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();

      rerender(<Modal {...defaultProps} isOpen={true} onClose={handleClose} />);
      expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });

    it('handles complex children', () => {
      render(
        <Modal {...defaultProps}>
          <form>
            <input type="text" placeholder="Name" />
            <select>
              <option>Option 1</option>
            </select>
            <button type="submit">Submit</button>
          </form>
        </Modal>
      );

      expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    });

    it('handles empty title and footer', () => {
      render(<Modal {...defaultProps} title="" footer={null} />);
      expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });
  });

  describe('Complete Modal', () => {
    it('renders with all props', () => {
      const handleClose = jest.fn();
      render(
        <Modal
          isOpen={true}
          onClose={handleClose}
          title="Complete Modal"
          size="lg"
          closeButton={true}
          footer={
            <>
              <button onClick={handleClose}>Cancel</button>
              <button>Save</button>
            </>
          }
        >
          <p>Main content goes here</p>
        </Modal>
      );

      expect(screen.getByRole('heading', { name: 'Complete Modal' })).toBeInTheDocument();
      expect(screen.getByText('Main content goes here')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    });
  });
});
