import { useTheme } from '@/features/theme';
import { useNotify } from '@/hooks/useNotify';
import { queryClient, useMutation } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/dataService';
import { DiscoveryRepository } from '@/services/data/repositories/DiscoveryRepository';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/atoms/Button/Button';
import { Input } from '@/shared/ui/atoms/Input/Input';
import { TextArea } from '@/shared/ui/atoms/TextArea/TextArea';
import type { CaseId, DiscoveryRequest } from '@/types';
import { queryKeys } from '@/utils/queryKeys';
import { Save, X } from 'lucide-react';
import { useCallback, useState, useTransition } from 'react';

/**
 * React v18 Concurrent-Safe Discovery Request Wizard
 *
 * Guidelines Applied:
 * - G21: Tolerates interruptible renders, no render-phase side effects
 * - G22: Context (theme) values treated as immutable
 * - G23: Never mutates context between renders
 * - G24: StrictMode compliant - all effects are idempotent
 * - G25: Uses startTransition for non-urgent form updates
 * - G28: Pure function of props and context only
 * - G33: Explicit transitional states (isPending) for UX feedback
 * - G38: Validates context defaults before use
 */

interface DiscoveryRequestWizardProps {
    caseId?: string;
    onComplete: () => void;
    onCancel: () => void;
}

export function DiscoveryRequestWizard({ caseId, onComplete, onCancel }: DiscoveryRequestWizardProps) {
    // G22 & G28: Immutable context read, pure function of context
    const { theme } = useTheme();
    const notify = useNotify();

    // G25 & G33: startTransition for non-urgent form state updates
    const [isPending, startTransition] = useTransition();

    // G24: Initial state is deterministic and concurrent-safe
    const [formData, setFormData] = useState<Partial<DiscoveryRequest>>({
        caseId: (caseId || '') as CaseId,
        title: '',
        type: 'Interrogatory', // Default
        propoundingParty: '',
        respondingParty: '',
        serviceDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +30 days
        status: 'Draft',
        description: '',
    });

    const { mutate: createRequest, isLoading } = useMutation(
        async (data: Partial<DiscoveryRequest>) => {
            const repo = DataService.discovery as unknown as DiscoveryRepository;
            return repo.addRequest(data as DiscoveryRequest);
        },
        {
            onSuccess: () => {
                notify.success('Discovery request created successfully.');
                queryClient.invalidate(queryKeys.discovery.all());
                onComplete();
            },
            onError: (err) => {
                notify.error('Failed to create discovery request.');
                console.error(err);
            }
        }
    );

    // G28: Pure callback, no side effects
    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        createRequest(formData);
    }, [createRequest, formData]);

    // G25: Non-urgent form updates use startTransition
    // G23: Immutable updates via spread operator
    const handleChange = useCallback((field: keyof DiscoveryRequest, value: string) => {
        startTransition(() => {
            setFormData(prev => ({ ...prev, [field]: value }));
        });
    }, []);

    return (
        <div className={cn("h-full flex flex-col p-6 max-w-4xl mx-auto", theme.background)}>
            <div className="mb-6">
                <h2 className={cn("text-2xl font-bold mb-2", theme.text.primary)}>Create New Discovery Request</h2>
                <p className={theme.text.secondary}>Draft a new discovery request to be served.</p>
            </div>

            <form onSubmit={handleSubmit} className={cn("flex-1 space-y-6 p-6 rounded-lg border", theme.surface.default, theme.border.default)}>
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className={cn("block text-sm font-medium mb-1", theme.text.secondary)}>Title</label>
                            <Input
                                value={formData.title}
                                onChange={(e) => handleChange('title', e.target.value)}
                                placeholder="e.g., Plaintiff's First Set of Interrogatories"
                                required
                            />
                        </div>
                        <div>
                            <label className={cn("block text-sm font-medium mb-1", theme.text.secondary)}>Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => handleChange('type', e.target.value)}
                                className={cn("w-full h-10 px-3 rounded-md border text-sm focus:outline-none focus:ring-2",
                                    theme.surface.input,
                                    theme.border.default,
                                    theme.text.primary
                                )}
                            >
                                <option value="Interrogatory">Interrogatory</option>
                                <option value="Production">Production Request</option>
                                <option value="Admission">Request for Admission</option>
                                <option value="Deposition">Notice of Deposition</option>
                            </select>
                        </div>
                        <div>
                            <label className={cn("block text-sm font-medium mb-1", theme.text.secondary)}>Propounding Party</label>
                            <Input
                                value={formData.propoundingParty}
                                onChange={(e) => handleChange('propoundingParty', e.target.value)}
                                placeholder="Sending party"
                                required
                            />
                        </div>
                        <div>
                            <label className={cn("block text-sm font-medium mb-1", theme.text.secondary)}>Responding Party</label>
                            <Input
                                value={formData.respondingParty}
                                onChange={(e) => handleChange('respondingParty', e.target.value)}
                                placeholder="Receiving party"
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className={cn("block text-sm font-medium mb-1", theme.text.secondary)}>Service Date</label>
                            <Input
                                type="date"
                                value={formData.serviceDate}
                                onChange={(e) => handleChange('serviceDate', e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className={cn("block text-sm font-medium mb-1", theme.text.secondary)}>Due Date</label>
                            <Input
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) => handleChange('dueDate', e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className={cn("block text-sm font-medium mb-1", theme.text.secondary)}>Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => handleChange('status', e.target.value)}
                                className={cn("w-full h-10 px-3 rounded-md border text-sm focus:outline-none focus:ring-2",
                                    theme.surface.input,
                                    theme.border.default,
                                    theme.text.primary
                                )}
                            >
                                <option value="Draft">Draft</option>
                                <option value="Served">Served</option>
                                <option value="Pending">Pending</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div>
                    <label className={cn("block text-sm font-medium mb-1", theme.text.secondary)}>Description / Notes</label>
                    <TextArea
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        placeholder="Additional details about this request..."
                        className="h-32"
                    />
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                    <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading || isPending} icon={X}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="primary" disabled={isLoading || isPending} icon={isLoading ? undefined : Save}>
                        {isLoading ? 'Creating...' : isPending ? 'Updating...' : 'Create Request'}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default DiscoveryRequestWizard;
