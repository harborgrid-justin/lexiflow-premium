import { Badge } from '@/components/ui/atoms/Badge';
import { Button } from '@/components/ui/atoms/Button';
import { Modal } from '@/components/ui/molecules/Modal';
import { useNotify } from '@/hooks/useNotify';
import { queryClient, useMutation } from '@/hooks/useQueryHooks';
import { useTheme } from '@/providers';
import { DataService } from '@/services/data/dataService';
import { GeminiService } from '@/services/features/research/geminiService';
import { DiscoveryRequest } from '@/types';
import { cn } from '@/utils/cn';
import { Wand2 } from 'lucide-react';
import React, { useState } from 'react';
// ✅ Migrated to backend API (2025-12-21)
import { queryKeys } from '@/utils/queryKeys';

interface DiscoveryResponseModalProps {
  request: DiscoveryRequest | null;
  onClose: () => void;
}

export const DiscoveryResponseModal: React.FC<DiscoveryResponseModalProps> = ({ request, onClose }) => {
  const [draftResponse, setDraftResponse] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);
  const { theme } = useTheme();
  const { success, error } = useNotify();

  const handleGenerateResponse = async () => {
    if (!request) return;
    setIsDrafting(true);
    const draft = await GeminiService.generateDraft(
      `Draft a legal response to this discovery request pursuant to FRCP 34/33: "${request.title}: ${request.description}".
      Include standard objections (overly broad, undue burden, vague/ambiguous).
      Format as a formal legal pleading.`,
      'Discovery Response'
    );
    setDraftResponse(draft);
    setIsDrafting(false);
  };

  const saveDraftMutation = useMutation(
    async () => {
      if (!request || !draftResponse) return;

      const draftPleading = {
        caseId: request.caseId || '',
        title: `Response to ${request.title}`,
        type: 'response' as const,
        content: draftResponse,
        status: 'draft' as const,
        filedDate: '',
        dueDate: '',
        parties: [request.respondingParty, request.propoundingParty],
      };

      await DataService.pleadings.add(draftPleading);
    },
    {
      onSuccess: () => {
        queryClient.invalidate(queryKeys.pleadings.all());
        success('Response saved to drafts successfully.');
        onClose();
      },
      onError: () => {
        error('Failed to save response. Please try again.');
      }
    }
  );

  const initialDraft = 'Click "Regenerate" to create a legally formatted response with standard objections.';

  return (
    <Modal
      isOpen={!!request}
      onClose={onClose}
      title={`Drafting Response: ${request?.id}`}
      size="lg"
    >
      <div className="p-6 space-y-6">
        <div className={cn("bg-slate-50 p-4 rounded-lg border border-slate-200", theme.surface.highlight, theme.border.default)}>
          <div className="flex justify-between items-start">
            <div>
              <h4 className={cn("font-bold text-slate-900 mb-1", theme.text.primary)}>{request?.title}</h4>
              <p className={cn("text-sm text-slate-700 mb-2", theme.text.secondary)}>{request?.description}</p>
            </div>
            <Badge variant="neutral">{request?.type}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs text-slate-500 mt-2">
            <div><strong>Propounding:</strong> {request?.propoundingParty}</div>
            <div><strong>Responding:</strong> {request?.respondingParty}</div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className={cn("font-bold text-slate-900 flex items-center gap-2", theme.text.primary)}>
              <Wand2 className={cn("h-4 w-4", theme.primary.text)} /> AI Draft (FRCP Compliant)
            </h4>
            <Button size="sm" variant="outline" onClick={handleGenerateResponse} disabled={isDrafting}>
              {isDrafting ? 'Generating...' : 'Regenerate'}
            </Button>
          </div>
          <div className="relative">
            <textarea
              placeholder="AI-generated response will appear here..."
              className={cn("w-full h-64 p-4 border rounded-lg text-sm font-mono leading-relaxed focus:ring-2 focus:ring-blue-500 outline-none resize-none", theme.surface.default, theme.border.default, theme.text.primary)}
              value={draftResponse || initialDraft}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDraftResponse(e.target.value)}
            />
            {!draftResponse && !isDrafting && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className={cn("text-slate-400 text-sm", theme.text.tertiary)}>AI Assistant Ready</p>
              </div>
            )}
          </div>
          <p className={cn("text-xs text-slate-500", theme.text.secondary)}>
            *This draft includes standard objections pursuant to Rule 33/34. Review for specific privilege claims before finalizing.
          </p>
        </div>

        <div className={cn("flex justify-end gap-3 pt-4 border-t border-slate-100", theme.border.default)}>
          <Button variant="secondary" onClick={onClose}>Discard</Button>
          <Button
            variant="primary"
            onClick={() => saveDraftMutation.mutate(undefined as unknown as Record<string, unknown>)}
            disabled={saveDraftMutation.isLoading || !draftResponse}
          >
            {saveDraftMutation.isLoading ? 'Saving...' : 'Save to Matter File'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DiscoveryResponseModal;
