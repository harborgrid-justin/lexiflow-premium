import { useMemo, useCallback } from 'react';
import { PleadingDocument, FormattingRule, PleadingSection, Case, Party } from '@/types';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/cn';
import { sanitizeHtml } from '@/lib/sanitize';
import { ViewMode } from '../types';

interface PleadingCanvasProps {
    document: PleadingDocument;
    rules: FormattingRule;
    readOnly?: boolean;
    viewMode?: ViewMode;
    onUpdateSection: (sectionId: string, updates: Partial<PleadingSection>) => void;
    relatedCase?: Case;
}

const PleadingCanvas: React.FC<PleadingCanvasProps> = ({ 
    document, rules, readOnly, viewMode, onUpdateSection, relatedCase 
}) => {
    // Memoize sorted sections to avoid re-sorting on every render
    const sortedSections = useMemo(() => {
        return [...document.sections].sort((a: PleadingSection, b: PleadingSection) => a.order - b.order);
    }, [document.sections]);

    // Memoize plaintiff and defendant names
    const plaintiffName = useMemo(() =>
        relatedCase?.parties?.filter((p: Party) => p.role.includes('Plaintiff') || p.role.includes('Appellant')).map((p: Party) => p.name).join(', ') || 'PLAINTIFF NAME',
        [relatedCase?.parties]
    );

    const defendantName = useMemo(() =>
        relatedCase?.parties?.filter((p: Party) => p.role.includes('Defendant') || p.role.includes('Appellee')).map((p: Party) => p.name).join(', ') || 'DEFENDANT NAME',
        [relatedCase?.parties]
    );

    // Memoize update handler to prevent creating new functions on each render
    const handleContentUpdate = useCallback((sectionId: string) => {
        return (e: React.FocusEvent<HTMLDivElement>) => {
            const newContent = e.currentTarget.innerHTML;
            onUpdateSection(sectionId, { content: newContent });
        };
    }, [onUpdateSection]);

    const renderBlock = useCallback((section: PleadingSection) => {
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
                role="article"
                aria-label={`Section: ${section.type}`}
            >
                {!readOnly && !isLogicMode && (
                    <div className="absolute -left-10 top-0 opacity-0 group-hover:opacity-100 flex flex-col gap-1 transition-opacity">
                        <button 
                            className="p-1.5 text-slate-400 hover:text-blue-600 bg-white shadow rounded-md cursor-grab active:cursor-grabbing"
                            aria-label="Drag to reorder section"
                            title="Drag to reorder"
                        >
                            <GripVertical className="h-4 w-4"/>
                        </button>
                    </div>
                )}
                
                {isLogicMode && (
                    <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-purple-400 rounded-full" id={`node-${section.id}`} aria-hidden="true" />
                )}

                {section.type === 'Caption' ? (
                    <div className="border-2 border-black p-4 grid grid-cols-2 mb-8" style={{ fontFamily: rules.fontFamily }} role="region" aria-label="Case caption">
                         <div className="border-r-2 border-black pr-4">
                             {plaintiffName}<br/>
                             Plaintiff,<br/><br/>
                             v.<br/><br/>
                             {defendantName}<br/>
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
                        style={{textAlign: section.meta?.alignment}}
                        contentEditable={!readOnly}
                        suppressContentEditableWarning
                        dangerouslySetInnerHTML={{__html: sanitizeHtml(section.content)}}
                        onBlur={handleContentUpdate(section.id)}
                        role="textbox"
                        aria-label="Heading"
                        aria-readonly={readOnly}
                        tabIndex={readOnly ? -1 : 0}
                    />
                ) : (
                    <div
                        className="text-justify outline-none min-h-[1em] empty:before:content-['Type...'] empty:before:text-slate-300"
                        style={{
                            textAlign: section.meta?.alignment,
                            fontWeight: section.meta?.isBold ? 'bold' : 'normal',
                            paddingLeft: `${(section.meta?.indent || 0) * 0.5}in`
                        }}
                        contentEditable={!readOnly}
                        suppressContentEditableWarning
                        dangerouslySetInnerHTML={{__html: sanitizeHtml(section.content)}}
                        onBlur={handleContentUpdate(section.id)}
                        role="textbox"
                        aria-label={`Paragraph section ${section.order + 1}`}
                        aria-readonly={readOnly}
                        tabIndex={readOnly ? -1 : 0}
                    />
                )}
            </div>
        );
    }, [viewMode, rules.fontFamily, document.filingStatus, document.caseId, document.title, plaintiffName, defendantName, relatedCase?.judge, readOnly, handleContentUpdate]);

    return (
        <div className="pb-20" role="main" aria-label="Document editor">
            {sortedSections.map(renderBlock)}
        </div>
    );
};
export default PleadingCanvas;
