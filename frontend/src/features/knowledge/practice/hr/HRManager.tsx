import React from 'react';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/organisms';
import { UserAvatar } from '@/components/atoms';
import { Badge } from '@/components/atoms';
import { Button } from '@/components/atoms';
import { ConfirmDialog } from '@/components/molecules';
import { MetricCard } from '@/components/molecules';
import { Plus, User, Award, TrendingUp, MoreHorizontal, Trash2, Loader2, AlertCircle, Users } from 'lucide-react';
import { StaffMember, UserId } from '@/types';

type StaffRole = 'Associate' | 'Paralegal' | 'Senior Partner' | 'Administrator';
import { DataService } from '@/services';
import { useTheme } from '@/providers/ThemeContext';
import { cn } from '@/utils/cn';
import { AddStaffModal } from './AddStaffModal';
import { useMutation } from '@/hooks/useQueryHooks';
// ✅ Migrated to backend API (2025-12-21)
import { useStaff } from '@/hooks/useDomainData';
import { useModalState } from '@/hooks';
import { useNotify } from '@/hooks/useNotify';
import { getTodayString } from '@/utils/dateUtils';
import { IdGenerator } from '@/utils/idGenerator';

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_BILLABLE_TARGET = 1800;
const DEFAULT_SALARY = 150000;
const UTILIZATION_WARNING_THRESHOLD = 75;
const UTILIZATION_TARGET = 85;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate average utilization rate across all staff
 */
const calculateAverageUtilization = (staffList: StaffMember[]): number => {
  if (staffList.length === 0) return 0;
  const totalUtilization = staffList.reduce((acc: any, s) => acc + (s.utilizationRate || 0), 0);
  return Math.round(totalUtilization / staffList.length);
};

/**
 * Get utilization color class based on rate
 */
const getUtilizationColorClass = (rate: number): string => {
  if (rate >= UTILIZATION_TARGET) return 'text-green-600';
  if (rate >= UTILIZATION_WARNING_THRESHOLD) return 'text-amber-600';
  return 'text-red-500';
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const HRManager: React.FC = () => {
  // ==========================================================================
  // HOOKS - Context & State
  // ==========================================================================
  const { theme } = useTheme();
  const notify = useNotify();
  const addStaffModal = useModalState();
  const deleteModal = useModalState();
  const [staffToDelete, setStaffToDelete] = React.useState<string | null>(null);

  // ==========================================================================
  // HOOKS - Data Fetching
  // ==========================================================================
  const { data: rawStaffList = [], isLoading, status, error, refetch } = useStaff();
  
  // Ensure staffList is always an array
  const staffList = Array.isArray(rawStaffList) ? rawStaffList : [];
  const isError = status === 'error';

  // ==========================================================================
  // HOOKS - Mutations
  // ==========================================================================
  const { mutate: addStaff, isLoading: isAdding } = useMutation(
      DataService.hr.addStaff,
      { 
          invalidateKeys: [['staff', 'all'], ['users', 'all']],
          onSuccess: () => {
              addStaffModal.close();
              notify.success('Staff member added successfully.');
          },
          onError: (err: Error) => {
              notify.error(`Failed to add staff member: ${err.message}`);
          }
      }
  );

  const { mutate: deleteStaff, isLoading: isDeleting } = useMutation(
      DataService.hr.deleteStaff,
      { 
          invalidateKeys: [['staff', 'all']],
          onSuccess: () => {
              deleteModal.close();
              setStaffToDelete(null);
              notify.success('Staff member removed successfully.');
          },
          onError: (err: Error) => {
              notify.error(`Failed to remove staff member: ${err.message}`);
          }
      }
  );

  // ==========================================================================
  // CALLBACKS - Event Handlers
  // ==========================================================================
  const handleAddStaff = (newStaff: Partial<StaffMember>) => {
      if (!newStaff.name?.trim() || !newStaff.email?.trim()) {
          notify.warning('Please fill in all required fields.');
          return;
      }

      const staff: StaffMember = {
          id: IdGenerator.staff(),
          userId: IdGenerator.user() as UserId,
          name: newStaff.name.trim(),
          email: newStaff.email.trim().toLowerCase(),
          role: (newStaff.role as StaffRole) || 'Associate',
          phone: newStaff.phone?.trim() || '',
          billableTarget: Number(newStaff.billableTarget) || DEFAULT_BILLABLE_TARGET,
          currentBillable: 0,
          utilizationRate: 0,
          salary: Number(newStaff.salary) || DEFAULT_SALARY,
          status: 'Active',
          startDate: getTodayString(),
      };
      addStaff(staff);
  };

  const handleDeleteClick = (id: string) => {
      setStaffToDelete(id);
      deleteModal.open();
  };
  
  const handleConfirmDelete = () => {
      if (staffToDelete) {
          deleteStaff(staffToDelete);
      }
  };

  const handleCancelDelete = () => {
      deleteModal.close();
      setStaffToDelete(null);
  };

  // ==========================================================================
  // COMPUTED VALUES
  // ==========================================================================
  const totalBillable = staffList.reduce((acc: any, s) => acc + (s.currentBillable || 0), 0);
  const averageUtilization = calculateAverageUtilization(staffList);
  const isOnTrackUtilization = averageUtilization >= UTILIZATION_TARGET;
  const staffToDeleteName = staffToDelete 
    ? staffList.find(s => s.id === staffToDelete)?.name || 'this staff member'
    : 'this staff member';

  // ==========================================================================
  // RENDER - Loading State
  // ==========================================================================
  if (isLoading) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-16', theme.surface.default)}>
        <Loader2 className={cn('h-8 w-8 animate-spin mb-4', theme.text.tertiary)} />
        <p className={theme.text.secondary}>Loading staff directory...</p>
      </div>
    );
  }

  // ==========================================================================
  // RENDER - Error State
  // ==========================================================================
  if (isError) {
    return (
      <div className={cn(
        'flex flex-col items-center justify-center py-16 rounded-lg border',
        theme.surface.default,
        theme.border.default
      )}>
        <AlertCircle className={cn('h-12 w-12 mb-4', theme.status.error.text)} />
        <h3 className={cn('text-lg font-semibold mb-2', theme.text.primary)}>
          Failed to Load Staff Directory
        </h3>
        <p className={cn('text-sm mb-4', theme.text.secondary)}>
          {error instanceof Error ? error.message : 'An unexpected error occurred'}
        </p>
        <Button variant="secondary" onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    );
  }

  // ==========================================================================
  // RENDER - Empty State
  // ==========================================================================
  const renderEmptyState = () => (
    <div className={cn(
      'flex flex-col items-center justify-center py-16 rounded-lg border border-dashed',
      theme.surface.default,
      theme.border.default
    )}>
      <Users className={cn('h-12 w-12 mb-4', theme.text.tertiary)} />
      <h3 className={cn('text-lg font-semibold mb-2', theme.text.primary)}>
        No Staff Members Found
      </h3>
      <p className={cn('text-sm mb-4 text-center max-w-md', theme.text.secondary)}>
        Your staff directory is empty. Add your first staff member to start tracking 
        attorney profiles, utilization targets, and performance metrics.
      </p>
      <Button variant="primary" icon={Plus} onClick={addStaffModal.open}>
        Add First Staff Member
      </Button>
    </div>
  );

  // ==========================================================================
  // MAIN RENDER
  // ==========================================================================
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className={cn("flex justify-between items-center p-4 rounded-lg border shadow-sm", theme.surface.default, theme.border.default)}>
        <div>
          <h3 className={cn("font-bold text-lg", theme.text.primary)}>Staff Directory</h3>
          <p className={cn("text-sm", theme.text.secondary)}>Manage attorney profiles, utilization targets, and performance.</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={addStaffModal.open}>Add Staff</Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard 
          label="Total Headcount" 
          value={staffList.length} 
          icon={User} 
          trend={staffList.length > 0 ? `${staffList.filter(s => s.status === 'Active').length} active` : 'No staff yet'}
          trendUp={staffList.length > 0}
          className="border-l-4 border-l-blue-600"
        />
        <MetricCard 
          label="Avg Utilization" 
          value={`${averageUtilization}%`}
          icon={Award} 
          trend={`Target: ${UTILIZATION_TARGET}%`}
          trendUp={isOnTrackUtilization}
          className="border-l-4 border-l-purple-600"
        />
        <MetricCard 
          label="Billable Hours YTD" 
          value={totalBillable.toLocaleString()} 
          icon={TrendingUp} 
          trend={totalBillable > 0 ? 'On track' : 'No hours logged'}
          trendUp={totalBillable > 0}
          className="border-l-4 border-l-emerald-600"
        />
      </div>

      {/* Staff Table or Empty State */}
      {staffList.length === 0 ? (
        renderEmptyState()
      ) : (
        <TableContainer responsive="card">
          <TableHeader>
            <TableHead>Employee</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Utilization</TableHead>
            <TableHead>Billable Target (Annual)</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableHeader>
          <TableBody>
            {staffList.map(staff => {
              const progress = staff.billableTarget > 0 
                ? (staff.currentBillable / staff.billableTarget) * 100 
                : 0;
              const utilizationColorClass = getUtilizationColorClass(staff.utilizationRate);
              
              return (
                <TableRow key={staff.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <UserAvatar name={staff.name} size="sm"/>
                      <div>
                        <p className={cn("font-bold text-sm", theme.text.primary)}>{staff.name}</p>
                        <p className={cn("text-xs", theme.text.secondary)}>{staff.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{staff.role}</TableCell>
                  <TableCell>
                    <Badge variant={staff.status === 'Active' ? 'success' : 'warning'}>{staff.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className={cn('font-bold', utilizationColorClass)}>
                      {staff.utilizationRate}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="w-full max-w-[140px]">
                      <div className={cn("flex justify-between text-xs mb-1", theme.text.secondary)}>
                        <span>{staff.currentBillable.toLocaleString()} hrs</span>
                        <span className={theme.text.tertiary}>/ {staff.billableTarget.toLocaleString()}</span>
                      </div>
                      <div className={cn("w-full rounded-full h-1.5", theme.surface.highlight)}>
                        {/* Progress bar - inline style required for dynamic width */}
                        { }
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        className={cn(
                          "p-1.5 rounded transition-colors",
                          theme.text.tertiary,
                          "hover:bg-slate-100 dark:hover:bg-slate-800"
                        )}
                        aria-label={`More options for ${staff.name}`}
                      >
                        <MoreHorizontal className="h-4 w-4"/>
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(staff.id)} 
                        className={cn(
                          "p-1.5 rounded transition-colors",
                          "text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                        )}
                        aria-label={`Remove ${staff.name}`}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4"/>
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </TableContainer>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Remove Staff Member"
        message={`Are you sure you want to remove ${staffToDeleteName}? This will affect HR records and billing.`}
        variant="danger"
        confirmText={isDeleting ? 'Removing...' : 'Remove Staff'}
      />

      {/* Add Staff Modal */}
      <AddStaffModal 
        isOpen={addStaffModal.isOpen} 
        onClose={addStaffModal.close} 
        onAdd={handleAddStaff} 
      />
    </div>
  );
}
