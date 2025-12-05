
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Printer, Download, FileText, ZoomIn, ZoomOut, Tag } from 'lucide-react';
import { Button } from '../common/Button';
import { DataService } from '../../services/dataService';
import { CodingPanel } from './viewer/CodingPanel';
import { useTheme } from '../../context/ThemeContext';

interface DiscoveryDocumentViewerProps {
  docId: string;
  onBack: () => void;
}

export const DiscoveryDocumentViewer: React.FC<DiscoveryDocumentViewerProps> = ({ docId, onBack }) => {
  const [doc, setDoc] = useState<any>({ title: 'Loading...', content: '', type: '', date: '' });
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
    <div className="flex flex-col h-full bg-slate-100 animate-fade-in absolute inset-0 z-10">
        {/* Review Toolbar */}
        <div className="h-14 bg-slate-900 border-b border-slate-700 flex justify-between items-center px-4 shrink-0 shadow-md z-20 text-white">
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-white">
                    <ArrowLeft className="h-5 w-5"/>
                </button>
                <div className="h-6 w-px bg-slate-700"></div>
                <div>
                    <h2 className="text-sm font-bold text-slate-100 flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-blue-400"/>
                        {doc.title}
                    </h2>
                    <p className="text-[10px] text-slate-400 font-mono">ID: {docId} • {doc.date}</p>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center bg-slate-800 rounded px-2 py-1 mr-2 border border-slate-700">
                    <button onClick={() => setScale(s => Math.max(50, s - 10))} className="p-1 hover:text-blue-400"><ZoomOut className="h-4 w-4"/></button>
                    <span className="text-xs font-mono w-12 text-center select-none">{scale}%</span>
                    <button onClick={() => setScale(s => Math.min(200, s + 10))} className="p-1 hover:text-blue-400"><ZoomIn className="h-4 w-4"/></button>
                </div>
                <Button size="sm" variant="secondary" className="bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700" icon={Printer}>Print</Button>
                <Button size="sm" variant="primary" icon={Download}>Download</Button>
                <button 
                    onClick={() => setShowCodingPanel(!showCodingPanel)}
                    className={`ml-2 p-2 rounded transition-colors ${showCodingPanel ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                >
                    <Tag className="h-5 w-5"/>
                </button>
            </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
            
            {/* Document Canvas */}
            <div className="flex-1 overflow-auto bg-slate-800 relative flex justify-center p-8">
                <div 
                    className="bg-white shadow-2xl min-h-[1100px] w-full max-w-4xl transition-transform origin-top duration-200 ease-out"
                    style={{ transform: `scale(${scale / 100})` }}
                >
                    {/* Simulated Document Header */}
                    <div className="h-16 border-b-2 border-slate-900 mb-8 mx-12 mt-12 flex justify-between items-end pb-2 opacity-80">
                        <span className="font-serif font-bold text-2xl uppercase">Legal Document</span>
                        <span className="font-mono text-sm">{docId}</span>
                    </div>
                    
                    <div className="px-16 py-4 font-serif text-slate-900 text-sm leading-loose whitespace-pre-wrap select-text">
                        {doc.content}
                    </div>

                    {/* Simulated Page Footer */}
                    <div className="mt-20 mx-12 border-t border-slate-300 pt-4 flex justify-between text-xs text-slate-400 font-mono">
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