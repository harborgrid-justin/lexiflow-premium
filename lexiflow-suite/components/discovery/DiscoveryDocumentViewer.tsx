
import React, { useState, useTransition } from 'react';
import { ArrowLeft, Printer, Download, FileText, ChevronRight, ChevronLeft, Search, ZoomIn, ZoomOut, CheckSquare, Flag, Tag } from 'lucide-react';
import { Button } from '../common/Button.tsx';
import { MOCK_DISCOVERY_DOCS } from '../../data/mockDiscovery.ts';
import { Badge } from '../common/Badge.tsx';

interface DiscoveryDocumentViewerProps {
  docId: string;
  onBack: () => void;
}

export const DiscoveryDocumentViewer: React.FC<DiscoveryDocumentViewerProps> = ({ docId, onBack }) => {
  // @ts-ignore
  const doc = MOCK_DISCOVERY_DOCS[docId] || { title: 'Unknown Document', content: 'Content not found.', type: 'Error', date: 'N/A' };
  const [scale, setScale] = useState(100);
  const [showCodingPanel, setShowCodingPanel] = useState(true);
  
  // Guideline 3: Transition for panel toggle (heavy UI update)
  const [isPending, startTransition] = useTransition();

  const handleTogglePanel = () => {
      startTransition(() => {
          setShowCodingPanel(prev => !prev);
      });
  };

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
                    onClick={handleTogglePanel}
                    className={`ml-2 p-2 rounded transition-colors ${showCodingPanel ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                >
                    <Tag className="h-5 w-5"/>
                </button>
            </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
            
            {/* Document Canvas */}
            <div className={`flex-1 overflow-auto bg-slate-800 relative flex justify-center p-8 transition-all duration-300 ${isPending ? 'opacity-90' : 'opacity-100'}`}>
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
            {showCodingPanel && (
                <div className="w-80 bg-white border-l border-slate-200 flex flex-col shrink-0 shadow-xl animate-in slide-in-from-right duration-200 z-10">
                    <div className="p-4 border-b border-slate-200 bg-slate-50">
                        <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Coding & Metadata</h3>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Review Status</label>
                            <div className="space-y-2">
                                <label className="flex items-center p-2 border rounded hover:bg-slate-50 cursor-pointer">
                                    <input type="radio" name="status" className="mr-2"/> Responsive
                                </label>
                                <label className="flex items-center p-2 border rounded hover:bg-slate-50 cursor-pointer">
                                    <input type="radio" name="status" className="mr-2"/> Non-Responsive
                                </label>
                                <label className="flex items-center p-2 border rounded hover:bg-slate-50 cursor-pointer bg-amber-50 border-amber-200">
                                    <input type="radio" name="status" className="mr-2"/> Needs Further Review
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Privilege</label>
                            <div className="flex items-center gap-2 mb-2">
                                <input type="checkbox" id="priv" className="rounded text-blue-600"/>
                                <label htmlFor="priv" className="text-sm font-medium">Mark as Privileged</label>
                            </div>
                            <select className="w-full text-sm border-slate-300 rounded-md p-2 bg-slate-50" disabled>
                                <option>Attorney-Client</option>
                                <option>Work Product</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Issue Tags</label>
                            <div className="flex flex-wrap gap-2">
                                {['Damages', 'Liability', 'Key Witness', 'Timeline'].map(tag => (
                                    <span key={tag} className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-xs text-slate-600 hover:bg-blue-50 hover:text-blue-600 cursor-pointer transition-colors">
                                        {tag}
                                    </span>
                                ))}
                                <button className="px-2 py-1 border border-dashed border-slate-300 rounded text-xs text-slate-400 hover:text-blue-500">+ Add</button>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Notes</label>
                            <textarea className="w-full border border-slate-300 rounded-md p-2 text-sm h-24 resize-none focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Reviewer comments..."></textarea>
                        </div>
                    </div>

                    <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between">
                        <Button variant="ghost" size="sm" icon={ChevronLeft}>Prev Doc</Button>
                        <Button variant="primary" size="sm">Save & Next <ChevronRight className="h-4 w-4 ml-1"/></Button>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};
