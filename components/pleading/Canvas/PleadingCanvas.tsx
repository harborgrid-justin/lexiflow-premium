
import React from 'react';
import { PleadingDocument, FormattingRule, PleadingSection } from '../../../types/pleadingTypes';
import { PleadingPaper } from './PleadingPaper';
import { GripVertical, Link } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import { Case } from '../../../types';

interface PleadingCanvasProps {
    document: PleadingDocument;
    rules: FormattingRule;
    readOnly: boolean;
    viewMode: 'write' | 'logic' | 'preview';
    onUpdateSection: (id: string, updates: Partial<PleadingSection>) => void;
    relatedCase: Case | null;
}

export const PleadingCanvas: React.FC<PleadingCanvasProps> = ({ 
    document, rules, readOnly, viewMode, onUpdateSection, relatedCase 
}) => {
    const { theme } = useTheme();

    const renderBlock = (section: PleadingSection) => {
        const isLogicMode = viewMode === 'logic';
        const hasLinks = (section.linkedEvidenceIds?.length || 0) > 0 || !!section.linkedArgumentId;
        
        return (
            <div 
                key={section.id} 
                id={`block-${section.id}`}
                className={cn(
                    "group relative mb-4 transition-all duration-300",
                    isLogicMode && "hover:ring-2 hover:ring-purple-400 rounded-lg p-2 -mx-2 bg-slate-50/50 cursor-pointer",
                    isLogicMode && hasLinks && "ring-1 ring-purple-200 bg-purple-50/30"
                )}
            >
                {!readOnly && !isLogicMode && (
                    <div className="absolute -left-10 top-0 opacity-0 group-hover:opacity-100 flex flex-col gap-1 transition-opacity">
                        <button className="p-1.5 text-slate-400 hover:text-blue-600 bg-white shadow rounded-md cursor-grab active:cursor-grabbing">
                            <GripVertical className="h-4 w-4"/>
                        </button>
                    </div>
                )}
                
                {/* Visual Logic Nodes for SVG overlay to hook onto */}
                {isLogicMode && (
                    <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-purple-400 rounded-full" id={`node-${section.id}`} />
                )}

                {section.type === 'Caption' ? (
                    <div className="border-2 border-black p-4 grid grid-cols-2 mb-8 font-serif">
                         <div className="border-r-2 border-black pr-4">
                             {relatedCase?.parties?.filter(p => p.role.includes('Plaintiff')).map(p => p.name).join(', ') || 'PLAINTIFF NAME'}<br/>
                             Plaintiff,<br/><br/>
                             v.<br/><br/>
                             {relatedCase?.parties?.filter(p => p.role.includes('Defendant')).map(p => p.name).join(', ') || 'DEFENDANT NAME'}<br/>
                             Defendant.
                         </div>
                         <div className="pl-4 flex flex-col justify-center">
                             Case No. {document.filingStatus === 'Pre-Filing' ? '____________________' : document.caseId}<br/>
                             <span className="font-bold uppercase mt-2">{document.title}</span><br/>
                             {document.filingStatus === 'Pre-Filing' ? 'JURY TRIAL DEMANDED' : `Judge: ${relatedCase?.judge || 'Unassigned'}`}
                         </div>
                    </div>
                ) : section.type === 'Heading' ? (
                    <div 
                        className="text-center font-bold uppercase underline mb-4 mt-6 outline-none"
                        contentEditable={!readOnly}
                        suppressContentEditableWarning
                        onBlur={(e) => onUpdateSection(section.id, { content: e.currentTarget.innerText })}
                    >
                        {section.content}
                    </div>
                ) : (
                    <div 
                        className="text-justify outline-none min-h-[1em] empty:before:content-['Type...'] empty:before:text-slate-300 font-serif"
                        contentEditable={!readOnly}
                        suppressContentEditableWarning
                        onBlur={(e) => onUpdateSection(section.id, { content: e.currentTarget.innerText })}
                    >
                        {section.content}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="pb-20">
            <PleadingPaper rules={rules}>
                {document.sections.map(renderBlock)}
            </PleadingPaper>
        </div>
    );
};
