/**
 * @fileoverview Enterprise-grade tests for CaseIntake component
 * @module components/case-intake/CaseIntake.test
 *
 * Tests multi-step form wizard, form validation, step navigation,
 * and data persistence across steps.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CaseIntake } from './CaseIntake';

// ============================================================================
// MOCKS
// ============================================================================

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  AlertTriangle: () => <svg data-testid="alert-icon" />,
  ArrowLeft: () => <svg data-testid="arrow-left-icon" />,
  ArrowRight: () => <svg data-testid="arrow-right-icon" />,
  Briefcase: () => <svg data-testid="briefcase-icon" />,
  CheckCircle: () => <svg data-testid="check-icon" />,
  DollarSign: () => <svg data-testid="dollar-icon" />,
  Shield: () => <svg data-testid="shield-icon" />,
  User: () => <svg data-testid="user-icon" />,
  Users: () => <svg data-testid="users-icon" />,
}));

// ============================================================================
// HEADER TESTS
// ============================================================================

describe('CaseIntake', () => {
  describe('Header', () => {
    it('renders the New Matter Intake title', () => {
      render(<CaseIntake />);
      expect(screen.getByRole('heading', { name: /new matter intake/i })).toBeInTheDocument();
    });

    it('renders the description', () => {
      render(<CaseIntake />);
      expect(screen.getByText(/complete the steps below/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // PROGRESS STEPS TESTS
  // ============================================================================

  describe('Progress Steps', () => {
    it('renders all six steps', () => {
      render(<CaseIntake />);

      expect(screen.getByText('Client Information')).toBeInTheDocument();
      expect(screen.getByText('Matter Details')).toBeInTheDocument();
      expect(screen.getByText('Conflict Check')).toBeInTheDocument();
      expect(screen.getByText('Team Assignment')).toBeInTheDocument();
      expect(screen.getByText('Financial Setup')).toBeInTheDocument();
      expect(screen.getByText('Review & Submit')).toBeInTheDocument();
    });

    it('highlights first step as active by default', () => {
      render(<CaseIntake />);

      const clientInfoText = screen.getByText('Client Information');
      expect(clientInfoText).toHaveClass('text-blue-600');
    });

    it('renders step icons', () => {
      render(<CaseIntake />);

      expect(screen.getByTestId('user-icon')).toBeInTheDocument();
      expect(screen.getByTestId('briefcase-icon')).toBeInTheDocument();
      expect(screen.getByTestId('shield-icon')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // CLIENT INFORMATION STEP TESTS
  // ============================================================================

  describe('Client Information Step', () => {
    it('renders client name input', () => {
      render(<CaseIntake />);
      expect(screen.getByLabelText(/client name/i)).toBeInTheDocument();
    });

    it('renders client type select', () => {
      render(<CaseIntake />);
      expect(screen.getByLabelText(/client type/i)).toBeInTheDocument();
    });

    it('renders email input', () => {
      render(<CaseIntake />);
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    it('renders phone input', () => {
      render(<CaseIntake />);
      expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    });

    it('allows entering client name', async () => {
      const user = userEvent.setup();
      render(<CaseIntake />);

      const nameInput = screen.getByLabelText(/client name/i);
      await user.type(nameInput, 'John Doe');

      expect(nameInput).toHaveValue('John Doe');
    });

    it('has client type options', () => {
      render(<CaseIntake />);

      expect(screen.getByRole('option', { name: /individual/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /corporate/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /government/i })).toBeInTheDocument();
    });
  });

  // ============================================================================
  // STEP NAVIGATION TESTS
  // ============================================================================

  describe('Step Navigation', () => {
    it('Back button is disabled on first step', () => {
      render(<CaseIntake />);

      const backButton = screen.getByRole('button', { name: /back/i });
      expect(backButton).toBeDisabled();
    });

    it('navigates to next step when Next button clicked', async () => {
      const user = userEvent.setup();
      render(<CaseIntake />);

      await user.click(screen.getByRole('button', { name: /next step/i }));

      // Should be on Matter Details step
      expect(screen.getByLabelText(/matter title/i)).toBeInTheDocument();
    });

    it('navigates back when Back button clicked', async () => {
      const user = userEvent.setup();
      render(<CaseIntake />);

      // Go to step 2
      await user.click(screen.getByRole('button', { name: /next step/i }));
      // Go back to step 1
      await user.click(screen.getByRole('button', { name: /back/i }));

      // Should be on Client Information step
      expect(screen.getByLabelText(/client name/i)).toBeInTheDocument();
    });

    it('shows Create Matter button on final step', async () => {
      const user = userEvent.setup();
      render(<CaseIntake />);

      // Navigate through all steps
      for (let i = 0; i < 5; i++) {
        await user.click(screen.getByRole('button', { name: /next step/i }));
      }

      expect(screen.getByRole('button', { name: /create matter/i })).toBeInTheDocument();
    });
  });

  // ============================================================================
  // MATTER DETAILS STEP TESTS
  // ============================================================================

  describe('Matter Details Step', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<CaseIntake />);
      await user.click(screen.getByRole('button', { name: /next step/i }));
    });

    it('renders matter title input', () => {
      expect(screen.getByLabelText(/matter title/i)).toBeInTheDocument();
    });

    it('renders practice area select', () => {
      expect(screen.getByLabelText(/practice area/i)).toBeInTheDocument();
    });

    it('renders priority select', () => {
      expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
    });

    it('renders description textarea', () => {
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    });

    it('has practice area options', () => {
      expect(screen.getByRole('option', { name: /litigation/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /corporate/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /intellectual property/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /real estate/i })).toBeInTheDocument();
    });

    it('has priority options', () => {
      expect(screen.getByRole('option', { name: /^low$/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /^medium$/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /^high$/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /^urgent$/i })).toBeInTheDocument();
    });
  });

  // ============================================================================
  // CONFLICT CHECK STEP TESTS
  // ============================================================================

  describe('Conflict Check Step', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<CaseIntake />);
      // Navigate to Conflict Check step
      await user.click(screen.getByRole('button', { name: /next step/i }));
      await user.click(screen.getByRole('button', { name: /next step/i }));
    });

    it('renders No Direct Conflicts Found message', () => {
      expect(screen.getByText(/no direct conflicts found/i)).toBeInTheDocument();
    });

    it('renders automated check information', () => {
      expect(screen.getByText(/automated check performed/i)).toBeInTheDocument();
    });

    it('renders Potential Name Matches section', () => {
      expect(screen.getByText(/potential name matches/i)).toBeInTheDocument();
    });

    it('renders Review button for potential matches', () => {
      expect(screen.getByRole('button', { name: /review/i })).toBeInTheDocument();
    });
  });

  // ============================================================================
  // TEAM ASSIGNMENT STEP TESTS
  // ============================================================================

  describe('Team Assignment Step', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<CaseIntake />);
      // Navigate to Team Assignment step
      for (let i = 0; i < 3; i++) {
        await user.click(screen.getByRole('button', { name: /next step/i }));
      }
    });

    it('renders Lead Attorney select', () => {
      expect(screen.getByLabelText(/lead attorney/i)).toBeInTheDocument();
    });

    it('has attorney options', () => {
      expect(screen.getByRole('option', { name: /sarah miller/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /james wilson/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /emily chen/i })).toBeInTheDocument();
    });

    it('renders Suggested Team Members section', () => {
      expect(screen.getByText(/suggested team members/i)).toBeInTheDocument();
    });

    it('displays team member suggestions', () => {
      expect(screen.getByText(/paralegal: mike ross/i)).toBeInTheDocument();
      expect(screen.getByText(/associate: rachel zane/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // FINANCIAL SETUP STEP TESTS
  // ============================================================================

  describe('Financial Setup Step', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<CaseIntake />);
      // Navigate to Financial Setup step
      for (let i = 0; i < 4; i++) {
        await user.click(screen.getByRole('button', { name: /next step/i }));
      }
    });

    it('renders Billing Type select', () => {
      expect(screen.getByLabelText(/billing type/i)).toBeInTheDocument();
    });

    it('has billing type options', () => {
      expect(screen.getByRole('option', { name: /hourly/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /flat fee/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /contingency/i })).toBeInTheDocument();
    });

    it('renders Rate / Amount input', () => {
      expect(screen.getByLabelText(/rate \/ amount/i)).toBeInTheDocument();
    });

    it('renders Retainer Amount input', () => {
      expect(screen.getByLabelText(/retainer amount/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // REVIEW STEP TESTS
  // ============================================================================

  describe('Review Step', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<CaseIntake />);

      // Fill in some data first
      await user.type(screen.getByLabelText(/client name/i), 'Test Client');

      // Navigate to Review step
      for (let i = 0; i < 5; i++) {
        await user.click(screen.getByRole('button', { name: /next step/i }));
      }
    });

    it('renders Summary section', () => {
      expect(screen.getByText('Summary')).toBeInTheDocument();
    });

    it('displays client name in summary', () => {
      expect(screen.getByText('Test Client')).toBeInTheDocument();
    });

    it('renders confirmation checkbox', () => {
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('renders confirmation label text', () => {
      expect(screen.getByText(/confirm that all conflict checks/i)).toBeInTheDocument();
    });

    it('renders Create Matter button', () => {
      expect(screen.getByRole('button', { name: /create matter/i })).toBeInTheDocument();
    });
  });

  // ============================================================================
  // DATA PERSISTENCE TESTS
  // ============================================================================

  describe('Data Persistence', () => {
    it('preserves data when navigating between steps', async () => {
      const user = userEvent.setup();
      render(<CaseIntake />);

      // Fill in client name
      await user.type(screen.getByLabelText(/client name/i), 'John Smith');

      // Navigate to next step and back
      await user.click(screen.getByRole('button', { name: /next step/i }));
      await user.click(screen.getByRole('button', { name: /back/i }));

      // Data should be preserved
      expect(screen.getByLabelText(/client name/i)).toHaveValue('John Smith');
    });
  });

  // ============================================================================
  // DARK MODE TESTS
  // ============================================================================

  describe('Dark Mode Support', () => {
    it('applies dark mode classes to main container', () => {
      render(<CaseIntake />);

      const formCard = screen.getByText('Summary').closest('.dark\\:bg-slate-800') ||
                       document.querySelector('.dark\\:bg-slate-800');
      expect(formCard).toBeInTheDocument();
    });

    it('applies dark mode classes to input labels', () => {
      render(<CaseIntake />);

      const label = screen.getByText(/client name/i);
      expect(label).toHaveClass('dark:text-slate-300');
    });
  });
});
