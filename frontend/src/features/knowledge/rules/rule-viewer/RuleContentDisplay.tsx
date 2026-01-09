import React from 'react';
import { LegalRule } from '@/types';
import { cn } from '@/shared/lib/cn';
import { History } from 'lucide-react';

interface ThemeType {
  mode?: string;
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  border: {
    default: string;
  };
  surface: {
    highlight: string;
  };
  primary: {
    border: string;
    text: string;
  };
  status: {
    success: { text: string };
    error: { text: string };
    warning: { text: string };
  };
}

interface RuleContentDisplayProps {
  selectedRule: LegalRule;
  activeTab: string;
  theme: ThemeType;
}

interface RuleTextSection {
  title: string;
  content: string | Record<string, string>;
  subsections?: Record<string, string>;
}

interface RuleAmendment {
  date: string;
  effective_date: string;
}

interface RuleEnactment {
  public_law: string;
  date: string;
  stat: string;
}

interface RuleStatutoryNotes {
  enactment: RuleEnactment;
  amendments: RuleAmendment[];
}

interface RuleAdvisoryNote {
  topic?: string;
  summary: string;
}

interface RuleStructuredContent {
  text?: Record<string, RuleTextSection>;
  statutory_notes?: RuleStatutoryNotes;
  advisory_committee_notes?: Record<string, Record<string, RuleAdvisoryNote>>;
}

export const RuleContentDisplay: React.FC<RuleContentDisplayProps> = ({ selectedRule, activeTab, theme }) => {
  const renderStructuredContent = (data: unknown) => {
    if (!data) return null;
    const structuredData = data as RuleStructuredContent;

    return (
      <div className="space-y-8">
        {/* Rule Text Section */}
        {activeTab === 'text' && structuredData.text && (
            <div className="space-y-6 animate-fade-in">
                {Object.entries(structuredData.text).map(([key, val]) => (
                    <div key={key} className={cn("pl-4 border-l-2", theme.border.default)}>
                        <h4 className={cn("text-sm font-bold mb-2 flex items-center", theme.text.primary)}>
                            <span className={cn("px-1.5 py-0.5 rounded mr-2 text-xs font-mono", theme.surface.highlight, theme.text.secondary)}>({key})</span>
                            {val.title}
                        </h4>

                        {/* Content can be string or object with subsections */}
                        {typeof val.content === 'string' ? (
                            <p className={cn("text-sm leading-relaxed mb-2", theme.text.secondary)}>{val.content}</p>
                        ) : (
                            val.content && Object.entries(val.content).map(([subKey, subText]) => (
                                <div key={subKey} className={cn("ml-4 mt-2 text-sm", theme.text.secondary)}>
                                    <span className="font-semibold capitalize">{subKey}: </span> {subText}
                                </div>
                            ))
                        )}

                        {/* Subsections */}
                        {val.subsections && (
                            <ul className={cn("ml-6 space-y-2 mt-2 list-disc text-sm", theme.text.secondary)}>
                                {Object.entries(val.subsections).map(([subKey, subText]) => (
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
        {activeTab === 'history' && structuredData.statutory_notes && (
             <div className="space-y-6 animate-fade-in">
                 <div className={cn("p-4 rounded-lg border", theme.surface.highlight, theme.border.default)}>
                     <h4 className={cn("text-sm font-bold mb-2 flex items-center", theme.text.primary)}><History className="h-4 w-4 mr-2"/> Enactment</h4>
                     <div className={cn("text-xs grid grid-cols-2 gap-4", theme.text.secondary)}>
                         <div><strong>Public Law:</strong> {structuredData.statutory_notes.enactment.public_law}</div>
                         <div><strong>Date:</strong> {structuredData.statutory_notes.enactment.date}</div>
                         <div><strong>Statute:</strong> {structuredData.statutory_notes.enactment.stat}</div>
                     </div>
                 </div>

                 <div>
                     <h4 className={cn("text-sm font-bold mb-3", theme.text.primary)}>Amendments</h4>
                     <ul className="space-y-2">
                         {structuredData.statutory_notes.amendments.map((am) => (
                             <li key={`amendment-${am.date}-${am.effective_date}`} className={cn("text-xs flex items-center p-2 border rounded hover:opacity-80", theme.surface.highlight, theme.border.default)}>
                                 <span className={cn("font-medium mr-2", theme.text.primary)}>{am.date}</span>
                                 <span className={theme.text.secondary}>Effective: {am.effective_date}</span>
                             </li>
                         ))}
                     </ul>
                 </div>
             </div>
        )}

        {/* Advisory Notes */}
        {activeTab === 'notes' && structuredData.advisory_committee_notes && (
            <div className="space-y-8 animate-fade-in">
                {Object.entries(structuredData.advisory_committee_notes).map(([sectionKey, notes]) => (
                    <div key={sectionKey}>
                        <h3 className={cn("text-sm font-bold uppercase tracking-wider border-b pb-2 mb-4", theme.text.primary, theme.border.default)}>{sectionKey.replace(/_/g, ' ')}</h3>
                        <div className="space-y-6">
                            {Object.entries(notes).map(([noteKey, note]) => (
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
