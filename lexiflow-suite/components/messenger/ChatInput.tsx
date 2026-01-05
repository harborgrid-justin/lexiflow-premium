
import React, { useRef } from 'react';
import { Paperclip, Send, X, FileText, Clock } from 'lucide-react';
import { Attachment } from '../../hooks/useSecureMessenger.ts';

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
}

export const ChatInput: React.FC<ChatInputProps> = ({
  inputText, setInputText, pendingAttachments, setPendingAttachments,
  isPrivilegedMode, setIsPrivilegedMode, onSend, onFileSelect, draft, recipientName
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="p-4 bg-white border-t border-slate-200 shrink-0">
        {pendingAttachments.length > 0 && (
          <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
            {pendingAttachments.map((att, i) => (
              <div key={i} className="flex items-center bg-slate-100 rounded-full px-3 py-1 text-xs border border-slate-200 shrink-0">
                <FileText className="h-3 w-3 mr-2 text-slate-500"/>
                <span className="max-w-[100px] truncate">{att.name}</span>
                <button onClick={() => setPendingAttachments(prev => prev.filter((_, idx) => idx !== i))} className="ml-2 text-slate-400 hover:text-red-500">
                  <X className="h-3 w-3"/>
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-2">
            <label className="flex items-center text-xs text-slate-600 cursor-pointer select-none">
              <div className={`w-8 h-4 rounded-full p-0.5 transition-colors mr-2 ${isPrivilegedMode ? 'bg-amber-500' : 'bg-slate-300'}`} onClick={() => setIsPrivilegedMode(!isPrivilegedMode)}>
                <div className={`w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform ${isPrivilegedMode ? 'translate-x-4' : 'translate-x-0'}`}></div>
              </div>
              <span className={isPrivilegedMode ? 'font-bold text-amber-700' : ''}>Attorney-Client Privilege</span>
            </label>
          </div>
          {draft && <span className="text-[10px] text-slate-400 italic flex items-center"><Clock className="h-3 w-3 mr-1"/> Draft saved</span>}
        </div>

        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-2 py-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all shadow-sm">
          <input type="file" ref={fileInputRef} className="hidden" onChange={onFileSelect} />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-200 rounded-full transition-colors"
            title="Attach File"
          >
            <Paperclip className="h-5 w-5"/>
          </button>
          <input 
            className="flex-1 bg-transparent border-none outline-none text-sm px-2"
            placeholder={`Message ${recipientName}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSend()}
          />
          <button 
            onClick={onSend}
            disabled={!inputText.trim() && pendingAttachments.length === 0}
            className={`p-2 rounded-full transition-all ${inputText.trim() || pendingAttachments.length > 0 ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm' : 'bg-slate-200 text-slate-400'}`}
          >
            <Send className="h-5 w-5 ml-0.5"/>
          </button>
        </div>
      </div>
  );
}
