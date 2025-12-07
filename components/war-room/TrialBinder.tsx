
import React, { useState, useMemo } from 'react';
import { Folder, FileText, ChevronRight, Gavel, BookOpen, Plus, File, Scale, MoreVertical } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { Button } from '../common/Button';
import { WarRoomData } from '../../types';

interface TrialBinderProps {
  caseId: string;
  warRoomData: WarRoomData;
}

interface BinderSection {
  id: string;
  title: string;
  icon: React.ElementType;
  documents: any[];
}

export const TrialBinder: React.FC<TrialBinderProps> = ({ caseId, warRoomData }) => {
  const { theme } = useTheme();
  const [selectedSectionId, setSelectedSectionId] = useState<string>('motions');

  // Memoize sections to prevent expensive re-mapping on every render
  const sections: BinderSection[] = useMemo(() => {
      const motions = (warRoomData.motions || []).map((m) => ({ ...m, docType: 'Motion', date: m.filingDate }));
      const orders = (warRoomData.docket || []).filter((d) => d.type === 'Order').map((d) => ({ ...d, docType: 'Order' }));
      const filings = (warRoomData.docket || []).filter((d) => d.type === 'Filing').map((d) => ({ ...d, docType: 'Filing' }));

      return [
        { id: 'motions', title: 'Motions & Pleadings', icon: Gavel, documents: motions },
        { id: 'orders', title: 'Court Orders', icon: Scale, documents: orders },
        { id: 'filings', title: 'All Filings', icon: FileText, documents: filings },
        { id: 'witnesses', title: 'Witness Prep', icon: Folder, documents: [] },
      ];
  }, [warRoomData]);

  const activeSection = useMemo(() => 
      sections.find(s => s.id === selectedSectionId), 
  [sections, selectedSectionId]);

  return (
    <div className={cn("flex h-full rounded-lg border shadow-sm overflow-hidden", theme.surface, theme.border.default)}>
        {/* Sidebar: Sections */}
        <div className={cn("w-72 border-r flex flex-col", theme.border.default, theme.surfaceHighlight)}>
            <div className={cn("p-4 border-b flex justify-between items-center", theme.border.default)}>
                <h3 className={cn("font-bold text-sm uppercase tracking-wide", theme.text.secondary)}>Binder Sections</h3>
                <button className={cn("p-1 rounded transition-colors", theme.text.tertiary, `hover:${theme.surface}`)}>
                    <Plus className="h-4 w-4"/>
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {sections.map(section => (
                    <button
                        key={section.id}
                        onClick={() => setSelectedSectionId(section.id)}
                        className={cn(
                            "w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium transition-all",
                            selectedSectionId === section.id 
                                ? cn(theme.surface, "shadow-sm text-blue-600 border", theme.border.default) 
                                : cn(theme.text.secondary, `hover:${theme.surface}`)
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <section.icon className={cn("h-4 w-4", selectedSectionId === section.id ? "text-blue-600" : theme.text.tertiary)}/>
                            {section.title}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={cn("text-xs px-1.5 py-0.5 rounded", theme.surface, theme.border.default, theme.text.tertiary)}>{section.documents.length}</span>
                            {selectedSectionId === section.id && <ChevronRight className="h-3 w-3"/>}
                        </div>
                    </button>
                ))}
            </div>
        </div>

        {/* Content Area */}
        <div className={cn("flex-1 flex flex-col", theme.surface)}>
            {activeSection ? (
                <>
                    <div className={cn("p-6 border-b flex justify-between items-center", theme.border.default)}>
                        <div>
                            <h2 className={cn("text-xl font-bold", theme.text.primary)}>{activeSection.title}</h2>
                            <p className={cn("text-sm mt-1", theme.text.secondary)}>Digital Binder • {activeSection.documents.length} Documents</p>
                        </div>
                        <Button variant="primary" icon={Plus}>Add Document</Button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="grid grid-cols-1 gap-3">
                            {activeSection.documents.map(doc => (
                                <div key={doc.id} className={cn("flex items-center justify-between p-4 rounded-lg border transition-all group cursor-pointer", theme.border.default, theme.surface, `hover:${theme.surfaceHighlight}`)}>
                                    <div className="flex items-center gap-4 overflow-hidden">
                                        <div className={cn("p-3 rounded-lg text-blue-600 shrink-0", theme.primary.light)}>
                                            <File className="h-6 w-6"/>
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className={cn("font-bold text-sm truncate", theme.text.primary)} title={doc.title}>{doc.title}</h4>
                                            <div className={cn("flex items-center gap-3 text-xs mt-1", theme.text.secondary)}>
                                                <span className="font-bold">{doc.docType}</span>
                                                <span>• {doc.date}</span>
                                                {doc.status && <span className={cn("px-1.5 py-0.5 rounded border font-medium", theme.surface, theme.border.default)}>{doc.status}</span>}
                                            </div>
                                            {doc.description && <p className={cn("text-xs mt-1 truncate max-w-md", theme.text.tertiary)}>{doc.description}</p>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button size="sm" variant="ghost">View</Button>
                                        <button className={cn("p-2 rounded transition-colors", theme.text.tertiary, `hover:${theme.text.primary}`)}>
                                            <MoreVertical className="h-4 w-4"/>
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {activeSection.documents.length === 0 && (
                                <div className={cn("text-center py-12 border-2 border-dashed rounded-lg", theme.border.default)}>
                                    <File className={cn("h-12 w-12 mx-auto mb-3", theme.text.tertiary)}/>
                                    <p className={cn(theme.text.secondary)}>No documents in this section yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            ) : (
                <div className={cn("flex-1 flex items-center justify-center", theme.text.tertiary)}>
                    Select a section to view contents
                </div>
            )}
        </div>
    </div>
  );
};
