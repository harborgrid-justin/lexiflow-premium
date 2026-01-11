/**
 * DiscoveryResponse.tsx
 *
 * AI-assisted discovery response drafting using Google Gemini.
 * Generates objections and substantive responses to discovery requests.
 *
 * @module components/discovery/DiscoveryResponse
 * @category Discovery - Response Drafting
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { ArrowLeft, Clock, Save, Wand2 } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Components
import { Badge } from '@/components/ui/atoms/Badge';
import { Button } from '@/components/ui/atoms/Button';

// Hooks & Context
import { useAutoSave } from "@/hooks/core";
import { useKeyboardShortcuts } from "@/hooks/ui";
import { useNotify } from "@/hooks/core";
import { useTheme } from "@/providers";

// Services & Utils
import { GeminiService } from "@/services";
import { validateDiscoveryRequestSafe } from '@/services/validation/discoverySchemas';
import { cn } from '@/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
import { DiscoveryResponseProps } from "./types";

export const DiscoveryResponse: React.FC<DiscoveryResponseProps> = ({
  request,
  onBack,
  onSave,
}) => {
  const { theme } = useTheme();
  const notify = useNotify();
  const [draftResponse, setDraftResponse] = useState("");
  const [isDrafting, setIsDrafting] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [, setValidationErrors] = useState<
    Array<{ path: string; message: string }>
  >([]);

  // Define handleGenerateResponse before useEffect
  const handleGenerateResponse = useCallback(async () => {
    if (!request) return;
    setIsDrafting(true);
    const draft = await GeminiService.generateDraft(
      `Draft a legal response to this discovery request pursuant to FRCP 34/33: "${request.title}: ${request.description}".
      Include standard objections (overly broad, undue burden, vague/ambiguous).
      Format as a formal legal pleading.`,
      "Discovery Response",
    );
    setDraftResponse(draft);
    setIsDrafting(false);
  }, [request]);

  // Auto-save with 2s debounce
  const { isSaving } = useAutoSave({
    data: draftResponse,
    onSave: async (data: string) => {
      if (request) {
        localStorage.setItem(`discovery-response-draft-${request.id}`, data);
        setLastSaved(new Date());
      }
    },
    delay: 2000,
    enabled: !!request
  });

  // Restore draft from localStorage on mount
  const [draftResponse, setDraftResponse] = useState<string>(() => {
    if (request) {
      try {
        const savedDraft = localStorage.getItem(`discovery-response-draft-${request.id}`);
        if (savedDraft) {
          return savedDraft;
        }
      } catch (err: unknown) {
        console.error("Failed to restore draft:", err);
      }
    }
    return '';
  });

  // Keyboard shortcuts
  useKeyboardShortcuts({
    "mod+s": () => {
      if (request) handleSave();
    },
    "mod+g": () => {
      handleGenerateResponse();
    },
    escape: () => {
      onBack();
    },
  });

  const handleSave = () => {
    if (!request) return;

    // Validate before saving
    const validation = validateDiscoveryRequestSafe(request);
    if (!validation.success) {
      setValidationErrors(validation.error.errors);
      notify.error("Validation failed. Please check the form.");
      return;
    }

    onSave(request.id, draftResponse);
    // Clear draft from localStorage
    localStorage.removeItem(`discovery-response-draft-${request.id}`);
    notify.success("Response saved successfully");
  };

  if (!request) return <div>No request selected.</div>;

  return (
    <div
      className={cn(
        "flex flex-col h-full rounded-lg shadow-sm border animate-fade-in",
        theme.surface.default,
        theme.border.default,
      )}
    >
      <div
        className={cn(
          "p-4 border-b flex justify-between items-center",
          theme.border.default,
          theme.surface.highlight,
        )}
      >
        <div className="flex items-center">
          <button
            onClick={onBack}
            className={cn(
              "mr-3 p-2 rounded-full transition-colors",
              theme.text.secondary,
              `hover:${theme.surface.default}`,
            )}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className={cn("text-lg font-bold", theme.text.primary)}>
              Drafting Response
            </h2>
            <p className={cn("text-xs", theme.text.secondary)}>
              Ref: {request.id} • {request.title}
            </p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          {isSaving && (
            <span
              className={cn(
                "text-xs flex items-center gap-1",
                theme.text.secondary,
              )}
            >
              <Clock className="h-3 w-3 animate-spin" /> Saving...
            </span>
          )}
          {lastSaved && !isSaving && (
            <span className={cn("text-xs", theme.text.tertiary)}>
              Saved {new Date(lastSaved).toLocaleTimeString()}
            </span>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleGenerateResponse}
            disabled={isDrafting}
          >
            {isDrafting ? "AI Generating..." : "Re-Generate AI Draft"}
          </Button>
          <Button size="sm" variant="primary" icon={Save} onClick={handleSave}>
            Save & Mark Responded
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Left: Request Context */}
        <div
          className={cn(
            "w-full md:w-1/3 border-r p-6 overflow-y-auto",
            theme.border.default,
            theme.surface.highlight,
          )}
        >
          <div className="mb-4">
            <Badge variant="neutral">{request.type}</Badge>
          </div>
          <h3 className={cn("font-bold mb-2", theme.text.primary)}>
            {request.title}
          </h3>
          <p
            className={cn(
              "text-sm leading-relaxed mb-6 p-4 rounded border",
              theme.surface.default,
              theme.border.default,
              theme.text.secondary,
            )}
          >
            {request.description}
          </p>

          <div className={cn("space-y-4 text-xs", theme.text.secondary)}>
            <div>
              <span className={cn("font-bold block", theme.text.primary)}>
                Propounding Party
              </span>
              {request.propoundingParty}
            </div>
            <div>
              <span className={cn("font-bold block", theme.text.primary)}>
                Responding Party
              </span>
              {request.respondingParty}
            </div>
            <div>
              <span className={cn("font-bold block", theme.text.primary)}>
                Deadline
              </span>
              {request.dueDate}
            </div>
          </div>

          <div
            className={cn(
              "mt-8 p-4 rounded border",
              theme.status.info.bg,
              theme.status.info.border,
            )}
          >
            <h4
              className={cn(
                "text-sm font-bold mb-2 flex items-center",
                theme.status.info.text,
              )}
            >
              <Wand2 className="h-3 w-3 mr-2" /> AI Insight
            </h4>
            <p className={cn("text-xs", theme.status.info.text)}>
              This request matches patterns often deemed "overly broad" in this
              jurisdiction. Consider objecting to the timeframe scope.
            </p>
          </div>
        </div>

        {/* Right: Editor */}
        <div className="flex-1 flex flex-col relative">
          <textarea
            className={cn(
              "flex-1 w-full p-8 font-serif text-base leading-relaxed outline-none resize-none",
              theme.surface.default,
              theme.text.primary,
            )}
            value={draftResponse}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDraftResponse(e.target.value)}
            placeholder="Draft your legal response here..."
          />
        </div>
      </div>
    </div>
  );
};

export default DiscoveryResponse;
