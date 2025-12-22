/**
 * DiscoveryStipulations.tsx
 *
 * Discovery stipulation management for joint discovery plans and agreements.
 * Handles creation, tracking, and management of discovery stipulations.
 *
 * @module components/discovery/DiscoveryStipulations
 * @category Discovery - Stipulations
 *
 * THEME SYSTEM USAGE:
 * This component uses the LexiFlow theme provider for consistent styling across light/dark modes.
 *
 * Key patterns:
 * - useTheme() hook provides: theme, isDark, mode, toggleTheme, setTheme
 * - theme.text.primary/secondary/tertiary for text colors
 * - theme.surface.default/raised/overlay for backgrounds
 * - theme.border.default/focused/error for borders
 * - theme.action.primary/secondary/ghost/danger for buttons
 * - theme.status.success/warning/error/info for status indicators
 *
 * Convention: Use semantic tokens from theme, NOT raw Tailwind colors
 * ✅ className={theme.text.primary}
 * ❌ className="text-slate-900 dark:text-white"
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React from 'react';
import { Plus, FileText, CheckCircle, XCircle, FileQuestion, AlertCircle, Loader2 } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Components
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../common/Table';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { Input, TextArea } from '../common/Inputs';

// Hooks & Context
import { useTheme } from '../../context/ThemeContext';
import { useNotify } from '../../hooks/useNotify';
import { useModalState } from '../../hooks';

// Services & Utils
import { DataService } from '../../services/data/dataService';
import { cn } from '../../utils/cn';
import { IdGenerator } from '../../utils/idGenerator';
import { useQuery, useMutation } from '../../hooks/useQueryHooks';
// ✅ Migrated to backend API (2025-12-21)

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
import { StipulationRequest, CaseId } from '../../types';

interface DiscoveryStipulationsProps {
  /** Optional case ID to filter stipulations */
  caseId?: CaseId;
}

// ============================================================================
// CONSTANTS
// ============================================================================
const STATUS_OPTIONS = [
  { value: 'Pending', label: 'Pending', variant: 'warning' as const },
  { value: 'Approved', label: 'Approved', variant: 'success' as const },
  { value: 'Rejected', label: 'Rejected', variant: 'error' as const },
] as const;

const INITIAL_STIPULATION_STATE: Partial<StipulationRequest> = {
  status: 'Pending',
  title: '',
  requestingParty: '',
  proposedDate: '',
  reason: '',
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * DiscoveryStipulations - Discovery stipulation management component
 *
 * Manages discovery stipulations including creation, approval tracking,
 * and status management for joint discovery agreements.
 *
 * @param props - Component props
 * @param props.caseId - Optional case ID to filter stipulations
 */
export const DiscoveryStipulations: React.FC<DiscoveryStipulationsProps> = ({ caseId }) => {
  // ==========================================================================
  // HOOKS - Context & State
  // ==========================================================================
  const { theme } = useTheme();
  const notify = useNotify();
  const { isOpen: isModalOpen, open: openModal, close: closeModal } = useModalState();
  const [newStip, setNewStip] = React.useState<Partial<StipulationRequest>>(INITIAL_STIPULATION_STATE);

  // ==========================================================================
  // HOOKS - Data Fetching
  // ==========================================================================
  const stipulationsQueryKey = caseId 
    ? ['stipulations', 'case', caseId]
    : ['stipulations', 'all'];

  const { 
    data: stipulations = [], 
    isLoading, 
    status, 
    error,
    refetch 
  } = useQuery<StipulationRequest[]>(
    stipulationsQueryKey,
    () => DataService.discovery.getStipulations(caseId)
  );

  const isError = status === 'error';

  const { mutate: addStip, isLoading: isAdding } = useMutation(
      DataService.discovery.addStipulation,
      {
          invalidateKeys: [stipulationsQueryKey],
          onSuccess: () => {
              closeModal();
              resetForm();
              notify.success('Stipulation requested successfully.');
          },
          onError: (err: Error) => {
              notify.error(`Failed to create stipulation: ${err.message}`);
          }
      }
  );

  const { mutate: updateStipStatus, isLoading: isUpdating } = useMutation(
      async ({ id, status }: { id: string; status: string }) => {
          const existing = stipulations.find(s => s.id === id);
          if (!existing) throw new Error('Stipulation not found');
          return DataService.discovery.addStipulation({ ...existing, status });
      },
      {
          invalidateKeys: [stipulationsQueryKey],
          onSuccess: (_, variables) => {
              const statusLabel = variables.status.toLowerCase();
              notify.success(`Stipulation ${statusLabel} successfully.`);
          },
          onError: (err: Error) => {
              notify.error(`Failed to update stipulation: ${err.message}`);
          }
      }
  );

  // ==========================================================================
  // CALLBACKS - Event Handlers
  // ==========================================================================

  const resetForm = () => {
    setNewStip(INITIAL_STIPULATION_STATE);
  };

  const handleOpenModal = () => {
    resetForm();
    openModal();
  };

  const handleCloseModal = () => {
    resetForm();
    closeModal();
  };

  const handleSave = () => {
      if (!newStip.title?.trim() || !newStip.requestingParty?.trim()) {
          notify.warning('Please fill in all required fields.');
          return;
      }

      const stipulationData: StipulationRequest = {
          id: IdGenerator.stipulation(),
          title: newStip.title.trim(),
          requestingParty: newStip.requestingParty.trim(),
          proposedDate: newStip.proposedDate || new Date().toISOString().split('T')[0],
          status: 'Pending',
          reason: newStip.reason?.trim() || '',
          caseId: caseId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
      };

      addStip(stipulationData);
  };

  const handleStatusChange = (id: string, newStatus: string) => {
      updateStipStatus({ id, status: newStatus });
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleInputChange = (field: keyof StipulationRequest) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setNewStip(prev => ({ ...prev, [field]: e.target.value }));
  };

  // ==========================================================================
  // RENDER HELPERS
  // ==========================================================================

  const getStatusVariant = (status: string): 'warning' | 'success' | 'error' | 'neutral' => {
    const option = STATUS_OPTIONS.find(opt => opt.value === status);
    return option?.variant || 'neutral';
  };

  const isFormValid = Boolean(newStip.title?.trim() && newStip.requestingParty?.trim());

  // ==========================================================================
  // RENDER - Loading State
  // ==========================================================================

  if (isLoading) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-16', theme.surface.default)}>
        <Loader2 className={cn('h-8 w-8 animate-spin mb-4', theme.text.tertiary)} />
        <p className={theme.text.secondary}>Loading stipulations...</p>
      </div>
    );
  }

  // ==========================================================================
  // RENDER - Error State
  // ==========================================================================

  if (isError) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-16 rounded-lg border', theme.surface.default, theme.border.default)}>
        <AlertCircle className={cn('h-12 w-12 mb-4', theme.status.error.text)} />
        <h3 className={cn('text-lg font-semibold mb-2', theme.text.primary)}>
          Failed to Load Stipulations
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
    <div className={cn('flex flex-col items-center justify-center py-16 rounded-lg border border-dashed', theme.surface.default, theme.border.default)}>
      <FileQuestion className={cn('h-12 w-12 mb-4', theme.text.tertiary)} />
      <h3 className={cn('text-lg font-semibold mb-2', theme.text.primary)}>
        No Stipulations Found
      </h3>
      <p className={cn('text-sm mb-4 text-center max-w-md', theme.text.secondary)}>
        Discovery stipulations help manage joint agreements between parties. 
        Create your first stipulation to get started.
      </p>
      <Button variant="primary" icon={Plus} onClick={handleOpenModal}>
        Create First Stipulation
      </Button>
    </div>
  );

  // ==========================================================================
  // MAIN RENDER
  // ==========================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={cn('text-xl font-semibold', theme.text.primary)}>
            Discovery Stipulations
          </h2>
          <p className={theme.text.secondary}>
            Manage joint discovery agreements and stipulations
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={handleOpenModal}
        >
          New Stipulation
        </Button>
      </div>

      {/* Stipulations Table or Empty State */}
      {stipulations.length === 0 ? (
        renderEmptyState()
      ) : (
        <TableContainer>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Requesting Party</TableHead>
              <TableHead>Proposed Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stipulations.map((stip) => (
              <TableRow key={stip.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <FileText className={cn('h-4 w-4', theme.text.secondary)} />
                    <span className={cn('font-medium', theme.text.primary)}>
                      {stip.title}
                    </span>
                  </div>
                </TableCell>
                <TableCell className={theme.text.secondary}>
                  {stip.requestingParty}
                </TableCell>
                <TableCell className={theme.text.secondary}>
                  {stip.proposedDate 
                    ? new Date(stip.proposedDate).toLocaleDateString() 
                    : 'Not set'}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(stip.status)}>
                    {stip.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {stip.status === 'Pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="primary"
                          icon={CheckCircle}
                          onClick={() => handleStatusChange(stip.id, 'Approved')}
                          disabled={isUpdating}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          icon={XCircle}
                          onClick={() => handleStatusChange(stip.id, 'Rejected')}
                          disabled={isUpdating}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </TableContainer>
      )}

      {/* Add Stipulation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="New Discovery Stipulation"
      >
        <div className="space-y-4">
          <div>
            <label className={cn('block text-sm font-medium mb-1', theme.text.primary)}>
              Title <span className={theme.status.error.text}>*</span>
            </label>
            <Input
              value={newStip.title || ''}
              onChange={handleInputChange('title')}
              placeholder="Enter stipulation title"
              required
              autoFocus
            />
          </div>

          <div>
            <label className={cn('block text-sm font-medium mb-1', theme.text.primary)}>
              Requesting Party <span className={theme.status.error.text}>*</span>
            </label>
            <Input
              value={newStip.requestingParty || ''}
              onChange={handleInputChange('requestingParty')}
              placeholder="Enter requesting party"
              required
            />
          </div>

          <div>
            <label className={cn('block text-sm font-medium mb-1', theme.text.primary)}>
              Proposed Date
            </label>
            <Input
              type="date"
              value={newStip.proposedDate || ''}
              onChange={handleInputChange('proposedDate')}
            />
          </div>

          <div>
            <label className={cn('block text-sm font-medium mb-1', theme.text.primary)}>
              Reason
            </label>
            <TextArea
              value={newStip.reason || ''}
              onChange={handleInputChange('reason')}
              placeholder="Enter reason for stipulation"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="secondary"
              onClick={handleCloseModal}
              disabled={isAdding}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={!isFormValid || isAdding}
            >
              {isAdding ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                'Create Stipulation'
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ============================================================================
// EXPORTS
export default DiscoveryStipulations;


