import React from 'react';
import { Conversation } from '../../hooks/useSecureMessenger';
import { UserAvatar } from '../common/UserAvatar';
import { Button } from '../common/Button';
import { SearchToolbar } from '../common/SearchToolbar';
import { MoreVertical, Briefcase, ExternalLink } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { VirtualList } from '../common/VirtualList';
import { useWindow } from '../../context/WindowContext';
import { MessengerChatWindow } from './MessengerChatWindow';

interface MessengerChatListProps {
  conversations: Conversation[];
  activeConvId: string | null;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  handleSelectConversation: (id: string) => void;
  formatTime: (iso: string) => string;
}

export const MessengerChatList: React.FC<MessengerChatListProps> = ({
  conversations, activeConvId, searchTerm, setSearchTerm, handleSelectConversation, formatTime
}) => {
  const { theme } = useTheme();
  const { openWindow, closeWindow } = useWindow();

  const handlePopOut = (conv: Conversation, e: React.MouseEvent) => {
      e.stopPropagation();
      const winId = `chat-${conv.id}`;
      openWindow(
          winId,
          `Chat: ${conv.name}`,
          <MessengerChatWindow 
            activeConversation={conv}
            activeConvId={conv.id}
            setActiveConvId={() => {}} // No-op for detached window
            inputText=""
            setInputText={() => {}}
            pendingAttachments={[]}
            setPendingAttachments={() => {}}
            isPrivilegedMode={false}
            setIsPrivilegedMode={() => {}}
            handleSendMessage={() => {}} // Mock
            handleFileSelect={() => {}} // Mock
            formatTime={formatTime}
          />
      );
  };

  const renderRow = (conv: Conversation) => {
    const lastMsg = conv.messages[conv.messages.length - 1];
    const isActive = activeConvId === conv.id;

    return (
      <div
        key={conv.id} 
        style={{ height: 88 }}
        onClick={() => handleSelectConversation(conv.id)}
        className={cn(
          "p-4 border-b border-l-4 cursor-pointer transition-all group flex flex-col justify-center",
          theme.border.light,
          isActive 
              ? cn(theme.surface, "border-l-blue-600 shadow-sm") 
              : cn("bg-transparent border-l-transparent", `hover:${theme.surfaceHighlight}`)
        )}
      >
        <div className="flex justify-between items-start mb-1">
          <div className="flex items-center space-x-3 overflow-hidden">
            <UserAvatar name={conv.name} size="md" indicatorStatus={conv.status as any} />
            <div className="min-w-0">
              <h4 className={cn("text-sm font-bold truncate", conv.unread > 0 ? theme.text.primary : theme.text.secondary)}>{conv.name}</h4>
              <p className={cn("text-xs truncate flex items-center", theme.text.tertiary)}>
                {conv.isExternal && <Briefcase className="h-3 w-3 mr-1 text-amber-500"/>}
                {conv.role}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
              <span className={cn("text-[10px] whitespace-nowrap ml-2", theme.text.tertiary)}>{formatTime(lastMsg?.timestamp)}</span>
              <button 
                  onClick={(e) => handlePopOut(conv, e)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-blue-600"
                  title="Pop Out Chat"
              >
                  <ExternalLink className="h-3 w-3"/>
              </button>
          </div>
        </div>
        <div className="flex justify-between items-center pl-12">
          <p className={cn(
              "text-sm truncate max-w-[180px]", 
              conv.draft ? "text-rose-500 italic" : (conv.unread > 0 ? theme.text.primary : theme.text.secondary)
          )}>
            {conv.draft ? `Draft: ${conv.draft}` : lastMsg?.text}
          </p>
          {conv.unread > 0 && (
            <span className="h-5 w-5 bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-sm">
              {conv.unread}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className={cn("p-4 border-b shrink-0", theme.border.default)}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={cn("text-lg font-bold", theme.text.primary)}>Inbox</h2>
          <div className="flex gap-2">
            <Button variant="ghost" size="xs" icon={MoreVertical} className="p-2"/>
            <Button variant="primary" size="xs" className="rounded-full w-7 h-7 p-0 flex items-center justify-center">+</Button>
          </div>
        </div>
        <SearchToolbar 
            value={searchTerm} 
            onChange={setSearchTerm} 
            placeholder="Search messages..." 
            className="p-0 border-none shadow-none bg-transparent"
        />
      </div>

      <div className="flex-1 min-h-0 relative">
        <VirtualList 
            items={conversations}
            height="100%"
            itemHeight={88}
            renderItem={renderRow}
            emptyMessage="No conversations found."
        />
      </div>
    </div>
  );
};
