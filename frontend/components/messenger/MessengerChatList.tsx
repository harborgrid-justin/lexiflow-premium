
import React from 'react';
import { Conversation } from '../../hooks/useSecureMessenger';
import { Button } from '../common/Button';
import { SearchToolbar } from '../common/SearchToolbar';
import { MoreVertical } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { VirtualList } from '../common/VirtualList';
import { useWindow } from '../../context/WindowContext';
import { MessengerChatWindow } from './MessengerChatWindow';
import { ConversationRow } from './ConversationRow';

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
  const { openWindow } = useWindow();

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

  const renderRow = (conv: Conversation) => (
      <ConversationRow 
          key={conv.id}
          conv={conv}
          isActive={activeConvId === conv.id}
          onSelect={() => handleSelectConversation(conv.id)}
          onPopOut={(e) => handlePopOut(conv, e)}
          formatTime={formatTime}
      />
  );

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
