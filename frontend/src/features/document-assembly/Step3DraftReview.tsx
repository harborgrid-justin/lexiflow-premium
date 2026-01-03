/**
 * @module components/document-assembly/Step3DraftReview
 * @description Draft review and save step for document assembly wizard
 * ✅ Backend-connected via parent component DocumentAssembly (2025-12-21)
 */

import React, { useRef, useEffect } from 'react';
import { Save, Download, Copy, Sparkles, Loader2, CheckCircle } from 'lucide-react';
import { useTheme } from '@/contexts/theme/ThemeContext';
import { cn } from '@/utils/cn';

interface Step3DraftReviewProps {
  result: string;
  isStreaming: boolean;
  isSaving: boolean;
  onSave: () => void;
}

export const Step3DraftReview: React.FC<Step3DraftReviewProps> = ({
  result,
  isStreaming,
  isSaving,
  onSave
}) => {
  const { theme } = useTheme();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = React.useState(false);

  // Auto-scroll to bottom as content streams in
  useEffect(() => {
    if (textAreaRef.current && isStreaming) {
      textAreaRef.current.scrollTop = textAreaRef.current.scrollHeight;
    }
  }, [result, isStreaming]);

  const handleCopy = async () => {
    if (result) {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `draft-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div>
        <h2 className={cn("text-2xl font-bold mb-2", theme.text.primary)}>
          {isStreaming ? 'Generating Draft...' : 'Review Generated Draft'}
        </h2>
        <p className={theme.text.secondary}>
          {isStreaming 
            ? 'AI is composing your document in real-time. This may take a moment.'
            : 'Review and edit the generated draft. You can save it to your case files when ready.'
          }
        </p>
      </div>

      {/* Streaming Indicator */}
      {isStreaming && (
        <div className={cn(
          "p-3 rounded-lg border flex items-center gap-3",
          "bg-blue-50 dark:bg-blue-950/20",
          "border-blue-200 dark:border-blue-800"
        )}>
          <Loader2 className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400" />
          <span className={cn("text-sm font-medium", theme.text.primary)}>
            AI is writing... {result.length} characters generated
          </span>
        </div>
      )}

      {/* Draft Text Area */}
      <div className="flex-1 min-h-[400px]">
        <textarea
          ref={textAreaRef}
          value={result}
          readOnly={isStreaming}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
            if (textAreaRef.current) {
              textAreaRef.current.value = e.target.value;
            }
          }}
          placeholder={isStreaming ? "Generating content..." : "Draft content will appear here"}
          className={cn(
            "w-full h-full px-4 py-3 rounded-lg border font-mono text-sm",
            theme.border.default,
            theme.surface.input,
            theme.text.primary,
            "focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            "placeholder:text-slate-400 dark:placeholder:text-slate-500",
            isStreaming && "animate-pulse"
          )}
        />
      </div>

      {/* Action Buttons */}
      {!isStreaming && result && (
        <>
          <div className={cn(
            "p-3 rounded-lg border",
            "bg-green-50 dark:bg-green-950/20",
            "border-green-200 dark:border-green-800"
          )}>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className={cn("text-sm font-medium", theme.text.primary)}>
                Draft complete! {result.length} characters generated.
              </span>
            </div>
          </div>

          <div className={cn("flex gap-3 pt-4 border-t", theme.border.default)}>
            <button
              onClick={handleCopy}
              className={cn(
                "px-4 py-2 rounded-lg border transition-colors",
                theme.border.default,
                theme.surface.raised,
                "hover:bg-slate-100 dark:hover:bg-slate-800",
                "flex items-center gap-2"
              )}
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className={theme.text.primary}>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span className={theme.text.primary}>Copy</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className={cn(
                "px-4 py-2 rounded-lg border transition-colors",
                theme.border.default,
                theme.surface.raised,
                "hover:bg-slate-100 dark:hover:bg-slate-800",
                "flex items-center gap-2"
              )}
            >
              <Download className="w-4 h-4" />
              <span className={theme.text.primary}>Download</span>
            </button>

            <button
              onClick={onSave}
              disabled={isSaving}
              className={cn(
                "flex-1 px-6 py-2 rounded-lg font-semibold transition-all",
                "flex items-center justify-center gap-2",
                isSaving
                  ? "bg-slate-400 dark:bg-slate-600 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg"
              )}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save to Case Files
                </>
              )}
            </button>
          </div>
        </>
      )}

      {/* Empty State */}
      {!isStreaming && !result && (
        <div className={cn(
          "flex-1 flex items-center justify-center",
          "border-2 border-dashed rounded-lg",
          theme.border.default
        )}>
          <div className="text-center py-12">
            <Sparkles className={cn("w-12 h-12 mx-auto mb-4", theme.text.tertiary)} />
            <p className={cn("text-lg font-medium", theme.text.secondary)}>
              Waiting for content generation...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
