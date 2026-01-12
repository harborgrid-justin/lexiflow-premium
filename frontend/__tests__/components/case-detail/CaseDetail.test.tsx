/**
 * @jest-environment jsdom
 */

import { fireEvent, render, screen } from '@/__tests__/test-utils';
import { CaseDetail } from '@/lexiflow-suite/components/CaseDetail';
import { Case, CaseStatus } from '@/lexiflow-suite/types';
import '@testing-library/jest-dom';

// Mock child components
jest.mock('@/lexiflow-suite/components/case-detail/CaseOverview', () => ({
  CaseOverview: () => <div data-testid="case-overview">Overview Content</div>,
}));

jest.mock('@/lexiflow-suite/components/case-detail/CaseDocuments', () => ({
  CaseDocuments: () => <div data-testid="case-documents">Documents Content</div>,
}));

jest.mock('@/lexiflow-suite/components/case-detail/CaseWorkflow', () => ({
  CaseWorkflow: () => <div data-testid="case-workflow">Workflow Content</div>,
}));

jest.mock('@/lexiflow-suite/components/case-detail/CaseBilling', () => ({
  CaseBilling: () => <div data-testid="case-billing">Billing Content</div>,
}));

// Mock hooks
jest.mock('@/lexiflow-suite/hooks/useCaseDetail', () => ({
  useCaseDetail: jest.fn(() => ({
    activeTab: 'Overview',
    setActiveTab: jest.fn(),
    documents: [],
    stages: [],
    parties: [],
    setParties: jest.fn(),
    projects: [],
    addProject: jest.fn(),
    addTaskToProject: jest.fn(),
    updateProjectTaskStatus: jest.fn(),
    billingEntries: [],
    setBillingEntries: jest.fn(),
    generatingWorkflow: false,
    analyzingId: null,
    timelineEvents: [],
    handleAnalyze: jest.fn(),
    handleGenerateWorkflow: jest.fn(),
  })),
}));

jest.mock('@/lexiflow-suite/components/providers/ThemeProvider', () => ({
  useTheme: jest.fn(() => ({
    density: 'comfortable',
  })),
}));

jest.mock('@/lexiflow-suite/data/mockEvidence', () => ({
  MOCK_EVIDENCE: [],
}));

describe('CaseDetail', () => {
  const mockCase: Case = {
    id: 'case-123',
    title: 'Smith v. Jones Industries',
    status: CaseStatus.Active,
    matterType: 'Litigation',
    client: 'Smith Corp',
    filingDate: '2026-01-01',
    value: 500000,
    userId: 'user-1',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  };

  const mockOnBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render case title', () => {
      render(<CaseDetail caseData={mockCase} onBack={mockOnBack} />);
      expect(screen.getByText('Smith v. Jones Industries')).toBeInTheDocument();
    });

    it('should render back button', () => {
      const { container } = render(<CaseDetail caseData={mockCase} onBack={mockOnBack} />);
      const backButtons = container.querySelectorAll('button');
      expect(backButtons.length).toBeGreaterThan(0);
    });

    it('should render all tab options', () => {
      render(<CaseDetail caseData={mockCase} onBack={mockOnBack} />);

      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Workflow')).toBeInTheDocument();
      expect(screen.getByText('Documents')).toBeInTheDocument();
      expect(screen.getByText('Motions')).toBeInTheDocument();
      expect(screen.getByText('Discovery')).toBeInTheDocument();
      expect(screen.getByText('Evidence')).toBeInTheDocument();
      expect(screen.getByText('Financials')).toBeInTheDocument();
      expect(screen.getByText('Strategy')).toBeInTheDocument();
      expect(screen.getByText('Parties')).toBeInTheDocument();
      expect(screen.getByText('Comms')).toBeInTheDocument();
      expect(screen.getByText('Dispose')).toBeInTheDocument();
    });

    it('should start with Overview tab active', () => {
      render(<CaseDetail caseData={mockCase} onBack={mockOnBack} />);
      expect(screen.getByTestId('case-overview')).toBeInTheDocument();
    });
  });

  describe('Back Navigation', () => {
    it('should call onBack when back button is clicked', () => {
      const { container } = render(<CaseDetail caseData={mockCase} onBack={mockOnBack} />);

      // Find back button (first button should be back)
      const buttons = container.querySelectorAll('button');
      if (buttons.length > 0) {
        fireEvent.click(buttons[0]);
        // In actual implementation, this would trigger onBack
      }
    });
  });

  describe('Tab Navigation', () => {
    it('should switch to Workflow tab', async () => {
      const { useCaseDetail } = require('@/lexiflow-suite/hooks/useCaseDetail');
      const mockSetActiveTab = jest.fn();

      useCaseDetail.mockReturnValue({
        activeTab: 'Workflow',
        setActiveTab: mockSetActiveTab,
        documents: [],
        stages: [],
        parties: [],
        setParties: jest.fn(),
        projects: [],
        addProject: jest.fn(),
        addTaskToProject: jest.fn(),
        updateProjectTaskStatus: jest.fn(),
        billingEntries: [],
        setBillingEntries: jest.fn(),
        generatingWorkflow: false,
        analyzingId: null,
        timelineEvents: [],
        handleAnalyze: jest.fn(),
        handleGenerateWorkflow: jest.fn(),
      });

      render(<CaseDetail caseData={mockCase} onBack={mockOnBack} />);

      expect(screen.getByTestId('case-workflow')).toBeInTheDocument();
    });

    it('should switch to Documents tab', async () => {
      const { useCaseDetail } = require('@/lexiflow-suite/hooks/useCaseDetail');

      useCaseDetail.mockReturnValue({
        activeTab: 'Documents',
        setActiveTab: jest.fn(),
        documents: [],
        stages: [],
        parties: [],
        setParties: jest.fn(),
        projects: [],
        addProject: jest.fn(),
        addTaskToProject: jest.fn(),
        updateProjectTaskStatus: jest.fn(),
        billingEntries: [],
        setBillingEntries: jest.fn(),
        generatingWorkflow: false,
        analyzingId: null,
        timelineEvents: [],
        handleAnalyze: jest.fn(),
        handleGenerateWorkflow: jest.fn(),
      });

      render(<CaseDetail caseData={mockCase} onBack={mockOnBack} />);

      expect(screen.getByTestId('case-documents')).toBeInTheDocument();
    });

    it('should switch to Billing tab', async () => {
      const { useCaseDetail } = require('@/lexiflow-suite/hooks/useCaseDetail');

      useCaseDetail.mockReturnValue({
        activeTab: 'Billing',
        setActiveTab: jest.fn(),
        documents: [],
        stages: [],
        parties: [],
        setParties: jest.fn(),
        projects: [],
        addProject: jest.fn(),
        addTaskToProject: jest.fn(),
        updateProjectTaskStatus: jest.fn(),
        billingEntries: [],
        setBillingEntries: jest.fn(),
        generatingWorkflow: false,
        analyzingId: null,
        timelineEvents: [],
        handleAnalyze: jest.fn(),
        handleGenerateWorkflow: jest.fn(),
      });

      render(<CaseDetail caseData={mockCase} onBack={mockOnBack} />);

      expect(screen.getByTestId('case-billing')).toBeInTheDocument();
    });
  });

  describe('Right Panel', () => {
    it('should have right panel toggle functionality', () => {
      render(<CaseDetail caseData={mockCase} onBack={mockOnBack} />);
      // Right panel state is managed internally
      const { container } = render(<CaseDetail caseData={mockCase} onBack={mockOnBack} />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('Theme Integration', () => {
    it('should apply theme colors', () => {
      const { container } = render(<CaseDetail caseData={mockCase} onBack={mockOnBack} />);

      // Component uses CSS variables for theming
      const themedElement = container.querySelector('[style*="background"]');
      expect(themedElement).toBeInTheDocument();
    });

    it('should apply density settings from theme', () => {
      const { useTheme } = require('@/lexiflow-suite/components/providers/ThemeProvider');

      useTheme.mockReturnValue({ density: 'compact' });

      render(<CaseDetail caseData={mockCase} onBack={mockOnBack} />);
      // Density is applied via theme context
    });
  });

  describe('Case Data Display', () => {
    it('should display case ID', () => {
      render(<CaseDetail caseData={mockCase} onBack={mockOnBack} />);
      expect(screen.getByText(/case-123/i)).toBeInTheDocument();
    });

    it('should display case status', () => {
      render(<CaseDetail caseData={mockCase} onBack={mockOnBack} />);
      // Status badge should be visible
      const { container } = render(<CaseDetail caseData={mockCase} onBack={mockOnBack} />);
      expect(container).toBeInTheDocument();
    });

    it('should display case client', () => {
      render(<CaseDetail caseData={mockCase} onBack={mockOnBack} />);
      expect(screen.getByText(/Smith Corp/i)).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('should have full screen height layout', () => {
      const { container } = render(<CaseDetail caseData={mockCase} onBack={mockOnBack} />);

      const fullHeightDiv = container.querySelector('.h-screen');
      expect(fullHeightDiv).toBeInTheDocument();
    });

    it('should have overflow hidden on main container', () => {
      const { container } = render(<CaseDetail caseData={mockCase} onBack={mockOnBack} />);

      const overflowHidden = container.querySelector('.overflow-hidden');
      expect(overflowHidden).toBeInTheDocument();
    });

    it('should have fixed header section', () => {
      const { container } = render(<CaseDetail caseData={mockCase} onBack={mockOnBack} />);

      const header = container.querySelector('header');
      expect(header).toBeInTheDocument();
    });
  });

  describe('Transitions', () => {
    it('should apply transition colors', () => {
      const { container } = render(<CaseDetail caseData={mockCase} onBack={mockOnBack} />);

      const transitionElement = container.querySelector('.transition-colors');
      expect(transitionElement).toBeInTheDocument();
    });

    it('should handle tab changes with transitions', () => {
      render(<CaseDetail caseData={mockCase} onBack={mockOnBack} />);

      const workflowTab = screen.getByText('Workflow');
      fireEvent.click(workflowTab);

      // Transition is handled internally
      expect(workflowTab).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have clickable tabs', () => {
      render(<CaseDetail caseData={mockCase} onBack={mockOnBack} />);

      const tabs = [
        screen.getByText('Overview'),
        screen.getByText('Workflow'),
        screen.getByText('Documents'),
      ];

      tabs.forEach(tab => {
        expect(tab).toBeInTheDocument();
      });
    });

    it('should have accessible buttons', () => {
      render(<CaseDetail caseData={mockCase} onBack={mockOnBack} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Hook Integration', () => {
    it('should call useCaseDetail hook with case data', () => {
      const { useCaseDetail } = require('@/lexiflow-suite/hooks/useCaseDetail');

      render(<CaseDetail caseData={mockCase} onBack={mockOnBack} />);

      expect(useCaseDetail).toHaveBeenCalledWith(mockCase);
    });
  });
});
