
import { AlertTriangle, ArrowLeft, Info, Lock, Phone, Video } from 'lucide-react';
import React from 'react';
import { Conversation } from '../../hooks/useSecureMessenger.ts';
import { Button } from '../common/Button.tsx';
import { UserAvatar } from '../common/UserAvatar.tsx';

interface ChatHeaderProps {
  conversation: Conversation;
  onBack: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ conversation, onBack }) => {
  return (
    <div style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }} className="h-16 px-4 md:px-6 border-b flex justify-between items-center shadow-sm z-10 relative shrink-0">
      <div className="flex items-center gap-3 overflow-hidden">
        <button onClick={onBack} style={{ color: 'var(--color-textMuted)' }} className="md:hidden p-2 -ml-2 hover:bg-slate-100 rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <UserAvatar name={conversation.name} />
        <div className="min-w-0">
          <h3 className="font-bold text-slate-900 flex items-center truncate text-sm md:text-base">
            {conversation.name}
            {conversation.isExternal && <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] rounded border border-amber-200 uppercase tracking-wide font-bold hidden sm:inline-block">External</span>}
          </h3>
          <div className="flex items-center text-xs text-green-600 font-medium truncate">
            <Lock className="h-3 w-3 mr-1" /> <span className="hidden sm:inline">End-to-End</span> Encrypted
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 md:gap-2">
        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-blue-600 px-2"><Phone className="h-5 w-5" /></Button>
        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-blue-600 px-2"><Video className="h-5 w-5" /></Button>
        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-blue-600 px-2"><Info className="h-5 w-5" /></Button>
      </div>

      {conversation.isExternal && (
        <div className="absolute top-full left-0 right-0 bg-amber-50 border-b border-amber-100 px-4 py-1 flex justify-center items-center text-[10px] text-amber-800 font-medium z-0">
          <AlertTriangle className="h-3 w-3 mr-2" />
          External Recipient. Do not share credentials.
        </div>
      )}
    </div>
  );
};
