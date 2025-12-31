
import { Badge } from '@/components/ui/atoms/Badge';
import { Button } from '@/components/ui/atoms/Button';
import { Input } from '@/components/ui/atoms/Input';
import { TextArea } from '@/components/ui/atoms/TextArea';
import { Card } from '@/components/ui/molecules/Card';
import { Modal } from '@/components/ui/molecules/Modal';
import { useModalState } from '@/hooks';
import { useMutation, useQuery } from '@/hooks/useQueryHooks';
import { useTheme } from '@/providers';
import { DataService } from '@/services/data/dataService';
import { STORES } from '@/services/data/db';
import { SanctionMotion } from '@/types';
import { cn } from '@/utils/cn';
import { FileWarning, Gavel, Plus } from 'lucide-react';
import React, { useState } from 'react';


export const MotionForSanctions: React.FC = () => {
    const { theme } = useTheme();
    const sanctionModal = useModalState();
    const [newMotion, setNewMotion] = useState<Partial<SanctionMotion>>({});

    const { data: sanctions = [] } = useQuery<SanctionMotion[]>(
        [STORES.SANCTIONS, 'all'],
        () => DataService.discovery.getSanctions()
    );

    const { mutate: addSanction } = useMutation(
        DataService.discovery.addSanctionMotion,
        {
            invalidateKeys: [[STORES.SANCTIONS, 'all']],
            onSuccess: () => { sanctionModal.close(); setNewMotion({}); }
        }
    );

    const handleSave = () => {
        if (!newMotion.title) return;
        addSanction({
            id: `sanc-${Date.now()}`,
            caseId: 'General',
            title: newMotion.title,
            ruleBasis: newMotion.ruleBasis as never || 'Rule 37(a)',
            status: 'Draft',
            relatedRequestId: newMotion.relatedRequestId || '',
            description: newMotion.description || ''
        } as unknown as SanctionMotion);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className={cn("p-6 rounded-lg border flex justify-between items-center", theme.status.error.bg, theme.status.error.border)}>
                <div>
                    <h3 className={cn("text-lg font-bold flex items-center", theme.status.error.text)}>
                        <Gavel className="h-5 w-5 mr-2" /> Motion for Sanctions (Rule 37)
                    </h3>
                    <p className={cn("text-sm", theme.status.error.text)}>Track enforcement actions for discovery non-compliance.</p>
                </div>
                <Button variant="danger" icon={Plus} onClick={sanctionModal.open}>File Motion</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sanctions.map(s => (
                    <Card key={s.id} className="border-l-4 border-l-red-500">
                        <div className="flex justify-between items-start mb-2">
                            <Badge variant="error">{s.ruleBasis}</Badge>
                            <span className={cn("text-xs font-bold uppercase", theme.text.tertiary)}>{s.status}</span>
                        </div>
                        <h4 className={cn("font-bold text-lg mb-2", theme.text.primary)}>{s.title}</h4>
                        <p className={cn("text-sm mb-4", theme.text.secondary)}>{s.description}</p>
                        <div className={cn("pt-4 border-t flex justify-end gap-2", theme.border.default)}>
                            <Button size="sm" variant="outline">View Brief</Button>
                            <Button size="sm" variant="ghost" className="text-red-600">Delete</Button>
                        </div>
                    </Card>
                ))}
                {sanctions.length === 0 && (
                    <div className={cn("col-span-2 text-center py-12 border-2 border-dashed rounded-lg text-slate-400", theme.border.default)}>
                        <FileWarning className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>No sanctions motions filed.</p>
                    </div>
                )}
            </div>

            <Modal isOpen={sanctionModal.isOpen} onClose={sanctionModal.close} title="Draft Sanctions Motion">
                <div className="p-6 space-y-4">
                    <Input label="Motion Title" value={newMotion.title || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMotion({ ...newMotion, title: e.target.value })} placeholder="e.g. Motion for Spoliation Sanctions" />
                    <div>
                        <label className={cn("block text-xs font-bold uppercase mb-1.5", theme.text.secondary)}>Basis</label>
                        <select className={cn("w-full p-2 border rounded text-sm", theme.surface.default, theme.border.default, theme.text.primary)} value={newMotion.ruleBasis} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewMotion({ ...newMotion, ruleBasis: e.target.value as any })}>
                            <option value="Rule 37(a)">Rule 37(a) - Compel</option>
                            <option value="Rule 37(b)">Rule 37(b) - Failure to Comply with Order</option>
                            <option value="Rule 37(c)">Rule 37(c) - Failure to Disclose/Admit</option>
                        </select>
                    </div>
                    <TextArea label="Argument Summary" value={newMotion.description || ''} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewMotion({ ...newMotion, description: e.target.value })} rows={4} placeholder="Describe the violation..." />
                    <div className="flex justify-end pt-4">
                        <Button variant="danger" onClick={handleSave}>Create Draft</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default MotionForSanctions;
