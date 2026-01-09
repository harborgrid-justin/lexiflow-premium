/**
 * Case Team Management Component
 *
 * Enterprise team management with:
 * - Role-based team member assignment
 * - Permission and access control management
 * - Workload balancing and capacity tracking
 * - Time tracking and billing rate management
 * - Team collaboration and notifications
 * - External counsel and expert witness management
 *
 * @module components/enterprise/CaseManagement/CaseTeam
 */

import { useTheme } from '@/contexts/theme/ThemeContext';
import { cn } from '@/shared/lib/utils';
import {
  AlertCircle,
  Building,
  CheckCircle,
  Clock,
  DollarSign,
  Edit,
  Mail,
  MoreVertical,
  Phone,
  Search,
  Shield,
  Star,
  Trash2,
  TrendingUp,
  UserPlus,
  Users
} from 'lucide-react';
import React, { useMemo, useState } from 'react';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type TeamMemberRole =
  | 'Lead Attorney'
  | 'Co-Counsel'
  | 'Associate'
  | 'Paralegal'
  | 'Legal Assistant'
  | 'Expert Witness'
  | 'External Counsel'
  | 'Consultant';

export type Permission =
  | 'view'
  | 'edit'
  | 'delete'
  | 'manage_team'
  | 'manage_documents'
  | 'manage_billing'
  | 'manage_calendar'
  | 'communicate_with_client';

export interface TeamMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  role: TeamMemberRole;
  permissions: Permission[];
  billingRate?: number;
  hoursLogged?: number;
  capacity?: number; // Percentage of availability
  joinedDate: string;
  status: 'active' | 'inactive' | 'pending';
  department?: string;
  organization?: string; // For external counsel
  expertise?: string[];
  assignedTasks?: number;
  completedTasks?: number;
  isStarred?: boolean;
  lastActive?: string;
}

export interface RoleTemplate {
  role: TeamMemberRole;
  defaultPermissions: Permission[];
  suggestedBillingRate?: number;
  description: string;
}

export interface WorkloadSummary {
  totalHours: number;
  billableAmount: number;
  utilizationRate: number;
  activeMembers: number;
}

export interface CaseTeamProps {
  caseId: string;
  members: TeamMember[];
  onAddMember?: (member: Partial<TeamMember>) => void;
  onRemoveMember?: (memberId: string) => void;
  onUpdateMember?: (member: TeamMember) => void;
  onUpdatePermissions?: (memberId: string, permissions: Permission[]) => void;
  allowEdit?: boolean;
  className?: string;
}

// ============================================================================
// Configuration
// ============================================================================

const PERMISSION_DESCRIPTIONS: Record<Permission, string> = {
  view: 'View case details and documents',
  edit: 'Edit case information and documents',
  delete: 'Delete case records and documents',
  manage_team: 'Add/remove team members and manage roles',
  manage_documents: 'Upload, organize, and manage documents',
  manage_billing: 'View and manage billing and invoices',
  manage_calendar: 'Create and manage calendar events',
  communicate_with_client: 'Direct communication with client',
};

const ROLE_COLORS: Record<TeamMemberRole, string> = {
  'Lead Attorney': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  'Co-Counsel': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  'Associate': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  'Paralegal': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  'Legal Assistant': 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
  'Expert Witness': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  'External Counsel': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  'Consultant': 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
};

// ============================================================================
// Component
// ============================================================================

export const CaseTeam: React.FC<CaseTeamProps> = ({
  members,
  onAddMember,
  onRemoveMember,
  onUpdateMember,
  onUpdatePermissions,
  allowEdit = false,
  className,
}) => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<TeamMemberRole | 'All'>('All');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showPermissions, setShowPermissions] = useState(false);

  // Calculate workload summary
  const workloadSummary = useMemo((): WorkloadSummary => {
    const activeMembers = members.filter(m => m.status === 'active');
    const totalHours = activeMembers.reduce((sum, m) => sum + (m.hoursLogged || 0), 0);
    const billableAmount = activeMembers.reduce((sum, m) =>
      sum + ((m.hoursLogged || 0) * (m.billingRate || 0)), 0
    );
    const avgCapacity = activeMembers.length > 0
      ? activeMembers.reduce((sum, m) => sum + (m.capacity || 100), 0) / activeMembers.length
      : 0;

    return {
      totalHours,
      billableAmount,
      utilizationRate: avgCapacity,
      activeMembers: activeMembers.length,
    };
  }, [members]);

  // Filtered members
  const filteredMembers = useMemo(() => {
    let result = members;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(m =>
        m.name.toLowerCase().includes(query) ||
        m.email.toLowerCase().includes(query) ||
        m.role.toLowerCase().includes(query)
      );
    }

    if (selectedRole !== 'All') {
      result = result.filter(m => m.role === selectedRole);
    }

    return result.sort((a, b) => {
      // Lead attorneys first, then by name
      if (a.role === 'Lead Attorney' && b.role !== 'Lead Attorney') return -1;
      if (a.role !== 'Lead Attorney' && b.role === 'Lead Attorney') return 1;
      return a.name.localeCompare(b.name);
    });
  }, [members, searchQuery, selectedRole]);

  // Get unique roles
  const roles = useMemo(() => {
    const uniqueRoles = new Set(members.map(m => m.role));
    return ['All', ...Array.from(uniqueRoles)];
  }, [members]);

  // Handle permission toggle
  const handlePermissionToggle = (permission: Permission) => {
    if (!selectedMember || !onUpdatePermissions) return;

    const newPermissions = selectedMember.permissions.includes(permission)
      ? selectedMember.permissions.filter(p => p !== permission)
      : [...selectedMember.permissions, permission];

    onUpdatePermissions(selectedMember.id, newPermissions);
    setSelectedMember({ ...selectedMember, permissions: newPermissions });
  };

  return (
    <div className={cn('flex flex-col h-full space-y-4', className)}>
      {/* Header & Summary Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className={cn("text-2xl font-bold", theme.text.primary)}>Case Team</h2>
            <p className={cn("text-sm mt-1", theme.text.secondary)}>
              {members.length} team members
            </p>
          </div>
          {allowEdit && (
            <button
              onClick={() => onAddMember?.({})}
              className={cn("flex items-center gap-2 px-4 py-2 text-white rounded-lg", theme.interactive.primary)}
            >
              <UserPlus className="h-4 w-4" />
              Add Member
            </button>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={cn("p-4 border rounded-lg", theme.surface.default, theme.border.default)}>
            <div className="flex items-center justify-between">
              <div>
                <p className={cn("text-xs font-medium", theme.text.secondary)}>Active Members</p>
                <p className={cn("text-2xl font-bold mt-1", theme.text.primary)}>
                  {workloadSummary.activeMembers}
                </p>
              </div>
              <Users className={cn("h-8 w-8", theme.text.accent)} />
            </div>
          </div>

          <div className={cn("p-4 border rounded-lg", theme.surface.default, theme.border.default)}>
            <div className="flex items-center justify-between">
              <div>
                <p className={cn("text-xs font-medium", theme.text.secondary)}>Total Hours</p>
                <p className={cn("text-2xl font-bold mt-1", theme.text.primary)}>
                  {workloadSummary.totalHours.toFixed(1)}
                </p>
              </div>
              <Clock className={cn("h-8 w-8", theme.text.success)} />
            </div>
          </div>

          <div className={cn("p-4 border rounded-lg", theme.surface.default, theme.border.default)}>
            <div className="flex items-center justify-between">
              <div>
                <p className={cn("text-xs font-medium", theme.text.secondary)}>Billable Amount</p>
                <p className={cn("text-2xl font-bold mt-1", theme.text.primary)}>
                  ${(workloadSummary.billableAmount / 1000).toFixed(1)}k
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          <div className={cn("p-4 border rounded-lg", theme.surface.default, theme.border.default)}>
            <div className="flex items-center justify-between">
              <div>
                <p className={cn("text-xs font-medium", theme.text.secondary)}>Utilization</p>
                <p className={cn("text-2xl font-bold mt-1", theme.text.primary)}>
                  {workloadSummary.utilizationRate.toFixed(0)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-amber-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4", theme.text.muted)} />
          <input
            type="text"
            placeholder="Search team members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn("w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500", theme.surface.input, theme.border.default, theme.text.primary)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {roles.map(role => (
            <button
              key={role}
              onClick={() => setSelectedRole(role as TeamMemberRole | 'All')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                selectedRole === role
                  ? theme.interactive.primary
                  : cn(theme.surface.subtle, theme.text.secondary, `hover:${theme.surface.highlight}`)
              )}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredMembers.map(member => (
          <div
            key={member.id}
            className={cn("border rounded-lg p-4 transition-shadow hover:shadow-md", theme.surface.default, theme.border.default)}
          >
            {/* Member Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>

                {/* Info */}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={cn("font-semibold", theme.text.primary)}>
                      {member.name}
                    </h3>
                    {member.isStarred && (
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    )}
                  </div>
                  <span className={cn('inline-block px-2 py-0.5 text-xs font-medium rounded-full mt-1', ROLE_COLORS[member.role])}>
                    {member.role}
                  </span>
                </div>
              </div>

              {/* Actions Menu */}
              {allowEdit && (
                <button className={cn(theme.text.muted, `hover:${theme.text.primary}`)}>
                  <MoreVertical className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Contact Info */}
            <div className="space-y-2 mb-3">
              <div className={cn("flex items-center gap-2 text-sm", theme.text.secondary)}>
                <Mail className="h-4 w-4" />
                <a href={`mailto:${member.email}`} className={cn("hover:underline", theme.text.link)}>
                  {member.email}
                </a>
              </div>
              {member.phone && (
                <div className={cn("flex items-center gap-2 text-sm", theme.text.secondary)}>
                  <Phone className="h-4 w-4" />
                  <a href={`tel:${member.phone}`} className={cn("hover:underline", theme.text.link)}>
                    {member.phone}
                  </a>
                </div>
              )}
              {member.organization && (
                <div className={cn("flex items-center gap-2 text-sm", theme.text.secondary)}>
                  <Building className="h-4 w-4" />
                  {member.organization}
                </div>
              )}
            </div>

            {/* Stats Row */}
            <div className={cn("grid grid-cols-3 gap-3 py-3 border-t", theme.border.default)}>
              <div>
                <p className={cn("text-xs", theme.text.secondary)}>Hours</p>
                <p className={cn("text-sm font-semibold", theme.text.primary)}>
                  {member.hoursLogged || 0}
                </p>
              </div>
              <div>
                <p className={cn("text-xs", theme.text.secondary)}>Rate</p>
                <p className={cn("text-sm font-semibold", theme.text.primary)}>
                  ${member.billingRate || 0}/hr
                </p>
              </div>
              <div>
                <p className={cn("text-xs", theme.text.secondary)}>Capacity</p>
                <p className={cn("text-sm font-semibold", theme.text.primary)}>
                  {member.capacity || 100}%
                </p>
              </div>
            </div>

            {/* Tasks */}
            {(member.assignedTasks !== undefined || member.completedTasks !== undefined) && (
              <div className={cn("flex items-center gap-4 pt-3 border-t text-sm", theme.border.default, theme.text.secondary)}>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  <span>{member.completedTasks || 0} completed</span>
                </div>
                <div className="flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  <span>{(member.assignedTasks || 0) - (member.completedTasks || 0)} pending</span>
                </div>
              </div>
            )}

            {/* Expertise Tags */}
            {member.expertise && member.expertise.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {member.expertise.slice(0, 3).map(skill => (
                  <span
                    key={skill}
                    className={cn("px-2 py-0.5 text-xs rounded", theme.surface.subtle, theme.text.secondary)}
                  >
                    {skill}
                  </span>
                ))}
                {member.expertise.length > 3 && (
                  <span className={cn("px-2 py-0.5 text-xs", theme.text.muted)}>
                    +{member.expertise.length - 3} more
                  </span>
                )}
              </div>
            )}

            {/* Actions */}
            {allowEdit && (
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => {
                    setSelectedMember(member);
                    setShowPermissions(true);
                  }}
                  className={cn("flex-1 flex items-center justify-center gap-2 px-3 py-2 border rounded-lg text-sm", theme.border.default, `hover:${theme.surface.highlight}`)}
                >
                  <Shield className="h-4 w-4" />
                  Permissions
                </button>
                <button
                  onClick={() => onUpdateMember?.(member)}
                  className={cn("flex-1 flex items-center justify-center gap-2 px-3 py-2 border rounded-lg text-sm", theme.border.default, `hover:${theme.surface.highlight}`)}
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={() => onRemoveMember?.(member.id)}
                  className={cn("px-3 py-2 border rounded-lg text-sm", theme.status.error.border, theme.status.error.text, "hover:bg-red-50 dark:hover:bg-red-900/20")}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredMembers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Users className={cn("h-12 w-12 mb-4", theme.text.muted)} />
          <h3 className={cn("text-lg font-semibold mb-2", theme.text.primary)}>
            No team members found
          </h3>
          <p className={cn("text-sm mb-4", theme.text.secondary)}>
            {searchQuery || selectedRole !== 'All'
              ? 'Try adjusting your search or filters'
              : 'Add team members to start collaborating'}
          </p>
          {allowEdit && (
            <button
              onClick={() => onAddMember?.({})}
              className={cn("flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90", theme.interactive.primary)}
            >
              <UserPlus className="h-4 w-4" />
              Add Your First Member
            </button>
          )}
        </div>
      )}

      {/* Permissions Modal */}
      {showPermissions && selectedMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={cn("rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto", theme.surface.default)}>
            {/* Modal Header */}
            <div className={cn("sticky top-0 border-b p-6", theme.surface.default, theme.border.default)}>
              <div className="flex items-start justify-between">
                <div>
                  <h2 className={cn("text-xl font-bold", theme.text.primary)}>
                    Manage Permissions
                  </h2>
                  <p className={cn("text-sm mt-1", theme.text.secondary)}>
                    {selectedMember.name} - {selectedMember.role}
                  </p>
                </div>
                <button
                  onClick={() => setShowPermissions(false)}
                  className={cn(theme.text.muted, `hover:${theme.text.primary}`)}
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-3">
              {Object.entries(PERMISSION_DESCRIPTIONS).map(([perm, description]) => {
                const permission = perm as Permission;
                const isGranted = selectedMember.permissions.includes(permission);

                return (
                  <label
                    key={permission}
                    className={cn(
                      "flex items-start gap-3 p-3 border rounded-lg cursor-pointer",
                      theme.border.default,
                      `hover:${theme.surface.highlight}`
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isGranted}
                      onChange={() => handlePermissionToggle(permission)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className={cn("font-medium capitalize", theme.text.primary)}>
                        {permission.replace(/_/g, ' ')}
                      </p>
                      <p className={cn("text-sm", theme.text.secondary)}>
                        {description}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className={cn("sticky bottom-0 border-t p-6", theme.surface.default, theme.border.default)}>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowPermissions(false)}
                  className={cn("px-4 py-2 border rounded-lg", theme.border.default, theme.text.primary, `hover:${theme.surface.highlight}`)}
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowPermissions(false)}
                  className={cn("px-4 py-2 text-white rounded-lg hover:opacity-90", theme.interactive.primary)}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
