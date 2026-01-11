/**
 * @fileoverview Enterprise-grade test suite for DraftingDashboard component
 * @module features/drafting/__tests__/DraftingDashboard.test
 *
 * Tests cover:
 * - Initial rendering and loading state
 * - Tab navigation and view switching
 * - Data fetching and error handling
 * - Template and draft interactions
 * - Editor view transitions
 * - Theme integration
 * - Accessibility compliance
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DraftingDashboard from '../DraftingDashboard';
import type {
  DraftingTemplate,
  GeneratedDocument,
  DraftingStats,
} from '@api/domains/drafting.api';

// ============================================================================
// MOCK SETUP
// ============================================================================

// Mock theme
const mockTheme = {
  background: 'bg-white',
  surface: { default: 'bg-white' },
  border: { default: 'border-gray-200' },
  text: {
    primary: 'text-gray-900',
    secondary: 'text-gray-600',
    link: 'text-blue-600',
  },
  primary: { text: 'text-blue-600' },
  action: {
    primary: { bg: 'bg-blue-600', text: 'text-white', hover: 'hover:bg-blue-700' },
    secondary: {
      bg: 'bg-gray-100',
      text: 'text-gray-900',
      border: 'border-gray-200',
      hover: 'hover:bg-gray-200',
    },
  },
  status: {
    success: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
    warning: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
    info: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  },
};

const mockAddToast = jest.fn();

// Mock providers
jest.mock('@providers/ThemeContext', () => ({
  useTheme: () => ({ theme: mockTheme }),
}));

jest.mock('@providers/ToastContext', () => ({
  useToast: () => ({ addToast: mockAddToast }),
}));

// Mock API
const mockDraftingApi = {
  getRecentDrafts: jest.fn(),
  getTemplates: jest.fn(),
  getPendingApprovals: jest.fn(),
  getStats: jest.fn(),
};

jest.mock('@api/domains/drafting.api', () => ({
  draftingApi: {
    getRecentDrafts: () => mockDraftingApi.getRecentDrafts(),
    getTemplates: () => mockDraftingApi.getTemplates(),
    getPendingApprovals: () => mockDraftingApi.getPendingApprovals(),
    getStats: () => mockDraftingApi.getStats(),
  },
}));

// Mock components
jest.mock('@/components/organisms/PageHeader/PageHeader', () => ({
  PageHeader: ({
    title,
    subtitle,
    actions,
  }: {
    title: string;
    subtitle: string;
    actions: React.ReactNode;
  }) => (
    <div data-testid="page-header">
      <h1>{title}</h1>
      <p>{subtitle}</p>
      <div data-testid="header-actions">{actions}</div>
    </div>
  ),
}));

jest.mock('@/components/organisms/TabNavigation/TabNavigation', () => ({
  TabNavigation: ({
    tabs,
    activeTab,
    onTabChange,
  }: {
    tabs: { id: string; label: string }[];
    activeTab: string;
    onTabChange: (id: string) => void;
  }) => (
    <div data-testid="tab-navigation">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          data-testid={`tab-${tab.id}`}
          data-active={tab.id === activeTab}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  ),
}));

jest.mock('@/utils/cn', () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(' '),
}));

// Mock child components
import type { GeneratedDocument as MockDocument } from '@api/domains/drafting.api';

jest.mock('../components/ApprovalQueue', () => ({
  ApprovalQueue: ({
    approvals,
    onReview,
  }: {
    approvals: MockDocument[];
    onReview: (doc: MockDocument) => void;
  }) => (
    <div data-testid="approval-queue">
      {approvals.map((a) => (
        <button key={a.id} onClick={() => onReview(a)} data-testid={`review-${a.id}`}>
          Review {a.title}
        </button>
      ))}
    </div>
  ),
}));

jest.mock('../components/DraftingStats', () => ({
  DraftingStats: ({ stats }: { stats: DraftingStats }) => (
    <div data-testid="drafting-stats">
      <span data-testid="drafts-count">{stats.drafts}</span>
      <span data-testid="templates-count">{stats.templates}</span>
    </div>
  ),
}));

jest.mock('../components/RecentDrafts', () => ({
  RecentDrafts: ({
    drafts,
    onSelect,
  }: {
    drafts: MockDocument[];
    onSelect: (draft: MockDocument) => void;
  }) => (
    <div data-testid="recent-drafts">
      {drafts.map((d) => (
        <button key={d.id} onClick={() => onSelect(d)} data-testid={`draft-${d.id}`}>
          {d.title}
        </button>
      ))}
    </div>
  ),
}));

jest.mock('../components/TemplateGallery', () => ({
  TemplateGallery: ({
    templates,
    onSelect,
    onEdit,
  }: {
    templates: DraftingTemplate[];
    onSelect: (template: DraftingTemplate) => void;
    onEdit: (template: DraftingTemplate) => void;
  }) => (
    <div data-testid="template-gallery">
      {templates.map((t) => (
        <div key={t.id}>
          <button onClick={() => onSelect(t)} data-testid={`select-template-${t.id}`}>
            Select {t.name}
          </button>
          <button onClick={() => onEdit(t)} data-testid={`edit-template-${t.id}`}>
            Edit {t.name}
          </button>
        </div>
      ))}
    </div>
  ),
}));

jest.mock('../components/TemplateEditor', () => ({
  TemplateEditor: ({
    template,
    onSave,
    onCancel,
  }: {
    template?: unknown;
    onSave: () => void;
    onCancel: () => void;
  }) => (
    <div data-testid="template-editor">
      <span>{template ? `Editing: ${template.name}` : 'New Template'}</span>
      <button onClick={onSave} data-testid="save-template">
        Save
      </button>
      <button onClick={onCancel} data-testid="cancel-template">
        Cancel
      </button>
    </div>
  ),
}));

jest.mock('../components/DocumentGenerator', () => ({
  DocumentGenerator: ({
    templateId,
    onComplete,
    onCancel,
  }: {
    templateId?: string;
    onComplete: () => void;
    onCancel: () => void;
  }) => (
    <div data-testid="document-generator">
      <span>{templateId ? `Template: ${templateId}` : 'No template'}</span>
      <button onClick={onComplete} data-testid="complete-generation">
        Complete
      </button>
      <button onClick={onCancel} data-testid="cancel-generation">
        Cancel
      </button>
    </div>
  ),
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  BarChart3: () => <span data-testid="icon-bar-chart" />,
  Clock: () => <span data-testid="icon-clock" />,
  FileText: () => <span data-testid="icon-file-text" />,
  FolderOpen: () => <span data-testid="icon-folder-open" />,
  Plus: () => <span data-testid="icon-plus" />,
}));

// ============================================================================
// TEST FIXTURES
// ============================================================================

const createMockTemplate = (id: string, name = 'Test Template'): DraftingTemplate => ({
  id,
  name,
  description: 'A test template',
  category: 'Motions',
  content: 'Template content',
  variables: ['case_name'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: 'user-1',
  isPublic: true,
});

const createMockDocument = (
  id: string,
  title = 'Test Document'
): GeneratedDocument => ({
  id,
  title,
  templateId: 'template-1',
  templateName: 'Motion Template',
  status: 'draft',
  content: 'Document content',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: 'user-1',
});

const createMockStats = (): DraftingStats => ({
  drafts: 24,
  templates: 12,
  pendingReviews: 5,
  myTemplates: 8,
});

const setupSuccessfulMocks = () => {
  mockDraftingApi.getRecentDrafts.mockResolvedValue([
    createMockDocument('doc-1', 'Draft 1'),
    createMockDocument('doc-2', 'Draft 2'),
  ]);
  mockDraftingApi.getTemplates.mockResolvedValue([
    createMockTemplate('tmpl-1', 'Template 1'),
    createMockTemplate('tmpl-2', 'Template 2'),
  ]);
  mockDraftingApi.getPendingApprovals.mockResolvedValue([
    { ...createMockDocument('approval-1', 'Approval 1'), status: 'review' },
  ]);
  mockDraftingApi.getStats.mockResolvedValue(createMockStats());
};

// ============================================================================
// TEST SUITES
// ============================================================================

describe('DraftingDashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupSuccessfulMocks();
  });

  // ==========================================================================
  // LOADING STATE TESTS
  // ==========================================================================

  describe('Loading State', () => {
    it('should show loading spinner while fetching data', async () => {
      // Delay API responses
      mockDraftingApi.getRecentDrafts.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve([]), 100))
      );
      mockDraftingApi.getTemplates.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve([]), 100))
      );
      mockDraftingApi.getPendingApprovals.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve([]), 100))
      );
      mockDraftingApi.getStats.mockImplementation(
        () =>
          new Promise((resolve) => setTimeout(() => resolve(createMockStats()), 100))
      );

      render(<DraftingDashboard />);

      // Should show loading spinner
      expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('should hide loading spinner after data loads', async () => {
      render(<DraftingDashboard />);

      await waitFor(() => {
        expect(document.querySelector('.animate-spin')).not.toBeInTheDocument();
      });
    });
  });

  // ==========================================================================
  // HEADER TESTS
  // ==========================================================================

  describe('Header', () => {
    it('should render page header with correct title', async () => {
      render(<DraftingDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Drafting & Assembly')).toBeInTheDocument();
      });
    });

    it('should render page header with correct subtitle', async () => {
      render(<DraftingDashboard />);

      await waitFor(() => {
        expect(
          screen.getByText(/enterprise document automation/i)
        ).toBeInTheDocument();
      });
    });

    it('should render New Template button', async () => {
      render(<DraftingDashboard />);

      await waitFor(() => {
        expect(screen.getByText('New Template')).toBeInTheDocument();
      });
    });

    it('should render Generate Document button', async () => {
      render(<DraftingDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Generate Document')).toBeInTheDocument();
      });
    });
  });

  // ==========================================================================
  // TAB NAVIGATION TESTS
  // ==========================================================================

  describe('Tab Navigation', () => {
    it('should render all tabs', async () => {
      render(<DraftingDashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('tab-overview')).toBeInTheDocument();
        expect(screen.getByTestId('tab-recent')).toBeInTheDocument();
        expect(screen.getByTestId('tab-templates')).toBeInTheDocument();
        expect(screen.getByTestId('tab-approvals')).toBeInTheDocument();
      });
    });

    it('should start with overview tab active', async () => {
      render(<DraftingDashboard />);

      await waitFor(() => {
        const overviewTab = screen.getByTestId('tab-overview');
        expect(overviewTab).toHaveAttribute('data-active', 'true');
      });
    });

    it('should switch to recent tab when clicked', async () => {
      const user = userEvent.setup();
      render(<DraftingDashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('tab-recent')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('tab-recent'));

      expect(screen.getByTestId('tab-recent')).toHaveAttribute('data-active', 'true');
    });

    it('should switch to templates tab when clicked', async () => {
      const user = userEvent.setup();
      render(<DraftingDashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('tab-templates')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('tab-templates'));

      expect(screen.getByTestId('tab-templates')).toHaveAttribute('data-active', 'true');
    });

    it('should switch to approvals tab when clicked', async () => {
      const user = userEvent.setup();
      render(<DraftingDashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('tab-approvals')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('tab-approvals'));

      expect(screen.getByTestId('tab-approvals')).toHaveAttribute('data-active', 'true');
    });
  });

  // ==========================================================================
  // OVERVIEW TAB TESTS
  // ==========================================================================

  describe('Overview Tab', () => {
    it('should render DraftingStats component', async () => {
      render(<DraftingDashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('drafting-stats')).toBeInTheDocument();
      });
    });

    it('should render RecentDrafts component', async () => {
      render(<DraftingDashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('recent-drafts')).toBeInTheDocument();
      });
    });

    it('should render TemplateGallery component', async () => {
      render(<DraftingDashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('template-gallery')).toBeInTheDocument();
      });
    });

    it('should render ApprovalQueue component', async () => {
      render(<DraftingDashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('approval-queue')).toBeInTheDocument();
      });
    });

    it('should display correct stats values', async () => {
      render(<DraftingDashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('drafts-count')).toHaveTextContent('24');
        expect(screen.getByTestId('templates-count')).toHaveTextContent('12');
      });
    });

    it('should render View All link for recent drafts', async () => {
      render(<DraftingDashboard />);

      await waitFor(() => {
        expect(screen.getByText('View All')).toBeInTheDocument();
      });
    });

    it('should render Browse All link for templates', async () => {
      render(<DraftingDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Browse All')).toBeInTheDocument();
      });
    });

    it('should render Quick Tips section', async () => {
      render(<DraftingDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Quick Tips')).toBeInTheDocument();
      });
    });

    it('should render Integration Points section', async () => {
      render(<DraftingDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Integration Points')).toBeInTheDocument();
      });
    });
  });

  // ==========================================================================
  // EDITOR VIEW TESTS
  // ==========================================================================

  describe('Editor Views', () => {
    describe('Template Editor', () => {
      it('should open template editor when New Template is clicked', async () => {
        const user = userEvent.setup();
        render(<DraftingDashboard />);

        await waitFor(() => {
          expect(screen.getByText('New Template')).toBeInTheDocument();
        });

        await user.click(screen.getByText('New Template'));

        expect(screen.getByTestId('template-editor')).toBeInTheDocument();
        expect(screen.getByText('New Template')).toBeInTheDocument();
      });

      it('should open template editor with template when Edit is clicked', async () => {
        const user = userEvent.setup();
        render(<DraftingDashboard />);

        await waitFor(() => {
          expect(screen.getByTestId('edit-template-tmpl-1')).toBeInTheDocument();
        });

        await user.click(screen.getByTestId('edit-template-tmpl-1'));

        expect(screen.getByTestId('template-editor')).toBeInTheDocument();
        expect(screen.getByText('Editing: Template 1')).toBeInTheDocument();
      });

      it('should close template editor when Cancel is clicked', async () => {
        const user = userEvent.setup();
        render(<DraftingDashboard />);

        await waitFor(() => {
          expect(screen.getByText('New Template')).toBeInTheDocument();
        });

        await user.click(screen.getByText('New Template'));
        expect(screen.getByTestId('template-editor')).toBeInTheDocument();

        await user.click(screen.getByTestId('cancel-template'));

        await waitFor(() => {
          expect(screen.queryByTestId('template-editor')).not.toBeInTheDocument();
        });
      });

      it('should show success toast and close editor when Save is clicked', async () => {
        const user = userEvent.setup();
        render(<DraftingDashboard />);

        await waitFor(() => {
          expect(screen.getByText('New Template')).toBeInTheDocument();
        });

        await user.click(screen.getByText('New Template'));
        await user.click(screen.getByTestId('save-template'));

        expect(mockAddToast).toHaveBeenCalledWith(
          'Template saved successfully',
          'success'
        );
      });
    });

    describe('Document Generator', () => {
      it('should open document generator when Generate Document is clicked', async () => {
        const user = userEvent.setup();
        render(<DraftingDashboard />);

        await waitFor(() => {
          expect(screen.getByText('Generate Document')).toBeInTheDocument();
        });

        await user.click(screen.getByText('Generate Document'));

        expect(screen.getByTestId('document-generator')).toBeInTheDocument();
      });

      it('should open document generator with template when Select is clicked', async () => {
        const user = userEvent.setup();
        render(<DraftingDashboard />);

        await waitFor(() => {
          expect(screen.getByTestId('select-template-tmpl-1')).toBeInTheDocument();
        });

        await user.click(screen.getByTestId('select-template-tmpl-1'));

        expect(screen.getByTestId('document-generator')).toBeInTheDocument();
        expect(screen.getByText('Template: tmpl-1')).toBeInTheDocument();
      });

      it('should close document generator when Cancel is clicked', async () => {
        const user = userEvent.setup();
        render(<DraftingDashboard />);

        await waitFor(() => {
          expect(screen.getByText('Generate Document')).toBeInTheDocument();
        });

        await user.click(screen.getByText('Generate Document'));
        expect(screen.getByTestId('document-generator')).toBeInTheDocument();

        await user.click(screen.getByTestId('cancel-generation'));

        await waitFor(() => {
          expect(screen.queryByTestId('document-generator')).not.toBeInTheDocument();
        });
      });

      it('should show success toast when generation completes', async () => {
        const user = userEvent.setup();
        render(<DraftingDashboard />);

        await waitFor(() => {
          expect(screen.getByText('Generate Document')).toBeInTheDocument();
        });

        await user.click(screen.getByText('Generate Document'));
        await user.click(screen.getByTestId('complete-generation'));

        expect(mockAddToast).toHaveBeenCalledWith(
          'Document generated successfully',
          'success'
        );
      });
    });
  });

  // ==========================================================================
  // DATA INTERACTIONS TESTS
  // ==========================================================================

  describe('Data Interactions', () => {
    it('should show toast when draft is selected', async () => {
      const user = userEvent.setup();
      render(<DraftingDashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('draft-doc-1')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('draft-doc-1'));

      expect(mockAddToast).toHaveBeenCalledWith('Opening draft: Draft 1', 'info');
    });

    it('should show toast when approval is reviewed', async () => {
      const user = userEvent.setup();
      render(<DraftingDashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('review-approval-1')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('review-approval-1'));

      expect(mockAddToast).toHaveBeenCalledWith('Reviewing: Approval 1', 'info');
    });
  });

  // ==========================================================================
  // ERROR HANDLING TESTS
  // ==========================================================================

  describe('Error Handling', () => {
    it('should show error toast when API fails', async () => {
      mockDraftingApi.getRecentDrafts.mockRejectedValue(new Error('API Error'));
      mockDraftingApi.getTemplates.mockRejectedValue(new Error('API Error'));
      mockDraftingApi.getPendingApprovals.mockRejectedValue(new Error('API Error'));
      mockDraftingApi.getStats.mockRejectedValue(new Error('API Error'));

      render(<DraftingDashboard />);

      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalledWith(
          'Failed to load dashboard data',
          'error'
        );
      });
    });

    it('should handle empty data gracefully', async () => {
      mockDraftingApi.getRecentDrafts.mockResolvedValue([]);
      mockDraftingApi.getTemplates.mockResolvedValue([]);
      mockDraftingApi.getPendingApprovals.mockResolvedValue([]);
      mockDraftingApi.getStats.mockResolvedValue({
        drafts: 0,
        templates: 0,
        pendingReviews: 0,
        myTemplates: 0,
      });

      render(<DraftingDashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('drafts-count')).toHaveTextContent('0');
      });
    });
  });

  // ==========================================================================
  // ACCESSIBILITY TESTS
  // ==========================================================================

  describe('Accessibility', () => {
    it('should have accessible page heading', async () => {
      render(<DraftingDashboard />);

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /drafting & assembly/i })
        ).toBeInTheDocument();
      });
    });

    it('should have accessible tab buttons', async () => {
      render(<DraftingDashboard />);

      await waitFor(() => {
        const tabs = screen.getAllByRole('button');
        tabs.forEach((tab) => {
          expect(tab).toHaveAccessibleName();
        });
      });
    });

    it('should have accessible action buttons', async () => {
      render(<DraftingDashboard />);

      await waitFor(() => {
        expect(screen.getByText('New Template')).toBeInTheDocument();
        expect(screen.getByText('Generate Document')).toBeInTheDocument();
      });
    });
  });

  // ==========================================================================
  // SNAPSHOT TESTS
  // ==========================================================================

  describe('Snapshots', () => {
    it('should match snapshot for overview tab', async () => {
      const { container } = render(<DraftingDashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('drafting-stats')).toBeInTheDocument();
      });

      expect(container).toMatchSnapshot();
    });
  });
});
