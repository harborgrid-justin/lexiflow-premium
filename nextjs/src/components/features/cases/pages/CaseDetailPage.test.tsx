/**
 * CaseDetailPage Component Tests
 * Enterprise-grade test suite for case detail tabbed interface
 *
 * @module components/features/cases/pages/CaseDetailPage.test
 */

import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CaseDetail } from './CaseDetailPage';
import type { Case } from '@/types';
import { CaseStatus, MatterPriority } from '@/types';

// Mock the useTheme hook
jest.mock('@/providers', () => ({
  useTheme: () => ({
    theme: {
      surface: { default: 'bg-white', highlight: 'bg-blue-50' },
      text: { primary: 'text-gray-900', secondary: 'text-gray-700', tertiary: 'text-gray-500' },
      border: { default: 'border-gray-200', subtle: 'border-gray-100' },
      backdrop: 'bg-gray-500/50',
      action: {
        primary: { bg: 'bg-blue-600', text: 'text-white', hover: 'hover:bg-blue-700' },
      },
    },
  }),
}));

// Mock the useCaseDetail hook
const mockSetActiveTab = jest.fn();
const mockAddProject = jest.fn();
const mockAddTaskToProject = jest.fn();
const mockUpdateProjectTaskStatus = jest.fn();
const mockAnalyzeWithAI = jest.fn();
const mockDraftDocument = jest.fn();
const mockGenerateAIWorkflow = jest.fn();

jest.mock('@/hooks/useCaseDetail', () => ({
  useCaseDetail: () => ({
    activeTab: 'Overview',
    setActiveTab: mockSetActiveTab,
    documents: [],
    setDocuments: jest.fn(),
    stages: [],
    parties: [],
    setParties: jest.fn(),
    projects: [],
    addProject: mockAddProject,
    addTaskToProject: mockAddTaskToProject,
    updateProjectTaskStatus: mockUpdateProjectTaskStatus,
    billingEntries: [],
    setBillingEntries: jest.fn(),
    generatingWorkflow: false,
    analyzingId: null,
    draftPrompt: '',
    setDraftPrompt: jest.fn(),
    draftResult: null,
    isDrafting: false,
    timelineEvents: [],
    analyzeWithAI: mockAnalyzeWithAI,
    draftDocument: mockDraftDocument,
    generateAIWorkflow: mockGenerateAIWorkflow,
  }),
}));

// Mock tab content components
jest.mock('@/features/cases/components/detail/overview/CaseOverview', () => ({
  CaseOverview: () => <div data-testid="case-overview">Case Overview Content</div>,
}));

jest.mock('@/features/cases/components/detail/CaseParties', () => ({
  CaseParties: () => <div data-testid="case-parties">Case Parties Content</div>,
}));

jest.mock('@/features/cases/components/detail/CaseTimeline', () => ({
  CaseTimeline: () => <div data-testid="case-timeline">Case Timeline Content</div>,
}));

jest.mock('@/features/cases/components/detail/CaseDocuments', () => ({
  CaseDocuments: () => <div data-testid="case-documents">Case Documents Content</div>,
}));

jest.mock('@/features/cases/components/detail/CaseDetailHeader', () => ({
  CaseDetailHeader: ({ title, onBack, onShowTimeline }: any) => (
    <header data-testid="case-detail-header">
      <h1>{title}</h1>
      <button onClick={onBack}>Back</button>
      <button onClick={onShowTimeline}>Show Timeline</button>
    </header>
  ),
}));

jest.mock('@/features/cases/components/detail/layout/CaseDetailNavigation', () => ({
  CaseDetailNavigation: ({ activeTab, setActiveTab }: any) => (
    <nav data-testid="case-detail-navigation">
      <button onClick={() => setActiveTab('Overview')}>Overview</button>
      <button onClick={() => setActiveTab('Parties')}>Parties</button>
      <button onClick={() => setActiveTab('Timeline')}>Timeline</button>
      <button onClick={() => setActiveTab('Documents')}>Documents</button>
      <span data-testid="active-tab">{activeTab}</span>
    </nav>
  ),
}));

jest.mock('@/features/cases/components/detail/CaseDetailMobileMenu', () => ({
  CaseDetailMobileMenu: ({ isOpen, onClose }: any) => (
    isOpen ? <div data-testid="mobile-menu"><button onClick={onClose}>Close</button></div> : null
  ),
}));

jest.mock('@/features/cases/components/detail/MobileTimelineOverlay', () => ({
  MobileTimelineOverlay: ({ isOpen, onClose }: any) => (
    isOpen ? <div data-testid="timeline-overlay"><button onClick={onClose}>Close</button></div> : null
  ),
}));

// Mock other tab components
jest.mock('@/features/cases/components/detail/CaseStrategy', () => ({
  CaseStrategy: () => <div data-testid="case-strategy">Strategy</div>,
}));

jest.mock('@/features/cases/components/detail/CaseArgumentManager', () => ({
  CaseArgumentManager: () => <div data-testid="case-arguments">Arguments</div>,
}));

jest.mock('@/features/cases/components/detail/CaseRiskManager', () => ({
  CaseRiskManager: () => <div data-testid="case-risk">Risk</div>,
}));

jest.mock('@/features/cases/components/detail/CasePlanning', () => ({
  CasePlanning: () => <div data-testid="case-planning">Planning</div>,
}));

jest.mock('@/features/cases/components/detail/projects/CaseProjects', () => ({
  CaseProjects: () => <div data-testid="case-projects">Projects</div>,
}));

jest.mock('@/features/cases/components/detail/CaseWorkflow', () => ({
  CaseWorkflow: () => <div data-testid="case-workflow">Workflow</div>,
}));

jest.mock('@/features/cases/components/detail/collaboration/CaseCollaboration', () => ({
  CaseCollaboration: () => <div data-testid="case-collaboration">Collaboration</div>,
}));

jest.mock('@/features/cases/components/detail/motions/CaseMotions', () => ({
  CaseMotions: () => <div data-testid="case-motions">Motions</div>,
}));

jest.mock('@/features/cases/components/detail/CaseDiscovery', () => ({
  CaseDiscovery: () => <div data-testid="case-discovery">Discovery</div>,
}));

jest.mock('@/features/cases/components/detail/CaseEvidence', () => ({
  CaseEvidence: () => <div data-testid="case-evidence">Evidence</div>,
}));

jest.mock('@/features/cases/components/detail/CaseDrafting', () => ({
  CaseDrafting: () => <div data-testid="case-drafting">Drafting</div>,
}));

jest.mock('@/features/cases/components/detail/CaseContractReview', () => ({
  CaseContractReview: () => <div data-testid="case-contract-review">Contract Review</div>,
}));

jest.mock('@/features/cases/components/detail/CaseBilling', () => ({
  CaseBilling: () => <div data-testid="case-billing">Billing</div>,
}));

describe('CaseDetail', () => {
  const mockCaseData: Case = {
    id: 'case-123',
    title: 'Smith v. Johnson',
    caseNumber: 'CV-2024-001234',
    status: CaseStatus.Active,
    priority: MatterPriority.HIGH,
    description: 'Commercial litigation dispute',
    client: 'Acme Corporation',
    clientId: 'client-456',
    jurisdiction: 'California',
    billingModel: 'Hourly',
    billingValue: 75000,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-20',
  };

  const defaultProps = {
    caseData: mockCaseData,
    onBack: jest.fn(),
    onSelectCase: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the case detail header', () => {
      render(<CaseDetail {...defaultProps} />);

      expect(screen.getByTestId('case-detail-header')).toBeInTheDocument();
    });

    it('should render the case title in header', () => {
      render(<CaseDetail {...defaultProps} />);

      expect(screen.getByText('Smith v. Johnson')).toBeInTheDocument();
    });

    it('should render the navigation', () => {
      render(<CaseDetail {...defaultProps} />);

      expect(screen.getByTestId('case-detail-navigation')).toBeInTheDocument();
    });

    it('should render tab content area', () => {
      render(<CaseDetail {...defaultProps} />);

      expect(screen.getByTestId('case-overview')).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    it('should show Overview tab by default', () => {
      render(<CaseDetail {...defaultProps} />);

      expect(screen.getByTestId('active-tab')).toHaveTextContent('Overview');
    });

    it('should accept initialTab prop', () => {
      render(<CaseDetail {...defaultProps} initialTab="Documents" />);

      // Tab is passed to useCaseDetail which initializes activeTab
      expect(screen.getByTestId('case-detail-navigation')).toBeInTheDocument();
    });

    it('should change tab when navigation item is clicked', async () => {
      const user = userEvent.setup();
      render(<CaseDetail {...defaultProps} />);

      await user.click(screen.getByText('Parties'));

      expect(mockSetActiveTab).toHaveBeenCalledWith('Parties');
    });

    it('should render all navigation options', () => {
      render(<CaseDetail {...defaultProps} />);

      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Parties')).toBeInTheDocument();
      expect(screen.getByText('Timeline')).toBeInTheDocument();
      expect(screen.getByText('Documents')).toBeInTheDocument();
    });
  });

  describe('Back Navigation', () => {
    it('should call onBack when back button is clicked', async () => {
      const user = userEvent.setup();
      render(<CaseDetail {...defaultProps} />);

      await user.click(screen.getByText('Back'));

      expect(defaultProps.onBack).toHaveBeenCalled();
    });

    it('should handle missing onBack gracefully', () => {
      const propsWithoutOnBack = { ...defaultProps, onBack: undefined };
      render(<CaseDetail {...propsWithoutOnBack} />);

      expect(screen.getByText('Back')).toBeInTheDocument();
    });
  });

  describe('Mobile Menu', () => {
    it('should show mobile menu when FAB is clicked', async () => {
      const user = userEvent.setup();
      render(<CaseDetail {...defaultProps} />);

      const fab = screen.getByRole('button', { name: /Open quick actions menu/i });
      await user.click(fab);

      expect(screen.getByTestId('mobile-menu')).toBeInTheDocument();
    });

    it('should close mobile menu when close button is clicked', async () => {
      const user = userEvent.setup();
      render(<CaseDetail {...defaultProps} />);

      const fab = screen.getByRole('button', { name: /Open quick actions menu/i });
      await user.click(fab);

      expect(screen.getByTestId('mobile-menu')).toBeInTheDocument();

      await user.click(screen.getByText('Close'));

      expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument();
    });
  });

  describe('Timeline Overlay', () => {
    it('should show timeline overlay when Show Timeline is clicked', async () => {
      const user = userEvent.setup();
      render(<CaseDetail {...defaultProps} />);

      await user.click(screen.getByText('Show Timeline'));

      expect(screen.getByTestId('timeline-overlay')).toBeInTheDocument();
    });

    it('should close timeline overlay when close button is clicked', async () => {
      const user = userEvent.setup();
      render(<CaseDetail {...defaultProps} />);

      await user.click(screen.getByText('Show Timeline'));
      expect(screen.getByTestId('timeline-overlay')).toBeInTheDocument();

      await user.click(screen.getByText('Close'));
      expect(screen.queryByTestId('timeline-overlay')).not.toBeInTheDocument();
    });
  });

  describe('Floating Action Button', () => {
    it('should render FAB for mobile', () => {
      render(<CaseDetail {...defaultProps} />);

      const fab = screen.getByRole('button', { name: /Open quick actions menu/i });
      expect(fab).toBeInTheDocument();
    });

    it('should have md:hidden class for responsive hiding', () => {
      render(<CaseDetail {...defaultProps} />);

      const fab = screen.getByRole('button', { name: /Open quick actions menu/i });
      expect(fab).toHaveClass('md:hidden');
    });

    it('should have proper accessibility attributes', () => {
      render(<CaseDetail {...defaultProps} />);

      const fab = screen.getByRole('button', { name: /Open quick actions menu/i });
      expect(fab).toHaveAttribute('title', 'Quick Actions Menu');
      expect(fab).toHaveAttribute('aria-label');
    });
  });

  describe('Pre-loaded Data', () => {
    it('should accept initialDocuments prop', () => {
      const mockDocuments = [{ id: 'doc-1', title: 'Test Document' }];
      render(<CaseDetail {...defaultProps} initialDocuments={mockDocuments as any} />);

      expect(screen.getByTestId('case-detail-header')).toBeInTheDocument();
    });

    it('should accept initialParties prop', () => {
      const mockParties = [{ id: 'party-1', name: 'Test Party' }];
      render(<CaseDetail {...defaultProps} initialParties={mockParties as any} />);

      expect(screen.getByTestId('case-detail-header')).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('should have full height layout', () => {
      const { container } = render(<CaseDetail {...defaultProps} />);

      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('h-full', 'flex', 'flex-col');
    });

    it('should have scrollable content area', () => {
      const { container } = render(<CaseDetail {...defaultProps} />);

      const contentArea = container.querySelector('.flex-1.overflow-y-auto');
      expect(contentArea).toBeInTheDocument();
    });

    it('should constrain content width', () => {
      const { container } = render(<CaseDetail {...defaultProps} />);

      const maxWidthContainer = container.querySelector('.max-w-7xl');
      expect(maxWidthContainer).toBeInTheDocument();
    });
  });

  describe('Theme Integration', () => {
    it('should use theme surface class', () => {
      const { container } = render(<CaseDetail {...defaultProps} />);

      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('bg-white');
    });
  });

  describe('Export Default', () => {
    it('should have default export', () => {
      expect(CaseDetail).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle minimal case data', () => {
      const minimalCase: Case = {
        id: 'min-case',
        title: 'Minimal Case',
        status: CaseStatus.Active,
        priority: MatterPriority.LOW,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      render(<CaseDetail caseData={minimalCase} />);

      expect(screen.getByText('Minimal Case')).toBeInTheDocument();
    });

    it('should handle case without clientId', () => {
      const caseWithoutClientId = { ...mockCaseData, clientId: undefined };
      render(<CaseDetail caseData={caseWithoutClientId} />);

      expect(screen.getByTestId('case-detail-header')).toBeInTheDocument();
    });

    it('should handle case without billing information', () => {
      const caseWithoutBilling = {
        ...mockCaseData,
        billingModel: undefined,
        billingValue: undefined,
      };
      render(<CaseDetail caseData={caseWithoutBilling} />);

      expect(screen.getByTestId('case-detail-header')).toBeInTheDocument();
    });
  });
});
