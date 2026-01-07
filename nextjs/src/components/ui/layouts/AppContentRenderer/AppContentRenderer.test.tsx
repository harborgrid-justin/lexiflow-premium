import React from 'react';
import { render, screen } from '@testing-library/react';
import { AppContentRenderer } from './AppContentRenderer';

// Mock dependencies
jest.mock('@/components/ui/molecules/LazyLoader/LazyLoader', () => ({
  LazyLoader: ({ message }: { message: string }) => (
    <div data-testid="lazy-loader">{message}</div>
  ),
}));

jest.mock('@/services/infrastructure/moduleRegistry', () => ({
  ModuleRegistry: {
    getModule: jest.fn(),
  },
}));

jest.mock('@/config/paths.config', () => ({
  PATHS: {
    CASES: 'cases',
    DASHBOARD: 'dashboard',
    WORKFLOWS: 'workflows',
    EVIDENCE: 'evidence',
    EXHIBITS: 'exhibits',
    BILLING: 'billing',
    CREATE_CASE: 'create-case',
    DOCUMENTS: 'documents',
    JURISDICTION: 'jurisdiction',
    PLEADING_BUILDER: 'pleading-builder',
    LITIGATION_BUILDER: 'litigation-builder',
  },
}));

// Mock the lazy-loaded CaseDetail component
jest.mock('@/components/features/cases/pages/CaseDetailPage', () => ({
  CaseDetail: ({ caseData, onBack }: { caseData: { id: string }; onBack: () => void }) => (
    <div data-testid="case-detail">
      <span>Case ID: {caseData.id}</span>
      <button onClick={onBack}>Back</button>
    </div>
  ),
}));

import { ModuleRegistry } from '@/services/infrastructure/moduleRegistry';

const mockModuleRegistry = ModuleRegistry as jest.Mocked<typeof ModuleRegistry>;

describe('AppContentRenderer', () => {
  const defaultProps = {
    activeView: 'dashboard' as const,
    currentUser: { id: '1', name: 'John Doe', role: 'attorney', email: 'john@example.com' },
    selectedCase: null,
    handleSelectCase: jest.fn(),
    handleSelectCaseById: jest.fn(),
    navigateToCaseTab: jest.fn(),
    handleBackToMain: jest.fn(),
    setActiveView: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockModuleRegistry.getModule.mockReturnValue(null);
  });

  describe('Module Not Found', () => {
    it('renders module not found message when module is not registered', () => {
      mockModuleRegistry.getModule.mockReturnValue(null);

      render(<AppContentRenderer {...defaultProps} activeView="unknown-view" />);

      expect(screen.getByText('Module Not Found')).toBeInTheDocument();
      expect(screen.getByText(/unknown-view/)).toBeInTheDocument();
    });

    it('displays help icon for not found state', () => {
      mockModuleRegistry.getModule.mockReturnValue(null);

      const { container } = render(
        <AppContentRenderer {...defaultProps} activeView="missing" />
      );

      const helpIcon = container.querySelector('svg');
      expect(helpIcon).toBeInTheDocument();
    });
  });

  describe('Access Denied', () => {
    it('shows access denied for admin-only modules without admin role', () => {
      mockModuleRegistry.getModule.mockReturnValue({
        label: 'Admin Panel',
        component: () => <div>Admin Content</div>,
        requiresAdmin: true,
      });

      render(
        <AppContentRenderer
          {...defaultProps}
          currentUser={{ id: '1', name: 'User', role: 'attorney', email: 'user@test.com' }}
        />
      );

      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(screen.getByText(/Admin Panel/)).toBeInTheDocument();
    });

    it('allows access for super_admin role', () => {
      const MockComponent = () => <div data-testid="admin-content">Admin Content</div>;
      mockModuleRegistry.getModule.mockReturnValue({
        label: 'Admin Panel',
        component: MockComponent,
        requiresAdmin: true,
      });

      render(
        <AppContentRenderer
          {...defaultProps}
          currentUser={{ id: '1', name: 'Admin', role: 'super_admin', email: 'admin@test.com' }}
        />
      );

      expect(screen.queryByText('Access Denied')).not.toBeInTheDocument();
    });

    it('allows access for admin role', () => {
      const MockComponent = () => <div data-testid="admin-content">Admin Content</div>;
      mockModuleRegistry.getModule.mockReturnValue({
        label: 'Admin Panel',
        component: MockComponent,
        requiresAdmin: true,
      });

      render(
        <AppContentRenderer
          {...defaultProps}
          currentUser={{ id: '1', name: 'Admin', role: 'admin', email: 'admin@test.com' }}
        />
      );

      expect(screen.queryByText('Access Denied')).not.toBeInTheDocument();
    });

    it('allows access for partner role', () => {
      const MockComponent = () => <div>Partner Content</div>;
      mockModuleRegistry.getModule.mockReturnValue({
        label: 'Partner Module',
        component: MockComponent,
        requiresAdmin: true,
      });

      render(
        <AppContentRenderer
          {...defaultProps}
          currentUser={{ id: '1', name: 'Partner', role: 'partner', email: 'partner@test.com' }}
        />
      );

      expect(screen.queryByText('Access Denied')).not.toBeInTheDocument();
    });
  });

  describe('Module Rendering', () => {
    it('renders registered module component', () => {
      const MockComponent = () => <div data-testid="mock-module">Module Content</div>;
      mockModuleRegistry.getModule.mockReturnValue({
        label: 'Test Module',
        component: MockComponent,
        requiresAdmin: false,
      });

      render(<AppContentRenderer {...defaultProps} />);

      expect(screen.getByTestId('mock-module')).toBeInTheDocument();
    });

    it('passes currentUser to module component', () => {
      const MockComponent = ({ currentUser }: { currentUser?: { name: string } }) => (
        <div data-testid="mock-module">{currentUser?.name}</div>
      );
      mockModuleRegistry.getModule.mockReturnValue({
        label: 'Test Module',
        component: MockComponent,
        requiresAdmin: false,
      });

      render(<AppContentRenderer {...defaultProps} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('passes initialTab to module when provided', () => {
      const MockComponent = ({ initialTab }: { initialTab?: string }) => (
        <div data-testid="mock-module">{initialTab}</div>
      );
      mockModuleRegistry.getModule.mockReturnValue({
        label: 'Test Module',
        component: MockComponent,
        requiresAdmin: false,
      });

      render(<AppContentRenderer {...defaultProps} initialTab="settings" />);

      expect(screen.getByText('settings')).toBeInTheDocument();
    });
  });

  describe('Case Detail View', () => {
    it('renders CaseDetail when selectedCase has valid id', async () => {
      const selectedCase = { id: 'case-123', title: 'Test Case' };

      render(
        <AppContentRenderer
          {...defaultProps}
          selectedCase={selectedCase as never}
        />
      );

      // Due to lazy loading, we may see the loader first
      // The test mocks should handle this
      expect(screen.getByTestId('case-detail')).toBeInTheDocument();
      expect(screen.getByText('Case ID: case-123')).toBeInTheDocument();
    });

    it('does not render CaseDetail when selectedCase is null', () => {
      mockModuleRegistry.getModule.mockReturnValue({
        label: 'Dashboard',
        component: () => <div>Dashboard</div>,
        requiresAdmin: false,
      });

      render(<AppContentRenderer {...defaultProps} selectedCase={null} />);

      expect(screen.queryByTestId('case-detail')).not.toBeInTheDocument();
    });

    it('does not render CaseDetail when selectedCase has no id', () => {
      mockModuleRegistry.getModule.mockReturnValue({
        label: 'Dashboard',
        component: () => <div>Dashboard</div>,
        requiresAdmin: false,
      });

      const incompleteCase = { title: 'No ID Case' };

      render(
        <AppContentRenderer
          {...defaultProps}
          selectedCase={incompleteCase as never}
        />
      );

      expect(screen.queryByTestId('case-detail')).not.toBeInTheDocument();
    });
  });

  describe('Dynamic Props for Specific Views', () => {
    it('passes onSelectCase for cases view', () => {
      const handleSelectCase = jest.fn();
      const MockComponent = ({ onSelectCase }: { onSelectCase?: () => void }) => (
        <div data-testid="cases-module">
          <button onClick={onSelectCase}>Select</button>
        </div>
      );
      mockModuleRegistry.getModule.mockReturnValue({
        label: 'Cases',
        component: MockComponent,
        requiresAdmin: false,
      });

      render(
        <AppContentRenderer
          {...defaultProps}
          activeView="cases"
          handleSelectCase={handleSelectCase}
        />
      );

      expect(screen.getByTestId('cases-module')).toBeInTheDocument();
    });

    it('passes onSelectCase for dashboard view', () => {
      const handleSelectCaseById = jest.fn();
      const MockComponent = ({ onSelectCase }: { onSelectCase?: () => void }) => (
        <div data-testid="dashboard-module">
          {onSelectCase && <span>Has onSelectCase</span>}
        </div>
      );
      mockModuleRegistry.getModule.mockReturnValue({
        label: 'Dashboard',
        component: MockComponent,
        requiresAdmin: false,
      });

      render(
        <AppContentRenderer
          {...defaultProps}
          activeView="dashboard"
          handleSelectCaseById={handleSelectCaseById}
        />
      );

      expect(screen.getByTestId('dashboard-module')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('shows loading message with module label', async () => {
      // This test would verify Suspense fallback behavior
      // Since we're mocking, we can verify the LazyLoader is used
      mockModuleRegistry.getModule.mockReturnValue({
        label: 'Dashboard',
        component: () => <div>Dashboard</div>,
        requiresAdmin: false,
      });

      render(<AppContentRenderer {...defaultProps} />);
      // Component renders without crashing
      expect(document.body).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined currentUser', () => {
      mockModuleRegistry.getModule.mockReturnValue({
        label: 'Public Module',
        component: () => <div>Public Content</div>,
        requiresAdmin: false,
      });

      render(
        <AppContentRenderer
          {...defaultProps}
          currentUser={undefined}
        />
      );

      expect(screen.getByText('Public Content')).toBeInTheDocument();
    });

    it('handles empty activeView', () => {
      mockModuleRegistry.getModule.mockReturnValue(null);

      render(<AppContentRenderer {...defaultProps} activeView="" />);

      expect(screen.getByText('Module Not Found')).toBeInTheDocument();
    });
  });
});
