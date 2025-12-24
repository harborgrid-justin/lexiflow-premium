/**
 * DocketEntryModal.tsx
 * 
 * Modal dialog for viewing detailed docket entry information with actions
 * for printing, downloading, and linking to timeline.
 * 
 * @module components/docket/DocketEntryModal
 * @category Case Management - Docket
 */

// External Dependencies
import React from 'react';
import { Lock, Printer, Download, ExternalLink, Scale, Calendar, Database, Tag, Copy } from 'lucide-react';

// Internal Dependencies - Components
import { Modal } from '../../common/Modal';
import { Button } from '../../common/Button';
import { Badge } from '../../common/Badge';
import { CopyButton } from '../../common/CopyButton';

// Internal Dependencies - Hooks & Context
import { useTheme } from '../../../context/ThemeContext';

// Internal Dependencies - Services & Utils
import { cn } from '@/utils/cn';

// Types & Interfaces
import { DocketEntry } from '../../../types';

interface DocketEntryModalProps {
  entry: DocketEntry | null;
  onClose: () => void;
  onViewOnTimeline: (caseId: string) => void;
  renderLinkedText: (text: string) => React.ReactNode;
  isOrbital?: boolean;
}

export const DocketEntryModal: React.FC<DocketEntryModalProps> = ({ 
  entry, onClose, onViewOnTimeline, renderLinkedText, isOrbital = false 
}) => {
  const { theme } = useTheme();
  
  if (!entry) return null;

  const content = (
      <div className={cn("p-6 h-full overflow-y-auto", theme.surface.default)}>
        <div className={cn("flex justify-between items-start mb-6 border-b pb-4", theme.border.default)}>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={cn("text-xl font-bold", theme.text.primary)}>Internal Seq #{entry.sequenceNumber}</span>
              {entry.pacerSequenceNumber && (
                  <span className={cn("text-sm font-mono px-2 py-0.5 border rounded", theme.surface.highlight, theme.text.secondary)}>
                      PACER #{entry.pacerSequenceNumber}
                  </span>
              )}
              <Badge variant="neutral">{entry.type}</Badge>
              {entry.isSealed && <Badge variant="error"><Lock className="h-3 w-3 mr-1"/> Sealed</Badge>}
            </div>
            <p className={cn("text-sm", theme.text.secondary)}>Filed on {entry.date} by <strong>{entry.filedBy}</strong></p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" icon={Printer}>Print</Button>
            <Button variant="outline" icon={Download}>Download PDF</Button>
          </div>
        </div>

        {/* Structured Data Visualization */}
        {entry.structuredData && (
            <div className={cn("mb-6 p-4 rounded-lg border", theme.status.info.bg, theme.status.info.border)}>
                <h4 className={cn("text-xs font-bold uppercase mb-3 flex items-center", theme.status.info.text)}>
                    <Database className="h-3 w-3 mr-2"/> Structured Analysis
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <span className={cn("block text-[10px] font-bold uppercase", theme.text.secondary)}>Action</span>
                        <span className={cn("font-medium", theme.text.primary)}>{entry.structuredData.actionType}</span>
                    </div>
                    <div>
                        <span className={cn("block text-[10px] font-bold uppercase", theme.text.secondary)}>Target/Doc</span>
                        <span className={cn("font-medium", theme.text.primary)}>{entry.structuredData.documentTitle}</span>
                    </div>
                    <div>
                        <span className={cn("block text-[10px] font-bold uppercase", theme.text.secondary)}>Verb / Action</span>
                        <span className={cn("font-medium px-1.5 rounded", theme.primary.text, theme.primary.light)}>{entry.structuredData.actionVerb}</span>
                    </div>
                    <div>
                        <span className={cn("block text-[10px] font-bold uppercase", theme.text.secondary)}>Filer Entity</span>
                        <span className={cn("font-medium", theme.text.primary)}>{entry.structuredData.filer}</span>
                    </div>
                </div>
                {entry.structuredData.additionalText && (
                    <div className={cn("mt-3 pt-3 border-t", theme.border.default)}>
                        <span className={cn("block text-[10px] font-bold uppercase mb-1", theme.text.secondary)}>Metadata</span>
                        <p className={cn("text-xs", theme.text.secondary)}>{entry.structuredData.additionalText}</p>
                    </div>
                )}
            </div>
        )}

        <div className={cn("p-4 rounded-lg border mb-6", theme.surface.highlight, theme.border.default)}>
          <div className="flex justify-between items-center mb-2">
            <h4 className={cn("text-sm font-bold", theme.text.primary)}>Full Text</h4>
            <CopyButton text={entry.description || entry.title} variant="ghost" size="sm" />
          </div>
          <p className={cn("text-sm leading-relaxed", theme.text.secondary)}>{renderLinkedText(entry.title)}</p>
          {entry.description && <p className={cn("text-sm mt-2 italic", theme.text.tertiary)}>{renderLinkedText(entry.description || '')}</p>}
        </div>

        {/* Auto-generated Tags or Rules */}
        <div className="mb-6 flex gap-2">
            {(entry.title || '').toLowerCase().includes('motion') && <span className={cn("text-xs border px-2 py-1 rounded flex items-center gap-1", theme.surface.highlight, theme.border.default)}><Tag className="h-3 w-3"/> Needs Response</span>}
            {entry.type === 'Order' && <span className={cn("text-xs border px-2 py-1 rounded flex items-center gap-1", theme.status.error.bg, theme.status.error.text, theme.status.error.border)}><Scale className="h-3 w-3"/> Ruling</span>}
        </div>

        {entry.triggersDeadlines && entry.triggersDeadlines.length > 0 && (
          <div className="mb-6">
            <h4 className={cn("text-sm font-bold mb-3 flex items-center", theme.text.primary)}><Scale className="h-4 w-4 mr-2"/> Rules Engine: Triggered Events</h4>
            <div className="space-y-2">
              {entry.triggersDeadlines.map(dl => (
                <div key={dl.id} className={cn("flex justify-between items-center p-3 border rounded-lg shadow-sm", theme.surface.default, theme.border.default)}>
                  <div className="flex items-center gap-3">
                    <Calendar className={cn("h-5 w-5", dl.status === 'Satisfied' ? theme.status.success.text : theme.status.warning.text)}/>
                    <div>
                      <p className={cn("font-bold text-sm", theme.text.primary)}>{dl.title}</p>
                      <p className={cn("text-xs", theme.text.secondary)}>Pursuant to {dl.ruleReference}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn("font-mono text-sm font-bold", theme.text.primary)}>{dl.date}</p>
                    <span className={cn("text-[10px] uppercase font-bold", dl.status === 'Satisfied' ? theme.status.success.text : theme.status.warning.text)}>{dl.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={cn("flex justify-end pt-4 gap-2 border-t", theme.border.default)}>
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <Button variant="primary" icon={ExternalLink} onClick={() => { onClose(); onViewOnTimeline(entry.caseId); }}>View on Timeline</Button>
        </div>
      </div>
  );

  // If Orbital, return just content, otherwise wrap in Modal
  if (isOrbital) return content;

  return (
    <Modal isOpen={true} onClose={onClose} title="Docket Entry Details" size="lg">
      {content}
    </Modal>
  );
};
