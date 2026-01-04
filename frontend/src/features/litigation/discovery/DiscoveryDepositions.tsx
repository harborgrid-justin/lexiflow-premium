/**
 * @module components/discovery/DiscoveryDepositions
 * @category Discovery
 * @description Deposition scheduling with witness tracking and transcripts.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { Calendar, CheckSquare, FileText, MapPin, Mic2, Plus, User, Video } from 'lucide-react';
import React, { useState } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Components
import { TaskCreationModal } from '@/components/features/cases/components/TaskCreationModal/TaskCreationModal';
import { TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '@/components/organisms/Table/Table';
import { Badge } from '@/components/ui/atoms/Badge';
import { Button } from '@/components/ui/atoms/Button';
import { Input } from '@/components/ui/atoms/Input';
import { TextArea } from '@/components/ui/atoms/TextArea';

// Hooks & Context
import { useTheme } from '@/contexts/theme/ThemeContext';
import { useMutation, useQuery } from '@/hooks/useQueryHooks';
import { useWindow } from '@/providers';

// Services & Utils
import { DataService } from '@/services/data/dataService';
import { STORES } from '@/services/data/db';
import { cn } from '@/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
import { CaseId, Deposition, UUID } from '@/types';

export const DiscoveryDepositions: React.FC = () => {
    const { theme } = useTheme();
    const { openWindow, closeWindow } = useWindow();
    const [newDepo, setNewDepo] = useState<Partial<Deposition>>({});

    // Enterprise Data Access
    const { data: rawDepositions = [] } = useQuery<Deposition[]>(
        [STORES.DISCOVERY_EXT_DEPO, 'all'],
        () => DataService.discovery.getDepositions()
    );

    // Ensure depositions is always an array
    const depositions = Array.isArray(rawDepositions) ? rawDepositions : [];

    const { mutate: scheduleDeposition } = useMutation(
        DataService.discovery.addDeposition,
        {
            invalidateKeys: [[STORES.DISCOVERY_EXT_DEPO, 'all']],
            onSuccess: () => {
                closeWindow('schedule-depo');
                setNewDepo({});
            }
        }
    );

    const handleSchedule = () => {
        if (!newDepo.witnessName || !newDepo.date) return;
        const deposition: Deposition = {
            id: `DEP-${Date.now()}` as UUID,
            caseId: 'C-2024-001' as CaseId, // Mock default
            witnessName: newDepo.witnessName,
            date: newDepo.date,
            location: newDepo.location || 'Remote',
            status: 'Scheduled',
            courtReporter: newDepo.courtReporter,
            prepNotes: newDepo.prepNotes
        };
        scheduleDeposition(deposition);
    };

    const openScheduleWindow = () => {
        openWindow(
            'schedule-depo',
            'Schedule Deposition',
            <div className="p-6 space-y-4 bg-white">
                <Input label="Witness Name" value={newDepo.witnessName || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDepo({ ...newDepo, witnessName: e.target.value })} placeholder="e.g. Jane Doe" />
                <div className="grid grid-cols-2 gap-4">
                    <Input label="Date" type="date" value={newDepo.date || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDepo({ ...newDepo, date: e.target.value })} />
                    <Input label="Location" value={newDepo.location || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDepo({ ...newDepo, location: e.target.value })} placeholder="e.g. Remote (Zoom)" />
                </div>
                <Input label="Court Reporter / Vendor" value={newDepo.courtReporter || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDepo({ ...newDepo, courtReporter: e.target.value })} placeholder="e.g. Veritext" />
                <TextArea label="Prep Notes" value={newDepo.prepNotes || ''} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewDepo({ ...newDepo, prepNotes: e.target.value })} placeholder="Key topics to cover..." />
                <div className="flex justify-end pt-4">
                    <Button variant="primary" onClick={handleSchedule}>Save Schedule</Button>
                </div>
            </div>
        );
    };

    const [taskModalOpen, setTaskModalOpen] = React.useState(false);
    const [selectedDepo, setSelectedDepo] = React.useState<Deposition | null>(null);

    const handleCreatePrepTask = (depo: Deposition) => {
        setSelectedDepo(depo);
        setTaskModalOpen(true);
    };

    return (
        <>
            {selectedDepo && (
                <TaskCreationModal
                    isOpen={taskModalOpen}
                    onClose={() => {
                        setTaskModalOpen(false);
                        setSelectedDepo(null);
                    }}
                    initialTitle={`Prepare for Depo: ${selectedDepo.witnessName}`}
                    relatedModule="Deposition"
                    relatedItemId={selectedDepo.id}
                />
            )}
            <div className="space-y-6 animate-fade-in">
                <div className={cn("flex justify-between items-center p-4 rounded-lg border shadow-sm", theme.surface.default, theme.border.default)}>
                    <div>
                        <h3 className={cn("font-bold flex items-center", theme.text.primary)}>
                            <Mic2 className="h-5 w-5 mr-2 text-indigo-600" /> Deposition Calendar
                        </h3>
                        <p className={cn("text-sm", theme.text.secondary)}>Manage witness schedules and preparation tasks.</p>
                    </div>
                    <Button variant="primary" icon={Plus} onClick={openScheduleWindow}>Schedule New</Button>
                </div>

                <TableContainer>
                    <TableHeader>
                        <TableHead>Witness</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Reporter / Vendor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableHeader>
                    <TableBody>
                        {depositions.map(depo => (
                            <TableRow key={depo.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="bg-indigo-50 p-2 rounded-full text-indigo-600">
                                            <User className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className={cn("font-bold text-sm", theme.text.primary)}>{depo.witnessName}</p>
                                            <p className={cn("text-xs font-mono", theme.text.tertiary)}>{depo.id}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className={cn("flex items-center text-sm", theme.text.primary)}>
                                        <Calendar className={cn("h-4 w-4 mr-2", theme.text.tertiary)} /> {new Date(depo.date).toLocaleDateString()}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className={cn("flex items-center text-sm", theme.text.primary)}>
                                        {depo.location.toLowerCase().includes('zoom') || depo.location.toLowerCase().includes('remote')
                                            ? <Video className="h-4 w-4 mr-2 text-blue-500" />
                                            : <MapPin className={cn("h-4 w-4 mr-2", theme.text.tertiary)} />
                                        }
                                        {depo.location}
                                    </div>
                                </TableCell>
                                <TableCell className={cn("text-sm", theme.text.secondary)}>{depo.courtReporter || '-'}</TableCell>
                                <TableCell>
                                    <Badge variant={depo.status === 'Scheduled' ? 'info' : depo.status === 'Completed' ? 'success' : 'neutral'}>
                                        {depo.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button size="sm" variant="ghost" icon={CheckSquare} onClick={() => handleCreatePrepTask(depo)}>Prep</Button>
                                        <Button size="sm" variant="ghost" icon={FileText} className="text-blue-600">Exhibits</Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {depositions.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className={cn("text-center py-8 italic", theme.text.tertiary)}>No depositions scheduled.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </TableContainer>
            </div>
        </>
    );
};

export default DiscoveryDepositions;
