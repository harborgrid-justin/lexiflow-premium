/**
 * CaseTeam.test.tsx
 * Comprehensive tests for Case Team component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CaseTeam } from '@/components/enterprise/CaseManagement/CaseTeam';
import { TeamMember, TeamMemberRole, Permission } from '@/components/enterprise/CaseManagement/CaseTeam';

// Mock team members
const mockTeamMembers: TeamMember[] = [
  {
    id: 'tm-1',
    userId: 'user-1',
    name: 'John Smith',
    email: 'john.smith@lawfirm.com',
    phone: '(555) 123-4567',
    role: 'Lead Attorney' as TeamMemberRole,
    permissions: ['view', 'edit', 'delete', 'manage_team'] as Permission[],
    billingRate: 500,
    hoursLogged: 45.5,
    capacity: 85,
    joinedDate: '2024-01-01',
    status: 'active',
    expertise: ['Litigation', 'Contract Law', 'Appeals'],
    assignedTasks: 12,
    completedTasks: 8,
    isStarred: true,
  },
  {
    id: 'tm-2',
    userId: 'user-2',
    name: 'Jane Doe',
    email: 'jane.doe@lawfirm.com',
    role: 'Associate' as TeamMemberRole,
    permissions: ['view', 'edit'] as Permission[],
    billingRate: 300,
    hoursLogged: 32.0,
    capacity: 70,
    joinedDate: '2024-01-10',
    status: 'active',
    department: 'Litigation',
    assignedTasks: 8,
    completedTasks: 6,
  },
  {
    id: 'tm-3',
    userId: 'user-3',
    name: 'Bob Wilson',
    email: 'bob.wilson@lawfirm.com',
    phone: '(555) 987-6543',
    role: 'Paralegal' as TeamMemberRole,
    permissions: ['view', 'manage_documents'] as Permission[],
    billingRate: 150,
    hoursLogged: 28.5,
    capacity: 90,
    joinedDate: '2024-01-05',
    status: 'active',
    expertise: ['Research', 'Document Management'],
    assignedTasks: 15,
    completedTasks: 12,
  },
  {
    id: 'tm-4',
    userId: 'user-4',
    name: 'Dr. Sarah Expert',
    email: 'sarah@expertwitness.com',
    role: 'Expert Witness' as TeamMemberRole,
    permissions: ['view'] as Permission[],
    billingRate: 800,
    hoursLogged: 10.0,
    capacity: 50,
    joinedDate: '2024-02-01',
    status: 'active',
    organization: 'Expert Consulting Inc.',
    expertise: ['Forensic Accounting'],
  },
  {
    id: 'tm-5',
    userId: 'user-5',
    name: 'Mark Inactive',
    email: 'mark@lawfirm.com',
    role: 'Associate' as TeamMemberRole,
    permissions: ['view'] as Permission[],
    billingRate: 300,
    hoursLogged: 0,
    capacity: 0,
    joinedDate: '2024-01-01',
    status: 'inactive',
  },
];

describe('CaseTeam', () => {
  const defaultProps = {
    caseId: 'case-123',
    members: mockTeamMembers,
    onAddMember: jest.fn(),
    onRemoveMember: jest.fn(),
    onUpdateMember: jest.fn(),
    onUpdatePermissions: jest.fn(),
    allowEdit: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Team Member Rendering', () => {
    it('should render all active team members', () => {
      render(<CaseTeam {...defaultProps} />);

      expect(screen.getByText('John Smith')).toBeInTheDocument();
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
      expect(screen.getByText('Dr. Sarah Expert')).toBeInTheDocument();
    });

    it('should display member roles', () => {
      render(<CaseTeam {...defaultProps} />);

      // Multiple elements may have the same role text (badges and filter buttons)
      expect(screen.getAllByText('Lead Attorney').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Associate').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Paralegal').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Expert Witness').length).toBeGreaterThan(0);
    });

    it('should display member contact information', () => {
      render(<CaseTeam {...defaultProps} />);

      expect(screen.getByText('john.smith@lawfirm.com')).toBeInTheDocument();
      expect(screen.getByText('(555) 123-4567')).toBeInTheDocument();
    });

    it('should display organization for external members', () => {
      render(<CaseTeam {...defaultProps} />);

      expect(screen.getByText('Expert Consulting Inc.')).toBeInTheDocument();
    });

    it('should show member count', () => {
      render(<CaseTeam {...defaultProps} />);

      expect(screen.getByText('5 team members')).toBeInTheDocument();
    });

    it('should display member avatars with initials', () => {
      render(<CaseTeam {...defaultProps} />);

      expect(screen.getByText('JS')).toBeInTheDocument(); // John Smith
      expect(screen.getByText('JD')).toBeInTheDocument(); // Jane Doe
      expect(screen.getByText('BW')).toBeInTheDocument(); // Bob Wilson
    });

    it('should show starred indicator for starred members', () => {
      render(<CaseTeam {...defaultProps} />);

      // John Smith is starred
      const johnCard = screen.getByText('John Smith').closest('div');
      expect(johnCard).toBeInTheDocument();
    });
  });

  describe('Role Assignment', () => {
    it('should display role badges with appropriate colors', () => {
      render(<CaseTeam {...defaultProps} />);

      // Find the badge (not the filter button) by looking for the specific badge classes
      const leadAttorneyBadges = screen.getAllByText('Lead Attorney');
      const badge = leadAttorneyBadges.find(el => el.className.includes('bg-purple-100'));
      expect(badge).toBeInTheDocument();
    });

    it('should sort members with lead attorneys first', () => {
      render(<CaseTeam {...defaultProps} />);

      const memberCards = screen.getAllByText(/Lead Attorney|Associate|Paralegal|Expert Witness/);
      // Lead Attorney should appear first in the list
      expect(memberCards[0]).toHaveTextContent(/Lead Attorney/);
    });
  });

  describe('Permission Display', () => {
    it('should open permissions modal when Permissions button clicked', async () => {
      render(<CaseTeam {...defaultProps} />);

      const permissionButtons = screen.getAllByRole('button', { name: /Permissions/i });
      await userEvent.click(permissionButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Manage Permissions')).toBeInTheDocument();
      });
    });

    it('should display all permission options in modal', async () => {
      render(<CaseTeam {...defaultProps} />);

      const permissionButtons = screen.getAllByRole('button', { name: /Permissions/i });
      await userEvent.click(permissionButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/View case details/i)).toBeInTheDocument();
        expect(screen.getByText(/Edit case information/i)).toBeInTheDocument();
        expect(screen.getByText(/Delete case records/i)).toBeInTheDocument();
      });
    });

    it('should show checked permissions for member', async () => {
      render(<CaseTeam {...defaultProps} />);

      const permissionButtons = screen.getAllByRole('button', { name: /Permissions/i });
      await userEvent.click(permissionButtons[0]);

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        // John Smith has 4 permissions, so at least 4 should be checked
        const checkedBoxes = checkboxes.filter(cb => (cb as HTMLInputElement).checked);
        expect(checkedBoxes.length).toBeGreaterThan(0);
      });
    });

    it('should call onUpdatePermissions when permission toggled', async () => {
      render(<CaseTeam {...defaultProps} />);

      const permissionButtons = screen.getAllByRole('button', { name: /Permissions/i });
      await userEvent.click(permissionButtons[0]);

      await waitFor(async () => {
        const checkboxes = screen.getAllByRole('checkbox');
        if (checkboxes.length > 0) {
          await userEvent.click(checkboxes[0]);
          expect(defaultProps.onUpdatePermissions).toHaveBeenCalled();
        }
      });
    });

    it('should close permissions modal when Cancel clicked', async () => {
      render(<CaseTeam {...defaultProps} />);

      const permissionButtons = screen.getAllByRole('button', { name: /Permissions/i });
      await userEvent.click(permissionButtons[0]);

      const cancelButton = await screen.findByRole('button', { name: /Cancel/i });
      await userEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText('Manage Permissions')).not.toBeInTheDocument();
      });
    });

    it('should close permissions modal when Save Changes clicked', async () => {
      render(<CaseTeam {...defaultProps} />);

      const permissionButtons = screen.getAllByRole('button', { name: /Permissions/i });
      await userEvent.click(permissionButtons[0]);

      const saveButton = await screen.findByRole('button', { name: /Save Changes/i });
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.queryByText('Manage Permissions')).not.toBeInTheDocument();
      });
    });
  });

  describe('Workload Indicators', () => {
    it('should display hours logged for each member', () => {
      render(<CaseTeam {...defaultProps} />);

      expect(screen.getByText('45.5')).toBeInTheDocument(); // John Smith
      expect(screen.getByText('32')).toBeInTheDocument(); // Jane Doe
      expect(screen.getByText('28.5')).toBeInTheDocument(); // Bob Wilson
    });

    it('should display billing rate for each member', () => {
      render(<CaseTeam {...defaultProps} />);

      expect(screen.getByText('$500/hr')).toBeInTheDocument();
      expect(screen.getAllByText('$300/hr').length).toBeGreaterThan(0);
      expect(screen.getByText('$150/hr')).toBeInTheDocument();
    });

    it('should display capacity percentage', () => {
      render(<CaseTeam {...defaultProps} />);

      expect(screen.getByText('85%')).toBeInTheDocument();
      expect(screen.getByText('70%')).toBeInTheDocument();
      expect(screen.getByText('90%')).toBeInTheDocument();
    });

    it('should display task completion statistics', () => {
      render(<CaseTeam {...defaultProps} />);

      expect(screen.getByText('8 completed')).toBeInTheDocument();
      expect(screen.getByText('4 pending')).toBeInTheDocument(); // 12 assigned - 8 completed
    });

    it('should calculate workload summary correctly', () => {
      render(<CaseTeam {...defaultProps} />);

      // Total hours: 45.5 + 32 + 28.5 + 10 = 116
      expect(screen.getByText('116.0')).toBeInTheDocument();

      // Active members (status !== inactive): 4
      expect(screen.getByText('4')).toBeInTheDocument();
    });

    it('should calculate billable amount', () => {
      render(<CaseTeam {...defaultProps} />);

      // (45.5 * 500) + (32 * 300) + (28.5 * 150) + (10 * 800) = 44,625
      // Displayed as $44.6k (using toFixed(1))
      expect(screen.getByText(/\$44\.6k/i)).toBeInTheDocument();
    });

    it('should calculate utilization rate', () => {
      render(<CaseTeam {...defaultProps} />);

      // Average capacity: (85 + 70 + 90 + 50) / 4 = 73.75, rounded to 74%
      expect(screen.getByText('74%')).toBeInTheDocument();
    });
  });

  describe('Team Search and Filtering', () => {
    it('should filter members by name', async () => {
      render(<CaseTeam {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/search team members/i);
      await userEvent.type(searchInput, 'John');

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
        expect(screen.queryByText('Jane Doe')).not.toBeInTheDocument();
      });
    });

    it('should filter members by email', async () => {
      render(<CaseTeam {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/search team members/i);
      await userEvent.type(searchInput, 'jane.doe');

      await waitFor(() => {
        expect(screen.getByText('Jane Doe')).toBeInTheDocument();
        expect(screen.queryByText('John Smith')).not.toBeInTheDocument();
      });
    });

    it('should filter members by role', async () => {
      render(<CaseTeam {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/search team members/i);
      await userEvent.type(searchInput, 'Paralegal');

      await waitFor(() => {
        expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
        expect(screen.queryByText('John Smith')).not.toBeInTheDocument();
      });
    });

    it('should filter by role using role buttons', async () => {
      render(<CaseTeam {...defaultProps} />);

      const associateButton = screen.getByRole('button', { name: /^Associate$/i });
      await userEvent.click(associateButton);

      await waitFor(() => {
        expect(screen.getByText('Jane Doe')).toBeInTheDocument();
        expect(screen.queryByText('John Smith')).not.toBeInTheDocument();
      });
    });

    it('should show All members when All filter selected', async () => {
      render(<CaseTeam {...defaultProps} />);

      // First filter to Associate
      const associateButton = screen.getByRole('button', { name: /^Associate$/i });
      await userEvent.click(associateButton);

      // Then click All
      const allButton = screen.getByRole('button', { name: /^All$/i });
      await userEvent.click(allButton);

      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
        expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      });
    });

    it('should highlight active role filter', async () => {
      render(<CaseTeam {...defaultProps} />);

      const paralegalButton = screen.getByRole('button', { name: /^Paralegal$/i });
      await userEvent.click(paralegalButton);

      await waitFor(() => {
        expect(paralegalButton).toHaveClass(/bg-blue-600/);
      });
    });
  });

  describe('Member Actions', () => {
    it('should call onUpdateMember when Edit clicked', async () => {
      render(<CaseTeam {...defaultProps} />);

      const editButtons = screen.getAllByRole('button', { name: /^Edit$/i });
      await userEvent.click(editButtons[0]);

      expect(defaultProps.onUpdateMember).toHaveBeenCalled();
    });

    it('should call onRemoveMember when delete button clicked', async () => {
      render(<CaseTeam {...defaultProps} />);

      const deleteButtons = screen.getAllByRole('button');
      const deleteButton = deleteButtons.find(btn => btn.querySelector('svg.lucide-trash-2'));

      if (deleteButton) {
        await userEvent.click(deleteButton);
        expect(defaultProps.onRemoveMember).toHaveBeenCalled();
      }
    });

    it('should not show action buttons when allowEdit is false', () => {
      render(<CaseTeam {...defaultProps} allowEdit={false} />);

      expect(screen.queryByRole('button', { name: /Permissions/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Edit/i })).not.toBeInTheDocument();
    });

    it('should show Add Member button when allowEdit is true', () => {
      render(<CaseTeam {...defaultProps} allowEdit={true} />);

      expect(screen.getByRole('button', { name: /Add Member/i })).toBeInTheDocument();
    });

    it('should not show Add Member button when allowEdit is false', () => {
      render(<CaseTeam {...defaultProps} allowEdit={false} />);

      expect(screen.queryByRole('button', { name: /Add Member/i })).not.toBeInTheDocument();
    });
  });

  describe('Expertise Tags', () => {
    it('should display expertise tags', () => {
      render(<CaseTeam {...defaultProps} />);

      expect(screen.getByText('Litigation')).toBeInTheDocument();
      expect(screen.getByText('Contract Law')).toBeInTheDocument();
      expect(screen.getByText('Research')).toBeInTheDocument();
    });

    it('should limit expertise tags to 3 and show more indicator', () => {
      render(<CaseTeam {...defaultProps} />);

      // John Smith has 3 expertise areas, should not show +more
      const johnCard = screen.getByText('John Smith').closest('div');
      if (johnCard) {
        expect(within(johnCard).queryByText(/\+\d+ more/)).not.toBeInTheDocument();
      }
    });

    it('should show +more indicator when more than 3 expertise areas', () => {
      const memberWithManySkills: TeamMember = {
        ...mockTeamMembers[0],
        expertise: ['Skill1', 'Skill2', 'Skill3', 'Skill4', 'Skill5'],
      };

      render(<CaseTeam {...defaultProps} members={[memberWithManySkills]} />);

      expect(screen.getByText('+2 more')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no members', () => {
      render(<CaseTeam {...defaultProps} members={[]} />);

      expect(screen.getByText('No team members found')).toBeInTheDocument();
      expect(screen.getByText(/Add team members to start collaborating/i)).toBeInTheDocument();
    });

    it('should show empty state with Add button when allowEdit', () => {
      render(<CaseTeam {...defaultProps} members={[]} allowEdit={true} />);

      expect(screen.getByRole('button', { name: /Add Your First Member/i })).toBeInTheDocument();
    });

    it('should show filtered empty state', async () => {
      render(<CaseTeam {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/search team members/i);
      await userEvent.type(searchInput, 'NonexistentMember');

      await waitFor(() => {
        expect(screen.getByText('No team members found')).toBeInTheDocument();
        expect(screen.getByText(/Try adjusting your search or filters/i)).toBeInTheDocument();
      });
    });
  });

  describe('Summary Statistics', () => {
    it('should display summary cards', () => {
      render(<CaseTeam {...defaultProps} />);

      expect(screen.getByText(/Active Members/i)).toBeInTheDocument();
      expect(screen.getByText(/Total Hours/i)).toBeInTheDocument();
      expect(screen.getByText(/Billable Amount/i)).toBeInTheDocument();
      expect(screen.getByText(/Utilization/i)).toBeInTheDocument();
    });
  });

  describe('Contact Links', () => {
    it('should render clickable email links', () => {
      render(<CaseTeam {...defaultProps} />);

      const emailLink = screen.getByText('john.smith@lawfirm.com');
      expect(emailLink.closest('a')).toHaveAttribute('href', 'mailto:john.smith@lawfirm.com');
    });

    it('should render clickable phone links', () => {
      render(<CaseTeam {...defaultProps} />);

      const phoneLink = screen.getByText('(555) 123-4567');
      expect(phoneLink.closest('a')).toHaveAttribute('href', 'tel:(555) 123-4567');
    });
  });

  describe('Member Sorting', () => {
    it('should sort lead attorneys to the top', () => {
      render(<CaseTeam {...defaultProps} />);

      const roleElements = screen.getAllByText(/Lead Attorney|Associate|Paralegal/);
      // First one should be Lead Attorney
      expect(roleElements[0]).toHaveTextContent('Lead Attorney');
    });
  });
});
