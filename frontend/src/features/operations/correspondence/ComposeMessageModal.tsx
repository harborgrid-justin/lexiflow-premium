import { Button } from '@/components/ui/atoms/Button/Button';
import { Input } from '@/components/ui/atoms/Input/Input';
import { Modal } from '@/components/ui/molecules/Modal/Modal';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useBlobRegistry } from '@/hooks/useBlobRegistry';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useNotify } from '@/hooks/useNotify';
import { useQuery } from '@/hooks/useQueryHooks';
import { useTheme } from '@/contexts/theme/ThemeContext';
import { DataService } from '@/services/data/dataService';
import { validateCommunicationItemSafe } from '@/services/validation/correspondenceSchemas';
import { CommunicationItem, CommunicationType, UserId } from '@/types';
import { CommunicationStatus } from '@/types/enums';
import { cn } from '@/utils/cn';
import { queryKeys } from '@/utils/queryKeys';
import { Paperclip, Send, Wand2, X } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

interface ComposeMessageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSend: (item: CommunicationItem) => void;
    initialData?: Partial<CommunicationItem>;
}

export function ComposeMessageModal({ isOpen, onClose, onSend, initialData }: ComposeMessageModalProps) {
    const { theme } = useTheme();
    const notify = useNotify();
    const { register, revoke } = useBlobRegistry();

    const [formData, setFormData] = useState<Partial<CommunicationItem>>({
        type: 'Email',
        direction: 'Outbound',
        isPrivileged: false,
        status: CommunicationStatus.DRAFT
    });
    const [isDrafting, setIsDrafting] = useState(false);
    const [_validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    // Note: validationErrors is set but not currently displayed in UI - can be used to show field-level errors

    // Load cases from IndexedDB via useQuery for accurate, cached data
    const { data: cases = [] } = useQuery(
        queryKeys.cases.all(),
        () => DataService.cases.getAll()
    );
    const [body, setBody] = useState('');
    const [attachments, setAttachments] = useState<Array<{ id: string; name: string; size: number }>>([]);

    // Auto-save draft every 2 seconds
    useAutoSave({
        data: { formData, body, attachments },
        onSave: async (data) => {
            if (data.body && data.formData.subject && isOpen) {
                // Save draft to IndexedDB
                const draftKey = `draft_communication_${data.formData.caseId || 'new'}`;
                localStorage.setItem(draftKey, JSON.stringify(data));
            }
        },
        delay: 2000,
        enabled: isOpen
    });

    // Keyboard shortcuts
    useKeyboardShortcuts([
        {
            key: 's',
            cmd: true,
            callback: () => {
                if (isOpen) {
                    handleSend();
                }
            },
            description: 'Send message'
        },
        {
            key: 'Escape',
            callback: () => {
                if (isOpen) onClose();
            },
            description: 'Close modal'
        }
    ], isOpen);

    // Effect discipline: Synchronize form with external data (Principle #6)
    // Strict Mode ready: State updates are idempotent (Principle #7)
    useEffect(() => {
        if (!isOpen) return;

        if (initialData) {
            setFormData(prev => ({
                ...prev,
                ...initialData,
                // Ensure defaults are preserved if not in initialData
                type: initialData.type || prev.type,
                direction: 'Outbound'
            }));
            if (initialData.preview) {
                setBody(`\n\n--- Original Message ---\n${initialData.preview}`);
            }
        } else {
            // Reset if opening fresh
            setFormData({
                type: 'Email',
                direction: 'Outbound',
                isPrivileged: false,
                status: 'Draft'
            });
            setBody('');
        }
    }, [isOpen, initialData]);

    const handleAIDraft = async () => {
        if (!formData.subject || !formData.recipient) return;
        setIsDrafting(true);
        try {
            // Lazy load GeminiService only when needed
            const { GeminiService } = await import('@/services/features/research/geminiService');
            const draft = await GeminiService.generateDraft(
                `Draft a formal ${formData.type} to ${formData.recipient} regarding ${formData.subject}. Tone: Professional Legal.`,
                'Communication'
            );
            setBody(draft);
        } catch (error) {
            notify.error('Failed to generate draft');
            console.error('AI draft error:', error);
        } finally {
            setIsDrafting(false);
        }
    };

    const handleAttachmentUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        for (const file of Array.from(files)) {
            if (file.size > 25 * 1024 * 1024) { // 25MB limit
                notify.error(`File ${file.name} exceeds 25MB limit`);
                continue;
            }

            const blobId = register(file);
            setAttachments(prev => [...prev, {
                id: blobId,
                name: file.name,
                size: file.size
            }]);
        }
        event.target.value = ''; // Reset input
    }, [register, notify]);

    const handleRemoveAttachment = useCallback((attachmentId: string) => {
        revoke(attachmentId);
        setAttachments(prev => prev.filter(a => a.id !== attachmentId));
    }, [revoke]);

    const handleSend = () => {
        if (!formData.subject || !formData.recipient || !formData.caseId) {
            setValidationErrors({
                subject: !formData.subject ? 'Subject is required' : '',
                recipient: !formData.recipient ? 'Recipient is required' : '',
                caseId: !formData.caseId ? 'Case is required' : ''
            });
            notify.error('Please fill in all required fields');
            return;
        }

        const newMessage: CommunicationItem = {
            id: `comm-${Date.now()}`,
            caseId: formData.caseId,
            userId: 'current-user' as UserId,
            subject: formData.subject,
            date: new Date().toISOString().split('T')[0],
            type: formData.type as CommunicationType,
            direction: 'Outbound',
            sender: 'Me (Attorney)',
            recipient: formData.recipient,
            preview: body.substring(0, 150) + (body.length > 150 ? '...' : ''),
            hasAttachment: attachments.length > 0,
            status: CommunicationStatus.SENT,
            isPrivileged: formData.isPrivileged || false
        };

        // Validate with Zod schema
        const validation = validateCommunicationItemSafe(newMessage);
        if (!validation.success) {
            const errors: Record<string, string> = {};
            validation.error.issues.forEach(err => {
                errors[err.path[0] as string] = err.message;
            });
            setValidationErrors(errors);
            notify.error('Validation failed. Please check your input.');
            return;
        }

        onSend(newMessage);
        setFormData({ type: 'Email', direction: 'Outbound', isPrivileged: false, status: CommunicationStatus.DRAFT });
        setBody('');
        setAttachments([]);
        setValidationErrors({});
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Compose Correspondence" size="lg">
            <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Type</label>
                        <select
                            title="Select message type"
                            className={cn("w-full px-3 py-2 border rounded-md text-sm", theme.surface.default, theme.border.default, theme.text.primary)}
                            value={formData.type}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, type: e.target.value as CommunicationType })}
                        >
                            <option value="Email">Email</option>
                            <option value="Letter">Formal Letter</option>
                            <option value="Fax">Fax</option>
                            <option value="Memo">Internal Memo</option>
                        </select>
                    </div>
                    <div>
                        <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Matter Reference</label>
                        <select
                            title="Select case reference"
                            className={cn("w-full px-3 py-2 border rounded-md text-sm", theme.surface.default, theme.border.default, theme.text.primary)}
                            value={formData.caseId || ''}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, caseId: e.target.value as import('@/types').CaseId })}
                        >
                            <option value="">Select Case...</option>
                            {(Array.isArray(cases) ? cases : []).map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                        </select>
                    </div>
                </div>

                <Input
                    label="Recipient"
                    placeholder="e.g. Opposing Counsel, Client"
                    value={formData.recipient || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, recipient: e.target.value })}
                />

                <Input
                    label="Subject"
                    placeholder="Subject line..."
                    value={formData.subject || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, subject: e.target.value })}
                />

                <div className="relative">
                    <div className="flex justify-between items-center mb-2">
                        <label className={cn("block text-xs font-semibold uppercase", theme.text.secondary)}>Message Body</label>
                        <Button size="xs" variant="ghost" icon={Wand2} onClick={handleAIDraft} disabled={isDrafting}>
                            {isDrafting ? 'Drafting...' : 'AI Assist'}
                        </Button>
                    </div>
                    <textarea
                        className={cn("w-full p-4 border rounded-lg text-sm font-serif h-48 resize-none outline-none focus:ring-2 focus:ring-blue-500", theme.surface.default, theme.border.default, theme.text.primary)}
                        value={body}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBody(e.target.value)}
                        placeholder="Type your message here..."
                    />
                </div>

                {/* Attachments Display */}
                {attachments.length > 0 && (
                    <div className="space-y-2">
                        <label className={cn("block text-xs font-semibold uppercase", theme.text.secondary)}>Attachments ({attachments.length})</label>
                        <div className="space-y-1">
                            {attachments.map(att => (
                                <div key={att.id} className={cn("flex items-center justify-between p-2 border rounded", theme.border.default, theme.surface.default)}>
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <Paperclip className="h-3 w-3 text-slate-400 shrink-0" />
                                        <span className="text-sm truncate">{att.name}</span>
                                        <span className="text-xs text-slate-400">({(att.size / 1024).toFixed(1)} KB)</span>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveAttachment(att.id)}
                                        title="Remove attachment"
                                        className="p-1 hover:bg-slate-100 rounded"
                                    >
                                        <X className="h-3 w-3 text-slate-400" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-4">
                        <label className="cursor-pointer">
                            <input
                                type="file"
                                multiple
                                onChange={handleAttachmentUpload}
                                className="hidden"
                                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                            />
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md hover:bg-slate-100 transition-colors">
                                <Paperclip className="h-4 w-4" />
                                Attach File
                            </span>
                        </label>
                        <label className="flex items-center text-sm cursor-pointer">
                            <input
                                type="checkbox"
                                className="mr-2 rounded text-blue-600"
                                checked={formData.isPrivileged}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, isPrivileged: e.target.checked })}
                            />
                            Mark Privileged
                        </label>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button variant="primary" icon={Send} onClick={handleSend}>Send (⌘S)</Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
