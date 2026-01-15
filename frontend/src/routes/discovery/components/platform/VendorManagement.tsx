/**
 * VendorManagement.tsx
 *
 * Vendor management for discovery services including court reporters, videographers, and interpreters.
 * Manages vendor relationships, ratings, and service coordination for discovery proceedings.
 *
 * @module components/discovery/VendorManagement
 * @category Discovery - Vendors
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
 * 
 * REACT V18 CONCURRENT-SAFE:
 * - G21: Pure rendering, no render-phase mutations
 * - G22: Context (theme) immutable throughout
 * - G23: State updates immutable
 * - G28: Pure function of props and context
 * - G33: Explicit loading states
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { Briefcase, Plus, Star } from 'lucide-react';
import { useState } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Components
import { TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '@/components/organisms/Table/Table';
import { Badge } from '@/components/atoms/Badge/Badge';
import { Button } from '@/components/atoms/Button/Button';
import { Input } from '@/components/atoms/Input/Input';
import { Modal } from '@/components/molecules/Modal/Modal';

// Hooks & Context
import { useTheme } from '@/theme';
import { useModalState } from '@/hooks/core';

// Services & Utils
import { useMutation, useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/data-service.service';
// ✅ Migrated to backend API (2025-12-21)

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
import { Vendor } from '@/types';

// ============================================================================
// CONSTANTS
// ============================================================================
const SERVICE_TYPES = [
  { value: 'Court Reporting', label: 'Court Reporting' },
  { value: 'Videography', label: 'Videography' },
  { value: 'Forensics', label: 'Forensics' },
  { value: 'Translation', label: 'Translation' },
] as const;

const STATUS_OPTIONS = [
  { value: 'Active', label: 'Active', variant: 'success' as const },
  { value: 'Preferred', label: 'Preferred', variant: 'info' as const },
  { value: 'Blocked', label: 'Blocked', variant: 'error' as const },
] as const;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * VendorManagement - Vendor management component
 *
 * Manages discovery service vendors including court reporters, videographers,
 * and interpreters with rating and status tracking.
 */
export function VendorManagement() {
  // ==========================================================================
  // HOOKS - Context & State
  // ==========================================================================
  const { theme } = useTheme();
  const vendorModal = useModalState();
  const [newVendor, setNewVendor] = useState<Partial<Vendor>>({});

  // ==========================================================================
  // HOOKS - Data Fetching
  // ==========================================================================
  const { data: rawVendors = [] } = useQuery<Vendor[]>(
    ['vendors', 'all'],
    async () => {
      const result = await DataService.discovery.getVendors();
      return Array.isArray(result) ? result : [];
    }
  );

  // Runtime array validation
  const vendors = Array.isArray(rawVendors) ? rawVendors : [];

  const { mutate: addVendor } = useMutation(
    DataService.discovery.addVendor,
    {
      invalidateKeys: [['vendors', 'all']],
      onSuccess: () => {
        vendorModal.close();
        setNewVendor({});
      }
    }
  );

  // ==========================================================================
  // CALLBACKS - Event Handlers
  // ==========================================================================

  const handleSave = () => {
    if (!newVendor.name) return;
    // Generate ID in event handler (not during render) for deterministic rendering
    const newId = `vnd-${Date.now()}`;
    addVendor({
      id: newId,
      name: newVendor.name,
      serviceType: newVendor.serviceType as unknown as Record<string, unknown> || 'Court Reporting',
      contactName: newVendor.contactName || '',
      phone: newVendor.phone || '',
      email: newVendor.email || '',
      status: 'Active',
      rating: 5
    } as unknown as Vendor);
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
          <h2 className={`text-xl font-semibold ${theme.text.primary}`}>Vendor Management</h2>
          <p className={theme.text.secondary}>Manage court reporters, videographers, and interpreters</p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={vendorModal.open}
        >
          Add Vendor
        </Button>
      </div>

      {/* Vendors Table */}
      <TableContainer>
        <TableHeader>
          <TableRow>
            <TableHead>Vendor Name</TableHead>
            <TableHead>Service Type</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Rating</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vendors.map((vendor) => (
            <TableRow key={vendor.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Briefcase className={`h-4 w-4 ${theme.text.secondary}`} />
                  <span className={`font-medium ${theme.text.primary}`}>{vendor.name}</span>
                </div>
              </TableCell>
              <TableCell className={theme.text.secondary}>{vendor.serviceType}</TableCell>
              <TableCell className={theme.text.secondary}>
                <div className="text-sm">
                  <p>{vendor.contactName}</p>
                  <p className="text-xs">{vendor.phone}</p>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(vendor.status)}>
                  {vendor.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-yellow-500">
                  <span className={`font-medium text-sm ${theme.text.primary}`}>{vendor.rating}</span>
                  <Star className="h-4 w-4 fill-current" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableContainer>

      {/* Add Vendor Modal */}
      {vendorModal.isOpen && (
        <Modal
          isOpen={vendorModal.isOpen}
          onClose={vendorModal.close}
          title="Add New Vendor"
        >
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${theme.text.primary} mb-1`}>
                Vendor Name *
              </label>
              <Input
                value={newVendor.name || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewVendor(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter vendor name"
                required
              />
            </div>

            <div>
              <label htmlFor="vendor-service-type" className={`block text-sm font-medium ${theme.text.primary} mb-1`}>
                Service Type
              </label>
              <select
                id="vendor-service-type"
                className={`w-full h-10 px-3 py-2 border rounded-md text-sm shadow-sm outline-none transition-all ${theme.surface.input} ${theme.border.default} ${theme.text.primary} ${theme.border.focused}`}
                value={newVendor.serviceType || 'Court Reporting'}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewVendor(prev => ({ ...prev, serviceType: e.target.value as typeof SERVICE_TYPES[number]['value'] }))}
              >
                {SERVICE_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium ${theme.text.primary} mb-1`}>
                Contact Person
              </label>
              <Input
                value={newVendor.contactName || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewVendor(prev => ({ ...prev, contactName: e.target.value }))}
                placeholder="Enter contact person"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${theme.text.primary} mb-1`}>
                Phone
              </label>
              <Input
                value={newVendor.phone || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewVendor(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${theme.text.primary} mb-1`}>
                Email
              </label>
              <Input
                type="email"
                value={newVendor.email || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewVendor(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="secondary"
                onClick={vendorModal.close}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={!newVendor.name}
              >
                Add Vendor
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default VendorManagement;
