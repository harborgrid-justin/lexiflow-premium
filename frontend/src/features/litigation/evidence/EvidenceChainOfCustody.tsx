/**
 * @module EvidenceChainOfCustody
 * @category Evidence
 * @description Manages the immutable chain of custody log for evidence items.
 * Supports adding new events, digital signatures, and viewing the audit trail.
 */

import { AlertOctagon, Layers, Link, Plus } from 'lucide-react';
import React, { useState } from 'react';

// Common Components
import { SignaturePad } from '@/features/discovery/ui/components/SignaturePad/SignaturePad';
import { Button } from '@/shared/ui/atoms/Button';
import { Input } from '@/shared/ui/atoms/Input';
import { TextArea } from '@/shared/ui/atoms/TextArea';
import { Modal } from '@/shared/ui/molecules/Modal';

// Context & Utils
import { useTheme } from '@/contexts/theme/ThemeContext';
import { useModalState } from '@/hooks/core';
import { useNotify } from '@/hooks/useNotify';
import { cn } from '@/shared/lib/cn';
import { getTodayString } from '@/shared/lib/dateUtils';

// Services & Types
import { queryClient, useMutation } from '@/hooks/useQueryHooks';
import { ChainService } from '@/services/infrastructure/chainService';
// ✅ Migrated to backend API (2025-12-21)
import { DataService } from '@/services/data/dataService';
import { evidenceQueryKeys } from '@/services/infrastructure/queryKeys';
import { CustodyActionType, validateCustodyEventSafe } from '@/services/validation/evidenceSchemas';
import { ChainOfCustodyEvent, EvidenceItem, UserId } from '@/types';

interface EvidenceChainOfCustodyProps {
  selectedItem: EvidenceItem;
  onCustodyUpdate?: (event: ChainOfCustodyEvent) => void;
}

export const EvidenceChainOfCustody: React.FC<EvidenceChainOfCustodyProps> = ({ selectedItem, onCustodyUpdate }) => {
  const { theme } = useTheme();
  const notify = useNotify();
  const custodyModal = useModalState();
  const [newEvent, setNewEvent] = useState<Partial<ChainOfCustodyEvent>>({
    date: getTodayString(),
    action: CustodyActionType.TRANSFER_TO_STORAGE,
    actor: 'Current User'
  });
  const [isSigned, setIsSigned] = useState(false);

  // Mutation with optimistic updates and exponential backoff retry
  const { mutate: updateEvidenceWithCustody, isLoading: isUpdating } = useMutation(
    async (payload: { item: EvidenceItem, event: ChainOfCustodyEvent }) => {
      // In a real app, this would involve server-side logic
      // For demo, we simulate the update and blockchain logging
      const updatedItem = {
        ...payload.item,
        chainOfCustody: [payload.event, ...payload.item.chainOfCustody]
      };
      await DataService.evidence.update(payload.item.id, updatedItem);

      // Log to internal immutable ledger
      const prevHash = selectedItem.chainOfCustody.length > 0
        ? ((selectedItem.chainOfCustody[0] as unknown as Record<string, unknown>).curr_hash as string) || '0'
        : '0000000000000000000000000000000000000000000000000000000000000000'; // Genesis hash

      const chainedLog = await ChainService.createEntry({
        timestamp: payload.event.date,
        userId: 'current-user' as UserId,
        user: payload.event.actor,
        action: `CUSTODY_UPDATE_${payload.event.action.toUpperCase().replace(/\s/g, '_')}`,
        resource: `Evidence/${selectedItem.id}`,
        ip: '127.0.0.1',
        previousValue: selectedItem.chainOfCustody[0]?.id || '',
        newValue: payload.event.id
      }, prevHash);

      return { updatedItem, chainedLog };
    },
    {
      // Optimistic update: immediately show new event in UI
      onMutate: async (payload) => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries(evidenceQueryKeys.evidence.detail(payload.item.id));

        // Snapshot previous value for rollback
        const previousEvidence = queryClient.getQueryState(
          evidenceQueryKeys.evidence.all()
        )?.data as EvidenceItem[] | undefined;

        // Optimistically update cache
        queryClient.setQueryData<EvidenceItem[]>(
          evidenceQueryKeys.evidence.all(),
          (old) => old?.map(item =>
            item.id === payload.item.id
              ? { ...item, chainOfCustody: [payload.event, ...item.chainOfCustody] }
              : item
          ) || []
        );

        return { previousEvidence };
      },
      onSuccess: (data, variables) => {
        if (onCustodyUpdate) {
          const enrichedEvent = { ...variables.event, hash: data.chainedLog.hash };
          onCustodyUpdate(enrichedEvent as unknown as ChainOfCustodyEvent);
        }
        notify.success("Custody log updated and immutably recorded.");
        custodyModal.close();
        setNewEvent({ date: new Date().toISOString().split('T')[0], action: CustodyActionType.TRANSFER_TO_STORAGE, actor: 'Current User' });
        setIsSigned(false);
      },
      onError: (_error, _variables, context: { previousEvidence?: EvidenceItem[] }) => {
        // Rollback optimistic update on error
        if (context?.previousEvidence) {
          queryClient.setQueryData(
            evidenceQueryKeys.evidence.all(),
            context.previousEvidence
          );
        }
        notify.error("Failed to update custody log. Changes rolled back.");
      },
      invalidateKeys: [
        evidenceQueryKeys.evidence.all(),
        evidenceQueryKeys.evidence.detail(selectedItem.id),
        evidenceQueryKeys.evidence.custody(selectedItem.id)
      ]
    }
  );

  const handleSaveEvent = () => {
    if (!isSigned) {
      notify.warning("Digital signature is required.");
      return;
    }
    if (!newEvent.action || !newEvent.actor) return;

    const event: ChainOfCustodyEvent = {
      id: `cc-${Date.now()}`,
      date: newEvent.date || new Date().toISOString(),
      action: newEvent.action,
      actor: newEvent.actor,
      notes: newEvent.notes,
    };

    // Validate event data before submission
    const validation = validateCustodyEventSafe(event);
    if (!validation.success) {
      notify.error(`Validation failed: ${validation.error?.errors[0]?.message || 'Unknown error'}`);
      return;
    }

    updateEvidenceWithCustody({ item: selectedItem, event });
  };

  return (
    <div className="space-y-6">
      <div className={cn("p-4 rounded-lg border flex justify-between items-center", theme.surface.default, theme.border.default)}>
        <div>
          <h3 className={cn("font-bold", theme.text.primary)}>Chain of Custody Log</h3>
          <p className={cn("text-sm", theme.text.secondary)}>Immutable audit trail of evidence handling.</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={custodyModal.open}>Log New Event</Button>
      </div>

      <div className={cn("rounded-lg border shadow-sm overflow-hidden", theme.surface.default, theme.border.default)}>
        <div className={cn("p-4 border-b font-bold text-xs uppercase tracking-wider", theme.surface.highlight, theme.border.default, theme.text.secondary)}>
          Event History ({selectedItem.chainOfCustody.length})
        </div>
        <div className="divide-y max-h-96 overflow-y-auto custom-scrollbar">
          {selectedItem.chainOfCustody.length === 0 && (
            <div className={cn("text-center py-8 italic", theme.text.tertiary)}>No custody events recorded.</div>
          )}
          {selectedItem.chainOfCustody.map(event => (
            <div key={event.id} className={cn("p-4 flex items-start gap-4", theme.surface.default, theme.border.default)}>
              <div className={cn("p-2 rounded-full shrink-0", theme.primary.light)}>
                <Layers className={cn("h-5 w-5", theme.primary.text)} />
              </div>
              <div>
                <p className={cn("text-sm font-bold", theme.text.primary)}>{event.action}</p>
                <p className={cn("text-xs text-slate-500 mt-1")}>
                  <span className="font-medium">{event.actor}</span> on {event.date}
                </p>
                {event.notes && <p className={cn("text-xs italic mt-2", theme.text.secondary)}>{event.notes}</p>}
                {(event as unknown as Record<string, unknown>).hash ? (
                  <div className={cn("mt-2 p-2 rounded text-[10px] font-mono border break-all", theme.surface.highlight, theme.border.default, theme.text.secondary)}>
                    <Link className={cn("h-3 w-3 inline mr-1", theme.text.tertiary)} />
                    Hash: {String((event as unknown as Record<string, unknown>).hash).substring(0, 12)}...
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={custodyModal.isOpen} onClose={custodyModal.close} title="Log Custody Event" size="sm">
        <div className="p-6 space-y-4">
          <Input
            label="Date of Event"
            type="date"
            value={newEvent.date}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewEvent({ ...newEvent, date: e.target.value })}
          />
          <Input
            label="Action Performed"
            value={newEvent.action || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewEvent({ ...newEvent, action: e.target.value })}
            placeholder="e.g. Transferred to Lab, Returned to Client"
          />
          <Input
            label="Actor / Recorder"
            value={newEvent.actor || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewEvent({ ...newEvent, actor: e.target.value })}
            placeholder="Name of person performing action"
          />
          <TextArea
            label="Notes (Optional)"
            value={newEvent.notes || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewEvent({ ...newEvent, notes: e.target.value })}
            rows={3}
            placeholder="Additional details regarding the transfer/event..."
          />

          <div className={cn("p-4 rounded-lg border flex items-center justify-between", theme.status.warning.bg, theme.status.warning.border)}>
            <div className="flex items-start gap-3">
              <AlertOctagon className={cn("h-5 w-5 mt-0.5 shrink-0", theme.status.warning.text)} />
              <div>
                <h4 className="font-bold text-sm text-amber-800">Digital Signature Required</h4>
                <p className="text-xs text-amber-700 mt-1">All custody changes must be digitally signed to ensure immutability.</p>
              </div>
            </div>
          </div>
          <SignaturePad
            value={isSigned}
            onChange={setIsSigned}
            isSigning={isUpdating}
            label="Digital Signature"
            subtext="I certify this event is accurate and occurred as logged."
          />

          <div className={cn("pt-4 flex justify-end gap-3 border-t mt-4", theme.border.default)}>
            <Button variant="secondary" onClick={custodyModal.close}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveEvent} disabled={isUpdating || !isSigned}>
              {isUpdating ? 'Logging...' : 'Save Event'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
