/**
 * CorrespondenceDetail.tsx
 * 
 * Detailed view for correspondence items and service of process tracking,
 * with document linking, task creation, and delivery confirmation.
 * 
 * @module components/case-detail/collaboration/CorrespondenceDetail
 * @category Case Management - Correspondence
 */

// External Dependencies
import React, { useState } from 'react';
import { X, Mail, MapPin, User, Calendar, FileText, Download, Navigation, CheckSquare, Archive, Briefcase, BookOpen, Truck, Package, PenTool, UploadCloud } from 'lucide-react';

// Internal Dependencies - Components
import { Button } from '../../../common/Button';
import { TaskCreationModal } from '../../../common/TaskCreationModal';

// Internal Dependencies - Hooks & Context
import { useTheme } from '../../../../context/ThemeContext';
import { useNotify } from '../../../../hooks/useNotify';
import { useMutation } from '../../../../hooks/useQueryHooks';

// Internal Dependencies - Services & Utils
import { DataService } from '../../../../services/data/dataService';
import { cn } from '../../../../utils/cn';

// Types & Interfaces
import { CommunicationItem, ServiceJob, LegalDocument, DocketEntry, EvidenceItem, WorkflowTask, DocumentId, CaseId, DocketId, EvidenceId, UUID } from '../../../../types';

interface CorrespondenceDetailProps {
  item: CommunicationItem | ServiceJob;
  type: 'communication' | 'service';
  onClose: () => void;
  onReply?: (item: CommunicationItem) => void;
}

export const CorrespondenceDetail: React.FC<CorrespondenceDetailProps> = ({ item, type, onClose, onReply }) => {
  const { theme } = useTheme();
  const notify = useNotify();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  
  // Local state for service updates - type narrowing required inside render or handlers, 
  // but initial state setup needs careful handling if item is wrong type.
  // We assume item matches type based on parent logic.
  const serviceItem = type === 'service' ? (item as ServiceJob) : null;
  
  const [signerName, setSignerName] = useState(serviceItem?.signerName || '');
  const [deliveryDate, setDeliveryDate] = useState(serviceItem?.servedDate || '');
  const [newStatus, setNewStatus] = useState(serviceItem?.status || 'Out for Service');

  // Type Guard helpers
  const isComm = (i: CommunicationItem | ServiceJob): i is CommunicationItem => type === 'communication';
  const isService = (i: CommunicationItem | ServiceJob): i is ServiceJob => type === 'service';

  // Mutations
  const { mutate: archiveItem } = useMutation(
      DataService.correspondence.archive,
      {
          onSuccess: () => {
              notify.success("Item archived.");
              onClose();
          }
      }
  );

  const handleCreateTask = async (task: WorkflowTask) => {
      await DataService.tasks.add(task);
      notify.success('Follow-up task created.');
  };

  const handleSaveToCase = async () => {
      if (!isComm(item)) return;
      
      const doc: LegalDocument = {
          id: `doc-${Date.now()}` as DocumentId,
          caseId: item.caseId as CaseId,
          title: `Correspondence: ${item.subject}`,
          type: 'Correspondence',
          content: item.preview, // In real app, this is full body
          uploadDate: new Date().toISOString().split('T')[0],
          lastModified: new Date().toISOString().split('T')[0],
          tags: ['Communication', item.type],
          versions: [],
          sourceModule: 'Correspondence',
          status: 'Final',
          fileSize: '24 KB' // Mock
      };
      
      try {
          await DataService.documents.add(doc);
          notify.success('Correspondence saved to Case Documents.');
      } catch (e) {
          notify.error('Failed to save document.');
      }
  };

  const handleLinkDocket = async () => {
      if (!isService(item)) return;
      
      const entry: DocketEntry = {
          id: `dk-${Date.now()}` as DocketId,
          sequenceNumber: 999, 
          caseId: item.caseId,
          date: new Date().toISOString().split('T')[0],
          type: 'Filing',
          title: `Proof of Service - ${item.documentTitle}`,
          description: `Service on ${item.targetPerson} at ${item.targetAddress}. Status: ${item.status}. Server: ${item.serverName}. Signed by: ${signerName || 'N/A'}`,
          filedBy: item.serverName,
          isSealed: false
      };
      
      try {
          await DataService.docket.add(entry);
          notify.success('Service Proof linked to Docket.');
      } catch (e) {
          notify.error('Failed to create docket entry.');
      }
  };

  const handleUpdateServiceStatus = async () => {
     if (!isService(item)) return;
     // Simulate update via direct object mod (in real app, use a PATCH mutation)
     item.status = newStatus as any;
     item.signerName = signerName;
     item.servedDate = deliveryDate;
     // This would be: await DataService.correspondence.updateServiceJob(item.id, { status: newStatus, ... });
     notify.success('Service status updated.');
  };

  const handleUploadProof = async () => {
      if (!isService(item)) return;
      
      const proof: EvidenceItem = {
          id: `ev-${Date.now()}` as EvidenceId,
          trackingUuid: crypto.randomUUID() as UUID,
          caseId: item.caseId,
          title: `Return Receipt - ${item.documentTitle}`,
          type: 'Document',
          description: `Proof of delivery/service for ${item.documentTitle} to ${item.targetPerson}. Signed by ${signerName}.`,
          collectionDate: new Date().toISOString().split('T')[0],
          collectedBy: 'System Import',
          custodian: 'Firm Records',
          location: 'Digital Evidence Vault',
          admissibility: 'Admissible',
          chainOfCustody: [],
          tags: ['Proof of Service', 'Return Receipt']
      };
      
      await DataService.evidence.add(proof);
      notify.success('Return Receipt added to Evidence Vault.');
  };

  return (
    <div className={cn("h-full flex flex-col border-l shadow-xl bg-white", theme.border.default)}>
        {isTaskModalOpen && (
            <TaskCreationModal 
                isOpen={true} 
                onClose={() => setIsTaskModalOpen(false)}
                initialTitle={`Follow up on: ${isComm(item) ? item.subject : (item as ServiceJob).documentTitle}`}
                relatedModule={type === 'communication' ? 'Correspondence' : 'Service'}
                relatedItemId={item.id}
                relatedItemTitle={isComm(item) ? item.subject : (item as ServiceJob).documentTitle}
                onSave={handleCreateTask}
            />
        )}

        <div className={cn("p-4 border-b flex justify-between items-center bg-slate-50", theme.border.default)}>
            <h4 className={cn("font-bold text-sm uppercase tracking-wide", theme.text.secondary)}>
                {type === 'communication' ? 'Message Details' : 'Service Job'}
            </h4>
            <button onClick={onClose} title="Close details" className={cn("p-1 rounded hover:bg-slate-200", theme.text.tertiary)}><X className="h-4 w-4"/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {isComm(item) && (
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
                            "{item.preview}..."
                        </div>
                    </div>

                    {item.hasAttachment && (
                        <div className={cn("p-3 border rounded-lg flex items-center justify-between cursor-pointer", theme.border.default, theme.surface.default, "hover:shadow-sm")}>
                            <div className="flex items-center gap-2">
                                <FileText className={cn("h-4 w-4", theme.text.link)}/>
                                <span className="text-sm font-medium">Attachment.pdf</span>
                            </div>
                            <Download className="h-4 w-4 text-slate-400"/>
                        </div>
                    )}
                </>
            )}

            {isService(item) && (
                <>
                    <div className="text-center pb-4 border-b border-slate-100">
                        <div className={cn("w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center", theme.surface.highlight, theme.action.primary.text)}>
                            {item.method === 'Mail' ? <Truck className="h-6 w-6"/> : <MapPin className="h-6 w-6"/>}
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
                                        title="Select current status"
                                        className="w-full p-2 text-sm border rounded bg-white"
                                        value={newStatus}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewStatus(e.target.value as any)}
                                    >
                                        <option value="Out for Service">Out for Service</option>
                                        <option value="Served">Served / Delivered</option>
                                        <option value="Attempted">Attempted</option>
                                        <option value="Non-Est">Non-Est / Return to Sender</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Date</label>
                                    <input 
                                        type="date" 
                                        title="Select delivery date"
                                        className="w-full p-2 text-sm border rounded bg-white"
                                        value={deliveryDate}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeliveryDate(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Signed By</label>
                                <div className="relative">
                                    <PenTool className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400"/>
                                    <input 
                                        className="w-full pl-7 p-2 text-sm border rounded bg-white" 
                                        placeholder="Name of signatory..."
                                        value={signerName}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSignerName(e.target.value)}
                                    />
                                </div>
                            </div>
                            <Button size="sm" className="w-full" onClick={handleUpdateServiceStatus}>Save Update</Button>
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
                                    <span className={cn("font-mono", theme.text.link)}>{item.trackingNumber}</span>
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
                                <Navigation className={cn("h-3 w-3", theme.text.link)}/>
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
            )}
        </div>

        <div className={cn("p-4 border-t flex flex-col gap-2", theme.border.default)}>
            {isComm(item) ? (
                <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" icon={Mail} onClick={() => onReply && onReply(item)}>Reply</Button>
                    <Button variant="secondary" size="sm" icon={CheckSquare} onClick={() => setIsTaskModalOpen(true)}>Create Task</Button>
                    <Button variant="secondary" size="sm" icon={Briefcase} onClick={handleSaveToCase}>Save to Case</Button>
                    <Button variant="ghost" size="sm" icon={Archive} className="text-slate-500" onClick={() => archiveItem(item.id)}>Archive</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-2">
                    <Button variant="secondary" size="sm" icon={BookOpen} onClick={handleLinkDocket} className="w-full">Link Proof to Docket</Button>
                </div>
            )}
        </div>
    </div>
  );
};