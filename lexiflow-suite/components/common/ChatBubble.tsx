
import React from 'react';
import { UserAvatar } from './UserAvatar.tsx';
import { Shield, CheckCheck, Check } from 'lucide-react';

interface ChatBubbleProps {
  text: string;
  sender: string;
  isMe: boolean;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
  isPrivileged?: boolean;
  children?: React.ReactNode;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ text, sender, isMe, timestamp, status, isPrivileged, children }) => {
  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} group/msg animate-fade-in-up`}>
      {!isMe && <UserAvatar name={sender} size="sm" className="mt-1 mr-2" />}
      <div className={`max-w-[85%] md:max-w-[70%]`}>
        {isPrivileged && (
          <div className="text-[10px] text-amber-600 font-bold mb-0.5 flex items-center justify-end">
            <Shield className="h-3 w-3 mr-1"/> PRIVILEGED
          </div>
        )}
        <div className={`p-3 rounded-2xl text-sm shadow-sm relative group ${
          isMe 
          ? 'bg-blue-600 text-white rounded-tr-none' 
          : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
        }`}>
          <div className="whitespace-pre-wrap">{text}</div>
          
          {children && <div className="mt-2 space-y-2">{children}</div>}

          <div className={`text-[10px] mt-1 flex items-center justify-end ${isMe ? 'text-blue-100' : 'text-slate-400'}`}>
            {timestamp}
            {isMe && status && (
              <span className="ml-1" title={status}>
                {status === 'read' ? <CheckCheck className="h-3 w-3"/> : status === 'delivered' ? <CheckCheck className="h-3 w-3 opacity-70"/> : <Check className="h-3 w-3"/>}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
