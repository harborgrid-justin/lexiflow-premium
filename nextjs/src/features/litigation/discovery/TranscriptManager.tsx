import { TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '@/components/organisms/Table/Table';
import { Button } from '@/components/ui/atoms/Button';
import { useMutation, useQuery } from '@/hooks/useQueryHooks';
import { useTheme } from '@/providers';
import { DataService } from '@/services/data/dataService';
import { Transcript } from '@/types';
import { cn } from '@/utils/cn';
import { CheckCircle, Clock, FileText, Search, Upload } from 'lucide-react';
import React, { useCallback, useState } from 'react';
// ✅ Migrated to backend API (2025-12-21)
import { Input } from '@/components/ui/atoms/Input';
import { Modal } from '@/components/ui/molecules/Modal/Modal';
import { useModalState } from '@/hooks/core';

export const TranscriptManager: React.FC = () => {
    const { theme } = useTheme();
    const transcriptModal = useModalState();
    const [newTranscript, setNewTranscript] = useState<Partial<Transcript>>({});

    const { data: transcripts = [] } = useQuery<Transcript[]>(
        ['transcripts', 'all'],
        () => DataService.discovery.getTranscripts()
    );

    const { mutate: addTranscript } = useMutation(
        DataService.discovery.addTranscript,
        {
            invalidateKeys: [['transcripts', 'all']],
            onSuccess: () => { transcriptModal.close(); setNewTranscript({}); }
        }
    );

    const handleSave = useCallback(() => {
        if (!newTranscript.deponent) return;
        // Generate ID in event handler (not during render) for deterministic rendering
        const newId = `tran-${Date.now()}`;
        addTranscript({
            id: newId,
            caseId: 'General',
            deponent: newTranscript.deponent,
            date: newTranscript.date || '',
            isFinal: newTranscript.isFinal || false,
            wordCount: 0
        } as Transcript);
    }, [newTranscript, addTranscript]);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className={cn("flex justify-between items-center p-4 rounded-lg border shadow-sm", theme.surface.default, theme.border.default)}>
                <div>
                    <h3 className={cn("font-bold flex items-center", theme.text.primary)}>
                        <FileText className="h-5 w-5 mr-2 text-slate-600" /> Transcript Manager (Rule 32)
                    </h3>
                    <p className={cn("text-sm", theme.text.secondary)}>Deposition indexing, full-text search, and video syncing.</p>
                </div>
                <Button variant="primary" icon={Upload} onClick={transcriptModal.open}>Import Transcript</Button>
            </div>

            <TableContainer>
                <TableHeader>
                    <TableHead>Deponent</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Pages/Words</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableHeader>
                <TableBody>
                    {transcripts.map(t => (
                        <TableRow key={t.id}>
                            <TableCell className={cn("font-bold", theme.text.primary)}>{t.deponent}</TableCell>
                            <TableCell>{t.date}</TableCell>
                            <TableCell>
                                <span className={cn("flex items-center text-xs font-medium", t.isFinal ? "text-green-600" : "text-amber-600")}>
                                    {t.isFinal ? <CheckCircle className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                                    {t.isFinal ? 'Final' : 'Draft'}
                                </span>
                            </TableCell>
                            <TableCell className={cn("text-xs font-mono", theme.text.tertiary)}>
                                {t.wordCount > 0 ? `${(t.wordCount / 250).toFixed(0)} pgs` : 'Processing'}
                            </TableCell>
                            <TableCell className="text-right">
                                <Button size="sm" variant="ghost" icon={Search}>Search Text</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                    {transcripts.length === 0 && (
                        <TableRow><TableCell colSpan={5} className={cn("text-center py-8 italic", theme.text.tertiary)}>No transcripts uploaded.</TableCell></TableRow>
                    )}
                </TableBody>
            </TableContainer>

            <Modal isOpen={transcriptModal.isOpen} onClose={transcriptModal.close} title="Import Transcript">
                <div className="p-6 space-y-4">
                    <Input label="Deponent Name" value={newTranscript.deponent || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTranscript({ ...newTranscript, deponent: e.target.value })} />
                    <Input type="date" label="Deposition Date" value={newTranscript.date || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTranscript({ ...newTranscript, date: e.target.value })} />
                    <div className="flex items-center gap-2 pt-2">
                        <input type="checkbox" id="final" className="rounded text-blue-600" checked={newTranscript.isFinal || false} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTranscript({ ...newTranscript, isFinal: e.target.checked })} />
                        <label htmlFor="final" className={cn("text-sm", theme.text.primary)}>Is Final Certified Copy?</label>
                    </div>
                    <div className={cn("border-2 border-dashed rounded-lg p-8 text-center mt-4", theme.border.default)}>
                        <Upload className={cn("h-8 w-8 mx-auto mb-2 text-slate-400")} />
                        <p className="text-xs text-slate-500">Drag .txt, .pdf, or .ptx file here</p>
                    </div>
                    <div className="flex justify-end pt-4">
                        <Button variant="primary" onClick={handleSave}>Start Import</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default TranscriptManager;
