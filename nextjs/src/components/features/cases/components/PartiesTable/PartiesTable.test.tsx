/**
 * PartiesTable Component Tests
 * Enterprise-grade test suite for case parties display with sorting and filtering
 *
 * @module components/features/cases/PartiesTable.test
 */

import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PartiesTable } from './PartiesTable';
import type { Party } from '@/types';

describe('PartiesTable', () => {
  const mockParties: Party[] = [
    {
      id: 'party-1',
      name: 'John Smith',
      type: 'Plaintiff',
      role: 'Lead Plaintiff',
      email: 'john.smith@example.com',
      phone: '555-123-4567',
      organization: 'Smith Corporation',
      attorneyName: 'Robert Attorney',
      attorneyFirm: 'Attorney & Associates',
      attorneyEmail: 'robert@attorney.com',
      isProSe: false,
    },
    {
      id: 'party-2',
      name: 'Jane Doe',
      type: 'Defendant',
      role: 'Primary Defendant',
      email: 'jane.doe@example.com',
      phone: '555-987-6543',
      counsel: 'Defense Counsel LLP',
      isProSe: false,
    },
    {
      id: 'party-3',
      name: 'Bob Wilson',
      type: 'Witness',
      role: 'Fact Witness',
      email: 'bob.wilson@example.com',
      isProSe: true,
    },
    {
      id: 'party-4',
      name: 'Expert Corp',
      type: 'Expert Witness',
      role: 'Technical Expert',
      organization: 'Expert Consulting Inc.',
    },
  ];

  const defaultProps = {
    parties: mockParties,
    onSelectParty: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render table headers', () => {
      render(<PartiesTable {...defaultProps} />);

      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Type')).toBeInTheDocument();
      expect(screen.getByText('Role')).toBeInTheDocument();
      expect(screen.getByText('Contact')).toBeInTheDocument();
      expect(screen.getByText('Counsel')).toBeInTheDocument();
    });

    it('should render all parties', () => {
      render(<PartiesTable {...defaultProps} />);

      expect(screen.getByText('John Smith')).toBeInTheDocument();
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
      expect(screen.getByText('Expert Corp')).toBeInTheDocument();
    });

    it('should render party types', () => {
      render(<PartiesTable {...defaultProps} />);

      expect(screen.getByText('Plaintiff')).toBeInTheDocument();
      expect(screen.getByText('Defendant')).toBeInTheDocument();
      expect(screen.getByText('Witness')).toBeInTheDocument();
      expect(screen.getByText('Expert Witness')).toBeInTheDocument();
    });

    it('should render party roles', () => {
      render(<PartiesTable {...defaultProps} />);

      expect(screen.getByText('Lead Plaintiff')).toBeInTheDocument();
      expect(screen.getByText('Primary Defendant')).toBeInTheDocument();
      expect(screen.getByText('Fact Witness')).toBeInTheDocument();
      expect(screen.getByText('Technical Expert')).toBeInTheDocument();
    });

    it('should render organization names', () => {
      render(<PartiesTable {...defaultProps} />);

      expect(screen.getByText('Smith Corporation')).toBeInTheDocument();
      expect(screen.getByText('Expert Consulting Inc.')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no parties', () => {
      render(<PartiesTable parties={[]} />);

      expect(screen.getByText('No parties')).toBeInTheDocument();
    });

    it('should show helpful empty state message', () => {
      render(<PartiesTable parties={[]} />);

      expect(screen.getByText(/Add parties to this case/)).toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('should sort by name by default', () => {
      render(<PartiesTable {...defaultProps} />);

      const rows = screen.getAllByRole('row');
      // First data row
      expect(rows[1]).toHaveTextContent('Bob Wilson');
    });

    it('should sort by name when Name header is clicked', async () => {
      const user = userEvent.setup();
      render(<PartiesTable {...defaultProps} />);

      const nameHeader = screen.getByRole('columnheader', { name: /Name/ });
      await user.click(nameHeader);

      const rows = screen.getAllByRole('row');
      expect(rows[1]).toHaveTextContent('Bob Wilson');
    });

    it('should toggle sort direction on second click', async () => {
      const user = userEvent.setup();
      render(<PartiesTable {...defaultProps} />);

      const nameHeader = screen.getByRole('columnheader', { name: /Name/ });
      await user.click(nameHeader);
      await user.click(nameHeader);

      const rows = screen.getAllByRole('row');
      // Descending order
      expect(rows[1]).toHaveTextContent('John Smith');
    });

    it('should sort by type', async () => {
      const user = userEvent.setup();
      render(<PartiesTable {...defaultProps} />);

      const typeHeader = screen.getByRole('columnheader', { name: /Type/ });
      await user.click(typeHeader);

      const rows = screen.getAllByRole('row');
      expect(rows[1]).toHaveTextContent('Defendant');
    });

    it('should sort by role', async () => {
      const user = userEvent.setup();
      render(<PartiesTable {...defaultProps} />);

      const roleHeader = screen.getByRole('columnheader', { name: /Role/ });
      await user.click(roleHeader);

      const rows = screen.getAllByRole('row');
      expect(rows[1]).toHaveTextContent('Fact Witness');
    });

    it('should display sort indicator arrow', async () => {
      const user = userEvent.setup();
      render(<PartiesTable {...defaultProps} />);

      const nameHeader = screen.getByRole('columnheader', { name: /Name/ });
      await user.click(nameHeader);

      const sortIcon = within(nameHeader).getByRole('img', { hidden: true }) || nameHeader.querySelector('svg');
      expect(sortIcon).toBeInTheDocument();
    });
  });

  describe('Party Type Badge Colors', () => {
    it('should apply blue color for Plaintiff type', () => {
      render(<PartiesTable {...defaultProps} />);

      const plaintiffBadge = screen.getByText('Plaintiff');
      expect(plaintiffBadge).toHaveClass('bg-blue-50', 'text-blue-700');
    });

    it('should apply red color for Defendant type', () => {
      render(<PartiesTable {...defaultProps} />);

      const defendantBadge = screen.getByText('Defendant');
      expect(defendantBadge).toHaveClass('bg-red-50', 'text-red-700');
    });

    it('should apply teal color for Witness type', () => {
      render(<PartiesTable {...defaultProps} />);

      const witnessBadge = screen.getByText('Witness');
      expect(witnessBadge).toHaveClass('bg-teal-50', 'text-teal-700');
    });

    it('should apply indigo color for Expert Witness type', () => {
      render(<PartiesTable {...defaultProps} />);

      const expertBadge = screen.getByText('Expert Witness');
      expect(expertBadge).toHaveClass('bg-indigo-50', 'text-indigo-700');
    });
  });

  describe('Contact Information', () => {
    it('should display email as clickable link', () => {
      render(<PartiesTable {...defaultProps} />);

      const emailLink = screen.getByRole('link', { name: 'john.smith@example.com' });
      expect(emailLink).toHaveAttribute('href', 'mailto:john.smith@example.com');
    });

    it('should display phone number', () => {
      render(<PartiesTable {...defaultProps} />);

      expect(screen.getByText('555-123-4567')).toBeInTheDocument();
    });

    it('should not render contact section when no email or phone', () => {
      const partiesWithoutContact = [{
        ...mockParties[3],
        email: undefined,
        phone: undefined,
      }];

      render(<PartiesTable parties={partiesWithoutContact} />);

      const row = screen.getByText('Expert Corp').closest('tr');
      const contactCell = within(row!).queryByRole('link');
      expect(contactCell).toBeNull();
    });
  });

  describe('Counsel Information', () => {
    it('should display attorney name', () => {
      render(<PartiesTable {...defaultProps} />);

      expect(screen.getByText('Robert Attorney')).toBeInTheDocument();
    });

    it('should display attorney firm', () => {
      render(<PartiesTable {...defaultProps} />);

      expect(screen.getByText('Attorney & Associates')).toBeInTheDocument();
    });

    it('should display attorney email', () => {
      render(<PartiesTable {...defaultProps} />);

      const emailLink = screen.getByRole('link', { name: 'robert@attorney.com' });
      expect(emailLink).toHaveAttribute('href', 'mailto:robert@attorney.com');
    });

    it('should display counsel name when no attorney details', () => {
      render(<PartiesTable {...defaultProps} />);

      expect(screen.getByText('Defense Counsel LLP')).toBeInTheDocument();
    });

    it('should display Pro Se badge when party represents themselves', () => {
      render(<PartiesTable {...defaultProps} />);

      expect(screen.getByText('Pro Se')).toBeInTheDocument();
    });

    it('should display No counsel when no counsel information', () => {
      const partiesWithoutCounsel = [{
        ...mockParties[3],
        counsel: undefined,
        attorneyName: undefined,
        isProSe: false,
      }];

      render(<PartiesTable parties={partiesWithoutCounsel} />);

      expect(screen.getByText('No counsel')).toBeInTheDocument();
    });
  });

  describe('Row Selection', () => {
    it('should call onSelectParty when row is clicked', async () => {
      const user = userEvent.setup();
      render(<PartiesTable {...defaultProps} />);

      const firstRow = screen.getByText('John Smith').closest('tr');
      await user.click(firstRow!);

      expect(defaultProps.onSelectParty).toHaveBeenCalledWith(mockParties[0]);
    });

    it('should have cursor pointer when onSelectParty is provided', () => {
      render(<PartiesTable {...defaultProps} />);

      const rows = screen.getAllByRole('row').slice(1); // Skip header
      rows.forEach(row => {
        expect(row).toHaveClass('cursor-pointer');
      });
    });

    it('should not have cursor pointer when onSelectParty is not provided', () => {
      render(<PartiesTable parties={mockParties} />);

      const rows = screen.getAllByRole('row').slice(1);
      rows.forEach(row => {
        expect(row).not.toHaveClass('cursor-pointer');
      });
    });
  });

  describe('Actions Column', () => {
    it('should show actions column when showActions is true', () => {
      render(<PartiesTable {...defaultProps} showActions />);

      expect(screen.getAllByText('View').length).toBeGreaterThan(0);
    });

    it('should hide actions column when showActions is false', () => {
      render(<PartiesTable {...defaultProps} showActions={false} />);

      expect(screen.queryByText('View')).not.toBeInTheDocument();
    });

    it('should show actions column by default', () => {
      render(<PartiesTable {...defaultProps} />);

      expect(screen.getAllByText('View').length).toBeGreaterThan(0);
    });

    it('should stop event propagation when View is clicked', async () => {
      const user = userEvent.setup();
      render(<PartiesTable {...defaultProps} />);

      const viewButtons = screen.getAllByText('View');
      await user.click(viewButtons[0]);

      // onSelectParty should NOT be called
      expect(defaultProps.onSelectParty).not.toHaveBeenCalled();
    });
  });

  describe('Responsive Design', () => {
    it('should have horizontal scroll container', () => {
      const { container } = render(<PartiesTable {...defaultProps} />);

      const scrollContainer = container.querySelector('.overflow-x-auto');
      expect(scrollContainer).toBeInTheDocument();
    });
  });

  describe('Dark Mode', () => {
    it('should have dark mode classes on container', () => {
      const { container } = render(<PartiesTable {...defaultProps} />);

      expect(container.firstChild).toHaveClass('dark:border-gray-700');
    });

    it('should have dark mode classes on table headers', () => {
      render(<PartiesTable {...defaultProps} />);

      const header = screen.getByRole('columnheader', { name: /Name/ });
      expect(header).toHaveClass('dark:text-gray-400', 'dark:hover:bg-gray-700');
    });

    it('should have dark mode classes on table body', () => {
      render(<PartiesTable {...defaultProps} />);

      const rows = screen.getAllByRole('row').slice(1);
      rows.forEach(row => {
        expect(row).toHaveClass('dark:hover:bg-gray-800');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper table structure', () => {
      render(<PartiesTable {...defaultProps} />);

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getAllByRole('columnheader').length).toBe(6); // Including Actions
      expect(screen.getAllByRole('row').length).toBe(5); // Header + 4 data rows
    });

    it('should have scope attributes on column headers', () => {
      render(<PartiesTable {...defaultProps} />);

      const headers = screen.getAllByRole('columnheader');
      headers.forEach(header => {
        expect(header).toHaveAttribute('scope', 'col');
      });
    });

    it('should have sr-only text for Actions column', () => {
      render(<PartiesTable {...defaultProps} showActions />);

      const actionsHeader = screen.getByText('Actions', { selector: '.sr-only' });
      expect(actionsHeader).toBeInTheDocument();
    });
  });

  describe('Custom ClassName', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <PartiesTable {...defaultProps} className="custom-parties-table" />
      );

      expect(container.firstChild).toHaveClass('custom-parties-table');
    });
  });

  describe('Various Party Types', () => {
    const allPartyTypes = [
      'Plaintiff', 'Defendant', 'Petitioner', 'Respondent',
      'Appellant', 'Appellee', 'Third Party', 'Witness', 'Expert Witness'
    ];

    allPartyTypes.forEach(type => {
      it(`should render ${type} type correctly`, () => {
        const partyWithType = [{
          ...mockParties[0],
          id: `party-${type}`,
          type,
        }];

        render(<PartiesTable parties={partyWithType} />);

        expect(screen.getByText(type)).toBeInTheDocument();
      });
    });
  });

  describe('Null/Undefined Values', () => {
    it('should handle null values gracefully', () => {
      const partiesWithNulls = [{
        id: 'party-null',
        name: 'Null Party',
        type: 'Plaintiff',
        role: null,
        email: null,
        phone: null,
      } as unknown as Party];

      render(<PartiesTable parties={partiesWithNulls} />);

      expect(screen.getByText('Null Party')).toBeInTheDocument();
    });

    it('should handle undefined values gracefully', () => {
      const partiesWithUndefined = [{
        id: 'party-undef',
        name: 'Undefined Party',
        type: 'Defendant',
        role: undefined,
        email: undefined,
        phone: undefined,
      }];

      render(<PartiesTable parties={partiesWithUndefined} />);

      expect(screen.getByText('Undefined Party')).toBeInTheDocument();
    });
  });
});
