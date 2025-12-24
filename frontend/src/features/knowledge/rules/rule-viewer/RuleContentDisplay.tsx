import React from 'react';
import { LegalRule } from '../../../../types';
import { cn } from '@/utils/cn';
import { History, FileText, Scale } from 'lucide-react';

interface RuleContentDisplayProps {
  selectedRule: LegalRule;
  activeTab: string;
  theme: any;
}

export const RuleContentDisplay: React.FC<RuleContentDisplayProps> = ({ selectedRule, activeTab, theme }) => {
  const { mode } = theme;

  const renderStructuredContent = (data: unknown) => {
    if (!data) return null;

    return (
      <div className="space-y-8">
        {/* Rule Text Section */}
        {activeTab === 'text' && (
            <div className="space-y-6 animate-fade-in">
                {Object.entries(data.text).map(([key, val]: [string, any]) => (
                    <div key={key} className={cn("pl-4 border-l-2", theme.border.default)}>
                        <h4 className={cn("text-sm font-bold mb-2 flex items-center", theme.text.primary)}>
                            <span className={cn("px-1.5 py-0.5 rounded mr-2 text-xs font-mono", theme.surface.highlight, theme.text.secondary)}>({key})</span>
                            {val.title}
                        </h4>
                        
                        {/* Content can be string or object with subsections */}
                        {typeof val.content === 'string' ? (
                            <p className={cn("text-sm leading-relaxed mb-2", theme.text.secondary)}>{val.content}</p>
                        ) : (
                            val.content && Object.entries(val.content).map(([subKey, subText]: [string, any]) => (
                                <div key={subKey} className={cn("ml-4 mt-2 text-sm", theme.text.secondary)}>
                                    <span className="font-semibold capitalize">{subKey}: </span> {subText}
                                </div>
                            ))
                        )}

                        {/* Subsections */}
                        {val.subsections && (
                            <ul className={cn("ml-6 space-y-2 mt-2 list-disc text-sm", theme.text.secondary)}>
                                {Object.entries(val.subsections).map(([subKey, subText]: [string, any]) => (
                                    <li key={subKey}>
                                        <span className={cn("font-mono text-xs mr-1", theme.text.tertiary)}>({subKey})</span> {subText}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}
            </div>
        )}

        {/* History / Statutory Notes */}
        {activeTab === 'history' && data.statutory_notes && (
             <div className="space-y-6 animate-fade-in">
                 <div className={cn("p-4 rounded-lg border", theme.surface.highlight, theme.border.default)}>
                     <h4 className={cn("text-sm font-bold mb-2 flex items-center", theme.text.primary)}><History className="h-4 w-4 mr-2"/> Enactment</h4>
                     <div className={cn("text-xs grid grid-cols-2 gap-4", theme.text.secondary)}>
                         <div><strong>Public Law:</strong> {data.statutory_notes.enactment.public_law}</div>
                         <div><strong>Date:</strong> {data.statutory_notes.enactment.date}</div>
                         <div><strong>Statute:</strong> {data.statutory_notes.enactment.stat}</div>
                     </div>
                 </div>

                 <div>
                     <h4 className={cn("text-sm font-bold mb-3", theme.text.primary)}>Amendments</h4>
                     <ul className="space-y-2">
                         {data.statutory_notes.amendments.map((am: unknown, i: number) => (
                             <li key={i} className={cn("text-xs flex items-center p-2 border rounded hover:opacity-80", theme.surface.highlight, theme.border.default)}>
                                 <span className={cn("font-medium mr-2", theme.text.primary)}>{am.date}</span>
                                 <span className={theme.text.secondary}>Effective: {am.effective_date}</span>
                             </li>
                         ))}
                     </ul>
                 </div>
             </div>
        )}

        {/* Advisory Notes */}
        {activeTab === 'notes' && data.advisory_committee_notes && (
            <div className="space-y-8 animate-fade-in">
                {Object.entries(data.advisory_committee_notes).map(([sectionKey, notes]: [string, any]) => (
                    <div key={sectionKey}>
                        <h3 className={cn("text-sm font-bold uppercase tracking-wider border-b pb-2 mb-4", theme.text.primary, theme.border.default)}>{sectionKey.replace(/_/g, ' ')}</h3>
                        <div className="space-y-6">
                            {Object.entries(notes).map(([noteKey, note]: [string, any]) => (
                                <div key={noteKey} className={cn("pl-4 border-l-2", theme.primary.border)}>
                                    <h4 className={cn("text-xs font-bold mb-1 uppercase", theme.primary.text)}>{noteKey.replace(/_/g, ' ')}</h4>
                                    {note.topic && <p className={cn("text-xs font-medium mb-1 italic", theme.text.secondary)}>{note.topic}</p>}
                                    <p className={cn("text-xs leading-relaxed text-justify", theme.text.secondary)}>{note.summary}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    );
  };
  return selectedRule.structuredContent ? (
    renderStructuredContent(selectedRule.structuredContent)
  ) : null;
};
