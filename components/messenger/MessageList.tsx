
import React, { useRef, useEffect, memo } from 'react';
import { Conversation } from '../../hooks/useSecureMessenger';
import { FileAttachment } from '../common/FileAttachment';
import { ChatBubble } from '../common/ChatBubble';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

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
    <div className={cn("flex-1 overflow-y-auto p-4 space-y-4 pt-8 scrollbar-thin", theme.surfaceHighlight)}>
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
                <div key={i} className="mt-2 w-full max-w-sm">
                  <FileAttachment 
                    name={att.name} 
                    size={att.size} 
                    type={att.type} 
                    className={cn(isMe ? "bg-blue-700/20 text-white border-blue-500/30" : theme.surface)}
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
