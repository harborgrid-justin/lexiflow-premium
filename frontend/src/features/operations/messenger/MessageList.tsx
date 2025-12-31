/**
 * @module components/messenger/MessageList
 * @category Messenger
 * @description Message list with auto-scroll and attachments.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { useRef, useEffect, memo } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/providers/ThemeContext';
import { Conversation } from '@/hooks/useSecureMessenger';

// Components
import { FileAttachment } from '@/components/ui/molecules/FileAttachment/FileAttachment';
import { ChatBubble } from '@/components/ui/molecules/ChatBubble/ChatBubble';

// Utils & Constants
import { cn } from '@/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface MessageListProps {
  conversation: Conversation;
  currentUserId: string;
  formatTime: (iso: string) => string;
}

export const MessageList = memo(function MessageList({ conversation, currentUserId, formatTime }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation.messages]);

  return (
    <div className={cn("flex-1 overflow-y-auto p-4 space-y-4 pt-8 scrollbar-thin", theme.surface.highlight)}>
        {conversation.messages.map((msg) => {
          const isMe = msg.senderId === currentUserId;
          return (
            <ChatBubble
              key={msg.id}
              text={msg.text}
              sender={isMe ? 'Me' : conversation.name}
              isMe={isMe}
              timestamp={formatTime(msg.timestamp)}
              status={msg.status}
              isPrivileged={msg.isPrivileged}
            >
              {msg.attachments && msg.attachments.map((att, i) => (
                <div key={`msg-${msg.id}-att-${att.name}-${i}`} className="mt-2 w-full max-w-sm">
                  <FileAttachment
                    name={att.name}
                    size={(typeof att.size === 'number' ? String(att.size) : att.size) as string | undefined}
                    type={att.type}
                    className={cn(isMe ? cn(theme.primary.light, "text-current border-blue-500/30") : theme.surface.default)}
                    variant="card"
                    onDownload={() => console.log('Downloading', att.name)}
                  />
                </div>
              ))}
            </ChatBubble>
          )
        })}
        <div ref={messagesEndRef} />
      </div>
  );
});
MessageList.displayName = 'MessageList';
