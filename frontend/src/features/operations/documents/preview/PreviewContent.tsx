import { PDFViewer } from '@/features/discovery/ui/components/PDFViewer/PDFViewer';
import { SignaturePad } from '@/features/discovery/ui/components/SignaturePad/SignaturePad';
import { Button } from '@/shared/ui/atoms/Button/Button';
import { FileIcon } from '@/shared/ui/atoms/FileIcon/FileIcon';
import { Modal } from '@/shared/ui/molecules/Modal/Modal';
import { useTheme } from '@/features/theme';
import { LegalDocument } from '@/types';
import { cn } from '@/shared/lib/cn';
import { useState } from 'react';
import { AcrobatToolbar, PDFTool } from './AcrobatToolbar';
import { Field, InteractiveOverlay } from './InteractiveOverlay';

interface PreviewContentProps {
    document: LegalDocument;
    previewUrl: string | null;
    isRedactionMode: boolean;
}

export function PreviewContent({ document, previewUrl, isRedactionMode }: PreviewContentProps) {
    const { theme } = useTheme();
    const isImage = document.type.includes('IMAGE') || document.type.includes('PNG') || document.type.includes('JPG');
    const isPDF = document.type.toUpperCase().includes('PDF') || document.title.toLowerCase().endsWith('.pdf');

    // State for Acrobat Features
    const [activeTool, setActiveTool] = useState<PDFTool>('select');
    const [scale, setScale] = useState(1.0);
    const [rotation, setRotation] = useState(0);
    const [pageNum, setPageNum] = useState(1);
    const [pageDims, setPageDims] = useState({ width: 0, height: 0 });
    const [signModalOpen, setSignModalOpen] = useState(false);
    const [activeField, setActiveField] = useState<Field | null>(null);

    const handleFieldClick = (field: Field) => {
        if (field.type === 'signature' || field.type === 'initials') {
            setActiveField(field);
            setSignModalOpen(true);
        }
    };

    const handleSignatureSave = (signed: boolean) => {
        if (signed && activeField) {
            activeField.value = "Signed by User"; // In real app, save image data URL
            setSignModalOpen(false);
            setActiveField(null);
        }
    };

    if (!isPDF) {
        // Fallback for non-PDFs
        return (
            <div className={cn("border rounded-lg overflow-hidden flex items-center justify-center min-h-[400px] relative group", theme.surface.highlight, theme.border.default)}>
                {isImage && previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="max-w-full max-h-[600px] object-contain" style={isRedactionMode ? { filter: 'blur(8px)' } : {}} />
                ) : (
                    <div className="text-center p-4">
                        <FileIcon type={document.type} className={cn("h-16 w-16 mx-auto mb-4 opacity-50", theme.text.tertiary)} />
                        <p className={cn("text-sm font-medium mb-2", theme.text.secondary)}>Preview not available for this file type.</p>
                        {previewUrl && <a href={previewUrl} download={document.title} className={cn("hover:underline text-xs", theme.primary.text)}>Download File</a>}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className={cn("flex flex-col h-full border rounded-lg overflow-hidden shadow-sm", theme.border.default, theme.surface.default)}>
            {/* Acrobat Toolbar */}
            <AcrobatToolbar
                activeTool={activeTool}
                setActiveTool={setActiveTool}
                scale={scale}
                setScale={setScale}
                rotation={rotation}
                setRotation={setRotation}
                pageNum={pageNum}
                setPageNum={setPageNum}
                totalPages={document.pageCount || 1}
            />

            {/* PDF Canvas Container */}
            <div className={cn("flex-1 relative overflow-auto", theme.surface.highlight)}>
                {previewUrl ? (
                    <PDFViewer
                        url={previewUrl}
                        scale={scale}
                        rotation={rotation}
                        onPageLoad={setPageDims}
                    >
                        <InteractiveOverlay
                            activeTool={activeTool}
                            dimensions={pageDims}
                            onFieldClick={handleFieldClick}
                        />
                    </PDFViewer>
                ) : (
                    <div className={cn("flex items-center justify-center h-full", theme.text.tertiary)}>
                        <p className="text-sm">No PDF source available.</p>
                    </div>
                )}
            </div>

            {/* Signature Modal */}
            <Modal isOpen={signModalOpen} onClose={() => setSignModalOpen(false)} title="Sign Document" size="sm">
                <div className="p-6">
                    <p className={cn("text-sm mb-4", theme.text.secondary)}>Draw your signature below to sign this field.</p>
                    <SignaturePad
                        value={false}
                        onChange={handleSignatureSave}
                        label="Draw Signature"
                        subtext="I certify this signature is valid."
                    />
                    <div className="mt-4 flex justify-end">
                        <Button variant="secondary" onClick={() => setSignModalOpen(false)}>Cancel</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
