
import React, { useState, useEffect, useMemo } from 'react';
import { FileSignature, Search, Send, Plus, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { LegalDocument } from '../../../types';
import { DataService } from '../../../services/dataService';
import { DocumentService } from '../../../services/documentService';
import { PDFViewer } from '../../common/PDFViewer';
import { AcrobatToolbar, PDFTool } from '../../document/preview/AcrobatToolbar';
import { InteractiveOverlay, Field } from '../../document/preview/InteractiveOverlay';
import { Modal } from '../../common/Modal';
import { SignaturePad } from '../../common/SignaturePad';
import { Button } from '../../common/Button';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import { useNotify } from '../../../hooks/useNotify';

type FormStatus = 'Draft' | 'Sent' | 'Signed';
type FilterCategory = FormStatus | 'Templates' | 'Out for Signature' | 'Completed';

export const FormsSigningView: React.FC = () => {
    const { theme } = useTheme();
    const notify = useNotify();
    const [documents, setDocuments] = useState<LegalDocument[]>([]);
    const [selectedDoc, setSelectedDoc] = useState<LegalDocument | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeList, setActiveList] = useState<FilterCategory>('Templates');
    const [searchTerm, setSearchTerm] = useState('');

    // PDF viewer state
    const [activeTool, setActiveTool] = useState<PDFTool>('select');
    const [scale, setScale] = useState(1.0);
    const [rotation, setRotation] = useState(0);
    const [pageNum, setPageNum] = useState(1);
    const [pageDims, setPageDims] = useState({ width: 0, height: 0 });
    const [signModalOpen, setSignModalOpen] = useState(false);
    const [activeField, setActiveField] = useState<Field | null>(null);
    const [isSendModalOpen, setIsSendModalOpen] = useState(false);

    useEffect(() => {
        const loadDocs = async () => {
            setIsLoading(true);
            const allDocs = await DataService.documents.getAll();
            const formDocs = allDocs.filter(d => d.tags.includes('Form') || d.tags.includes('Template'));
            setDocuments(formDocs);
            if (formDocs.length > 0) {
                // Default to first template if available
                const firstTemplate = formDocs.find(d => d.tags.includes('Template'));
                setSelectedDoc(firstTemplate || formDocs[0]);
            }
            setIsLoading(false);
        };
        loadDocs();
    }, []);

    useEffect(() => {
        if (selectedDoc) {
            const loadUrl = async () => {
                if (selectedDoc.tags.includes('Local')) {
                    const url = await DocumentService.getDocumentUrl(selectedDoc.id);
                    setPreviewUrl(url);
                } else {
                    setPreviewUrl(null); 
                }
            };
            loadUrl();
        }
        return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
    }, [selectedDoc]);

    const filteredDocuments = useMemo(() => {
        return documents.filter(doc => {
            const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
            let matchesList = false;
            if (activeList === 'Templates') matchesList = doc.tags.includes('Template');
            else if (activeList === 'Draft') matchesList = doc.status === 'Draft' && doc.tags.includes('Form');
            else if (activeList === 'Out for Signature') matchesList = doc.status === 'Sent';
            else if (activeList === 'Completed') matchesList = doc.status === 'Signed';

            return matchesSearch && matchesList;
        });
    }, [documents, searchTerm, activeList]);

    const handleFieldClick = (field: Field) => {
        if (field.type === 'signature' || field.type === 'initials') {
            setActiveField(field);
            setSignModalOpen(true);
        }
    };

    const handleSignatureSave = (signed: boolean) => {
        if (signed && activeField && selectedDoc) {
            const updatedDoc = {
                ...selectedDoc,
                formFields: (selectedDoc.formFields || []).map((f: Field) => f.id === activeField.id ? {...f, value: "Signed by User"} : f)
            };
            setSelectedDoc(updatedDoc);
            setDocuments(docs => docs.map(d => d.id === selectedDoc.id ? updatedDoc : d));
            setSignModalOpen(false);
            setActiveField(null);
            notify.success("Document Signed");
        }
    };
    
    const handleFieldsUpdate = (updatedFields: Field[]) => {
        if (selectedDoc) {
            const updatedDoc = { ...selectedDoc, formFields: updatedFields };
            setSelectedDoc(updatedDoc);
            setDocuments(docs => docs.map(d => d.id === selectedDoc.id ? updatedDoc : d));
        }
    };

    const handleSend = () => {
        if (selectedDoc) {
            const updatedDoc = { ...selectedDoc, status: 'Sent' as any };
            setDocuments(docs => docs.map(d => d.id === selectedDoc.id ? updatedDoc : d));
            setSelectedDoc(updatedDoc);
            setIsSendModalOpen(false);
            notify.success(`'${selectedDoc.title}' sent for signature.`);
        }
    };

    const ListButton = ({ id, label, count }: { id: FilterCategory, label: string, count: number }) => (
        <button onClick={() => setActiveList(id)} className={cn(
            "w-full text-left p-3 rounded-md text-sm font-medium flex justify-between items-center transition-colors",
            activeList === id ? cn(theme.surface, theme.primary.text) : `hover:${theme.surface}`
        )}>
            <span>{label}</span>
            <span className={cn("px-2 py-0.5 rounded-full text-xs", activeList === id ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-600")}>{count}</span>
        </button>
    );

    return (
        <div className="flex h-full">
            {/* Sidebar */}
            <div className={cn("w-72 border-r flex flex-col shrink-0", theme.border.default, theme.surfaceHighlight)}>
                <div className={cn("p-4 border-b", theme.border.default)}>
                    <h3 className={cn("font-bold", theme.text.primary)}>Forms & Templates</h3>
                    <div className="relative mt-2">
                        <Search className={cn("absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4", theme.text.tertiary)}/>
                        <input 
                            className={cn("w-full pl-8 pr-2 py-1.5 text-xs border rounded-md outline-none", theme.surface, theme.border.default)}
                            placeholder="Search documents..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="p-2 space-y-1">
                    <ListButton id="Templates" label="Templates" count={documents.filter(d => d.tags.includes('Template')).length} />
                    <ListButton id="Draft" label="Drafts" count={documents.filter(d => d.status === 'Draft' && d.tags.includes('Form')).length} />
                    <ListButton id="Out for Signature" label="Out for Signature" count={documents.filter(d => d.status === 'Sent').length} />
                    <ListButton id="Completed" label="Completed" count={documents.filter(d => d.status === 'Signed').length} />
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                    {isLoading ? <Loader2 className="animate-spin m-4"/> : filteredDocuments.map(doc => (
                        <button key={doc.id} onClick={() => setSelectedDoc(doc)} className={cn(
                            "w-full text-left p-3 border-b text-sm transition-colors",
                            theme.border.light,
                            selectedDoc?.id === doc.id ? cn(theme.primary.light, theme.primary.text) : `hover:${theme.surface}`
                        )}>
                            <div className="font-medium truncate">{doc.title}</div>
                            <div className={cn("text-xs opacity-70 flex items-center mt-1", selectedDoc?.id === doc.id ? "" : theme.text.secondary)}>
                                {doc.status === 'Signed' ? <CheckCircle className="h-3 w-3 mr-1 text-green-500"/> : <Clock className="h-3 w-3 mr-1"/>}
                                {doc.status || 'Template'} • {doc.lastModified}
                            </div>
                        </button>
                    ))}
                </div>
                <div className={cn("p-4 border-t", theme.border.default)}>
                    <Button variant="outline" className="w-full" icon={Plus}>Upload Template</Button>
                </div>
            </div>
            {/* Editor */}
            <div className={cn("flex-1 flex flex-col", theme.surface)}>
                {selectedDoc ? (
                    <>
                        <AcrobatToolbar 
                            activeTool={activeTool} setActiveTool={setActiveTool}
                            scale={scale} setScale={setScale}
                            rotation={rotation} setRotation={setRotation}
                            pageNum={pageNum} setPageNum={setPageNum}
                            totalPages={1}
                        />
                        <div className={cn("flex-1 relative overflow-auto", theme.surfaceHighlight)}>
                            <PDFViewer url={previewUrl} scale={scale} rotation={rotation} onPageLoad={setPageDims}>
                                <InteractiveOverlay 
                                    activeTool={activeTool} 
                                    dimensions={pageDims} 
                                    onFieldClick={handleFieldClick} 
                                    existingFields={selectedDoc.formFields || []}
                                    onFieldsUpdate={handleFieldsUpdate}
                                />
                            </PDFViewer>
                        </div>
                         <div className={cn("p-4 border-t", theme.border.default)}>
                            <Button className="w-full" icon={Send} onClick={() => setIsSendModalOpen(true)}>Send for Signature</Button>
                        </div>
                    </>
                ) : (
                    <div className={cn("flex-1 flex flex-col items-center justify-center", theme.text.tertiary)}>
                        <FileSignature className="h-12 w-12 mb-4 opacity-50"/>
                        {isLoading ? "Loading documents..." : "Select a document to prepare for signing."}
                    </div>
                )}
            </div>

            {/* Modals */}
            <Modal isOpen={signModalOpen} onClose={() => setSignModalOpen(false)} title="Sign Document" size="sm">
                <div className="p-6">
                    <p className={cn("text-sm mb-4", theme.text.secondary)}>Draw your signature below to sign this field.</p>
                    <SignaturePad value={false} onChange={handleSignatureSave} label="Draw Signature" subtext="I certify this signature is valid."/>
                </div>
            </Modal>
            <Modal isOpen={isSendModalOpen} onClose={() => setIsSendModalOpen(false)} title="Send for Signature" size="md">
                <div className="p-6 space-y-4">
                    <input className={cn("w-full p-2 border rounded", theme.border.default)} placeholder="Recipient Email..."/>
                    <textarea className={cn("w-full p-2 border rounded h-24", theme.border.default)} placeholder="Optional message..."/>
                    <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => setIsSendModalOpen(false)}>Cancel</Button>
                        <Button variant="primary" icon={Send} onClick={handleSend}>Send</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
