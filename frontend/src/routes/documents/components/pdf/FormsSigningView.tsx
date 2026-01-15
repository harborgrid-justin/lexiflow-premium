import { useModalState } from '@/hooks/core';
import { useNotify } from '@/hooks/useNotify';
import { queryClient, useQuery } from '@/hooks/useQueryHooks';
import { PDFViewer } from '@/routes/discovery/components/PDFViewer/PDFViewer';
import { SignaturePad } from '@/routes/discovery/components/SignaturePad/SignaturePad';
import { DataService } from '@/services/data/data-service.service';
import { DocumentService } from '@/services/features/documents/documents';
import { cn } from '@/lib/cn';
import { Button } from '@/components/atoms/Button/Button';
import { ErrorState } from '@/components/molecules/ErrorState/ErrorState';
import { Modal } from '@/components/molecules/Modal/Modal';
import { useTheme } from '@/theme';
import { LegalDocument } from '@/types';
import { queryKeys } from '@/utils/queryKeys';
import { CheckCircle, Clock, FileSignature, Loader2, Plus, Search, Send } from 'lucide-react';
import { useDeferredValue, useEffect, useMemo, useState, useTransition } from 'react';
import { AcrobatToolbar, PDFTool } from "../preview/AcrobatToolbar";
import { Field, InteractiveOverlay } from "../preview/InteractiveOverlay";

type FormStatus = 'Draft' | 'Sent' | 'Signed';
type FilterCategory = FormStatus | 'Templates' | 'Out for Signature' | 'Completed';

export const FormsSigningView = () => {
    const { theme } = useTheme();
    const notify = useNotify();
    const [selectedDocument, setSelectedDocument] = useState<LegalDocument | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [activeList, setActiveList] = useState<FilterCategory>('Templates');
    const [searchTerm, setSearchTerm] = useState('');
    const [_isPending, _startTransition] = useTransition();

    // Defer search for better input responsiveness
    const deferredSearchTerm = useDeferredValue(searchTerm);

    // Load documents from IndexedDB via useQuery for accurate, cached data
    const { data: allDocs = [], isLoading, error, refetch } = useQuery(
        queryKeys.documents.all(),
        () => DataService.documents.getAll()
    );

    // Filter for form/PDF documents
    const documents = useMemo(() =>
        Array.isArray(allDocs) ? allDocs.filter(d => d.type.toUpperCase().includes('PDF') || d.type === 'Form' || d.title.toLowerCase().endsWith('.pdf')) : [],
        [allDocs]
    );

    // PDF viewer state
    const [activeTool, setActiveTool] = useState<PDFTool>('select');
    const [scale, setScale] = useState(1.0);
    const [rotation, setRotation] = useState(0);
    const [pageNum, setPageNum] = useState(1);
    const [pageDims, setPageDims] = useState({ width: 0, height: 0 });
    const signModal = useModalState();
    const [activeField, setActiveField] = useState<Field | null>(null);
    const sendModal = useModalState();

    // Select first template when documents load
    useEffect(() => {
        if (documents.length > 0 && !selectedDocument) {
            const firstTemplate = documents.find(d => d.tags.includes('Template'));
            setSelectedDocument(firstTemplate || documents[0]);
        }
    }, [documents, selectedDocument]);

    useEffect(() => {
        if (selectedDocument) {
            const loadUrl = async () => {
                if (selectedDocument.tags.includes('Local')) {
                    const url = await DocumentService.getDocumentUrl(selectedDocument.id);
                    setPreviewUrl(url);
                } else {
                    setPreviewUrl(null);
                }
            };
            loadUrl();
        }
        return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
    }, [selectedDocument, previewUrl]);

    const filteredDocuments = useMemo(() => {
        return documents.filter(doc => {
            const matchesSearch = doc.title.toLowerCase().includes(deferredSearchTerm.toLowerCase());
            let matchesList = false;
            if (activeList === 'Templates') matchesList = doc.tags.includes('Template');
            else if (activeList === 'Draft') matchesList = doc.status === 'Draft' && doc.tags.includes('Form');
            else if (activeList === 'Out for Signature') matchesList = doc.status === 'Sent';
            else if (activeList === 'Completed') matchesList = doc.status === 'Signed';

            return matchesSearch && matchesList;
        });
    }, [documents, deferredSearchTerm, activeList]);

    const handleFieldClick = (field: Field) => {
        if (field.type === 'signature' || field.type === 'initials') {
            setActiveField(field);
            signModal.open();
        }
    };

    const handleSignatureSave = async (signed: boolean) => {
        if (signed && activeField && selectedDocument) {
            const updatedDoc: LegalDocument = {
                ...selectedDocument,
                formFields: (selectedDocument.formFields || []).map((f) =>
                    (f as { name: string; type: string; value: unknown }).name === activeField.id
                        ? { ...f, value: "Signed by User" }
                        : f
                )
            };
            await DataService.documents.update(selectedDocument.id, updatedDoc);
            queryClient.invalidate(queryKeys.documents.all());
            setSelectedDocument(updatedDoc);
            signModal.close();
            setActiveField(null);
            notify.success("Document Signed");
        }
    };

    const handleFieldsUpdate = async (updatedFields: Field[]) => {
        if (selectedDocument) {
            const updatedDoc: LegalDocument = {
                ...selectedDocument,
                formFields: updatedFields.map(f => ({ name: f.id, type: f.type, value: f.value || '' }))
            };
            await DataService.documents.update(selectedDocument.id, updatedDoc);
            queryClient.invalidate(queryKeys.documents.all());
            setSelectedDocument(updatedDoc);
        }
    };

    const handleSend = async () => {
        if (selectedDocument) {
            const updatedDoc = { ...selectedDocument, status: 'Sent' };
            await DataService.documents.update(selectedDocument.id, updatedDoc);
            queryClient.invalidate(queryKeys.documents.all());
            setSelectedDocument(updatedDoc);
            sendModal.close();
            notify.success(`'${selectedDocument.title}' sent for signature.`);
        }
    };

    const ListButton = ({ id, label, count }: { id: FilterCategory, label: string, count: number }) => (
        <button onClick={() => setActiveList(id)} className={cn(
            "w-full text-left p-3 rounded-md text-sm font-medium flex justify-between items-center transition-colors",
            activeList === id ? cn(theme.surface.default, theme.primary.text) : `hover:${theme.surface.default}`
        )}>
            <span>{label}</span>
            <span className={cn("px-2 py-0.5 rounded-full text-xs", activeList === id ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-600")}>{count}</span>
        </button>
    );

    if (error) {
        return <ErrorState message="Failed to load documents" onRetry={refetch} />;
    }

    return (
        <div className="flex h-full">
            {/* Sidebar */}
            <div className={cn("w-72 border-r flex flex-col shrink-0", theme.border.default, theme.surface.highlight)}>
                <div className={cn("p-4 border-b", theme.border.default)}>
                    <h3 className={cn("font-bold", theme.text.primary)}>Forms & Templates</h3>
                    <div className="relative mt-2">
                        <Search className={cn("absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4", theme.text.tertiary)} />
                        <input
                            className={cn("w-full pl-8 pr-2 py-1.5 text-xs border rounded-md outline-none", theme.surface.default, theme.border.default)}
                            placeholder="Search documents..."
                            value={searchTerm}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
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
                    {isLoading ? <Loader2 className="animate-spin m-4" /> : filteredDocuments.map(doc => (
                        <button key={doc.id} onClick={() => setSelectedDocument(doc)} className={cn(
                            "w-full text-left p-3 border-b text-sm transition-colors",
                            theme.border.default,
                            selectedDocument?.id === doc.id ? cn(theme.primary.light, theme.primary.text) : `hover:${theme.surface.default}`
                        )}>
                            <div className="font-medium truncate">{doc.title}</div>
                            <div className={cn("text-xs opacity-70 flex items-center mt-1", selectedDocument?.id === doc.id ? "" : theme.text.secondary)}>
                                {doc.status === 'Signed' ? <CheckCircle className="h-3 w-3 mr-1 text-green-500" /> : <Clock className="h-3 w-3 mr-1" />}
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
            <div className={cn("flex-1 flex flex-col", theme.surface.default)}>
                {selectedDocument ? (
                    <>
                        <AcrobatToolbar
                            activeTool={activeTool} setActiveTool={setActiveTool}
                            scale={scale} setScale={setScale}
                            rotation={rotation} setRotation={setRotation}
                            pageNum={pageNum} setPageNum={setPageNum}
                            totalPages={1}
                        />
                        <div className={cn("flex-1 relative overflow-auto", theme.surface.highlight)}>
                            <PDFViewer url={previewUrl} scale={scale} rotation={rotation} onPageLoad={setPageDims}>
                                <InteractiveOverlay
                                    activeTool={activeTool}
                                    dimensions={pageDims}
                                    onFieldClick={handleFieldClick}
                                    existingFields={(selectedDocument.formFields || []).map((f, idx) => ({
                                        id: (f as { name: string }).name || `field-${idx}`,
                                        type: ((f as { type: string }).type as Field['type']) || 'text',
                                        x: 0,
                                        y: 0,
                                        value: (f as { value: unknown }).value as string
                                    }))}
                                    onFieldsUpdate={handleFieldsUpdate}
                                />
                            </PDFViewer>
                        </div>
                        <div className={cn("p-4 border-t", theme.border.default)}>
                            <Button className="w-full" icon={Send} onClick={sendModal.open}>Send for Signature</Button>
                        </div>
                    </>
                ) : (
                    <div className={cn("flex-1 flex flex-col items-center justify-center", theme.text.tertiary)}>
                        <FileSignature className="h-12 w-12 mb-4 opacity-50" />
                        {isLoading ? "Loading documents..." : "Select a document to prepare for signing."}
                    </div>
                )}
            </div>

            {/* Modals */}
            <Modal isOpen={signModal.isOpen} onClose={signModal.close} title="Sign Document" size="sm">
                <div className="p-6">
                    <p className={cn("text-sm mb-4", theme.text.secondary)}>Draw your signature below to sign this field.</p>
                    <SignaturePad value={false} onChange={handleSignatureSave} label="Draw Signature" subtext="I certify this signature is valid." />
                </div>
            </Modal>
            <Modal isOpen={sendModal.isOpen} onClose={sendModal.close} title="Send for Signature" size="md">
                <div className="p-6 space-y-4">
                    <input className={cn("w-full p-2 border rounded", theme.border.default)} placeholder="Recipient Email..." />
                    <textarea className={cn("w-full p-2 border rounded h-24", theme.border.default)} placeholder="Optional message..." />
                    <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={sendModal.close}>Cancel</Button>
                        <Button variant="primary" icon={Send} onClick={handleSend}>Send</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
