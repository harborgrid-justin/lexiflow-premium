import { TaskCreationModal } from '@/components/features/cases/components/TaskCreationModal/TaskCreationModal';
import { Button } from '@/components/ui/atoms/Button/Button';
import { useNotify } from '@/hooks/useNotify';
import { useMutation } from '@/hooks/useQueryHooks';
import { useTheme } from '@/providers';
import { DataService } from '@/services/data/dataService';
import { correspondenceQueryKeys } from '@/services/infrastructure/queryKeys';
import { CaseId, CommunicationItem, DocketEntry, DocketId, DocumentId, EvidenceId, EvidenceItem, LegalDocument, ServiceJob, UUID, WorkflowTask } from '@/types';
import { ServiceStatus } from '@/types/enums';
import { cn } from '@/utils/cn';
import { Archive, BookOpen, Briefcase, CheckSquare, Download, FileText, Mail, MapPin, Navigation, PenTool, Truck, UploadCloud, X } from 'lucide-react';
import React, { useState } from 'react';

// Discriminated union type for correspondence items
type CorrespondenceItem =
    | { type: 'communication'; item: CommunicationItem }
    | { type: 'service'; item: ServiceJob };

interface CorrespondenceDetailProps {
    correspondenceItem: CorrespondenceItem;
    onClose: () => void;
    onReply?: (item: CommunicationItem) => void;
}

export function CorrespondenceDetail({ correspondenceItem, onClose, onReply }: CorrespondenceDetailProps) {
    const { theme } = useTheme();
    const notify = useNotify();
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

    // State for service job updates with discriminated union type narrowing
    const [signerName, setSignerName] = useState(
        correspondenceItem.type === 'service' ? correspondenceItem.item.signerName || '' : ''
    );
    const [deliveryDate, setDeliveryDate] = useState(
        correspondenceItem.type === 'service' ? correspondenceItem.item.servedDate || '' : ''
    );
    const [newStatus, setNewStatus] = useState<keyof typeof ServiceStatus>(
        correspondenceItem.type === 'service' ? correspondenceItem.item.status : 'OUT_FOR_SERVICE'
    );

    // Optimistic mutation for archiving with exponential backoff retry
    const { mutate: archiveItem, isLoading: isArchiving } = useMutation(
        async (id: string) => {
            const correspondence = DataService.correspondence as any;
            return correspondence.archive(id);
        },
        {
            onMutate: (_id: string) => {
                notify.info('Archiving...');
            },
            onSuccess: () => {
                notify.success("Item archived successfully");
                onClose();
            },
            onError: (error: unknown) => {
                notify.error('Failed to archive item');
                console.error('Archive error:', error);
            },
            invalidateKeys: [
                correspondenceQueryKeys.correspondence.lists(),
                correspondenceQueryKeys.serviceJobs.lists()
            ]
        }
    );

    // Optimistic mutation for service job updates
    const { mutate: updateServiceJob, isLoading: isUpdating } = useMutation(
        async (updates: Partial<ServiceJob> & { id: string }) => {
            const correspondence = DataService.correspondence as any;
            await correspondence.updateServiceJob(updates.id, updates);
        },
        {
            onMutate: (_updates: Partial<ServiceJob> & { id: string }) => {
                notify.info('Updating service status...');
            },
            onSuccess: () => {
                notify.success('Service status updated');
            },
            onError: (error: unknown) => {
                notify.error('Failed to update service job');
                console.error('Update error:', error);
            },
            invalidateKeys: [correspondenceQueryKeys.serviceJobs.lists()]
        }
    );

    const handleCreateTask = async (task: WorkflowTask) => {
        const tasks = DataService.tasks as any;
        await tasks.add(task);
        notify.success('Follow-up task created.');
    };

    const handleSaveToCase = async () => {
        if (correspondenceItem.type !== 'communication') return;

        const commItem = correspondenceItem.item;
        const doc: LegalDocument = {
            id: `doc-${Date.now()}` as DocumentId,
            caseId: commItem.caseId as CaseId,
            title: `Correspondence: ${commItem.subject}`,
            type: 'Correspondence',
            content: commItem.preview,
            uploadDate: new Date().toISOString().split('T')[0],
            lastModified: new Date().toISOString().split('T')[0],
            tags: ['Communication', commItem.type],
            versions: [],
            sourceModule: 'Correspondence',
            status: 'Final',
            fileSize: '24 KB'
        };

        try {
            const documents = DataService.documents as any;
            await documents.add(doc);
            notify.success('Correspondence saved to Case Documents.');
        } catch (e) {
            notify.error('Failed to save document.');
            console.error('Save error:', e);
        }
    };

    const handleLinkDocket = async () => {
        if (correspondenceItem.type !== 'service') return;

        const serviceItem = correspondenceItem.item;
        const todayDate = new Date().toISOString().split('T')[0];
        const entry: DocketEntry = {
            id: `dk-${Date.now()}` as DocketId,
            sequenceNumber: 999,
            caseId: serviceItem.caseId,
            dateFiled: todayDate,
            entryDate: todayDate,
            date: todayDate,
            type: 'Filing',
            title: `Proof of Service - ${serviceItem.documentTitle}`,
            description: `Service on ${serviceItem.targetPerson} at ${serviceItem.targetAddress}. Status: ${serviceItem.status}. Server: ${serviceItem.serverName}. Signed by: ${signerName || 'N/A'}`,
            filedBy: serviceItem.serverName,
            isSealed: false
        };

        try {
            const docket = DataService.docket as any;
            await docket.add(entry);
            notify.success('Service Proof linked to Docket.');
        } catch (e) {
            notify.error('Failed to create docket entry.');
            console.error('Docket error:', e);
        }
    };

    const handleUpdateServiceStatus = () => {
        if (correspondenceItem.type !== 'service') return;

        const serviceItem = correspondenceItem.item;
        updateServiceJob({
            id: serviceItem.id,
            status: newStatus,
            signerName,
            servedDate: deliveryDate
        });
    };

    const handleUploadProof = async () => {
        if (correspondenceItem.type !== 'service') return;

        const serviceItem = correspondenceItem.item;
        const proof: EvidenceItem = {
            id: `ev-${Date.now()}` as EvidenceId,
            trackingUuid: crypto.randomUUID() as UUID,
            caseId: serviceItem.caseId,
            title: `Return Receipt - ${serviceItem.documentTitle}`,
            type: 'Document',
            description: `Proof of delivery/service for ${serviceItem.documentTitle} to ${serviceItem.targetPerson}. Signed by ${signerName}.`,
            collectionDate: new Date().toISOString().split('T')[0],
            collectedBy: 'System Import',
            custodian: 'Firm Records',
            location: 'Digital Evidence Vault',
            admissibility: 'Admissible',
            chainOfCustody: [],
            tags: ['Proof of Service', 'Return Receipt']
        };

        try {
            const evidence = DataService.evidence as any;
            await evidence.add(proof);
            notify.success('Return Receipt added to Evidence Vault.');
        } catch (e) {
            notify.error('Failed to upload proof.');
            console.error('Upload error:', e);
        }
    };

    return (
        <div className={cn("h-full flex flex-col border-l shadow-xl bg-white", theme.border.default)}>
            {isTaskModalOpen && (
                <TaskCreationModal
                    isOpen={true}
                    onClose={() => setIsTaskModalOpen(false)}
                    initialTitle={`Follow up on: ${correspondenceItem.type === 'communication'
                        ? correspondenceItem.item.subject
                        : correspondenceItem.item.documentTitle
                        }`}
                    relatedModule={correspondenceItem.type === 'communication' ? 'Correspondence' : 'Service'}
                    relatedItemId={correspondenceItem.item.id}
                    relatedItemTitle={
                        correspondenceItem.type === 'communication'
                            ? correspondenceItem.item.subject
                            : correspondenceItem.item.documentTitle
                    }
                    onSave={handleCreateTask}
                />
            )}

            <div className={cn("p-4 border-b flex justify-between items-center bg-slate-50", theme.border.default)}>
                <h4 className={cn("font-bold text-sm uppercase tracking-wide", theme.text.secondary)}>
                    {correspondenceItem.type === 'communication' ? 'Message Details' : 'Service Job'}
                </h4>
                <button
                    onClick={onClose}
                    className={cn("p-1 rounded hover:bg-slate-200", theme.text.tertiary)}
                    disabled={isArchiving}
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {correspondenceItem.type === 'communication' && (() => {
                    const item = correspondenceItem.item;
                    return (
                        <>
                            <div>
                                <h3 className={cn("text-lg font-bold mb-2", theme.text.primary)}>{item.subject}</h3>
                                <div className="flex items-center gap-2 mb-4">
                                    <span className={cn("px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs font-bold border")}>{item.type}</span>
                                    <span className={cn("text-xs", theme.text.tertiary)}>{item.date}</span>
                                </div>
                            </div>

                            <div className="space-y-3 p-4 rounded-lg bg-slate-50 border border-slate-100">
                                <div className="flex justify-between text-sm">
                                    <span className={theme.text.secondary}>From:</span>
                                    <span className={cn("font-medium", theme.text.primary)}>{item.sender}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className={theme.text.secondary}>To:</span>
                                    <span className={cn("font-medium", theme.text.primary)}>{item.recipient}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className={theme.text.secondary}>Case:</span>
                                    <span className={cn("font-mono text-xs", theme.primary.text)}>{item.caseId}</span>
                                </div>
                            </div>

                            <div>
                                <h4 className={cn("text-xs font-bold uppercase mb-2", theme.text.tertiary)}>Content Preview</h4>
                                <div className={cn("p-4 rounded border text-sm italic leading-relaxed", theme.surface.default, theme.border.default, theme.text.secondary)}>
                                    &quot;{item.preview}...&quot;
                                </div>
                            </div>

                            {item.hasAttachment && (
                                <div className="p-3 border rounded-lg flex items-center justify-between hover:bg-slate-50 cursor-pointer">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-blue-600" />
                                        <span className="text-sm font-medium">Attachment.pdf</span>
                                    </div>
                                    <Download className="h-4 w-4 text-slate-400" />
                                </div>
                            )}
                        </>
                    );
                })()}

                {correspondenceItem.type === 'service' && (() => {
                    const item = correspondenceItem.item;
                    return (
                        <>
                            <div className="text-center pb-4 border-b border-slate-100">
                                <div className={cn("w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center", item.method === 'Mail' ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600")}>
                                    {item.method === 'Mail' ? <Truck className="h-6 w-6" /> : <MapPin className="h-6 w-6" />}
                                </div>
                                <h3 className={cn("text-lg font-bold", theme.text.primary)}>{item.targetPerson}</h3>
                                <p className={cn("text-sm", theme.text.secondary)}>{item.targetAddress}</p>
                            </div>

                            <div className="space-y-4">
                                {/* Update Status Section */}
                                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                                    <h4 className={cn("text-xs font-bold uppercase text-slate-500")}>Update Status</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Current Status</label>
                                            <select
                                                className="w-full p-2 text-sm border rounded bg-white"
                                                value={newStatus}
                                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewStatus(e.target.value as keyof typeof ServiceStatus)}
                                            >
                                                <option value="OUT_FOR_SERVICE">Out for Service</option>
                                                <option value="SERVED">Served / Delivered</option>
                                                <option value="ATTEMPTED">Attempted</option>
                                                <option value="NON_EST">Non-Est / Return to Sender</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Date</label>
                                            <input
                                                type="date"
                                                className="w-full p-2 text-sm border rounded bg-white"
                                                value={deliveryDate}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeliveryDate(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Signed By</label>
                                        <div className="relative">
                                            <PenTool className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
                                            <input
                                                className="w-full pl-7 p-2 text-sm border rounded bg-white"
                                                placeholder="Name of signatory..."
                                                value={signerName}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSignerName(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        className="w-full"
                                        onClick={handleUpdateServiceStatus}
                                        disabled={isUpdating}
                                    >
                                        {isUpdating ? 'Saving...' : 'Save Update'}
                                    </Button>
                                </div>

                                <div className="space-y-2 text-sm pt-2">
                                    <div className="flex justify-between">
                                        <span className={theme.text.tertiary}>Method:</span>
                                        <span className="font-medium">{item.method}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className={theme.text.tertiary}>Carrier/Server:</span>
                                        <span>{item.serverName}</span>
                                    </div>
                                    {item.mailType && (
                                        <div className="flex justify-between">
                                            <span className={theme.text.tertiary}>Mail Type:</span>
                                            <span>{item.mailType}</span>
                                        </div>
                                    )}
                                    {item.trackingNumber && (
                                        <div className="flex justify-between">
                                            <span className={theme.text.tertiary}>Tracking #:</span>
                                            <span className="font-mono text-blue-600">{item.trackingNumber}</span>
                                        </div>
                                    )}
                                    {item.addressedTo && (
                                        <div className="flex justify-between">
                                            <span className={theme.text.tertiary}>Addressed To:</span>
                                            <span>{item.addressedTo}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className={theme.text.tertiary}>Due Date:</span>
                                        <span className="text-red-500 font-medium">{item.dueDate}</span>
                                    </div>
                                </div>

                                {item.gpsCoordinates && (
                                    <div className={cn("p-3 rounded bg-slate-50 border border-slate-100 text-xs flex items-center gap-2", theme.text.secondary)}>
                                        <Navigation className="h-3 w-3 text-blue-500" />
                                        GPS Verified: {item.gpsCoordinates}
                                    </div>
                                )}

                                {item.notes && (
                                    <div>
                                        <label className={cn("block text-xs font-bold uppercase mb-1", theme.text.secondary)}>Notes</label>
                                        <p className={cn("text-sm p-3 bg-yellow-50 border border-yellow-100 rounded text-yellow-800")}>{item.notes}</p>
                                    </div>
                                )}

                                <div className="pt-2">
                                    <Button variant="outline" size="sm" className="w-full border-dashed" icon={UploadCloud} onClick={handleUploadProof}>
                                        Upload Return Receipt / Proof
                                    </Button>
                                </div>
                            </div>
                        </>
                    );
                })()}
            </div>

            <div className={cn("p-4 border-t flex flex-col gap-2", theme.border.default)}>
                {correspondenceItem.type === 'communication' ? (
                    <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm" icon={Mail} onClick={() => onReply && onReply(correspondenceItem.item)}>Reply</Button>
                        <Button variant="secondary" size="sm" icon={CheckSquare} onClick={() => setIsTaskModalOpen(true)}>Create Task</Button>
                        <Button variant="secondary" size="sm" icon={Briefcase} onClick={handleSaveToCase}>Save to Case</Button>
                        <Button variant="ghost" size="sm" icon={Archive} className="text-slate-500" onClick={() => archiveItem(correspondenceItem.item.id)}>Archive</Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-2">
                        <Button variant="secondary" size="sm" icon={BookOpen} onClick={handleLinkDocket} className="w-full">Link Proof to Docket</Button>
                    </div>
                )}
            </div>
        </div>
    );
}
