import { useState } from 'react';
/**
 * LegalHoldWizard.tsx
 * Multi-step wizard for creating new legal holds
 * 
 * REACT V18 CONCURRENT-SAFE:
 * - G21: Form renders tolerate interruption
 * - G22: Context (theme) immutable read
 * - G23: State updates via immutable patterns
 * - G25: Could use startTransition for form updates
 * - G28: Pure function of props and context
 * - G33: Explicit loading states
 */

import { useTheme } from '@/features/theme';
import { Button } from '@/shared/ui/atoms/Button/Button';
import { Input } from '@/shared/ui/atoms/Input/Input';
import { TextArea } from '@/shared/ui/atoms/TextArea/TextArea';
import { DataService } from '@/services/data/dataService';
import { useNotify } from '@/hooks/useNotify';
import { DiscoveryRepository } from '@/services/data/repositories/DiscoveryRepository';
import { LegalHoldEnhanced } from '@/types/discovery-enhanced';
import { useMutation, queryClient } from '@/hooks/useQueryHooks';
import { Save, X } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

interface LegalHoldWizardProps {
    caseId?: string;
    onComplete: () => void;
    onCancel: () => void;
}

export function LegalHoldWizard({ caseId: _caseId, onComplete, onCancel }: LegalHoldWizardProps) {
    const { theme } = useTheme();
    const notify = useNotify();
    const [formData, setFormData] = useState<Partial<LegalHoldEnhanced>>({
        holdName: '',
        matter: '',
        status: 'draft',
        issuedDate: new Date().toISOString().split('T')[0],
        scope: '',
        custodianCount: 0,
        acknowledgedCount: 0
    });

    const { mutate: createHold, isLoading } = useMutation(
        async (data: Partial<LegalHoldEnhanced>) => {
            const repo = DataService.discovery as unknown as DiscoveryRepository;
            return repo.createLegalHold(data as LegalHoldEnhanced);
        },
        {
            onSuccess: () => {
                notify.success('Legal Hold issued successfully.');
                // Invalidate both standard and enhanced queries
                queryClient.invalidateQueries(['discovery', 'legal-holds']);
                queryClient.invalidateQueries(['discovery', 'legal-holds', 'enhanced']);
                onComplete();
            },
            onError: (err) => {
                notify.error('Failed to issue legal hold.');
                console.error(err);
            }
        }
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createHold(formData);
    };

    const handleChange = (field: keyof LegalHoldEnhanced, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
             <div className={cn("w-full max-w-2xl rounded-lg shadow-xl", theme.surface.default, theme.border.default)}>
                <div className="p-6 border-b">
                    <h2 className={cn("text-xl font-bold", theme.text.primary)}>Issue New Legal Hold</h2>
                    <p className={theme.text.secondary}>Create a preservation notice for custodians.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={cn("block text-sm font-medium mb-1", theme.text.secondary)}>Hold Name</label>
                            <Input
                                value={formData.holdName}
                                onChange={(e) => handleChange('holdName', e.target.value)}
                                placeholder="e.g. Q4 Financials Hold"
                                required
                            />
                        </div>
                        <div>
                            <label className={cn("block text-sm font-medium mb-1", theme.text.secondary)}>Matter / Case</label>
                            <Input
                                value={formData.matter}
                                onChange={(e) => handleChange('matter', e.target.value)}
                                placeholder="Case Name"
                                required
                            />
                        </div>
                         <div>
                            <label className={cn("block text-sm font-medium mb-1", theme.text.secondary)}>Issued Date</label>
                            <Input
                                type="date"
                                value={formData.issuedDate}
                                onChange={(e) => handleChange('issuedDate', e.target.value)}
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
                                <option value="draft">Draft</option>
                                <option value="active">Active</option>
                                <option value="released">Released</option>
                            </select>
                        </div>
                    </div>

                    <div>
                         <label className={cn("block text-sm font-medium mb-1", theme.text.secondary)}>Scope of Preservation</label>
                        <TextArea
                            value={formData.scope}
                            onChange={(e) => handleChange('scope', e.target.value)}
                            placeholder="Describe data types, date ranges, and sources to preserve..."
                            className="h-24"
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading} icon={X}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" disabled={isLoading} icon={isLoading ? undefined : Save}>
                            {isLoading ? 'Issuing...' : 'Issue Hold'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
