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
import React, { useState } from 'react';
import { Plus, FileText, CheckCircle, XCircle } from 'lucide-react';

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

// Services & Utils
import { DataService } from '../../services/dataService';
import { cn } from '../../utils/cn';
import { useQuery, useMutation, queryClient } from '../../services/queryClient';
import { STORES } from '../../services/db';
import { queryKeys } from '../../utils/queryKeys';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
import { StipulationRequest } from '../../types';

// ============================================================================
// CONSTANTS
// ============================================================================
const STATUS_OPTIONS = [
  { value: 'Pending', label: 'Pending', variant: 'warning' as const },
  { value: 'Approved', label: 'Approved', variant: 'success' as const },
  { value: 'Rejected', label: 'Rejected', variant: 'error' as const },
] as const;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * DiscoveryStipulations - Discovery stipulation management component
 *
 * Manages discovery stipulations including creation, approval tracking,
 * and status management for joint discovery agreements.
 */
export const DiscoveryStipulations: React.FC = () => {
  // ==========================================================================
  // HOOKS - Context & State
  // ==========================================================================
  const { theme } = useTheme();
  const notify = useNotify();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStip, setNewStip] = useState<Partial<StipulationRequest>>({ status: 'Pending' });

  // ==========================================================================
  // HOOKS - Data Fetching
  // ==========================================================================
  const { data: stipulations = [] } = useQuery<StipulationRequest[]>(
      [STORES.STIPULATIONS, 'all'],
      () => DataService.discovery.getStipulations()
  );

  const { mutate: addStip } = useMutation(
      DataService.discovery.addStipulation,
      {
          invalidateKeys: [[STORES.STIPULATIONS, 'all']],
          onSuccess: () => {
              setIsModalOpen(false);
              setNewStip({ status: 'Pending' });
              notify.success("Stipulation requested.");
          }
      }
  );

  // ==========================================================================
  // CALLBACKS - Event Handlers
  // ==========================================================================

  const handleSave = () => {
      if (!newStip.title || !newStip.requestingParty) return;
      addStip({
          id: `stip-${Date.now()}`,
          title: newStip.title,
          requestingParty: newStip.requestingParty,
          proposedDate: newStip.proposedDate || new Date().toISOString().split('T')[0],
          status: 'Pending',
          reason: newStip.reason || ''
      } as StipulationRequest);
  };

  const handleStatusChange = (id: string, newStatus: string) => {
      // Implementation for status change would go here
      notify.info(`Status change to ${newStatus} not yet implemented`);
  };

  // ==========================================================================
  // RENDER HELPERS
  // ==========================================================================

  const getStatusVariant = (status: string) => {
    const option = STATUS_OPTIONS.find(opt => opt.value === status);
    return option?.variant || 'neutral';
  };

  // ==========================================================================
  // MAIN RENDER
  // ==========================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-semibold ${theme.text.primary}`}>Discovery Stipulations</h2>
          <p className={theme.text.secondary}>Manage joint discovery agreements and stipulations</p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setIsModalOpen(true)}
        >
          New Stipulation
        </Button>
      </div>

      {/* Stipulations Table */}
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
                  <FileText className={`h-4 w-4 ${theme.text.secondary}`} />
                  <span className={`font-medium ${theme.text.primary}`}>{stip.title}</span>
                </div>
              </TableCell>
              <TableCell className={theme.text.secondary}>{stip.requestingParty}</TableCell>
              <TableCell className={theme.text.secondary}>
                {stip.proposedDate ? new Date(stip.proposedDate).toLocaleDateString() : 'Not set'}
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
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        icon={XCircle}
                        onClick={() => handleStatusChange(stip.id, 'Rejected')}
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

      {/* Add Stipulation Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="New Discovery Stipulation"
        >
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${theme.text.primary} mb-1`}>
                Title *
              </label>
              <Input
                value={newStip.title || ''}
                onChange={(e) => setNewStip(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter stipulation title"
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${theme.text.primary} mb-1`}>
                Requesting Party *
              </label>
              <Input
                value={newStip.requestingParty || ''}
                onChange={(e) => setNewStip(prev => ({ ...prev, requestingParty: e.target.value }))}
                placeholder="Enter requesting party"
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${theme.text.primary} mb-1`}>
                Proposed Date
              </label>
              <Input
                type="date"
                value={newStip.proposedDate || ''}
                onChange={(e) => setNewStip(prev => ({ ...prev, proposedDate: e.target.value }))}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${theme.text.primary} mb-1`}>
                Reason
              </label>
              <TextArea
                value={newStip.reason || ''}
                onChange={(e) => setNewStip(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Enter reason for stipulation"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="secondary"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={!newStip.title || !newStip.requestingParty}
              >
                Create Stipulation
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ============================================================================
// EXPORTS
export default DiscoveryStipulations;
