
import React from 'react';
import { PleadingDocument, FormattingRule, PleadingSection } from '../../../types/pleadingTypes';
import { PleadingPaper } from './PleadingPaper';
import { GripVertical, AlertCircle, Link } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';

interface PleadingCanvasProps {
    document: PleadingDocument;
    rules: FormattingRule;
    readOnly: boolean;
    viewMode: 'write' | 'logic' | 'preview';
}

export const PleadingCanvas: React.FC<PleadingCanvasProps> = ({ document, rules, readOnly, viewMode }) => {
    const { theme } = useTheme();

    const renderBlock = (section: PleadingSection) => {
        // Logic Mode Styling
        const isLogicMode = viewMode === 'logic';
        const hasLinks = (section.linkedEvidenceIds?.length || 0) > 0;
        
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
                {/* Block Controls (Hover) */}
                {!readOnly && !isLogicMode && (
                    <div className="absolute -left-10 top-0 opacity-0 group-hover:opacity-100 flex flex-col gap-1 transition-opacity">
                        <button className="p-1.5 text-slate-400 hover:text-blue-600 bg-white shadow rounded-md cursor-grab active:cursor-grabbing">
                            <GripVertical className="h-4 w-4"/>
                        </button>
                    </div>
                )}
                
                {/* Logic Indicators */}
                {isLogicMode && hasLinks && (
                    <div className="absolute -right-24 top-0 flex items-center gap-2">
                        <div className="h-px w-8 bg-purple-300"></div>
                        <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-bold border border-purple-200">
                            {section.linkedEvidenceIds?.length} Links
                        </span>
                    </div>
                )}

                {/* Content Rendering */}
                {section.type === 'Caption' ? (
                    <div className="border-2 border-black p-4 grid grid-cols-2 mb-8">
                         <div className="border-r-2 border-black pr-4">
                             JUSTIN SAADEIN-MORALES,<br/>
                             Plaintiff,<br/><br/>
                             v.<br/><br/>
                             WESTRIDGE SWIM & RACQUET CLUB,<br/>
                             Defendant.
                         </div>
                         <div className="pl-4 flex flex-col justify-center">
                             Case No. {document.caseId}<br/>
                             <span className="font-bold">COMPLAINT FOR DAMAGES</span><br/>
                             JURY TRIAL DEMANDED
                         </div>
                    </div>
                ) : section.type === 'Heading' ? (
                    <div 
                        className="text-center font-bold uppercase underline mb-4 mt-6 outline-none"
                        contentEditable={!readOnly}
                        suppressContentEditableWarning
                    >
                        {section.content}
                    </div>
                ) : (
                    <div 
                        className="text-justify outline-none min-h-[1em] empty:before:content-['Type...'] empty:before:text-slate-300"
                        contentEditable={!readOnly}
                        suppressContentEditableWarning
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
