
import React, { useRef } from 'react';
import { Paperclip, Send, X, FileText, Clock, Sparkles, Loader2 } from 'lucide-react';
import { Attachment } from '../../hooks/useSecureMessenger';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

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

export const ChatInput: React.FC<ChatInputProps> = ({
  inputText, setInputText, pendingAttachments, setPendingAttachments,
  isPrivilegedMode, setIsPrivilegedMode, onSend, onFileSelect, draft, recipientName,
  onAiAssist, isAiThinking
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();

  return (
    <div className={cn("p-4 border-t shrink-0", theme.surface, theme.border.default)}>
        {pendingAttachments.length > 0 && (
          <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
            {pendingAttachments.map((att, i) => (
              <div key={i} className={cn("flex items-center rounded-full px-3 py-1 text-xs border shrink-0", theme.surfaceHighlight, theme.border.default)}>
                <FileText className={cn("h-3 w-3 mr-2", theme.text.secondary)}/>
                <span className={cn("max-w-[100px] truncate", theme.text.primary)}>{att.name}</span>
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
                className={cn("w-8 h-4 rounded-full p-0.5 transition-colors mr-2", isPrivilegedMode ? 'bg-amber-500' : 'bg-slate-300')} 
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
                    className={cn("text-[10px] flex items-center px-2 py-1 rounded bg-purple-50 text-purple-600 border border-purple-100 hover:bg-purple-100 transition-colors", isAiThinking ? "opacity-70" : "")}
                >
                    {isAiThinking ? <Loader2 className="h-3 w-3 animate-spin mr-1"/> : <Sparkles className="h-3 w-3 mr-1"/>}
                    {isAiThinking ? 'Thinking...' : 'Smart Reply'}
                </button>
             )}
             {draft && <span className={cn("text-[10px] italic flex items-center", theme.text.tertiary)}><Clock className="h-3 w-3 mr-1"/> Draft saved</span>}
          </div>
        </div>

        <div className={cn("flex items-center gap-2 border rounded-full px-2 py-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all shadow-sm", theme.surfaceHighlight, theme.border.default)}>
          <input type="file" ref={fileInputRef} className="hidden" onChange={onFileSelect} />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className={cn("p-2 rounded-full transition-colors", theme.text.tertiary, `hover:${theme.primary.text}`, `hover:${theme.surface}`)}
            title="Attach File"
          >
            <Paperclip className="h-5 w-5"/>
          </button>
          <input 
            className={cn("flex-1 bg-transparent border-none outline-none text-sm px-2 placeholder:text-slate-400", theme.text.primary)}
            placeholder={`Message ${recipientName}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSend()}
          />
          <button 
            onClick={onSend}
            disabled={!inputText.trim() && pendingAttachments.length === 0}
            className={cn("p-2 rounded-full transition-all", 
                inputText.trim() || pendingAttachments.length > 0 ? cn(theme.primary.DEFAULT, theme.text.inverse, "shadow-sm") : cn("bg-slate-200 dark:bg-slate-700", theme.text.tertiary)
            )}
          >
            <Send className="h-5 w-5 ml-0.5"/>
          </button>
        </div>
      </div>
  );
}
