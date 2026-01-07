/**
 * @fileoverview Enterprise-grade tests for CorrespondenceManager component
 * @module components/correspondence/CorrespondenceManager.test
 *
 * Tests communication log, service of process tracking, and inspector panel.
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CorrespondenceManager from './CorrespondenceManager';

// ============================================================================
// MOCKS
// ============================================================================

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Calendar: () => <svg data-testid="calendar-icon" />,
  Filter: () => <svg data-testid="filter-icon" />,
  Mail: () => <svg data-testid="mail-icon" />,
  MapPin: () => <svg data-testid="map-pin-icon" />,
  Paperclip: () => <svg data-testid="paperclip-icon" />,
  Plus: () => <svg data-testid="plus-icon" />,
  Search: () => <svg data-testid="search-icon" />,
  User: () => <svg data-testid="user-icon" />,
}));

// ============================================================================
// HEADER TESTS
// ============================================================================

describe('CorrespondenceManager', () => {
  describe('Header', () => {
    it('renders the Correspondence & Service title', () => {
      render(<CorrespondenceManager />);
      expect(screen.getByRole('heading', { name: /correspondence & service/i })).toBeInTheDocument();
    });

    it('renders the description', () => {
      render(<CorrespondenceManager />);
      expect(screen.getByText(/manage legal communications, process servers/i)).toBeInTheDocument();
    });

    it('renders Filter button', () => {
      render(<CorrespondenceManager />);
      expect(screen.getByRole('button', { name: /filter/i })).toBeInTheDocument();
    });
  });

  // ============================================================================
  // TAB NAVIGATION TESTS
  // ============================================================================

  describe('Tab Navigation', () => {
    it('renders Communications tab', () => {
      render(<CorrespondenceManager />);
      expect(screen.getByRole('button', { name: /communications/i })).toBeInTheDocument();
    });

    it('renders Service of Process tab', () => {
      render(<CorrespondenceManager />);
      expect(screen.getByRole('button', { name: /service of process/i })).toBeInTheDocument();
    });

    it('defaults to Communications tab', () => {
      render(<CorrespondenceManager />);
      const communicationsTab = screen.getByRole('button', { name: /communications/i });
      expect(communicationsTab).toHaveClass('border-blue-600', 'text-blue-600');
    });

    it('switches to Service of Process tab', async () => {
      const user = userEvent.setup();
      render(<CorrespondenceManager />);

      await user.click(screen.getByRole('button', { name: /service of process/i }));

      const serviceTab = screen.getByRole('button', { name: /service of process/i });
      expect(serviceTab).toHaveClass('border-blue-600', 'text-blue-600');
    });

    it('shows Compose button in communications tab', () => {
      render(<CorrespondenceManager />);
      expect(screen.getByRole('button', { name: /compose/i })).toBeInTheDocument();
    });

    it('shows New Service Job button in service tab', async () => {
      const user = userEvent.setup();
      render(<CorrespondenceManager />);

      await user.click(screen.getByRole('button', { name: /service of process/i }));

      expect(screen.getByRole('button', { name: /new service job/i })).toBeInTheDocument();
    });
  });

  // ============================================================================
  // COMMUNICATION LOG TESTS
  // ============================================================================

  describe('Communication Log', () => {
    it('renders communication search input', () => {
      render(<CorrespondenceManager />);
      expect(screen.getByPlaceholderText(/search communications/i)).toBeInTheDocument();
    });

    it('renders communication items', () => {
      render(<CorrespondenceManager />);

      expect(screen.getByText(/re: settlement offer - smith v\. jones/i)).toBeInTheDocument();
      expect(screen.getByText(/court appearance notice/i)).toBeInTheDocument();
      expect(screen.getByText(/client meeting notes/i)).toBeInTheDocument();
    });

    it('displays sender names', () => {
      render(<CorrespondenceManager />);

      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      expect(screen.getByText('Court Clerk')).toBeInTheDocument();
      expect(screen.getByText('John Smith')).toBeInTheDocument();
    });

    it('displays message previews', () => {
      render(<CorrespondenceManager />);

      expect(screen.getByText(/we have reviewed the settlement offer/i)).toBeInTheDocument();
      expect(screen.getByText(/please be advised that the hearing/i)).toBeInTheDocument();
    });

    it('displays dates', () => {
      render(<CorrespondenceManager />);

      expect(screen.getByText('2026-01-02')).toBeInTheDocument();
      expect(screen.getByText('2026-01-01')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // SERVICE TRACKER TESTS
  // ============================================================================

  describe('Service Tracker', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<CorrespondenceManager />);
      await user.click(screen.getByRole('button', { name: /service of process/i }));
    });

    it('renders Active Service Jobs heading', () => {
      expect(screen.getByText(/active service jobs/i)).toBeInTheDocument();
    });

    it('renders service job entries', () => {
      expect(screen.getByText('Smith v. Jones')).toBeInTheDocument();
      expect(screen.getByText('State v. Doe')).toBeInTheDocument();
    });

    it('displays recipients', () => {
      expect(screen.getByText(/to: robert jones/i)).toBeInTheDocument();
      expect(screen.getByText(/to: witness a/i)).toBeInTheDocument();
    });

    it('displays status badges', () => {
      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
    });

    it('displays due dates', () => {
      expect(screen.getByText(/due: 2026-01-15/i)).toBeInTheDocument();
      expect(screen.getByText(/due: 2025-12-28/i)).toBeInTheDocument();
    });

    it('displays process server names', () => {
      expect(screen.getByText('Metro Process Servers')).toBeInTheDocument();
      expect(screen.getByText('City Legal Services')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // STATUS BADGE COLORS TESTS
  // ============================================================================

  describe('Status Badge Colors', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<CorrespondenceManager />);
      await user.click(screen.getByRole('button', { name: /service of process/i }));
    });

    it('applies amber color for In Progress status', () => {
      const inProgressBadge = screen.getByText('In Progress');
      expect(inProgressBadge).toHaveClass('bg-amber-100', 'text-amber-700');
    });

    it('applies green color for Completed status', () => {
      const completedBadge = screen.getByText('Completed');
      expect(completedBadge).toHaveClass('bg-green-100', 'text-green-700');
    });
  });

  // ============================================================================
  // INSPECTOR PANEL TESTS
  // ============================================================================

  describe('Inspector Panel', () => {
    it('does not show inspector by default', () => {
      render(<CorrespondenceManager />);
      expect(screen.queryByText('Details')).not.toBeInTheDocument();
    });

    it('opens inspector when communication is clicked', async () => {
      const user = userEvent.setup();
      render(<CorrespondenceManager />);

      await user.click(screen.getByText(/re: settlement offer/i));

      expect(screen.getByText('Details')).toBeInTheDocument();
    });

    it('displays communication details in inspector', async () => {
      const user = userEvent.setup();
      render(<CorrespondenceManager />);

      await user.click(screen.getByText(/re: settlement offer/i));

      expect(screen.getByRole('heading', { name: /re: settlement offer/i })).toBeInTheDocument();
    });

    it('displays attachments section', async () => {
      const user = userEvent.setup();
      render(<CorrespondenceManager />);

      await user.click(screen.getByText(/re: settlement offer/i));

      expect(screen.getByText('Attachments')).toBeInTheDocument();
      expect(screen.getByText(/document\.pdf/i)).toBeInTheDocument();
    });

    it('has Reply button in inspector', async () => {
      const user = userEvent.setup();
      render(<CorrespondenceManager />);

      await user.click(screen.getByText(/re: settlement offer/i));

      expect(screen.getByRole('button', { name: /reply/i })).toBeInTheDocument();
    });

    it('has Archive button in inspector', async () => {
      const user = userEvent.setup();
      render(<CorrespondenceManager />);

      await user.click(screen.getByText(/re: settlement offer/i));

      expect(screen.getByRole('button', { name: /archive/i })).toBeInTheDocument();
    });

    it('closes inspector when close button is clicked', async () => {
      const user = userEvent.setup();
      render(<CorrespondenceManager />);

      await user.click(screen.getByText(/re: settlement offer/i));
      await user.click(screen.getByRole('button', { name: /\u00d7/i }));

      expect(screen.queryByText('Details')).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // SELECTION STATE TESTS
  // ============================================================================

  describe('Selection State', () => {
    it('highlights selected communication', async () => {
      const user = userEvent.setup();
      render(<CorrespondenceManager />);

      const communication = screen.getByText(/re: settlement offer/i).closest('.cursor-pointer');
      await user.click(communication!);

      expect(communication).toHaveClass('bg-blue-50', 'border-l-blue-600');
    });

    it('highlights selected service job', async () => {
      const user = userEvent.setup();
      render(<CorrespondenceManager />);

      await user.click(screen.getByRole('button', { name: /service of process/i }));

      const serviceJob = screen.getByText('Smith v. Jones').closest('.cursor-pointer');
      await user.click(serviceJob!);

      expect(serviceJob).toHaveClass('ring-2', 'ring-blue-500');
    });
  });

  // ============================================================================
  // INITIAL TAB PROP TESTS
  // ============================================================================

  describe('Initial Tab Prop', () => {
    it('starts on communications tab by default', () => {
      render(<CorrespondenceManager />);
      expect(screen.getByPlaceholderText(/search communications/i)).toBeInTheDocument();
    });

    it('starts on process tab when initialTab is process', () => {
      render(<CorrespondenceManager initialTab="process" />);
      expect(screen.getByText(/active service jobs/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // RESPONSIVE LAYOUT TESTS
  // ============================================================================

  describe('Responsive Layout', () => {
    it('inspector panel has fixed width', async () => {
      const user = userEvent.setup();
      render(<CorrespondenceManager />);

      await user.click(screen.getByText(/re: settlement offer/i));

      const inspectorPanel = screen.getByText('Details').closest('.w-96');
      expect(inspectorPanel).toBeInTheDocument();
    });
  });

  // ============================================================================
  // TAB ICONS TESTS
  // ============================================================================

  describe('Tab Icons', () => {
    it('renders Mail icon for Communications tab', () => {
      render(<CorrespondenceManager />);
      expect(screen.getByTestId('mail-icon')).toBeInTheDocument();
    });

    it('renders MapPin icon for Service tab', () => {
      render(<CorrespondenceManager />);
      expect(screen.getByTestId('map-pin-icon')).toBeInTheDocument();
    });
  });
});
