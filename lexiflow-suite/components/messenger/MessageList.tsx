
import React, { useRef, useLayoutEffect } from 'react';
import { Conversation } from '../../hooks/useSecureMessenger.ts';
import { FileAttachment } from '../common/FileAttachment.tsx';
import { ChatBubble } from '../common/ChatBubble.tsx';

interface MessageListProps {
  conversation: Conversation;
  currentUserId: string;
  formatTime: (iso: string) => string;
}

export const MessageList: React.FC<MessageListProps> = ({ conversation, currentUserId, formatTime }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use layout effect to scroll before browser paint to avoid visual jumping (Principle 5/11)
  useLayoutEffect(() => {
    // Check if we are near bottom or if it's a new message from 'me' to auto-scroll
    // For simplicity in this demo, we auto-scroll on new messages.
    // In a real app, check `containerRef.current.scrollTop` vs `scrollHeight`.
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [conversation.messages]);

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-4 pt-8 bg-slate-50/30 scroll-smooth">
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
                <div key={i} className="mt-2">
                  <FileAttachment 
                    name={att.name} 
                    size={att.size} 
                    type={att.type} 
                    className={`border-none ${isMe ? 'bg-blue-700/50 text-white' : 'bg-slate-50'}`}
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
};
