import { useTheme } from '@/theme';
import { cn } from '@/lib/cn';
import { Button } from '@/components/atoms/Button/Button';
import { Input } from '@/components/atoms/Input/Input';
import { Modal } from '@/components/molecules/Modal/Modal';
import { RLSPolicy, SqlCmd } from '@/types';
import { Check, Code, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PolicyEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (policy: Partial<RLSPolicy>) => void;
    initialPolicy?: RLSPolicy;
}

export function PolicyEditorModal({ isOpen, onClose, onSave, initialPolicy }: PolicyEditorModalProps) {
    const { theme } = useTheme();

    const [formData, setFormData] = useState<Partial<RLSPolicy>>({
        name: '',
        table: '',
        cmd: 'SELECT',
        roles: [],
        using: '',
        withCheck: '',
        status: 'Active'
    });

    const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());

    const availableRoles = ['Administrator', 'Partner', 'Associate', 'Paralegal', 'Client', 'All'];
    const tables = ['cases', 'documents', 'users', 'billing', 'audit_logs', 'clients', 'evidence'];

    useEffect(() => {
        if (initialPolicy) {
            setFormData(initialPolicy);
            setSelectedRoles(new Set(initialPolicy.roles));
        } else {
            setFormData({
                name: '',
                table: 'cases',
                cmd: 'SELECT',
                roles: [],
                using: '',
                withCheck: '',
                status: 'Active'
            });
            setSelectedRoles(new Set(['All']));
        }
    }, [initialPolicy, isOpen]);

    const toggleRole = (role: string) => {
        const newSet = new Set(selectedRoles);
        if (newSet.has(role)) newSet.delete(role);
        else newSet.add(role);
        setSelectedRoles(newSet);
    };

    const handleSave = () => {
        const finalRoles = Array.from(selectedRoles);
        if (!formData.name || !formData.table || finalRoles.length === 0) return;

        onSave({
            ...formData,
            roles: finalRoles
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialPolicy ? "Edit RLS Policy" : "New Security Policy"} size="lg">
            <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <Input
                        label="Policy Name"
                        placeholder="e.g. tenant_isolation_cases"
                        value={formData.name || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                        autoFocus
                    />
                    <div>
                        <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Target Table</label>
                        <select
                            className={cn("w-full px-3 py-2 border rounded-md text-sm outline-none", theme.surface.default, theme.border.default, theme.text.primary)}
                            value={formData.table}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, table: e.target.value })}
                        >
                            {tables.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Command Type</label>
                        <select
                            className={cn("w-full px-3 py-2 border rounded-md text-sm outline-none", theme.surface.default, theme.border.default, theme.text.primary)}
                            value={formData.cmd}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, cmd: e.target.value as SqlCmd })}
                        >
                            <option value="ALL">ALL</option>
                            <option value="SELECT">SELECT</option>
                            <option value="INSERT">INSERT</option>
                            <option value="UPDATE">UPDATE</option>
                            <option value="DELETE">DELETE</option>
                        </select>
                    </div>
                    <div>
                        <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Applies To Roles</label>
                        <div className="flex flex-wrap gap-2">
                            {availableRoles.map(role => (
                                <button
                                    key={role}
                                    onClick={() => toggleRole(role)}
                                    className={cn(
                                        "px-2 py-1 text-xs border rounded transition-colors",
                                        selectedRoles.has(role)
                                            ? "bg-blue-600 text-white border-blue-600"
                                            : cn(theme.surface.default, theme.border.default, theme.text.secondary)
                                    )}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div>
                    <label className={cn("flex text-xs font-semibold uppercase mb-2 items-center gap-2", theme.text.secondary)}>
                        <Code className="h-3 w-3" /> SQL Expression (USING)
                    </label>
                    <div className="relative">
                        <textarea
                            className={cn("w-full p-4 rounded-lg font-mono text-xs leading-relaxed h-32 border focus:ring-2 focus:ring-blue-500 outline-none resize-none", theme.surface.highlight, theme.border.default, theme.text.primary)}
                            placeholder="e.g. org_id = current_setting('app.current_org_id')::uuid"
                            value={formData.using || ''}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, using: e.target.value })}
                        />
                    </div>
                    <p className={cn("text-xs mt-1 italic", theme.text.tertiary)}>Boolean expression checked for existing rows.</p>
                </div>

                {['INSERT', 'UPDATE', 'ALL'].includes(formData.cmd || '') && (
                    <div>
                        <label className={cn("flex text-xs font-semibold uppercase mb-2 items-center gap-2", theme.text.secondary)}>
                            <Shield className="h-3 w-3" /> Check Expression (WITH CHECK)
                        </label>
                        <div className="relative">
                            <textarea
                                className={cn("w-full p-4 rounded-lg font-mono text-xs leading-relaxed h-24 border focus:ring-2 focus:ring-blue-500 outline-none resize-none", theme.surface.highlight, theme.border.default, theme.text.primary)}
                                placeholder="Optional. e.g. status != 'Closed' OR role = 'Admin'"
                                value={formData.withCheck || ''}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, withCheck: e.target.value })}
                            />
                        </div>
                        <p className={cn("text-xs mt-1 italic", theme.text.tertiary)}>Ensures new/updated rows meet criteria.</p>
                    </div>
                )}

                <div className={cn("pt-6 border-t flex justify-end gap-3", theme.border.default)}>
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button variant="primary" icon={Check} onClick={handleSave}>Save Policy</Button>
                </div>
            </div>
        </Modal>
    );
};
