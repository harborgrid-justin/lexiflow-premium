/**
 * CaseOverviewModals.tsx
 *
 * Modal collection for overview quick actions including time entry,
 * case linking, and matter transfer workflows.
 *
 * @module components/case-detail/overview/CaseOverviewModals
 * @category Case Management - Overview
 */

// External Dependencies
import React from 'react';
import { AlertCircle, ArrowRightLeft, Plus } from 'lucide-react';

// Internal Dependencies - Components
import { TimeEntryModal } from '@/components/features/cases/components/TimeEntryModal/TimeEntryModal';
import { Modal } from '@/components/ui/molecules/Modal';
import { Button } from '@/components/ui/atoms/Button';

// Internal Dependencies - Hooks & Context
import { useTheme } from '@/providers/ThemeContext';

// Internal Dependencies - Services & Utils
import { cn } from '@/utils/cn';

// Types & Interfaces
import { Case, TimeEntryPayload } from '@/types';

interface CaseOverviewModalsProps {
  caseData: Case;
  showTimeModal: boolean;
  setShowTimeModal: (v: boolean) => void;
  showLinkModal: boolean;
  setShowLinkModal: (v: boolean) => void;
  showTransferModal: boolean;
  setShowTransferModal: (v: boolean) => void;
  availableCases: Case[];
  onSaveTime: (entry: TimeEntryPayload) => void;
  onLinkCase: (c: Case) => void;
  onTransfer: () => void;
}

export const CaseOverviewModals: React.FC<CaseOverviewModalsProps> = ({
  caseData, showTimeModal, setShowTimeModal, showLinkModal, setShowLinkModal,
  showTransferModal, setShowTransferModal, availableCases, onSaveTime, onLinkCase, onTransfer
}) => {
  const { theme } = useTheme();

  return (
    <>
      <TimeEntryModal
        isOpen={showTimeModal}
        onClose={() => setShowTimeModal(false)}
        caseId={caseData.id}
        onSave={onSaveTime}
      />

      <Modal isOpen={showLinkModal} onClose={() => setShowLinkModal(false)} title="Link Related Docket">
          <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
              <p className={cn("text-sm mb-4", theme.text.secondary)}>Select a docket to consolidate or link as a related matter.</p>
              {availableCases.length === 0 && <p className={cn("text-sm italic", theme.text.tertiary)}>No other cases available to link.</p>}
              {availableCases.map(c => (
                  <div key={c.id} className={cn("flex justify-between items-center p-3 border rounded transition-colors", theme.border.default, `hover:${theme.surface.highlight}`)}>
                      <div>
                          <p className={cn("font-bold text-sm", theme.text.primary)}>{c.title}</p>
                          <p className={cn("text-xs", theme.text.secondary)}>{c.id} • {c.court}</p>
                      </div>
                      <Button size="sm" variant="outline" icon={Plus} onClick={() => onLinkCase(c)}>Link</Button>
                  </div>
              ))}
          </div>
          <div className={cn("p-4 border-t flex justify-end", theme.border.default)}>
              <Button onClick={() => setShowLinkModal(false)}>Done</Button>
          </div>
      </Modal>

      <Modal isOpen={showTransferModal} onClose={() => setShowTransferModal(false)} title="Transfer to Appeal" size="sm">
          <div className="p-6">
              <div className={cn("border rounded p-4 mb-4", theme.status.warning.bg, theme.status.warning.border)}>
                  <div className={cn("flex items-center gap-2 font-bold mb-1", theme.status.warning.text)}>
                      <AlertCircle className="h-5 w-5"/> Important
                  </div>
                  <p className={cn("text-xs", theme.status.warning.text)}>
                      This action will create a new linked matter with type "Appeal". The current case status will remain active until closed. FRAP 4 deadlines will be tracked.
                  </p>
              </div>
              <p className={cn("text-sm mb-4", theme.text.secondary)}>
                  Confirm creation of Appellate Matter for <strong>{caseData.title}</strong>?
              </p>
              <div className="flex justify-end gap-3">
                  <Button variant="secondary" onClick={() => setShowTransferModal(false)}>Cancel</Button>
                  <Button variant="primary" icon={ArrowRightLeft} onClick={onTransfer}>File Appeal</Button>
              </div>
          </div>
      </Modal>
    </>
  );
};
