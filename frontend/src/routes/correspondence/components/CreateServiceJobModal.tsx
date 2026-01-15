import { Button } from '@/components/atoms/Button/Button';
import { Input } from '@/components/atoms/Input/Input';
import { TextArea } from '@/components/atoms/TextArea/TextArea';
import { Modal } from '@/components/molecules/Modal/Modal';
import { useTheme } from '@/contexts/ThemeContext';
import { useNotify } from '@/hooks/useNotify';
import { useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/data-service.service';
import { validateServiceJobSafe } from '@/services/validation/correspondenceSchemas';
import { CaseId, ServiceJob, UserId } from '@/types';
import { cn } from '@/lib/cn';
import { queryKeys } from '@/utils/queryKeys';
import { useState } from 'react';

interface CreateServiceJobModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (job: ServiceJob) => void;
}

export function CreateServiceJobModal({ isOpen, onClose, onSave }: CreateServiceJobModalProps) {
    const { theme } = useTheme();
    const notify = useNotify();
    const [formData, setFormData] = useState<Partial<ServiceJob>>({
        status: 'DRAFT',
        attempts: 0,
        method: 'Process Server'
    });
    const [_validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    // Note: validationErrors is set but not currently displayed in UI - can be used to show field-level errors

    // Load cases from IndexedDB via useQuery for accurate, cached data
    const { data: cases = [] } = useQuery(
        queryKeys.cases.all(),
        () => DataService.cases.getAll()
    );

    // Load documents for selected case
    const { data: docs = [] } = useQuery(
        queryKeys.documents.byCaseId(formData.caseId || ''),
        () => DataService.documents.getByCaseId(formData.caseId!),
        { enabled: !!formData.caseId }
    );

    const handleSave = () => {
        if (!formData.targetPerson || !formData.caseId || !formData.documentTitle || !formData.dueDate) {
            notify.error('Please fill in all required fields');
            return;
        }

        const newJob: ServiceJob = {
            id: `srv-${Date.now()}`,
            caseId: formData.caseId,
            requestorId: 'current-user' as UserId,
            documentTitle: formData.documentTitle,
            targetPerson: formData.targetPerson,
            targetAddress: formData.targetAddress || '',
            serverName: formData.method === 'Mail' ? (formData.serverName || 'USPS') : (formData.serverName || 'Pending Assignment'),
            method: formData.method || 'Process Server',
            mailType: formData.mailType,
            trackingNumber: formData.trackingNumber,
            addressedTo: formData.addressedTo,
            status: 'OUT_FOR_SERVICE',
            dueDate: formData.dueDate,
            attempts: 0,
            notes: formData.notes
        };

        // Validate with Zod schema
        const validation = validateServiceJobSafe(newJob);
        if (!validation.success) {
            const errors: Record<string, string> = {};
            validation.error.issues.forEach(err => {
                errors[err.path[0] as string] = err.message;
            });
            setValidationErrors(errors);
            notify.error('Validation failed: ' + (validation.error.issues[0]?.message || 'Unknown error'));
            return;
        }

        onSave(newJob);
        setFormData({ status: 'DRAFT', attempts: 0, method: 'Process Server' });
        setValidationErrors({});
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="New Service Job">
            <div className="p-6 space-y-4">
                <div className="flex justify-center mb-4 bg-slate-100 p-1 rounded-lg">
                    <button
                        className={cn("flex-1 py-1.5 rounded-md text-sm font-medium transition-all", formData.method === 'Process Server' ? "bg-white shadow text-blue-600" : "text-slate-500 hover:text-slate-700")}
                        onClick={() => setFormData({ ...formData, method: 'Process Server' })}
                    >
                        Process Server
                    </button>
                    <button
                        className={cn("flex-1 py-1.5 rounded-md text-sm font-medium transition-all", formData.method === 'Mail' ? "bg-white shadow text-blue-600" : "text-slate-500 hover:text-slate-700")}
                        onClick={() => setFormData({ ...formData, method: 'Mail' })}
                    >
                        Mail Carrier
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label htmlFor="case-select" className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Case</label>
                        <select
                            id="case-select"
                            aria-label="Select case"
                            className={cn("w-full px-3 py-2 border rounded-md text-sm", theme.surface.default, theme.border.default, theme.text.primary)}
                            value={formData.caseId || ''}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, caseId: e.target.value as CaseId })}
                        >
                            <option value="">Select Case...</option>
                            {(Array.isArray(cases) ? cases : []).map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="document-select" className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Document to Serve</label>
                        {formData.caseId ? (
                            <select
                                id="document-select"
                                aria-label="Select document to serve"
                                className={cn("w-full px-3 py-2 border rounded-md text-sm", theme.surface.default, theme.border.default, theme.text.primary)}
                                value={formData.documentTitle || ''}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, documentTitle: e.target.value })}
                            >
                                <option value="">Select Document...</option>
                                {(Array.isArray(docs) ? docs : []).map((d) => {
                                    if (typeof d !== 'object' || d === null) return null;
                                    const docId = 'id' in d ? String(d.id) : '';
                                    const docTitle = 'title' in d && typeof d.title === 'string' ? d.title : '';
                                    return <option key={docId} value={docTitle}>{docTitle}</option>;
                                })}
                            </select>
                        ) : (
                            <Input
                                value={formData.documentTitle || ''}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, documentTitle: e.target.value })}
                                placeholder="Or type document name..."
                                disabled={false}
                            />
                        )}
                    </div>

                    {formData.method === 'Mail' && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="mail-service-select" className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Mail Service</label>
                                    <select
                                        id="mail-service-select"
                                        aria-label="Select mail service"
                                        className={cn("w-full px-3 py-2 border rounded-md text-sm", theme.surface.default, theme.border.default, theme.text.primary)}
                                        value={formData.mailType || ''}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, mailType: e.target.value as never, serverName: e.target.value.includes('FedEx') ? 'FedEx' : e.target.value.includes('UPS') ? 'UPS' : 'USPS' })}
                                    >
                                        <option value="">Select Service...</option>
                                        <option value="USPS Certified RR">USPS Certified w/ Return Receipt</option>
                                        <option value="USPS Certified">USPS Certified</option>
                                        <option value="USPS First Class">USPS First Class</option>
                                        <option value="FedEx">FedEx Overnight</option>
                                        <option value="UPS">UPS Next Day</option>
                                    </select>
                                </div>
                                <Input
                                    label="Tracking Number"
                                    placeholder="e.g. 7023 0000..."
                                    value={formData.trackingNumber || ''}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, trackingNumber: e.target.value })}
                                />
                            </div>
                            <Input
                                label="Addressed To (Specific Name)"
                                placeholder="Name on envelope"
                                value={formData.addressedTo || ''}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, addressedTo: e.target.value })}
                            />
                        </>
                    )}

                    <Input
                        label="Target Party / Entity"
                        placeholder="e.g. Registered Agent for Corp Inc."
                        value={formData.targetPerson || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, targetPerson: e.target.value })}
                    />

                    <Input
                        label="Service Address"
                        placeholder="Full street address"
                        value={formData.targetAddress || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, targetAddress: e.target.value })}
                    />

                    {formData.method === 'Process Server' && (
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Vendor / Process Server"
                                placeholder="e.g. ABC Legal"
                                value={formData.serverName || ''}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, serverName: e.target.value })}
                            />
                            <Input
                                label="Due Date"
                                type="date"
                                value={formData.dueDate || ''}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, dueDate: e.target.value })}
                            />
                        </div>
                    )}

                    {formData.method === 'Mail' && (
                        <Input
                            label="Target Delivery Date"
                            type="date"
                            value={formData.dueDate || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, dueDate: e.target.value })}
                        />
                    )}

                    <TextArea
                        label="Instructions / Notes"
                        rows={3}
                        placeholder={formData.method === 'Mail' ? "Notes on enclosure..." : "e.g. Best time to serve is morning..."}
                        value={formData.notes || ''}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, notes: e.target.value })}
                    />
                </div>

                <div className={cn("pt-4 flex justify-end gap-2 border-t mt-4", theme.border.default)}>
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button variant="primary" onClick={handleSave}>Create Job</Button>
                </div>
            </div>
        </Modal>
    );
}
