
import { Briefcase, MoreVertical, Plus, Search } from 'lucide-react';
import React from 'react';
import { Conversation } from '../../hooks/useSecureMessenger.ts';
import { Badge } from '../common/Badge.tsx';
import { Button } from '../common/Button.tsx';
import { UserAvatar } from '../common/UserAvatar.tsx';

interface MessengerChatListProps {
  conversations: Conversation[];
  activeConvId: string | null;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  handleSelectConversation: (id: string) => void;
  formatTime: (iso: string) => string;
  onNewChat: () => void;
}

export const MessengerChatList: React.FC<MessengerChatListProps> = ({
  conversations, activeConvId, searchTerm, setSearchTerm, handleSelectConversation, formatTime, onNewChat
}) => {
  return (
    <div style={{ backgroundColor: 'var(--color-background)' }} className="flex flex-col h-full">
      <div style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }} className="p-4 border-b">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Inbox</h2>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="p-2 text-slate-400 hover:text-slate-600"><MoreVertical className="h-5 w-5" /></Button>
            <Button variant="primary" size="sm" className="h-8 w-8 p-0 rounded-full flex items-center justify-center shadow-md hover:shadow-lg" onClick={onNewChat}>
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            style={{ backgroundColor: 'var(--color-surfaceHover)', borderColor: 'transparent', color: 'var(--color-text)' }}
            className="w-full pl-9 pr-4 py-2 border focus:bg-white focus:border-blue-300 focus:ring-4 focus:ring-blue-500/10 rounded-lg text-sm outline-none transition-all placeholder:text-slate-400 font-medium"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.map(conv => {
          const lastMsg = conv.messages[conv.messages.length - 1];
          const isActive = activeConvId === conv.id;

          return (
            <div
              key={conv.id}
              onClick={() => handleSelectConversation(conv.id)}
              className={`p-4 border-b border-slate-100 cursor-pointer transition-all group ${isActive ? 'bg-white border-l-4 border-l-blue-600 shadow-sm z-10 relative' : 'border-l-4 border-l-transparent hover:bg-slate-50'}`}
            >
              <div className="flex justify-between items-start mb-1.5">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="relative">
                    <UserAvatar name={conv.name} size="md" className={isActive ? 'ring-2 ring-blue-100' : ''} />
                    <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white shadow-sm ${conv.status === 'online' ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                  </div>
                  <div className="min-w-0">
                    <h4 className={`text-sm font-bold truncate ${conv.unread > 0 ? 'text-slate-900' : 'text-slate-700'}`}>{conv.name}</h4>
                    <p className="text-[10px] text-slate-500 truncate flex items-center font-medium uppercase tracking-wide mt-0.5">
                      {conv.isExternal && <Briefcase className="h-3 w-3 mr-1 text-amber-500" />}
                      {conv.role}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2 font-medium">{formatTime(lastMsg?.timestamp)}</span>
              </div>

              <div className="flex justify-between items-center mt-2 pl-11">
                <p className={`text-xs truncate max-w-[180px] leading-relaxed ${conv.unread > 0 ? 'text-slate-800 font-bold' : 'text-slate-500'}`}>
                  {conv.draft ? <span className="text-red-500 italic">Draft: {conv.draft}</span> : lastMsg?.text}
                </p>
                {conv.unread > 0 && (
                  <Badge variant="info" className="text-[9px] px-1.5 py-0.5 font-bold h-5 min-w-[20px] flex items-center justify-center rounded-full">
                    {conv.unread}
                  </Badge>
                )}
              </div>
            </div>
          );
        })}

        {conversations.length === 0 && (
          <div className="p-8 text-center text-slate-400">
            <p className="text-sm">No conversations found.</p>
            <Button variant="ghost" size="sm" className="mt-2 text-blue-600" onClick={onNewChat}>Start a new chat</Button>
          </div>
        )}
      </div>
    </div>
  );
};
