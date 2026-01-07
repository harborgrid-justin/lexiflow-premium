/**
 * @fileoverview Enterprise-grade tests for ComplianceDashboard component
 * @module components/compliance/ComplianceDashboard.test
 *
 * Tests compliance metrics, audit trail, policy management, and alert system.
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComplianceDashboard } from './ComplianceDashboard';

// ============================================================================
// MOCKS
// ============================================================================

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  AlertTriangle: () => <svg data-testid="alert-triangle-icon" />,
  CheckCircle: () => <svg data-testid="check-circle-icon" />,
  Clock: () => <svg data-testid="clock-icon" />,
  Download: () => <svg data-testid="download-icon" />,
  Eye: () => <svg data-testid="eye-icon" />,
  FileText: () => <svg data-testid="file-text-icon" />,
  RefreshCw: () => <svg data-testid="refresh-icon" />,
  Shield: () => <svg data-testid="shield-icon" />,
  XCircle: () => <svg data-testid="x-circle-icon" />,
}));

// ============================================================================
// HEADER TESTS
// ============================================================================

describe('ComplianceDashboard', () => {
  describe('Header', () => {
    it('renders the Compliance Dashboard title', () => {
      render(<ComplianceDashboard />);
      expect(screen.getByRole('heading', { name: /compliance dashboard/i })).toBeInTheDocument();
    });

    it('renders the description', () => {
      render(<ComplianceDashboard />);
      expect(screen.getByText(/regulatory compliance and audit management/i)).toBeInTheDocument();
    });

    it('renders Run Audit button', () => {
      render(<ComplianceDashboard />);
      expect(screen.getByRole('button', { name: /run audit/i })).toBeInTheDocument();
    });

    it('renders Export Report button', () => {
      render(<ComplianceDashboard />);
      expect(screen.getByRole('button', { name: /export report/i })).toBeInTheDocument();
    });
  });

  // ============================================================================
  // COMPLIANCE SCORE TESTS
  // ============================================================================

  describe('Compliance Score', () => {
    it('renders overall compliance score', () => {
      render(<ComplianceDashboard />);
      expect(screen.getByText('94%')).toBeInTheDocument();
    });

    it('renders Compliance Score label', () => {
      render(<ComplianceDashboard />);
      expect(screen.getByText(/compliance score/i)).toBeInTheDocument();
    });

    it('applies appropriate color based on score', () => {
      render(<ComplianceDashboard />);

      // 94% should be good (green or blue)
      const scoreText = screen.getByText('94%');
      expect(scoreText).toHaveClass('text-emerald-600');
    });
  });

  // ============================================================================
  // COMPLIANCE METRICS TESTS
  // ============================================================================

  describe('Compliance Metrics', () => {
    it('renders Policies Compliant metric', () => {
      render(<ComplianceDashboard />);
      expect(screen.getByText(/policies compliant/i)).toBeInTheDocument();
      expect(screen.getByText('47/50')).toBeInTheDocument();
    });

    it('renders Active Audits metric', () => {
      render(<ComplianceDashboard />);
      expect(screen.getByText(/active audits/i)).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('renders Pending Reviews metric', () => {
      render(<ComplianceDashboard />);
      expect(screen.getByText(/pending reviews/i)).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
    });

    it('renders Days Since Incident metric', () => {
      render(<ComplianceDashboard />);
      expect(screen.getByText(/days since incident/i)).toBeInTheDocument();
      expect(screen.getByText('127')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // TAB NAVIGATION TESTS
  // ============================================================================

  describe('Tab Navigation', () => {
    it('renders all tabs', () => {
      render(<ComplianceDashboard />);

      expect(screen.getByRole('button', { name: /policies/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /audit trail/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /alerts/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /regulations/i })).toBeInTheDocument();
    });

    it('defaults to Policies tab', () => {
      render(<ComplianceDashboard />);
      const policiesTab = screen.getByRole('button', { name: /policies/i });
      expect(policiesTab).toHaveClass('bg-blue-100', 'text-blue-700');
    });

    it('switches to Audit Trail tab', async () => {
      const user = userEvent.setup();
      render(<ComplianceDashboard />);

      await user.click(screen.getByRole('button', { name: /audit trail/i }));

      const auditTab = screen.getByRole('button', { name: /audit trail/i });
      expect(auditTab).toHaveClass('bg-blue-100', 'text-blue-700');
    });

    it('switches to Alerts tab', async () => {
      const user = userEvent.setup();
      render(<ComplianceDashboard />);

      await user.click(screen.getByRole('button', { name: /alerts/i }));

      const alertsTab = screen.getByRole('button', { name: /alerts/i });
      expect(alertsTab).toHaveClass('bg-blue-100', 'text-blue-700');
    });
  });

  // ============================================================================
  // POLICIES TAB TESTS
  // ============================================================================

  describe('Policies Tab', () => {
    it('renders policy list', () => {
      render(<ComplianceDashboard />);

      expect(screen.getByText(/data retention policy/i)).toBeInTheDocument();
      expect(screen.getByText(/client confidentiality/i)).toBeInTheDocument();
      expect(screen.getByText(/conflict of interest/i)).toBeInTheDocument();
    });

    it('displays policy status badges', () => {
      render(<ComplianceDashboard />);

      const compliantBadges = screen.getAllByText('Compliant');
      expect(compliantBadges.length).toBeGreaterThan(0);
    });

    it('displays last review dates', () => {
      render(<ComplianceDashboard />);

      expect(screen.getByText(/last reviewed/i)).toBeInTheDocument();
    });

    it('renders View Details button for each policy', () => {
      render(<ComplianceDashboard />);

      const viewButtons = screen.getAllByRole('button', { name: /view details/i });
      expect(viewButtons.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // AUDIT TRAIL TAB TESTS
  // ============================================================================

  describe('Audit Trail Tab', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<ComplianceDashboard />);
      await user.click(screen.getByRole('button', { name: /audit trail/i }));
    });

    it('renders audit entries', () => {
      expect(screen.getByText(/annual compliance review completed/i)).toBeInTheDocument();
    });

    it('displays audit timestamps', () => {
      expect(screen.getByText(/2024-01-15/i)).toBeInTheDocument();
    });

    it('displays audit performers', () => {
      expect(screen.getByText(/compliance officer/i)).toBeInTheDocument();
    });

    it('displays audit status', () => {
      expect(screen.getByText('Completed')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // ALERTS TAB TESTS
  // ============================================================================

  describe('Alerts Tab', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<ComplianceDashboard />);
      await user.click(screen.getByRole('button', { name: /alerts/i }));
    });

    it('renders alert entries', () => {
      expect(screen.getByText(/policy review overdue/i)).toBeInTheDocument();
    });

    it('displays alert severity', () => {
      expect(screen.getByText('High')).toBeInTheDocument();
      expect(screen.getByText('Medium')).toBeInTheDocument();
    });

    it('renders Dismiss button for alerts', () => {
      const dismissButtons = screen.getAllByRole('button', { name: /dismiss/i });
      expect(dismissButtons.length).toBeGreaterThan(0);
    });

    it('renders Resolve button for alerts', () => {
      const resolveButtons = screen.getAllByRole('button', { name: /resolve/i });
      expect(resolveButtons.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // REGULATIONS TAB TESTS
  // ============================================================================

  describe('Regulations Tab', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<ComplianceDashboard />);
      await user.click(screen.getByRole('button', { name: /regulations/i }));
    });

    it('renders regulation entries', () => {
      expect(screen.getByText(/bar association rules/i)).toBeInTheDocument();
    });

    it('displays regulation compliance status', () => {
      const compliantStatuses = screen.getAllByText(/compliant/i);
      expect(compliantStatuses.length).toBeGreaterThan(0);
    });

    it('displays next review dates', () => {
      expect(screen.getByText(/next review/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // SEVERITY COLORS TESTS
  // ============================================================================

  describe('Severity Colors', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<ComplianceDashboard />);
      await user.click(screen.getByRole('button', { name: /alerts/i }));
    });

    it('applies red styling for high severity alerts', () => {
      const highBadge = screen.getByText('High');
      expect(highBadge).toHaveClass('bg-red-100', 'text-red-800');
    });

    it('applies yellow styling for medium severity alerts', () => {
      const mediumBadge = screen.getByText('Medium');
      expect(mediumBadge).toHaveClass('bg-yellow-100', 'text-yellow-800');
    });
  });

  // ============================================================================
  // RUN AUDIT TESTS
  // ============================================================================

  describe('Run Audit Button', () => {
    it('renders with refresh icon', () => {
      render(<ComplianceDashboard />);

      const auditButton = screen.getByRole('button', { name: /run audit/i });
      expect(auditButton).toBeInTheDocument();
      expect(screen.getByTestId('refresh-icon')).toBeInTheDocument();
    });

    it('is clickable', async () => {
      const user = userEvent.setup();
      render(<ComplianceDashboard />);

      const auditButton = screen.getByRole('button', { name: /run audit/i });
      await expect(user.click(auditButton)).resolves.not.toThrow();
    });
  });

  // ============================================================================
  // EXPORT REPORT TESTS
  // ============================================================================

  describe('Export Report Button', () => {
    it('renders with download icon', () => {
      render(<ComplianceDashboard />);

      const exportButton = screen.getByRole('button', { name: /export report/i });
      expect(exportButton).toBeInTheDocument();
      expect(screen.getByTestId('download-icon')).toBeInTheDocument();
    });

    it('is clickable', async () => {
      const user = userEvent.setup();
      render(<ComplianceDashboard />);

      const exportButton = screen.getByRole('button', { name: /export report/i });
      await expect(user.click(exportButton)).resolves.not.toThrow();
    });
  });

  // ============================================================================
  // RESPONSIVE LAYOUT TESTS
  // ============================================================================

  describe('Responsive Layout', () => {
    it('uses responsive grid for metrics', () => {
      render(<ComplianceDashboard />);

      const metricsGrid = screen.getByText(/policies compliant/i).closest('.grid');
      expect(metricsGrid).toHaveClass('md:grid-cols-2', 'lg:grid-cols-4');
    });
  });

  // ============================================================================
  // DARK MODE TESTS
  // ============================================================================

  describe('Dark Mode Support', () => {
    it('applies dark mode classes to container', () => {
      render(<ComplianceDashboard />);

      const container = screen.getByRole('heading', { name: /compliance dashboard/i }).closest('.dark\\:bg-slate-900');
      expect(container).toBeInTheDocument();
    });

    it('applies dark mode classes to metric cards', () => {
      render(<ComplianceDashboard />);

      const card = screen.getByText(/policies compliant/i).closest('.dark\\:bg-slate-800');
      expect(card).toBeInTheDocument();
    });
  });
});
