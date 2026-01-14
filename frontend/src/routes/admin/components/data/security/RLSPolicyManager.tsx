import { useTheme } from '@/theme';
import { queryClient, useMutation, useQuery } from '@/hooks/backend';
import { useNotify } from '@/hooks/core';
import { DataService } from '@/services/data/dataService';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/atoms/Button';
import { EmptyListState } from '@/shared/ui/organisms/_legacy/RefactoredCommon';
import { RLSPolicy } from '@/types';
import { queryKeys } from '@/utils/queryKeys';
import { Edit2, Pause, Play, Plus, Shield, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { PolicyEditorModal } from './PolicyEditorModal';

export function RLSPolicyManager() {
    const { theme } = useTheme();
    const notify = useNotify();
    const [editingPolicy, setEditingPolicy] = useState<RLSPolicy | undefined>(undefined);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: policies = [], isLoading } = useQuery<RLSPolicy[]>(
        ['admin', 'rls_policies'],
        DataService.admin.getRLSPolicies
    );

    const { mutate: savePolicy } = useMutation(
        DataService.admin.saveRLSPolicy,
        {
            onSuccess: () => {
                queryClient.invalidate(queryKeys.admin.rlsPolicies());
                setIsModalOpen(false);
                notify.success("Policy saved successfully.");
            }
        }
    );

    const { mutate: deletePolicy } = useMutation(
        DataService.admin.deleteRLSPolicy,
        {
            onSuccess: () => {
                queryClient.invalidate(queryKeys.admin.rlsPolicies());
                notify.info("Policy deleted.");
            }
        }
    );

    const { mutate: toggleStatus } = useMutation(
        async (policy: RLSPolicy) => {
            const newStatus = policy.status === 'Active' ? 'Disabled' : 'Active';
            return DataService.admin.saveRLSPolicy({ ...policy, status: newStatus });
        },
        {
            onSuccess: (data) => {
                queryClient.invalidate(queryKeys.admin.rlsPolicies());
                notify.success(`Policy ${data.name} is now ${data.status}`);
            }
        }
    );

    const handleEdit = (p: RLSPolicy) => {
        setEditingPolicy(p);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm('Delete this security policy? This action cannot be undone.')) {
            deletePolicy(id);
        }
    };

    const handleCreate = () => {
        setEditingPolicy(undefined);
        setIsModalOpen(true);
    };

    if (isLoading) return <div className="p-8 text-center text-slate-500">Loading Policies...</div>;

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className={cn("font-bold text-lg", theme.text.primary)}>PostgreSQL RLS Policies</h3>
                <Button size="sm" variant="primary" icon={Plus} onClick={handleCreate}>New Policy</Button>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                {policies.length === 0 ? (
                    <EmptyListState title="No policies defined" />
                ) : (
                    policies.map(p => (
                        <div key={p.id} className={cn("p-4 rounded-lg border shadow-sm transition-all hover:shadow-md group", theme.surface.default, theme.border.default)}>
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={cn("p-2 rounded bg-blue-50 text-blue-600")}>
                                        <Shield className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className={cn("font-bold text-sm", theme.text.primary)}>{p.name}</h4>
                                        <p className={cn("text-xs font-mono mt-0.5", theme.text.tertiary)}>ON table "{p.table}"</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={cn("text-[10px] uppercase font-bold px-2 py-0.5 rounded border", p.status === 'Active' ? "bg-green-50 text-green-700 border-green-200" : "bg-slate-100 text-slate-500 border-slate-200")}>
                                        {p.status}
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => toggleStatus(p)} className={cn("p-1.5 rounded hover:bg-slate-100 text-slate-500")} title={p.status === 'Active' ? "Disable" : "Enable"}>
                                            {p.status === 'Active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                        </button>
                                        <button onClick={() => handleEdit(p)} className={cn("p-1.5 rounded hover:bg-slate-100 text-blue-600")} aria-label="Edit policy"><Edit2 className="h-4 w-4" /></button>
                                        <button onClick={() => handleDelete(p.id)} className={cn("p-1.5 rounded hover:bg-red-50 text-red-600")} aria-label="Delete policy"><Trash2 className="h-4 w-4" /></button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-xs">
                                <div className={cn("p-2 rounded bg-slate-50 border border-slate-100")}>
                                    <span className="block font-bold mb-1 text-slate-500">FOR {p.cmd} TO {p.roles.join(', ')}</span>
                                    <code className="text-slate-700 break-all font-mono">USING ({p.using})</code>
                                </div>
                                {p.withCheck && (
                                    <div className={cn("p-2 rounded bg-purple-50 border border-purple-100")}>
                                        <span className="block font-bold mb-1 text-purple-700">WITH CHECK</span>
                                        <code className="text-purple-800 break-all font-mono">({p.withCheck})</code>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <PolicyEditorModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={savePolicy}
                initialPolicy={editingPolicy}
            />
        </div>
    );
};
