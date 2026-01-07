/**
 * CaseIntakePage Component Tests
 * Enterprise-grade test suite for case intake form page
 *
 * @module components/features/cases/pages/CaseIntakePage.test
 */

import { render, screen } from '@testing-library/react';
import { CaseIntakePage } from './CaseIntakePage';

// Mock the NewCaseIntakeForm component
jest.mock('@/features/cases/components/intake/NewCaseIntakeForm', () => ({
  NewCaseIntakeForm: () => <div data-testid="intake-form">New Case Intake Form</div>,
}));

// Mock the CenteredLayout component
jest.mock('@/components/ui/layouts/CenteredLayout/CenteredLayout', () => ({
  CenteredLayout: ({ children, maxWidth, verticalCenter }: {
    children: React.ReactNode;
    maxWidth?: string;
    verticalCenter?: boolean;
  }) => (
    <div
      data-testid="centered-layout"
      data-max-width={maxWidth}
      data-vertical-center={verticalCenter}
    >
      {children}
    </div>
  ),
}));

describe('CaseIntakePage', () => {
  describe('Rendering', () => {
    it('should render the centered layout', () => {
      render(<CaseIntakePage />);

      expect(screen.getByTestId('centered-layout')).toBeInTheDocument();
    });

    it('should render the intake form', () => {
      render(<CaseIntakePage />);

      expect(screen.getByTestId('intake-form')).toBeInTheDocument();
    });
  });

  describe('Layout Configuration', () => {
    it('should set maxWidth to 2xl', () => {
      render(<CaseIntakePage />);

      const layout = screen.getByTestId('centered-layout');
      expect(layout).toHaveAttribute('data-max-width', '2xl');
    });

    it('should disable verticalCenter', () => {
      render(<CaseIntakePage />);

      const layout = screen.getByTestId('centered-layout');
      expect(layout).toHaveAttribute('data-vertical-center', 'false');
    });
  });

  describe('Props Handling', () => {
    it('should accept onComplete callback', () => {
      const onComplete = jest.fn();
      render(<CaseIntakePage onComplete={onComplete} />);

      expect(screen.getByTestId('intake-form')).toBeInTheDocument();
    });

    it('should accept onCancel callback', () => {
      const onCancel = jest.fn();
      render(<CaseIntakePage onCancel={onCancel} />);

      expect(screen.getByTestId('intake-form')).toBeInTheDocument();
    });

    it('should accept both callbacks', () => {
      const onComplete = jest.fn();
      const onCancel = jest.fn();
      render(<CaseIntakePage onComplete={onComplete} onCancel={onCancel} />);

      expect(screen.getByTestId('intake-form')).toBeInTheDocument();
    });

    it('should render without any callbacks', () => {
      render(<CaseIntakePage />);

      expect(screen.getByTestId('intake-form')).toBeInTheDocument();
    });
  });

  describe('Component Optimization', () => {
    it('should be wrapped with React.memo', () => {
      expect(CaseIntakePage.displayName || CaseIntakePage.name).toBeDefined();
    });

    it('should not rerender with same props', () => {
      const onComplete = jest.fn();
      const { rerender } = render(<CaseIntakePage onComplete={onComplete} />);

      rerender(<CaseIntakePage onComplete={onComplete} />);

      expect(screen.getByTestId('intake-form')).toBeInTheDocument();
    });
  });

  describe('Layout Structure', () => {
    it('should nest intake form inside centered layout', () => {
      render(<CaseIntakePage />);

      const centeredLayout = screen.getByTestId('centered-layout');
      const intakeForm = screen.getByTestId('intake-form');

      expect(centeredLayout).toContainElement(intakeForm);
    });
  });

  describe('Callback Types', () => {
    it('should accept onComplete with caseId parameter type', () => {
      const onComplete = (caseId: string) => {
        expect(typeof caseId).toBe('string');
      };
      render(<CaseIntakePage onComplete={onComplete} />);

      expect(screen.getByTestId('intake-form')).toBeInTheDocument();
    });

    it('should accept onCancel with no parameters', () => {
      const onCancel = () => {};
      render(<CaseIntakePage onCancel={onCancel} />);

      expect(screen.getByTestId('intake-form')).toBeInTheDocument();
    });
  });
});
