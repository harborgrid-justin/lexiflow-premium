/**
 * @jest-environment jsdom
 * PleadingDashboard Component Tests
 * Enterprise-grade tests for pleading document management dashboard
 */

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PleadingDashboard } from './PleadingDashboard';

// Mock dependencies
jest.mock('@/components/ui/atoms/Button/Button', () => ({
  Button: ({ children, onClick, variant, ...props }: any) => (
    <button onClick={onClick} data-variant={variant} {...props}>{children}</button>
  ),
}));

jest.mock('@/components/ui/atoms/Input/Input', () => ({
  Input: (props: any) => <input {...props} />,
}));

jest.mock('@/components/ui/molecules/Modal/Modal', () => ({
  Modal: ({ isOpen, onClose, title, children }: any) => (
    isOpen ? (
      <div data-testid="modal">
        <h2>{title}</h2>
        {children}
      </div>
    ) : null
  ),
}));

describe('PleadingDashboard', () => {
  const defaultProps = {
    onCreate: jest.fn(),
    onEdit: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders header with title', () => {
      render(<PleadingDashboard {...defaultProps} />);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Pleadings');
    });

    it('renders subtitle', () => {
      render(<PleadingDashboard {...defaultProps} />);

      expect(screen.getByText('Manage and draft legal pleadings')).toBeInTheDocument();
    });

    it('renders New Pleading button', () => {
      render(<PleadingDashboard {...defaultProps} />);

      expect(screen.getByText('New Pleading')).toBeInTheDocument();
    });

    it('renders search input', () => {
      render(<PleadingDashboard {...defaultProps} />);

      expect(screen.getByPlaceholderText('Search pleadings...')).toBeInTheDocument();
    });

    it('renders filter button', () => {
      render(<PleadingDashboard {...defaultProps} />);

      expect(screen.getByText('Filter')).toBeInTheDocument();
    });
  });

  describe('Pleading Cards', () => {
    it('renders pleading cards', () => {
      render(<PleadingDashboard {...defaultProps} />);

      expect(screen.getByText('Complaint for Damages')).toBeInTheDocument();
      expect(screen.getByText('Motion to Dismiss')).toBeInTheDocument();
      expect(screen.getByText('Answer to Complaint')).toBeInTheDocument();
      expect(screen.getByText('Interrogatories')).toBeInTheDocument();
    });

    it('displays case IDs', () => {
      render(<PleadingDashboard {...defaultProps} />);

      expect(screen.getByText('CASE-2024-001')).toBeInTheDocument();
      expect(screen.getByText('CASE-2024-002')).toBeInTheDocument();
      expect(screen.getByText('CASE-2024-003')).toBeInTheDocument();
    });

    it('displays status badges', () => {
      render(<PleadingDashboard {...defaultProps} />);

      expect(screen.getAllByText('Draft').length).toBeGreaterThan(0);
      expect(screen.getByText('Review')).toBeInTheDocument();
      expect(screen.getByText('Final')).toBeInTheDocument();
    });

    it('displays last edited time', () => {
      render(<PleadingDashboard {...defaultProps} />);

      expect(screen.getByText(/Last edited: 2 mins ago/)).toBeInTheDocument();
      expect(screen.getByText(/Last edited: 1 hour ago/)).toBeInTheDocument();
      expect(screen.getByText(/Last edited: Yesterday/)).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('filters pleadings by title', async () => {
      const user = userEvent.setup();
      render(<PleadingDashboard {...defaultProps} />);

      await user.type(screen.getByPlaceholderText('Search pleadings...'), 'Motion');

      expect(screen.getByText('Motion to Dismiss')).toBeInTheDocument();
      expect(screen.queryByText('Complaint for Damages')).not.toBeInTheDocument();
    });

    it('filters pleadings by case ID', async () => {
      const user = userEvent.setup();
      render(<PleadingDashboard {...defaultProps} />);

      await user.type(screen.getByPlaceholderText('Search pleadings...'), 'CASE-2024-002');

      expect(screen.getByText('Motion to Dismiss')).toBeInTheDocument();
      expect(screen.queryByText('Complaint for Damages')).not.toBeInTheDocument();
    });

    it('search is case-insensitive', async () => {
      const user = userEvent.setup();
      render(<PleadingDashboard {...defaultProps} />);

      await user.type(screen.getByPlaceholderText('Search pleadings...'), 'motion');

      expect(screen.getByText('Motion to Dismiss')).toBeInTheDocument();
    });

    it('shows all pleadings when search is cleared', async () => {
      const user = userEvent.setup();
      render(<PleadingDashboard {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search pleadings...');
      await user.type(searchInput, 'Motion');
      await user.clear(searchInput);

      expect(screen.getByText('Complaint for Damages')).toBeInTheDocument();
      expect(screen.getByText('Motion to Dismiss')).toBeInTheDocument();
    });
  });

  describe('Create Pleading Modal', () => {
    it('opens modal when New Pleading clicked', async () => {
      const user = userEvent.setup();
      render(<PleadingDashboard {...defaultProps} />);

      await user.click(screen.getByText('New Pleading'));

      expect(screen.getByTestId('modal')).toBeInTheDocument();
      expect(screen.getByText('Create New Pleading')).toBeInTheDocument();
    });

    it('renders title input in modal', async () => {
      const user = userEvent.setup();
      render(<PleadingDashboard {...defaultProps} />);

      await user.click(screen.getByText('New Pleading'));

      expect(screen.getByPlaceholderText('e.g., Motion for Summary Judgment')).toBeInTheDocument();
    });

    it('renders Cancel and Create Document buttons', async () => {
      const user = userEvent.setup();
      render(<PleadingDashboard {...defaultProps} />);

      await user.click(screen.getByText('New Pleading'));

      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Create Document')).toBeInTheDocument();
    });

    it('calls onCreate when Create Document clicked', async () => {
      const user = userEvent.setup();
      const onCreate = jest.fn();
      render(<PleadingDashboard {...defaultProps} onCreate={onCreate} />);

      await user.click(screen.getByText('New Pleading'));
      await user.type(screen.getByPlaceholderText('e.g., Motion for Summary Judgment'), 'Test Motion');
      await user.click(screen.getByText('Create Document'));

      expect(onCreate).toHaveBeenCalled();
    });

    it('closes modal when Cancel clicked', async () => {
      const user = userEvent.setup();
      render(<PleadingDashboard {...defaultProps} />);

      await user.click(screen.getByText('New Pleading'));
      expect(screen.getByTestId('modal')).toBeInTheDocument();

      await user.click(screen.getByText('Cancel'));

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });
  });

  describe('Edit Functionality', () => {
    it('calls onEdit when pleading card clicked', async () => {
      const user = userEvent.setup();
      const onEdit = jest.fn();
      render(<PleadingDashboard {...defaultProps} onEdit={onEdit} />);

      await user.click(screen.getByText('Complaint for Damages'));

      expect(onEdit).toHaveBeenCalledWith('1');
    });

    it('calls onEdit with correct ID for each card', async () => {
      const user = userEvent.setup();
      const onEdit = jest.fn();
      render(<PleadingDashboard {...defaultProps} onEdit={onEdit} />);

      await user.click(screen.getByText('Motion to Dismiss'));

      expect(onEdit).toHaveBeenCalledWith('2');
    });
  });

  describe('Status Badge Styling', () => {
    it('applies Draft status styling', () => {
      const { container } = render(<PleadingDashboard {...defaultProps} />);

      const draftBadges = container.querySelectorAll('.bg-slate-100');
      expect(draftBadges.length).toBeGreaterThan(0);
    });

    it('applies Review status styling', () => {
      const { container } = render(<PleadingDashboard {...defaultProps} />);

      expect(container.querySelector('.bg-amber-100')).toBeInTheDocument();
    });

    it('applies Final status styling', () => {
      const { container } = render(<PleadingDashboard {...defaultProps} />);

      expect(container.querySelector('.bg-emerald-100')).toBeInTheDocument();
    });
  });

  describe('Responsive Grid', () => {
    it('applies grid layout classes', () => {
      const { container } = render(<PleadingDashboard {...defaultProps} />);

      expect(container.querySelector('.grid')).toBeInTheDocument();
      expect(container.querySelector('.grid-cols-1')).toBeInTheDocument();
      expect(container.querySelector('.md\\:grid-cols-2')).toBeInTheDocument();
    });
  });

  describe('Card Interactions', () => {
    it('has hover effect on cards', () => {
      const { container } = render(<PleadingDashboard {...defaultProps} />);

      expect(container.querySelector('.hover\\:shadow-md')).toBeInTheDocument();
    });

    it('cards are clickable', () => {
      const { container } = render(<PleadingDashboard {...defaultProps} />);

      expect(container.querySelector('.cursor-pointer')).toBeInTheDocument();
    });
  });

  describe('Document Icon', () => {
    it('renders FileText icon for each card', () => {
      const { container } = render(<PleadingDashboard {...defaultProps} />);

      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });
  });
});
