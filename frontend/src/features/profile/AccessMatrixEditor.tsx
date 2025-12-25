/**
 * @module components/profile/AccessMatrixEditor
 * @category User Profile
 * @description Granular permission matrix editor for fine-grained access control beyond role-based
 * permissions. Provides CRUD operations for resource-level permissions with effect (Allow/Deny),
 * scope (Global/Region/Office/Personal), expiration, and conditions. Evaluation order: Deny > Allow.
 * 
 * THEME SYSTEM USAGE:
 * - theme.text.primary/secondary - Headers and permission labels
 * - theme.surface.highlight - Permission action badges
 * - theme.border.default - Table borders and modal borders
 * - theme.status.success/error - Allow/Deny effect indicators
 */

// ========================================
// EXTERNAL DEPENDENCIES
// ========================================
import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Shield, Globe, Lock, Clock } from 'lucide-react';

// ========================================
// INTERNAL DEPENDENCIES
// ========================================
// Components
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/organisms/Table';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { Modal } from '@/components/molecules/Modal';
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog';
import { Input } from '@/components/atoms';

// Hooks & Context
import { useTheme } from '@/providers/ThemeContext';
import { useModalState } from '../../hooks';

// Utils & Constants
import { cn } from '@/utils/cn';

// Types
import { ExtendedUserProfile, GranularPermission, AccessEffect } from '@/types';


// ========================================
// TYPES & INTERFACES
// ========================================
interface AccessMatrixEditorProps {
  profile: ExtendedUserProfile;
}

// ========================================
// COMPONENT
// ========================================
export const AccessMatrixEditor = ({ profile }: AccessMatrixEditorProps) => {
  const { theme } = useTheme();
  const [permissions, setPermissions] = useState<GranularPermission[]>(profile.accessMatrix);
  const permModal = useModalState();
  const deleteModal = useModalState();
  const [permToDelete, setPermToDelete] = useState<string | null>(null);
  const [newPerm, setNewPerm] = useState<Partial<GranularPermission>>({ effect: 'Allow', scope: 'Global' });

  const getEffectColor = (effect: AccessEffect) => {
      return effect === 'Allow' ? 'success' : 'error';
  };

  const handleDelete = (id: string) => {
      setPermToDelete(id);
      deleteModal.open();
  };
  
  const confirmDeletePermission = () => {
      if (permToDelete) {
          setPermissions(prev => prev.filter(p => p.id !== permToDelete));
          setPermToDelete(null);
      }
  };

  const handleAdd = () => {
      if(!newPerm.resource || !newPerm.action) return;
      
      const perm: GranularPermission = {
          id: `perm-${Date.now()}`,
          resource: newPerm.resource,
          action: newPerm.action as any,
          effect: newPerm.effect as any,
          scope: newPerm.scope as any,
          expiration: newPerm.expiration,
          conditions: []
      };
      setPermissions([...permissions, perm]);
      permModal.close();
      setNewPerm({ effect: 'Allow', scope: 'Global' });
  };

  return (
    <div className="h-full flex flex-col p-6 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h3 className={cn("text-lg font-bold flex items-center gap-2", theme.text.primary)}>
                    <Shield className="h-5 w-5 text-blue-600"/> Granular Access Matrix
                </h3>
                <p className={cn("text-sm", theme.text.secondary)}>
                    Fine-grained permissions overriding standard role-based access. Evaluation order: Deny {'>'} Allow.
                </p>
            </div>
            <Button variant="primary" icon={Plus} onClick={permModal.open}>Add Permission</Button>
        </div>

        <div className="flex-1 overflow-hidden rounded-lg border shadow-sm bg-white">
            <TableContainer className="h-full border-0 rounded-none shadow-none">
                <TableHeader>
                    <TableHead>Resource</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Effect</TableHead>
                    <TableHead>Scope</TableHead>
                    <TableHead>Conditions</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableHeader>
                <TableBody>
                    {permissions.map(perm => (
                        <TableRow key={perm.id}>
                            <TableCell className="font-mono text-xs font-bold text-slate-700">{perm.resource}</TableCell>
                            <TableCell>
                                <span className={cn("px-2 py-1 rounded text-xs border font-medium", theme.surface.highlight, theme.border.default)}>
                                    {perm.action.toUpperCase()}
                                </span>
                            </TableCell>
                            <TableCell>
                                <Badge variant={getEffectColor(perm.effect)}>{perm.effect}</Badge>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-1 text-xs">
                                    {perm.scope === 'Global' ? <Globe className="h-3 w-3"/> : <Lock className="h-3 w-3"/>}
                                    {perm.scope}
                                </div>
                            </TableCell>
                            <TableCell>
                                {perm.conditions && perm.conditions.length > 0 ? (
                                    <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded border border-amber-200">
                                        {perm.conditions.length} Active Rules
                                    </span>
                                ) : <span className="text-slate-400 text-xs">-</span>}
                            </TableCell>
                            <TableCell>
                                {perm.expiration ? (
                                    <div className="flex items-center text-xs text-red-600 font-medium">
                                        <Clock className="h-3 w-3 mr-1"/> {perm.expiration}
                                    </div>
                                ) : <span className="text-slate-400 text-xs">Never</span>}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <button className="p-1 hover:bg-slate-100 rounded text-blue-600"><Edit2 className="h-4 w-4"/></button>
                                    <button onClick={() => handleDelete(perm.id)} className="p-1 hover:bg-red-50 rounded text-red-600"><Trash2 className="h-4 w-4"/></button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </TableContainer>
        </div>

        <ConfirmDialog
          isOpen={deleteModal.isOpen}
          onClose={deleteModal.close}
          onConfirm={confirmDeletePermission}
          title="Delete Permission"
          message="Are you sure you want to delete this permission? This will immediately affect the user's access rights."
          variant="danger"
          confirmText="Delete Permission"
        />

        <Modal isOpen={permModal.isOpen} onClose={permModal.close} title="Grant Granular Permission" size="md">
            <div className="p-6 space-y-4">
                <Input label="Resource Identifier" placeholder="e.g. billing.invoices" value={newPerm.resource || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPerm({...newPerm, resource: e.target.value})} />
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold uppercase mb-1 text-slate-500">Action</label>
                        <select className="w-full p-2 border rounded text-sm" value={newPerm.action} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewPerm({...newPerm, action: e.target.value as any})}>
                            <option value="read">Read</option>
                            <option value="create">Create</option>
                            <option value="update">Update</option>
                            <option value="delete">Delete</option>
                            <option value="approve">Approve</option>
                            <option value="*">Full Control (*)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase mb-1 text-slate-500">Effect</label>
                        <select className="w-full p-2 border rounded text-sm" value={newPerm.effect} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewPerm({...newPerm, effect: e.target.value as any})}>
                            <option value="Allow">Allow</option>
                            <option value="Deny">Deny</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold uppercase mb-1 text-slate-500">Scope</label>
                        <select className="w-full p-2 border rounded text-sm" value={newPerm.scope} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewPerm({...newPerm, scope: e.target.value as any})}>
                            <option value="Global">Global</option>
                            <option value="Region">Region</option>
                            <option value="Office">Office</option>
                            <option value="Personal">Personal</option>
                        </select>
                    </div>
                    <Input type="date" label="Expiration (Optional)" value={newPerm.expiration || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPerm({...newPerm, expiration: e.target.value})} />
                </div>

                <div className="flex justify-end pt-4 border-t mt-2 gap-2">
                    <Button variant="secondary" onClick={permModal.close}>Cancel</Button>
                    <Button variant="primary" onClick={handleAdd}>Save Rule</Button>
                </div>
            </div>
        </Modal>
    </div>
  );
};
