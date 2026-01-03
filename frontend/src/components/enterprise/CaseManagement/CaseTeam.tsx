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

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  Users, UserPlus, UserMinus, Search, Filter,
  Mail, Phone, Calendar, DollarSign, Clock,
  Shield, Edit, Trash2, MoreVertical, Star,
  CheckCircle, AlertCircle, TrendingUp, Award,
  Building, ExternalLink, Settings, Download
} from 'lucide-react';

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

const ROLE_TEMPLATES: RoleTemplate[] = [
  {
    role: 'Lead Attorney',
    defaultPermissions: ['view', 'edit', 'delete', 'manage_team', 'manage_documents', 'manage_billing', 'manage_calendar', 'communicate_with_client'],
    suggestedBillingRate: 500,
    description: 'Primary attorney responsible for case strategy and client communication',
  },
  {
    role: 'Co-Counsel',
    defaultPermissions: ['view', 'edit', 'manage_documents', 'manage_calendar', 'communicate_with_client'],
    suggestedBillingRate: 450,
    description: 'Secondary attorney assisting with case management',
  },
  {
    role: 'Associate',
    defaultPermissions: ['view', 'edit', 'manage_documents'],
    suggestedBillingRate: 300,
    description: 'Attorney providing research and document preparation support',
  },
  {
    role: 'Paralegal',
    defaultPermissions: ['view', 'edit', 'manage_documents', 'manage_calendar'],
    suggestedBillingRate: 150,
    description: 'Legal professional handling administrative and research tasks',
  },
  {
    role: 'Legal Assistant',
    defaultPermissions: ['view', 'manage_documents', 'manage_calendar'],
    suggestedBillingRate: 100,
    description: 'Administrative support for case documentation and scheduling',
  },
  {
    role: 'Expert Witness',
    defaultPermissions: ['view'],
    suggestedBillingRate: 800,
    description: 'Subject matter expert providing testimony and analysis',
  },
  {
    role: 'External Counsel',
    defaultPermissions: ['view', 'edit', 'manage_documents'],
    suggestedBillingRate: 450,
    description: 'Outside attorney providing specialized expertise',
  },
  {
    role: 'Consultant',
    defaultPermissions: ['view'],
    suggestedBillingRate: 350,
    description: 'Advisor providing specialized knowledge or services',
  },
];

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
  caseId,
  members,
  onAddMember,
  onRemoveMember,
  onUpdateMember,
  onUpdatePermissions,
  allowEdit = false,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<TeamMemberRole | 'All'>('All');
  const [showAddMember, setShowAddMember] = useState(false);
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Case Team</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {members.length} team members
            </p>
          </div>
          {allowEdit && (
            <button
              onClick={() => setShowAddMember(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <UserPlus className="h-4 w-4" />
              Add Member
            </button>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Active Members</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {workloadSummary.activeMembers}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Total Hours</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {workloadSummary.totalHours.toFixed(1)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Billable Amount</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  ${(workloadSummary.billableAmount / 1000).toFixed(1)}k
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Utilization</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search team members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
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
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
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
            className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700"
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
                    <h3 className="font-semibold text-gray-900 dark:text-white">
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
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <MoreVertical className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Contact Info */}
            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Mail className="h-4 w-4" />
                <a href={`mailto:${member.email}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                  {member.email}
                </a>
              </div>
              {member.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Phone className="h-4 w-4" />
                  <a href={`tel:${member.phone}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                    {member.phone}
                  </a>
                </div>
              )}
              {member.organization && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Building className="h-4 w-4" />
                  {member.organization}
                </div>
              )}
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3 py-3 border-t border-gray-200 dark:border-gray-700">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Hours</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {member.hoursLogged || 0}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Rate</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  ${member.billingRate || 0}/hr
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Capacity</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {member.capacity || 100}%
                </p>
              </div>
            </div>

            {/* Tasks */}
            {(member.assignedTasks !== undefined || member.completedTasks !== undefined) && (
              <div className="flex items-center gap-4 pt-3 border-t border-gray-200 dark:border-gray-700 text-sm">
                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <CheckCircle className="h-4 w-4" />
                  <span>{member.completedTasks || 0} completed</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
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
                    className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded dark:bg-gray-700 dark:text-gray-300"
                  >
                    {skill}
                  </span>
                ))}
                {member.expertise.length > 3 && (
                  <span className="px-2 py-0.5 text-xs text-gray-500">
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
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  <Shield className="h-4 w-4" />
                  Permissions
                </button>
                <button
                  onClick={() => onUpdateMember?.(member)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={() => onRemoveMember?.(member.id)}
                  className="px-3 py-2 border border-red-300 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
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
          <Users className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No team members found
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {searchQuery || selectedRole !== 'All'
              ? 'Try adjusting your search or filters'
              : 'Add team members to start collaborating'}
          </p>
          {allowEdit && (
            <button
              onClick={() => setShowAddMember(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <UserPlus className="h-4 w-4" />
              Add Your First Member
            </button>
          )}
        </div>
      )}

      {/* Permissions Modal */}
      {showPermissions && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Manage Permissions
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {selectedMember.name} - {selectedMember.role}
                  </p>
                </div>
                <button
                  onClick={() => setShowPermissions(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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
                    className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                  >
                    <input
                      type="checkbox"
                      checked={isGranted}
                      onChange={() => handlePermissionToggle(permission)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white capitalize">
                        {permission.replace(/_/g, ' ')}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {description}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowPermissions(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowPermissions(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
