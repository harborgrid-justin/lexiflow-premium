/**
 * DocumentDragOverlay Component Tests
 * Enterprise-grade tests for drag and drop overlay.
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { DocumentDragOverlay } from './DocumentDragOverlay';

// Mock @/lib/utils
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

describe('DocumentDragOverlay', () => {
  const mockOnDrop = jest.fn();
  const mockOnDragLeave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the overlay with upload message', () => {
      render(<DocumentDragOverlay />);

      expect(screen.getByText('Drop files to upload')).toBeInTheDocument();
    });

    it('renders the pipeline ready message', () => {
      render(<DocumentDragOverlay />);

      expect(screen.getByText('Secure Ingestion Pipeline Ready')).toBeInTheDocument();
    });

    it('renders upload icon', () => {
      const { container } = render(<DocumentDragOverlay />);

      // UploadCloud icon should be present
      const iconContainer = container.querySelector('.animate-bounce');
      expect(iconContainer).toBeInTheDocument();
    });

    it('has correct styling classes', () => {
      const { container } = render(<DocumentDragOverlay />);

      const overlay = container.firstChild;
      expect(overlay).toHaveClass('absolute', 'inset-0', 'z-50');
      expect(overlay).toHaveClass('border-4', 'border-blue-500', 'border-dashed');
    });

    it('has backdrop blur styling', () => {
      const { container } = render(<DocumentDragOverlay />);

      const overlay = container.firstChild;
      expect(overlay).toHaveClass('backdrop-blur-md');
    });

    it('has cursor-copy styling', () => {
      const { container } = render(<DocumentDragOverlay />);

      const overlay = container.firstChild;
      expect(overlay).toHaveClass('cursor-copy');
    });
  });

  describe('Event Handlers', () => {
    it('calls onDrop when files are dropped', () => {
      const { container } = render(
        <DocumentDragOverlay onDrop={mockOnDrop} onDragLeave={mockOnDragLeave} />
      );

      const overlay = container.firstChild as Element;
      const dropEvent = new Event('drop', { bubbles: true });
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: {
          files: [new File(['content'], 'test.pdf', { type: 'application/pdf' })],
        },
      });

      fireEvent(overlay, dropEvent);

      expect(mockOnDrop).toHaveBeenCalled();
    });

    it('calls onDragLeave when drag leaves the overlay', () => {
      const { container } = render(
        <DocumentDragOverlay onDrop={mockOnDrop} onDragLeave={mockOnDragLeave} />
      );

      const overlay = container.firstChild as Element;
      fireEvent.dragLeave(overlay);

      expect(mockOnDragLeave).toHaveBeenCalled();
    });

    it('prevents default on dragOver', () => {
      const { container } = render(<DocumentDragOverlay />);

      const overlay = container.firstChild as Element;
      const dragOverEvent = fireEvent.dragOver(overlay);

      // The event should be prevented
      expect(dragOverEvent).toBe(true);
    });

    it('stops propagation on dragOver', () => {
      const parentHandler = jest.fn();
      const { container } = render(
        <div onDragOver={parentHandler}>
          <DocumentDragOverlay />
        </div>
      );

      const overlay = container.querySelector('.absolute');
      fireEvent.dragOver(overlay!);

      // Parent handler should not be called due to stopPropagation
      expect(parentHandler).not.toHaveBeenCalled();
    });
  });

  describe('Without Event Handlers', () => {
    it('renders without onDrop handler', () => {
      render(<DocumentDragOverlay onDragLeave={mockOnDragLeave} />);

      expect(screen.getByText('Drop files to upload')).toBeInTheDocument();
    });

    it('renders without onDragLeave handler', () => {
      render(<DocumentDragOverlay onDrop={mockOnDrop} />);

      expect(screen.getByText('Drop files to upload')).toBeInTheDocument();
    });

    it('renders without any handlers', () => {
      render(<DocumentDragOverlay />);

      expect(screen.getByText('Drop files to upload')).toBeInTheDocument();
    });
  });

  describe('Animation', () => {
    it('has fade-in animation class', () => {
      const { container } = render(<DocumentDragOverlay />);

      const overlay = container.firstChild;
      expect(overlay).toHaveClass('animate-in', 'fade-in');
    });

    it('has zoom-in animation class', () => {
      const { container } = render(<DocumentDragOverlay />);

      const overlay = container.firstChild;
      expect(overlay).toHaveClass('zoom-in-95');
    });

    it('icon container has bounce animation', () => {
      const { container } = render(<DocumentDragOverlay />);

      const iconContainer = container.querySelector('.animate-bounce');
      expect(iconContainer).toBeInTheDocument();
    });
  });

  describe('Pointer Events', () => {
    it('text elements have pointer-events-none', () => {
      const { container } = render(<DocumentDragOverlay />);

      const heading = screen.getByText('Drop files to upload');
      expect(heading).toHaveClass('pointer-events-none');

      const subtitle = screen.getByText('Secure Ingestion Pipeline Ready');
      expect(subtitle).toHaveClass('pointer-events-none');
    });

    it('icon container has pointer-events-none', () => {
      const { container } = render(<DocumentDragOverlay />);

      const iconContainer = container.querySelector('.animate-bounce');
      expect(iconContainer).toHaveClass('pointer-events-none');
    });
  });

  describe('Dark Mode', () => {
    it('has dark mode background class', () => {
      const { container } = render(<DocumentDragOverlay />);

      const iconBg = container.querySelector('.bg-white');
      expect(iconBg).toHaveClass('dark:bg-slate-900');
    });

    it('has dark mode text classes', () => {
      render(<DocumentDragOverlay />);

      const heading = screen.getByText('Drop files to upload');
      expect(heading).toHaveClass('dark:text-slate-100');

      const subtitle = screen.getByText('Secure Ingestion Pipeline Ready');
      expect(subtitle).toHaveClass('dark:text-slate-400');
    });
  });

  describe('Accessibility', () => {
    it('renders as visible overlay', () => {
      const { container } = render(<DocumentDragOverlay />);

      const overlay = container.firstChild;
      expect(overlay).not.toHaveClass('hidden');
      expect(overlay).not.toHaveAttribute('aria-hidden', 'true');
    });

    it('has semantic heading', () => {
      render(<DocumentDragOverlay />);

      const heading = screen.getByText('Drop files to upload');
      expect(heading.tagName).toBe('H3');
    });
  });

  describe('Layout', () => {
    it('centers content with flexbox', () => {
      const { container } = render(<DocumentDragOverlay />);

      const overlay = container.firstChild;
      expect(overlay).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center');
    });

    it('has rounded corners', () => {
      const { container } = render(<DocumentDragOverlay />);

      const overlay = container.firstChild;
      expect(overlay).toHaveClass('rounded-xl');
    });

    it('has margin for spacing from edges', () => {
      const { container } = render(<DocumentDragOverlay />);

      const overlay = container.firstChild;
      expect(overlay).toHaveClass('m-4');
    });
  });
});
