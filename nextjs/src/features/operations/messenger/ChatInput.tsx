/**
 * @module components/messenger/ChatInput
 * @category Messenger
 * @description Message input with attachments and AI assistance.
 *
 * VIEW-ONLY CONTRACT:
 * - Pure view component - all state managed by parent
 * - Props in (inputText, pendingAttachments, etc.) → JSX out
 * - No internal data fetching or subscriptions
 * - Side effects delegated to callbacks (onSend, onFileSelect, onAiAssist)
 * - Enables predictable hydration and safe reuse
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useRef, useEffect } from 'react';
import { Paperclip, Send, X, FileText, Clock, Sparkles, Loader2 } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/providers/ThemeContext';
import { Attachment } from '@/hooks/useSecureMessenger';

// Utils & Constants
import { cn } from '@/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface ChatInputProps {
  inputText: string;
  setInputText: (text: string) => void;
  pendingAttachments: Attachment[];
  setPendingAttachments: React.Dispatch<React.SetStateAction<Attachment[]>>;
  isPrivilegedMode: boolean;
  setIsPrivilegedMode: (mode: boolean) => void;
  onSend: () => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  draft?: string;
  recipientName: string;
  onAiAssist?: () => void;
  isAiThinking?: boolean;
}

export const ChatInput = ({
  inputText, setInputText, pendingAttachments, setPendingAttachments,
  isPrivilegedMode, setIsPrivilegedMode, onSend, onFileSelect, draft, recipientName,
  onAiAssist, isAiThinking
}: ChatInputProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { theme } = useTheme();

  // Effect discipline: Synchronize textarea height with content (Principle #6)
  // useLayoutEffect would block paint - useEffect is correct here (Principle #8)
  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
    // No cleanup needed - style mutation is idempotent
  }, [inputText]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          onSend();
      }
  };

  return (
    <div className={cn("p-4 border-t shrink-0", theme.surface.default, theme.border.default)}>
        {pendingAttachments.length > 0 && (
          <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
            {pendingAttachments.map((att, i) => (
              <div key={`attachment-${att.name}-${i}`} className={cn("flex items-center rounded-full px-3 py-1 text-xs border shrink-0", theme.surface.highlight, theme.border.default)}>")
                <FileText className={cn("h-3 w-3 mr-2", theme.text.secondary)}/>
                <span className={cn("max-w-[100px] truncate", theme.text.primary)}>{att.name}</span>
                {/* Concurrent-safe: Functional update prevents stale closures (Principle #5) */}
                <button onClick={() => setPendingAttachments(prev => prev.filter((_, idx) => idx !== i))} className={cn("ml-2 hover:text-rose-500", theme.text.tertiary)}>
                  <X className="h-3 w-3"/>
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-2">
            <label className={cn("flex items-center text-xs cursor-pointer select-none", theme.text.secondary)}>
              <div
                className={cn("w-8 h-4 rounded-full p-0.5 transition-colors mr-2", isPrivilegedMode ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-600')}
                onClick={() => setIsPrivilegedMode(!isPrivilegedMode)}
              >
                <div className={cn("w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform", isPrivilegedMode ? 'translate-x-4' : 'translate-x-0')}></div>
              </div>
              <span className={isPrivilegedMode ? 'font-bold text-amber-600' : ''}>Attorney-Client Privilege</span>
            </label>
          </div>
          <div className="flex items-center gap-2">
             {onAiAssist && !inputText && (
                <button
                    onClick={onAiAssist}
                    disabled={isAiThinking}
                    className={cn("text-[10px] flex items-center px-2 py-1 rounded border transition-colors", "bg-purple-50 text-purple-600 border-purple-100 hover:bg-purple-100", isAiThinking ? "opacity-70" : "")}
                >
                    {isAiThinking ? <Loader2 className="h-3 w-3 animate-spin mr-1"/> : <Sparkles className="h-3 w-3 mr-1"/>}
                    {isAiThinking ? 'Thinking...' : 'Smart Reply'}
                </button>
             )}
             {draft && <span className={cn("text-[10px] italic flex items-center", theme.text.tertiary)}><Clock className="h-3 w-3 mr-1"/> Draft saved</span>}
          </div>
        </div>

        <div className={cn("flex items-end gap-2 border rounded-xl px-2 py-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all shadow-sm", theme.surface.highlight, theme.border.default)}>
          <input type="file" ref={fileInputRef} className="hidden" onChange={onFileSelect} />
          <button
            onClick={() => fileInputRef.current?.click()}
            className={cn("p-2 rounded-full transition-colors mb-0.5", theme.text.tertiary, `hover:${theme.primary.text}`, `hover:${theme.surface.default}`)}
            title="Attach File"
          >
            <Paperclip className="h-5 w-5"/>
          </button>

          <textarea
            ref={textareaRef}
            className={cn("flex-1 bg-transparent border-none outline-none text-sm px-2 py-2 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none max-h-32 min-h-[36px]", theme.text.primary)}
            placeholder={`Message ${recipientName}...`}
            value={inputText}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />

          <button
            onClick={onSend}
            disabled={!inputText.trim() && pendingAttachments.length === 0}
            className={cn("p-2 rounded-full transition-all mb-0.5",
                inputText.trim() || pendingAttachments.length > 0 ? cn(theme.primary.DEFAULT, theme.text.inverse, "shadow-sm") : cn(theme.surface.default, theme.text.tertiary, theme.border.default, "border")
            )}
          >
            <Send className="h-5 w-5 ml-0.5"/>
          </button>
        </div>
      </div>
  );
}
