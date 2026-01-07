/**
 * @module components/enterprise/forms/WizardForm.test
 * @description Unit tests for WizardForm component.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WizardForm } from './WizardForm';
import type { WizardConfig, WizardStep, FieldSchema } from '@/types/forms';

// ============================================================================
// MOCKS
// ============================================================================

jest.mock('@/providers', () => ({
  useTheme: () => ({
    theme: {
      surface: { default: 'bg-white', highlight: 'bg-gray-100' },
      text: { primary: 'text-gray-900', secondary: 'text-gray-600', tertiary: 'text-gray-400' },
      border: { default: 'border-gray-200', subtle: 'border-gray-100' },
      backdrop: 'bg-black/50',
    },
  }),
}));

// Mock the useEnhancedWizard hook
const mockGoNext = jest.fn();
const mockGoBack = jest.fn();
const mockGoToStep = jest.fn();
const mockUpdateData = jest.fn();
const mockSubmit = jest.fn();

jest.mock('@/hooks/useEnhancedWizard', () => ({
  useEnhancedWizard: jest.fn((config: { config: WizardConfig<TestFormData>, initialData: TestFormData }) => ({
    currentStep: config.config.steps[0],
    currentStepIndex: 0,
    visibleSteps: config.config.steps,
    data: config.initialData,
    updateData: mockUpdateData,
    goNext: mockGoNext,
    goBack: mockGoBack,
    goToStep: mockGoToStep,
    isFirst: true,
    isLast: false,
    isValidating: false,
    progress: 25,
    visitedSteps: new Set([0]),
    submit: mockSubmit,
    errors: {},
  })),
}));

// ============================================================================
// TEST SETUP
// ============================================================================

interface TestFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

const step1Fields: FieldSchema[] = [
  { name: 'firstName', label: 'First Name', type: 'text', required: true },
  { name: 'lastName', label: 'Last Name', type: 'text', required: true },
];

const step2Fields: FieldSchema[] = [
  { name: 'email', label: 'Email', type: 'email', required: true },
];

const step3Fields: FieldSchema[] = [
  { name: 'password', label: 'Password', type: 'password', required: true },
];

const testSteps: WizardStep<TestFormData>[] = [
  {
    id: 'personal',
    title: 'Personal Info',
    description: 'Enter your personal information',
    fields: step1Fields,
  },
  {
    id: 'contact',
    title: 'Contact Info',
    description: 'Enter your contact information',
    fields: step2Fields,
  },
  {
    id: 'security',
    title: 'Security',
    description: 'Set up your password',
    fields: step3Fields,
  },
];

const testConfig: WizardConfig<TestFormData> = {
  steps: testSteps,
  title: 'Registration Wizard',
  description: 'Complete all steps to register',
  showProgress: true,
  progressType: 'steps',
  allowStepNavigation: false,
  onSubmit: jest.fn(),
};

const testInitialData: TestFormData = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
};

const defaultProps = {
  config: testConfig,
  initialData: testInitialData,
};

const renderWizardForm = (props = {}) => {
  const mergedProps = { ...defaultProps, ...props };
  return render(<WizardForm {...mergedProps} />);
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ============================================================================
// RENDERING TESTS
// ============================================================================

describe('WizardForm rendering', () => {
  it('should render wizard title', () => {
    renderWizardForm();

    expect(screen.getByText('Registration Wizard')).toBeInTheDocument();
  });

  it('should render wizard description', () => {
    renderWizardForm();

    expect(screen.getByText('Complete all steps to register')).toBeInTheDocument();
  });

  it('should render current step title', () => {
    renderWizardForm();

    expect(screen.getByText('Personal Info')).toBeInTheDocument();
  });

  it('should render current step description', () => {
    renderWizardForm();

    expect(screen.getByText('Enter your personal information')).toBeInTheDocument();
  });

  it('should render navigation buttons', () => {
    renderWizardForm();

    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
  });

  it('should render keyboard shortcuts hint', () => {
    renderWizardForm();

    expect(screen.getByText(/previous/i)).toBeInTheDocument();
    expect(screen.getByText(/next/i)).toBeInTheDocument();
  });
});

// ============================================================================
// PROGRESS INDICATOR TESTS
// ============================================================================

describe('WizardForm progress indicator', () => {
  it('should render step progress when progressType is steps', () => {
    renderWizardForm({ config: { ...testConfig, progressType: 'steps' } });

    expect(screen.getByRole('navigation', { name: /wizard progress/i })).toBeInTheDocument();
  });

  it('should render bar progress when progressType is bar', () => {
    renderWizardForm({ config: { ...testConfig, progressType: 'bar' } });

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should render dots progress when progressType is dots', () => {
    renderWizardForm({ config: { ...testConfig, progressType: 'dots' } });

    // Should have 3 dot buttons
    const dots = screen.getAllByRole('button', { name: /go to step/i });
    expect(dots.length).toBe(3);
  });

  it('should not render progress when showProgress is false', () => {
    renderWizardForm({ config: { ...testConfig, showProgress: false } });

    expect(screen.queryByRole('navigation', { name: /wizard progress/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('should show step numbers in progress', () => {
    renderWizardForm({ config: { ...testConfig, progressType: 'steps' } });

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Personal Info')).toBeInTheDocument();
    expect(screen.getByText('Contact Info')).toBeInTheDocument();
    expect(screen.getByText('Security')).toBeInTheDocument();
  });
});

// ============================================================================
// NAVIGATION TESTS
// ============================================================================

describe('WizardForm navigation', () => {
  it('should disable back button on first step', () => {
    renderWizardForm();

    const backButton = screen.getByRole('button', { name: /back/i });
    expect(backButton).toBeDisabled();
  });

  it('should call goNext when clicking next button', async () => {
    renderWizardForm();

    const nextButton = screen.getByRole('button', { name: /next/i });
    await userEvent.click(nextButton);

    expect(mockGoNext).toHaveBeenCalled();
  });

  it('should call goBack when clicking back button', async () => {
    // Update mock to not be first step
    const { useEnhancedWizard } = require('@/hooks/useEnhancedWizard');
    useEnhancedWizard.mockReturnValueOnce({
      currentStep: testSteps[1],
      currentStepIndex: 1,
      visibleSteps: testSteps,
      data: testInitialData,
      updateData: mockUpdateData,
      goNext: mockGoNext,
      goBack: mockGoBack,
      goToStep: mockGoToStep,
      isFirst: false,
      isLast: false,
      isValidating: false,
      progress: 50,
      visitedSteps: new Set([0, 1]),
      submit: mockSubmit,
      errors: {},
    });

    renderWizardForm();

    const backButton = screen.getByRole('button', { name: /back/i });
    await userEvent.click(backButton);

    expect(mockGoBack).toHaveBeenCalled();
  });

  it('should call goToStep when clicking step indicator (if allowed)', async () => {
    renderWizardForm({
      config: { ...testConfig, allowStepNavigation: true, progressType: 'steps' },
    });

    const stepButtons = screen.getAllByRole('button', { name: /personal info|contact info|security/i });
    await userEvent.click(stepButtons[1]);

    expect(mockGoToStep).toHaveBeenCalledWith(1);
  });

  it('should not allow step navigation when disabled', () => {
    renderWizardForm({
      config: { ...testConfig, allowStepNavigation: false, progressType: 'dots' },
    });

    const dots = screen.getAllByRole('button', { name: /go to step/i });
    dots.forEach(dot => {
      expect(dot).toBeDisabled();
    });
  });
});

// ============================================================================
// FORM SUBMISSION TESTS
// ============================================================================

describe('WizardForm submission', () => {
  it('should show Submit button on last step', () => {
    const { useEnhancedWizard } = require('@/hooks/useEnhancedWizard');
    useEnhancedWizard.mockReturnValueOnce({
      currentStep: testSteps[2],
      currentStepIndex: 2,
      visibleSteps: testSteps,
      data: testInitialData,
      updateData: mockUpdateData,
      goNext: mockGoNext,
      goBack: mockGoBack,
      goToStep: mockGoToStep,
      isFirst: false,
      isLast: true,
      isValidating: false,
      progress: 100,
      visitedSteps: new Set([0, 1, 2]),
      submit: mockSubmit,
      errors: {},
    });

    renderWizardForm();

    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('should call submit on last step when clicking submit', async () => {
    const { useEnhancedWizard } = require('@/hooks/useEnhancedWizard');
    useEnhancedWizard.mockReturnValueOnce({
      currentStep: testSteps[2],
      currentStepIndex: 2,
      visibleSteps: testSteps,
      data: testInitialData,
      updateData: mockUpdateData,
      goNext: mockGoNext,
      goBack: mockGoBack,
      goToStep: mockGoToStep,
      isFirst: false,
      isLast: true,
      isValidating: false,
      progress: 100,
      visitedSteps: new Set([0, 1, 2]),
      submit: mockSubmit,
      errors: {},
    });

    renderWizardForm();

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await userEvent.click(submitButton);

    expect(mockSubmit).toHaveBeenCalled();
  });

  it('should show validating state', () => {
    const { useEnhancedWizard } = require('@/hooks/useEnhancedWizard');
    useEnhancedWizard.mockReturnValueOnce({
      currentStep: testSteps[0],
      currentStepIndex: 0,
      visibleSteps: testSteps,
      data: testInitialData,
      updateData: mockUpdateData,
      goNext: mockGoNext,
      goBack: mockGoBack,
      goToStep: mockGoToStep,
      isFirst: true,
      isLast: false,
      isValidating: true,
      progress: 25,
      visitedSteps: new Set([0]),
      submit: mockSubmit,
      errors: {},
    });

    renderWizardForm();

    expect(screen.getByRole('button', { name: /validating/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /validating/i })).toBeDisabled();
  });
});

// ============================================================================
// CANCEL BUTTON TESTS
// ============================================================================

describe('WizardForm cancel button', () => {
  it('should render cancel button when onCancel is provided', () => {
    const onCancel = jest.fn();
    renderWizardForm({ config: { ...testConfig, onCancel } });

    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('should not render cancel button when onCancel is not provided', () => {
    renderWizardForm();

    expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
  });

  it('should call onCancel when clicking cancel', async () => {
    const onCancel = jest.fn();
    renderWizardForm({ config: { ...testConfig, onCancel } });

    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onCancel).toHaveBeenCalled();
  });
});

// ============================================================================
// CUSTOM BUTTON TEXT TESTS
// ============================================================================

describe('WizardForm custom button text', () => {
  it('should use custom next button text from step', () => {
    const customSteps = [
      { ...testSteps[0], nextButtonText: 'Continue' },
      ...testSteps.slice(1),
    ];

    const { useEnhancedWizard } = require('@/hooks/useEnhancedWizard');
    useEnhancedWizard.mockReturnValueOnce({
      currentStep: customSteps[0],
      currentStepIndex: 0,
      visibleSteps: customSteps,
      data: testInitialData,
      updateData: mockUpdateData,
      goNext: mockGoNext,
      goBack: mockGoBack,
      goToStep: mockGoToStep,
      isFirst: true,
      isLast: false,
      isValidating: false,
      progress: 25,
      visitedSteps: new Set([0]),
      submit: mockSubmit,
      errors: {},
    });

    renderWizardForm({ config: { ...testConfig, steps: customSteps } });

    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
  });

  it('should use custom back button text from step', () => {
    const customSteps = [
      testSteps[0],
      { ...testSteps[1], backButtonText: 'Previous' },
      testSteps[2],
    ];

    const { useEnhancedWizard } = require('@/hooks/useEnhancedWizard');
    useEnhancedWizard.mockReturnValueOnce({
      currentStep: customSteps[1],
      currentStepIndex: 1,
      visibleSteps: customSteps,
      data: testInitialData,
      updateData: mockUpdateData,
      goNext: mockGoNext,
      goBack: mockGoBack,
      goToStep: mockGoToStep,
      isFirst: false,
      isLast: false,
      isValidating: false,
      progress: 50,
      visitedSteps: new Set([0, 1]),
      submit: mockSubmit,
      errors: {},
    });

    renderWizardForm({ config: { ...testConfig, steps: customSteps } });

    expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
  });
});

// ============================================================================
// STEP ICON TESTS
// ============================================================================

describe('WizardForm step icons', () => {
  it('should render step icon when provided', () => {
    const stepsWithIcon = [
      { ...testSteps[0], icon: '👤' },
      ...testSteps.slice(1),
    ];

    const { useEnhancedWizard } = require('@/hooks/useEnhancedWizard');
    useEnhancedWizard.mockReturnValueOnce({
      currentStep: stepsWithIcon[0],
      currentStepIndex: 0,
      visibleSteps: stepsWithIcon,
      data: testInitialData,
      updateData: mockUpdateData,
      goNext: mockGoNext,
      goBack: mockGoBack,
      goToStep: mockGoToStep,
      isFirst: true,
      isLast: false,
      isValidating: false,
      progress: 25,
      visitedSteps: new Set([0]),
      submit: mockSubmit,
      errors: {},
    });

    renderWizardForm({ config: { ...testConfig, steps: stepsWithIcon } });

    expect(screen.getByText('👤')).toBeInTheDocument();
  });
});

// ============================================================================
// STYLING TESTS
// ============================================================================

describe('WizardForm styling', () => {
  it('should apply custom className', () => {
    const { container } = renderWizardForm({ className: 'custom-wizard' });

    expect(container.firstChild).toHaveClass('custom-wizard');
  });

  it('should center the wizard', () => {
    const { container } = renderWizardForm();

    expect(container.firstChild).toHaveClass('mx-auto');
  });

  it('should have max-width constraint', () => {
    const { container } = renderWizardForm();

    expect(container.firstChild).toHaveClass('max-w-4xl');
  });
});

// ============================================================================
// ACCESSIBILITY TESTS
// ============================================================================

describe('WizardForm accessibility', () => {
  it('should have aria-current on current step indicator', () => {
    renderWizardForm({ config: { ...testConfig, progressType: 'dots' } });

    const currentDot = screen.getByRole('button', { name: /go to step 1/i });
    expect(currentDot).toHaveAttribute('aria-current', 'step');
  });

  it('should have proper heading hierarchy', () => {
    renderWizardForm();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toHaveTextContent('Registration Wizard');

    const h2 = screen.getByRole('heading', { level: 2 });
    expect(h2).toHaveTextContent('Personal Info');
  });

  it('should have accessible progress bar', () => {
    renderWizardForm({ config: { ...testConfig, progressType: 'bar' } });

    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '25');
    expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '100');
    expect(progressbar).toHaveAttribute('aria-label', 'Wizard progress');
  });
});

// ============================================================================
// EDGE CASES
// ============================================================================

describe('WizardForm edge cases', () => {
  it('should handle no title', () => {
    const configNoTitle = { ...testConfig, title: undefined };
    renderWizardForm({ config: configNoTitle });

    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
  });

  it('should handle no description', () => {
    const configNoDesc = { ...testConfig, description: undefined };
    renderWizardForm({ config: configNoDesc });

    expect(screen.queryByText('Complete all steps to register')).not.toBeInTheDocument();
  });

  it('should handle single step wizard', () => {
    const singleStep: WizardConfig<TestFormData> = {
      ...testConfig,
      steps: [testSteps[0]],
    };

    const { useEnhancedWizard } = require('@/hooks/useEnhancedWizard');
    useEnhancedWizard.mockReturnValueOnce({
      currentStep: testSteps[0],
      currentStepIndex: 0,
      visibleSteps: [testSteps[0]],
      data: testInitialData,
      updateData: mockUpdateData,
      goNext: mockGoNext,
      goBack: mockGoBack,
      goToStep: mockGoToStep,
      isFirst: true,
      isLast: true,
      isValidating: false,
      progress: 100,
      visitedSteps: new Set([0]),
      submit: mockSubmit,
      errors: {},
    });

    renderWizardForm({ config: singleStep });

    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /back/i })).toBeDisabled();
  });

  it('should handle empty step fields', () => {
    const emptyStep: WizardStep<TestFormData> = {
      id: 'empty',
      title: 'Empty Step',
      fields: [],
    };

    const { useEnhancedWizard } = require('@/hooks/useEnhancedWizard');
    useEnhancedWizard.mockReturnValueOnce({
      currentStep: emptyStep,
      currentStepIndex: 0,
      visibleSteps: [emptyStep],
      data: testInitialData,
      updateData: mockUpdateData,
      goNext: mockGoNext,
      goBack: mockGoBack,
      goToStep: mockGoToStep,
      isFirst: true,
      isLast: true,
      isValidating: false,
      progress: 100,
      visitedSteps: new Set([0]),
      submit: mockSubmit,
      errors: {},
    });

    renderWizardForm({ config: { ...testConfig, steps: [emptyStep] } });

    expect(screen.getByText('Empty Step')).toBeInTheDocument();
  });

  it('should handle step with no description', () => {
    const stepNoDesc: WizardStep<TestFormData> = {
      id: 'nodesc',
      title: 'No Description',
      description: undefined,
      fields: step1Fields,
    };

    const { useEnhancedWizard } = require('@/hooks/useEnhancedWizard');
    useEnhancedWizard.mockReturnValueOnce({
      currentStep: stepNoDesc,
      currentStepIndex: 0,
      visibleSteps: [stepNoDesc],
      data: testInitialData,
      updateData: mockUpdateData,
      goNext: mockGoNext,
      goBack: mockGoBack,
      goToStep: mockGoToStep,
      isFirst: true,
      isLast: true,
      isValidating: false,
      progress: 100,
      visitedSteps: new Set([0]),
      submit: mockSubmit,
      errors: {},
    });

    renderWizardForm({ config: { ...testConfig, steps: [stepNoDesc] } });

    expect(screen.getByText('No Description')).toBeInTheDocument();
  });
});
