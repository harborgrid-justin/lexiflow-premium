import React, { useState, useEffect } from 'react';
import { ArrowLeft, Printer, Download, FileText, ZoomIn, ZoomOut, Tag } from 'lucide-react';
import { Button } from '@/components/ui/atoms/Button';
import { DataService } from '@/services/data/dataService';
import { CodingPanel } from './viewer/CodingPanel';
import { useTheme } from '@/providers';
import { cn } from '@/utils/cn';
import { DiscoveryDocumentViewerProps, ViewerDocumentState } from './types';

export const DiscoveryDocumentViewer: React.FC<DiscoveryDocumentViewerProps> = ({ docId, onBack }) => {
  const { theme } = useTheme();
  const [doc, setDoc] = useState<ViewerDocumentState>({ title: 'Loading...', content: '', type: '', date: '' });
  const [scale, setScale] = useState(100);
  const [showCodingPanel, setShowCodingPanel] = useState(true);

  useEffect(() => {
      const loadDoc = async () => {
          // Fetch metadata and content
          const metadata = await DataService.documents.getById(docId);
          const content = await DataService.documents.getContent(docId);

          if (metadata) {
              setDoc({
                  title: metadata.title,
                  content: content,
                  type: metadata.type,
                  date: metadata.uploadDate
              });
          } else {
               // Fallback for pure discovery docs that might not be in main documents store in this mock setup
               // In a real app, all docs would be unified.
               setDoc({ title: 'Document Preview', content: content, type: 'Discovery', date: new Date().toLocaleDateString() });
          }
      };
      loadDoc();
  }, [docId]);

  return (
    <div className={cn("flex flex-col h-full animate-fade-in absolute inset-0 z-10", theme.background)}>
        {/* Review Toolbar */}
        <div className={cn("h-14 border-b flex justify-between items-center px-4 shrink-0 shadow-md z-20", theme.surface.default, theme.border.default)}>
            <div className="flex items-center gap-4">
                <button onClick={onBack} className={cn("p-2 rounded-full transition-colors", theme.text.secondary, `hover:${theme.surface.highlight}`)} aria-label="Go back">
                    <ArrowLeft className="h-5 w-5"/>
                </button>
                <div className={cn("h-6 w-px", theme.border.default)}></div>
                <div>
                    <h2 className={cn("text-sm font-bold flex items-center", theme.text.primary)}>
                        <FileText className="h-4 w-4 mr-2 text-blue-400"/>
                        {doc.title}
                    </h2>
                    <p className={cn("text-[10px] font-mono", theme.text.secondary)}>ID: {docId} • {doc.date}</p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <div className={cn("hidden md:flex items-center rounded px-2 py-1 mr-2 border", theme.surface.highlight, theme.border.default)}>
                    <button onClick={() => setScale(s => Math.max(50, s - 10))} className={cn("p-1 hover:text-blue-400", theme.text.secondary)} aria-label="Zoom out"><ZoomOut className="h-4 w-4"/></button>
                    <span className={cn("text-xs font-mono w-12 text-center select-none", theme.text.primary)}>{scale}%</span>
                    <button onClick={() => setScale(s => Math.min(200, s + 10))} className={cn("p-1 hover:text-blue-400", theme.text.secondary)} aria-label="Zoom in"><ZoomIn className="h-4 w-4"/></button>
                </div>
                <Button size="sm" variant="secondary" icon={Printer}>Print</Button>
                <Button size="sm" variant="primary" icon={Download}>Download</Button>
                <button
                    onClick={() => setShowCodingPanel(!showCodingPanel)}
                    className={cn("ml-2 p-2 rounded transition-colors", showCodingPanel ? "bg-blue-600 text-white" : cn(theme.surface.highlight, theme.text.secondary, `hover:${theme.text.primary}`))}
                    aria-label={showCodingPanel ? "Hide coding panel" : "Show coding panel"}
                >
                    <Tag className="h-5 w-5"/>
                </button>
            </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">

            {/* Document Canvas */}
            <div className={cn("flex-1 overflow-auto relative flex justify-center p-8", theme.surface.highlight)}>
                { }
                <div
                    className={cn("shadow-2xl min-h-[1100px] w-full max-w-4xl transition-transform origin-top duration-200 ease-out", theme.surface.default)}
                    style={{ transform: `scale(${scale / 100})` }}
                >
                    {/* Simulated Document Header */}
                    <div className={cn("h-16 border-b-2 mb-8 mx-12 mt-12 flex justify-between items-end pb-2 opacity-80", theme.border.default)}>
                        <span className={cn("font-serif font-bold text-2xl uppercase", theme.text.primary)}>Legal Document</span>
                        <span className={cn("font-mono text-sm", theme.text.secondary)}>{docId}</span>
                    </div>

                    <div className={cn("px-16 py-4 font-serif text-sm leading-loose whitespace-pre-wrap select-text", theme.text.primary)}>
                        {doc.content}
                    </div>

                    {/* Simulated Page Footer */}
                    <div className={cn("mt-20 mx-12 border-t pt-4 flex justify-between text-xs font-mono", theme.border.default, theme.text.tertiary)}>
                        <span>CONFIDENTIAL - ATTORNEY EYES ONLY</span>
                        <span>Page 1 of 1</span>
                    </div>
                </div>
            </div>

            {/* Coding Sidebar */}
            {showCodingPanel && <CodingPanel />}
        </div>
    </div>
  );
};

export default DiscoveryDocumentViewer;
