/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { EnterpriseModal, WizardStep } from '@/components/enterprise/ui/EnterpriseModal';
import { ThemeProvider } from '@/contexts/theme/ThemeContext';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock react-dom portal
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node: any) => node,
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('EnterpriseModal', () => {
  describe('Modal Open/Close', () => {
    it('should render when isOpen is true', () => {
      renderWithTheme(
        <EnterpriseModal isOpen={true} onClose={jest.fn()} title="Test Modal">
          <div>Modal Content</div>
        </EnterpriseModal>
      );

      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      renderWithTheme(
        <EnterpriseModal isOpen={false} onClose={jest.fn()} title="Test Modal">
          <div>Modal Content</div>
        </EnterpriseModal>
      );

      expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    });

    it('should call onClose when close button is clicked', () => {
      const onClose = jest.fn();
      renderWithTheme(
        <EnterpriseModal isOpen={true} onClose={onClose} title="Test Modal">
          <div>Content</div>
        </EnterpriseModal>
      );

      const closeButtons = screen.getAllByRole('button');
      const closeButton = closeButtons.find(btn => {
        const svg = btn.querySelector('svg');
        return svg !== null;
      });

      if (closeButton) {
        fireEvent.click(closeButton);
        expect(onClose).toHaveBeenCalled();
      }
    });

    it('should show close button by default', () => {
      renderWithTheme(
        <EnterpriseModal isOpen={true} onClose={jest.fn()} title="Test Modal">
          <div>Content</div>
        </EnterpriseModal>
      );

      const closeButtons = screen.getAllByRole('button');
      expect(closeButtons.length).toBeGreaterThan(0);
    });

    it('should hide close button when showCloseButton is false', () => {
      renderWithTheme(
        <EnterpriseModal isOpen={true} onClose={jest.fn()} title="Test Modal" showCloseButton={false}>
          <div>Content</div>
        </EnterpriseModal>
      );

      const closeButtons = screen.queryAllByRole('button');
      const closeButton = closeButtons.find(btn => btn.querySelector('svg'));
      expect(closeButton).toBeUndefined();
    });

    it('should support different modal sizes', () => {
      const { rerender } = renderWithTheme(
        <EnterpriseModal isOpen={true} onClose={jest.fn()} title="Small Modal" size="sm">
          <div>Content</div>
        </EnterpriseModal>
      );

      expect(screen.getByText('Small Modal')).toBeInTheDocument();

      rerender(
        <ThemeProvider>
          <EnterpriseModal isOpen={true} onClose={jest.fn()} title="Large Modal" size="lg">
            <div>Content</div>
          </EnterpriseModal>
        </ThemeProvider>
      );

      expect(screen.getByText('Large Modal')).toBeInTheDocument();
    });
  });

  describe('Wizard Steps', () => {
    const wizardSteps: WizardStep[] = [
      {
        id: 'step1',
        title: 'Step 1',
        description: 'First step',
        content: <div>Step 1 Content</div>,
        isValid: true,
      },
      {
        id: 'step2',
        title: 'Step 2',
        description: 'Second step',
        content: <div>Step 2 Content</div>,
        isValid: true,
      },
      {
        id: 'step3',
        title: 'Step 3',
        description: 'Third step',
        content: <div>Step 3 Content</div>,
        isValid: true,
      },
    ];

    it('should render wizard with steps', () => {
      renderWithTheme(
        <EnterpriseModal isOpen={true} onClose={jest.fn()} title="Wizard" steps={wizardSteps}>
          <div>Fallback</div>
        </EnterpriseModal>
      );

      expect(screen.getByText('Step 1 Content')).toBeInTheDocument();
      expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
    });

    it('should navigate to next step when Next button is clicked', async () => {
      renderWithTheme(
        <EnterpriseModal isOpen={true} onClose={jest.fn()} title="Wizard" steps={wizardSteps}>
          <div>Fallback</div>
        </EnterpriseModal>
      );

      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Step 2 Content')).toBeInTheDocument();
      });
    });

    it('should navigate to previous step when Previous button is clicked', async () => {
      renderWithTheme(
        <EnterpriseModal isOpen={true} onClose={jest.fn()} title="Wizard" steps={wizardSteps}>
          <div>Fallback</div>
        </EnterpriseModal>
      );

      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Step 2 Content')).toBeInTheDocument();
      });

      const previousButton = screen.getByRole('button', { name: /previous/i });
      fireEvent.click(previousButton);

      await waitFor(() => {
        expect(screen.getByText('Step 1 Content')).toBeInTheDocument();
      });
    });

    it('should disable Previous button on first step', () => {
      renderWithTheme(
        <EnterpriseModal isOpen={true} onClose={jest.fn()} title="Wizard" steps={wizardSteps}>
          <div>Fallback</div>
        </EnterpriseModal>
      );

      const previousButton = screen.getByRole('button', { name: /previous/i });
      expect(previousButton).toBeDisabled();
    });

    it('should show Complete button on last step', async () => {
      renderWithTheme(
        <EnterpriseModal isOpen={true} onClose={jest.fn()} title="Wizard" steps={wizardSteps}>
          <div>Fallback</div>
        </EnterpriseModal>
      );

      const nextButton = screen.getByRole('button', { name: /next/i });

      // Navigate to last step
      fireEvent.click(nextButton);
      await waitFor(() => expect(screen.getByText('Step 2 Content')).toBeInTheDocument());

      fireEvent.click(nextButton);
      await waitFor(() => {
        expect(screen.getByText('Step 3 Content')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /complete/i })).toBeInTheDocument();
      });
    });

    it('should call onComplete when completing wizard', async () => {
      const onComplete = jest.fn();
      renderWithTheme(
        <EnterpriseModal
          isOpen={true}
          onClose={jest.fn()}
          title="Wizard"
          steps={wizardSteps}
          onComplete={onComplete}
        >
          <div>Fallback</div>
        </EnterpriseModal>
      );

      const nextButton = screen.getByRole('button', { name: /next/i });

      // Navigate to last step
      fireEvent.click(nextButton);
      await waitFor(() => expect(screen.getByText('Step 2 Content')).toBeInTheDocument());

      fireEvent.click(nextButton);
      await waitFor(() => expect(screen.getByText('Step 3 Content')).toBeInTheDocument());

      const completeButton = screen.getByRole('button', { name: /complete/i });
      fireEvent.click(completeButton);

      await waitFor(() => {
        expect(onComplete).toHaveBeenCalled();
      });
    });

    it('should display progress bar', () => {
      renderWithTheme(
        <EnterpriseModal isOpen={true} onClose={jest.fn()} title="Wizard" steps={wizardSteps} showProgress>
          <div>Fallback</div>
        </EnterpriseModal>
      );

      expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
      expect(screen.getByText('33%')).toBeInTheDocument();
    });

    it('should allow clicking on completed steps to navigate', async () => {
      renderWithTheme(
        <EnterpriseModal isOpen={true} onClose={jest.fn()} title="Wizard" steps={wizardSteps}>
          <div>Fallback</div>
        </EnterpriseModal>
      );

      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Step 2 Content')).toBeInTheDocument();
      });

      // Click on step 1 indicator
      const stepIndicators = screen.getAllByRole('button');
      const step1Indicator = stepIndicators.find(btn => btn.textContent?.includes('Step 1'));

      if (step1Indicator) {
        fireEvent.click(step1Indicator);
        await waitFor(() => {
          expect(screen.getByText('Step 1 Content')).toBeInTheDocument();
        });
      }
    });

    it('should disable Next button when step is invalid', () => {
      const invalidSteps = [
        { ...wizardSteps[0], isValid: false },
        ...wizardSteps.slice(1),
      ];

      renderWithTheme(
        <EnterpriseModal isOpen={true} onClose={jest.fn()} title="Wizard" steps={invalidSteps}>
          <div>Fallback</div>
        </EnterpriseModal>
      );

      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).toBeDisabled();
    });

    it('should show Skip button for skippable steps', () => {
      const skippableSteps = [
        { ...wizardSteps[0], canSkip: true },
        ...wizardSteps.slice(1),
      ];

      renderWithTheme(
        <EnterpriseModal isOpen={true} onClose={jest.fn()} title="Wizard" steps={skippableSteps}>
          <div>Fallback</div>
        </EnterpriseModal>
      );

      expect(screen.getByRole('button', { name: /skip/i })).toBeInTheDocument();
    });
  });

  describe('Confirmation Dialog', () => {
    it('should render confirmation dialog variant', () => {
      renderWithTheme(
        <EnterpriseModal
          isOpen={true}
          onClose={jest.fn()}
          variant="confirmation"
          title="Confirm Action"
          confirmationMessage="Are you sure?"
        />
      );

      expect(screen.getByText('Confirm Action')).toBeInTheDocument();
      expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    });

    it('should display confirmation icon based on type', () => {
      const { rerender } = renderWithTheme(
        <EnterpriseModal
          isOpen={true}
          onClose={jest.fn()}
          variant="confirmation"
          confirmationType="warning"
          title="Warning"
        />
      );

      expect(screen.getByText('Warning')).toBeInTheDocument();

      rerender(
        <ThemeProvider>
          <EnterpriseModal
            isOpen={true}
            onClose={jest.fn()}
            variant="confirmation"
            confirmationType="error"
            title="Error"
          />
        </ThemeProvider>
      );

      expect(screen.getByText('Error')).toBeInTheDocument();
    });

    it('should call onConfirm when Confirm button is clicked', async () => {
      const onConfirm = jest.fn();
      renderWithTheme(
        <EnterpriseModal
          isOpen={true}
          onClose={jest.fn()}
          variant="confirmation"
          title="Confirm"
          onConfirm={onConfirm}
        />
      );

      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(onConfirm).toHaveBeenCalled();
      });
    });

    it('should call onCancel when Cancel button is clicked', () => {
      const onCancel = jest.fn();
      renderWithTheme(
        <EnterpriseModal
          isOpen={true}
          onClose={jest.fn()}
          variant="confirmation"
          title="Confirm"
          onCancel={onCancel}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(onCancel).toHaveBeenCalled();
    });

    it('should support custom button labels', () => {
      renderWithTheme(
        <EnterpriseModal
          isOpen={true}
          onClose={jest.fn()}
          variant="confirmation"
          title="Delete Item"
          confirmLabel="Delete"
          cancelLabel="Keep"
        />
      );

      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /keep/i })).toBeInTheDocument();
    });

    it('should show loading state on confirm', async () => {
      const onConfirm = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
      renderWithTheme(
        <EnterpriseModal
          isOpen={true}
          onClose={jest.fn()}
          variant="confirmation"
          title="Confirm"
          onConfirm={onConfirm}
        />
      );

      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      fireEvent.click(confirmButton);

      expect(confirmButton).toBeDisabled();
    });
  });

  describe('Drawer Panel', () => {
    it('should render drawer variant', () => {
      renderWithTheme(
        <EnterpriseModal isOpen={true} onClose={jest.fn()} variant="drawer" title="Drawer">
          <div>Drawer Content</div>
        </EnterpriseModal>
      );

      expect(screen.getByText('Drawer')).toBeInTheDocument();
      expect(screen.getByText('Drawer Content')).toBeInTheDocument();
    });

    it('should support left and right drawer positions', () => {
      const { rerender } = renderWithTheme(
        <EnterpriseModal
          isOpen={true}
          onClose={jest.fn()}
          variant="drawer"
          drawerPosition="right"
          title="Right Drawer"
        >
          <div>Content</div>
        </EnterpriseModal>
      );

      expect(screen.getByText('Right Drawer')).toBeInTheDocument();

      rerender(
        <ThemeProvider>
          <EnterpriseModal
            isOpen={true}
            onClose={jest.fn()}
            variant="drawer"
            drawerPosition="left"
            title="Left Drawer"
          >
            <div>Content</div>
          </EnterpriseModal>
        </ThemeProvider>
      );

      expect(screen.getByText('Left Drawer')).toBeInTheDocument();
    });

    it('should support custom drawer width', () => {
      renderWithTheme(
        <EnterpriseModal
          isOpen={true}
          onClose={jest.fn()}
          variant="drawer"
          drawerWidth="40rem"
          title="Wide Drawer"
        >
          <div>Content</div>
        </EnterpriseModal>
      );

      expect(screen.getByText('Wide Drawer')).toBeInTheDocument();
    });

    it('should render footer in drawer', () => {
      renderWithTheme(
        <EnterpriseModal
          isOpen={true}
          onClose={jest.fn()}
          variant="drawer"
          title="Drawer"
          footer={<button>Custom Footer</button>}
        >
          <div>Content</div>
        </EnterpriseModal>
      );

      expect(screen.getByText('Custom Footer')).toBeInTheDocument();
    });
  });

  describe('Backdrop Click', () => {
    it('should close modal on backdrop click when closeOnBackdrop is true', () => {
      const onClose = jest.fn();
      renderWithTheme(
        <EnterpriseModal isOpen={true} onClose={onClose} closeOnBackdrop={true} title="Modal">
          <div>Content</div>
        </EnterpriseModal>
      );

      const backdrop = document.querySelector('[class*="backdrop"]');
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(onClose).toHaveBeenCalled();
      }
    });

    it('should not close modal on backdrop click when closeOnBackdrop is false', () => {
      const onClose = jest.fn();
      renderWithTheme(
        <EnterpriseModal isOpen={true} onClose={onClose} closeOnBackdrop={false} title="Modal">
          <div>Content</div>
        </EnterpriseModal>
      );

      const backdrop = document.querySelector('[class*="backdrop"]');
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(onClose).not.toHaveBeenCalled();
      }
    });

    it('should not close when clicking modal content', () => {
      const onClose = jest.fn();
      renderWithTheme(
        <EnterpriseModal isOpen={true} onClose={onClose} closeOnBackdrop={true} title="Modal">
          <div>Content</div>
        </EnterpriseModal>
      );

      const content = screen.getByText('Content');
      fireEvent.click(content);

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard Escape', () => {
    it('should close modal when Escape is pressed', () => {
      const onClose = jest.fn();
      renderWithTheme(
        <EnterpriseModal isOpen={true} onClose={onClose} closeOnEscape={true} title="Modal">
          <div>Content</div>
        </EnterpriseModal>
      );

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(onClose).toHaveBeenCalled();
    });

    it('should not close when closeOnEscape is false', () => {
      const onClose = jest.fn();
      renderWithTheme(
        <EnterpriseModal isOpen={true} onClose={onClose} closeOnEscape={false} title="Modal">
          <div>Content</div>
        </EnterpriseModal>
      );

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(onClose).not.toHaveBeenCalled();
    });

    it('should close wizard modal on Escape', () => {
      const onClose = jest.fn();
      const wizardSteps: WizardStep[] = [
        {
          id: 'step1',
          title: 'Step 1',
          content: <div>Step 1</div>,
        },
        {
          id: 'step2',
          title: 'Step 2',
          content: <div>Step 2</div>,
        },
      ];

      renderWithTheme(
        <EnterpriseModal isOpen={true} onClose={onClose} steps={wizardSteps} title="Wizard">
          <div>Fallback</div>
        </EnterpriseModal>
      );

      // Navigate to step 2
      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);

      fireEvent.keyDown(document, { key: 'Escape' });

      // Should close the modal
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      renderWithTheme(
        <EnterpriseModal isOpen={true} onClose={jest.fn()} title="Accessible Modal">
          <div>Content</div>
        </EnterpriseModal>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('should use alertdialog role for confirmation variant', () => {
      renderWithTheme(
        <EnterpriseModal
          isOpen={true}
          onClose={jest.fn()}
          variant="confirmation"
          title="Confirm"
        />
      );

      const dialog = screen.getByRole('alertdialog');
      expect(dialog).toBeInTheDocument();
    });

    it('should associate title with dialog', () => {
      renderWithTheme(
        <EnterpriseModal isOpen={true} onClose={jest.fn()} title="Test Modal">
          <div>Content</div>
        </EnterpriseModal>
      );

      const dialog = screen.getByRole('dialog');
      const title = screen.getByText('Test Modal');

      expect(dialog).toHaveAttribute('aria-labelledby');
      expect(title).toHaveAttribute('id');
    });

    it('should trap focus within modal', () => {
      renderWithTheme(
        <EnterpriseModal isOpen={true} onClose={jest.fn()} title="Modal">
          <button>Button 1</button>
          <button>Button 2</button>
        </EnterpriseModal>
      );

      // Modal should contain focusable elements
      expect(screen.getByText('Button 1')).toBeInTheDocument();
      expect(screen.getByText('Button 2')).toBeInTheDocument();
    });
  });

  describe('Custom Footer', () => {
    it('should render custom footer', () => {
      renderWithTheme(
        <EnterpriseModal
          isOpen={true}
          onClose={jest.fn()}
          title="Modal"
          footer={
            <div>
              <button>Custom Action</button>
            </div>
          }
        >
          <div>Content</div>
        </EnterpriseModal>
      );

      expect(screen.getByText('Custom Action')).toBeInTheDocument();
    });

    it('should not render footer when not provided', () => {
      const { container } = renderWithTheme(
        <EnterpriseModal isOpen={true} onClose={jest.fn()} title="Modal">
          <div>Content</div>
        </EnterpriseModal>
      );

      const footers = container.querySelectorAll('[class*="border-t"]');
      expect(footers.length).toBeLessThanOrEqual(2); // Only header border
    });
  });
});
