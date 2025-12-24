/**
 * @module components/war-room/TrialBinder
 * @category WarRoom
 * @description Digital trial binder organizing motions, orders, filings, and witness prep materials.
 * Provides a hierarchical view of case documents.
 *
 * THEME SYSTEM USAGE:
 * This component uses the `useTheme` hook to apply semantic colors for backgrounds,
 * text, and borders, ensuring a consistent look in both light and dark modes.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useState, useMemo } from 'react';
import { Folder, FileText, ChevronRight, Gavel, BookOpen, Plus, File, Scale, MoreVertical } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/providers/ThemeContext';

// Components
import { Button } from '@/components/atoms/Button';

// Utils & Constants
import { cn } from '@/utils/cn';

// Types
import type { WarRoomData, LegalDocument } from '@/types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface TrialBinderProps {
  /** The ID of the current case. */
  caseId: string;
  /** The comprehensive data object for the war room. */
  warRoomData: WarRoomData;
}

interface BinderSection {
  id: string;
  title: string;
  icon: React.ElementType;
  documents: LegalDocument[];
}

// ============================================================================
// COMPONENT
// ============================================================================

export const TrialBinder: React.FC<TrialBinderProps> = ({ caseId, warRoomData }) => {
  // ============================================================================
  // HOOKS & CONTEXT
  // ============================================================================
  const { theme } = useTheme();

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  const [selectedSectionId, setSelectedSectionId] = useState<string>('motions');

  // ============================================================================
  // MEMOIZED VALUES
  // ============================================================================
  const sections: BinderSection[] = useMemo(() => {
      const motions = (warRoomData.motions || []).map((m) => ({ ...m, docType: 'Motion', date: m.filingDate }));
      const orders = (warRoomData.docket || []).filter((d: any) => d.type === 'Order').map((d: any) => ({ ...d, docType: 'Order' }));
      const filings = (warRoomData.docket || []).filter((d: any) => d.type === 'Filing').map((d: any) => ({ ...d, docType: 'Filing' }));

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
    <div className={cn("flex h-full rounded-lg border shadow-sm overflow-hidden", theme.surface.default, theme.border.default)}>
        {/* Sidebar: Sections */}
        <div className={cn("w-72 border-r flex flex-col", theme.border.default, theme.surface.highlight)}>
            <div className={cn("p-4 border-b flex justify-between items-center", theme.border.default)}>
                <h3 className={cn("font-bold text-sm uppercase tracking-wide", theme.text.secondary)}>Binder Sections</h3>
                <button title="Add section" className={cn("p-1 rounded transition-colors", theme.text.tertiary, `hover:${theme.surface.default}`)}>
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
                                ? cn(theme.surface.default, "shadow-sm border", theme.primary.text, theme.border.default) 
                                : cn(theme.text.secondary, `hover:${theme.surface.default}`)
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <section.icon className={cn("h-4 w-4", selectedSectionId === section.id ? theme.primary.text : theme.text.tertiary)}/>
                            {section.title}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={cn("text-xs px-1.5 py-0.5 rounded", theme.surface.default, theme.border.default, theme.text.tertiary)}>{section.documents.length}</span>
                            {selectedSectionId === section.id && <ChevronRight className="h-3 w-3"/>}
                        </div>
                    </button>
                ))}
            </div>
        </div>

        {/* Content Area */}
        <div className={cn("flex-1 flex flex-col", theme.surface.default)}>
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
                                <div key={doc.id} className={cn("flex items-center justify-between p-4 rounded-lg border transition-all group cursor-pointer", theme.border.default, theme.surface.default, `hover:${theme.surface.highlight}`)}>
                                    <div className="flex items-center gap-4 overflow-hidden">
                                        <div className={cn("p-3 rounded-lg shrink-0", theme.primary.light, theme.primary.text)}>
                                            <File className="h-6 w-6"/>
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className={cn("font-bold text-sm truncate", theme.text.primary)} title={doc.title}>{doc.title}</h4>
                                            <div className={cn("flex items-center gap-3 text-xs mt-1", theme.text.secondary)}>
                                                <span className="font-bold">{doc.docType}</span>
                                                <span>• {doc.date}</span>
                                                {doc.status && <span className={cn("px-1.5 py-0.5 rounded border font-medium", theme.surface.default, theme.border.default)}>{doc.status}</span>}
                                            </div>
                                            {doc.description && <p className={cn("text-xs mt-1 truncate max-w-md", theme.text.tertiary)}>{doc.description}</p>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button size="sm" variant="ghost">View</Button>
                                        <button title="More options" className={cn("p-2 rounded transition-colors", theme.text.tertiary, `hover:${theme.text.primary}`)}>
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
