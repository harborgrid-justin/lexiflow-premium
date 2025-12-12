import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Paperclip, Smile, MoreVertical, Phone, Video, Info } from 'lucide-react';
import { chatService, Message, Attachment } from '../../services/chatService';
import { UserPresence } from './UserPresence';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

/**
 * ChatWindow Component
 *
 * Real-time chat interface with WebSocket integration
 * Features:
 * - Real-time message delivery
 * - Typing indicators
 * - Read receipts
 * - File attachments
 * - Auto-scroll to latest message
 * - Online presence indicators
 */

interface ChatWindowProps {
  conversationId: string;
  title: string;
  participantIds: string[];
  currentUserId: string;
  onClose?: () => void;
  className?: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversationId,
  title,
  participantIds,
  currentUserId,
  onClose,
  className,
}) => {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Join conversation on mount
  useEffect(() => {
    chatService.joinConversation(conversationId).catch((error) => {
      console.error('[ChatWindow] Failed to join conversation:', error);
    });

    return () => {
      chatService.leaveConversation(conversationId).catch((error) => {
        console.error('[ChatWindow] Failed to leave conversation:', error);
      });
    };
  }, [conversationId]);

  // Subscribe to new messages
  useEffect(() => {
    const unsubscribe = chatService.onMessage((message) => {
      if (message.conversationId === conversationId) {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();

        // Mark as read if not from current user
        if (message.senderId !== currentUserId) {
          chatService.markAsRead(message.id, conversationId);
        }
      }
    });

    return unsubscribe;
  }, [conversationId, currentUserId, scrollToBottom]);

  // Subscribe to typing indicators
  useEffect(() => {
    const unsubscribe = chatService.onTyping((data) => {
      if (data.conversationId === conversationId) {
        if (data.userId !== currentUserId) {
          setTypingUsers((prev) => new Set(prev).add(data.userId));

          // Remove typing indicator after 3 seconds
          setTimeout(() => {
            setTypingUsers((prev) => {
              const newSet = new Set(prev);
              newSet.delete(data.userId);
              return newSet;
            });
          }, 3000);
        }
      }
    });

    return unsubscribe;
  }, [conversationId, currentUserId]);

  // Handle input change with typing indicator
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInputText(e.target.value);

      if (!isTyping && e.target.value.length > 0) {
        setIsTyping(true);
        chatService.startTyping(conversationId);
      }

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        chatService.stopTyping(conversationId);
      }, 2000);
    },
    [conversationId, isTyping],
  );

  // Send message
  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim() && attachments.length === 0) return;

    try {
      await chatService.sendMessage(conversationId, inputText, {
        attachments: attachments.length > 0 ? attachments : undefined,
      });

      setInputText('');
      setAttachments([]);
      setIsTyping(false);
      chatService.stopTyping(conversationId);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      inputRef.current?.focus();
    } catch (error) {
      console.error('[ChatWindow] Failed to send message:', error);
    }
  }, [conversationId, inputText, attachments]);

  // Handle Enter key
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage],
  );

  // Handle file selection
  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      setIsUploading(true);

      try {
        const uploadedAttachments: Attachment[] = [];

        for (const file of Array.from(files)) {
          const attachment = await chatService.uploadFile(conversationId, file, (progress) => {
            console.log(`Upload progress: ${progress}%`);
          });
          uploadedAttachments.push(attachment);
        }

        setAttachments((prev) => [...prev, ...uploadedAttachments]);
      } catch (error) {
        console.error('[ChatWindow] Failed to upload file:', error);
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [conversationId],
  );

  // Format timestamp
  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={cn('flex flex-col h-full', theme.surface.default, className)}>
      {/* Header */}
      <div className={cn('p-4 border-b flex items-center justify-between', theme.border.default)}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-semibold">
              {title.charAt(0).toUpperCase()}
            </div>
            {participantIds.length === 1 && (
              <UserPresence userId={participantIds[0]} size="sm" position="bottom-right" />
            )}
          </div>
          <div>
            <h3 className={cn('font-semibold', theme.text.primary)}>{title}</h3>
            {typingUsers.size > 0 && (
              <p className={cn('text-xs', theme.text.tertiary)}>typing...</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className={cn('p-2 rounded-lg hover:' + theme.surfaceHighlight, theme.text.secondary)}
          >
            <Phone className="h-5 w-5" />
          </button>
          <button
            className={cn('p-2 rounded-lg hover:' + theme.surfaceHighlight, theme.text.secondary)}
          >
            <Video className="h-5 w-5" />
          </button>
          <button
            className={cn('p-2 rounded-lg hover:' + theme.surfaceHighlight, theme.text.secondary)}
          >
            <Info className="h-5 w-5" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className={cn('p-2 rounded-lg hover:' + theme.surfaceHighlight, theme.text.secondary)}
            >
              <MoreVertical className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isMe = message.senderId === currentUserId;

          return (
            <div key={message.id} className={cn('flex', isMe ? 'justify-end' : 'justify-start')}>
              <div className={cn('max-w-[70%]', isMe ? 'items-end' : 'items-start')}>
                <div
                  className={cn(
                    'px-4 py-2 rounded-2xl',
                    isMe
                      ? cn(theme.primary.bg, 'text-white')
                      : cn(theme.surfaceHighlight, theme.text.primary),
                  )}
                >
                  {message.content && <p className="text-sm">{message.content}</p>}

                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {message.attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className={cn(
                            'p-2 rounded-lg flex items-center gap-2',
                            isMe ? 'bg-white/10' : theme.surface.default,
                          )}
                        >
                          <Paperclip className="h-4 w-4" />
                          <span className="text-xs flex-1">{attachment.name}</span>
                          <span className="text-xs opacity-75">
                            {(attachment.size / 1024).toFixed(0)} KB
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className={cn('flex items-center gap-2 mt-1 px-2')}>
                  <span className={cn('text-xs', theme.text.tertiary)}>
                    {formatTime(message.createdAt)}
                  </span>
                  {isMe && message.read && (
                    <span className={cn('text-xs', theme.primary.text)}>Read</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {typingUsers.size > 0 && (
          <div className="flex justify-start">
            <div className={cn('px-4 py-2 rounded-2xl', theme.surfaceHighlight)}>
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className={cn('px-4 py-2 border-t', theme.border.default)}>
          <div className="flex gap-2 overflow-x-auto">
            {attachments.map((attachment, index) => (
              <div
                key={attachment.id}
                className={cn('p-2 rounded-lg flex items-center gap-2', theme.surfaceHighlight)}
              >
                <Paperclip className="h-4 w-4" />
                <span className="text-xs">{attachment.name}</span>
                <button
                  onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== index))}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className={cn('p-4 border-t', theme.border.default)}>
        <div className="flex items-end gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className={cn('p-2 rounded-lg hover:' + theme.surfaceHighlight, theme.text.secondary)}
          >
            <Paperclip className="h-5 w-5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />

          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              rows={1}
              className={cn(
                'w-full px-4 py-2 rounded-lg border resize-none focus:outline-none focus:ring-2',
                theme.surface.default,
                theme.border.default,
                theme.text.primary,
                theme.primary.border,
              )}
              style={{ maxHeight: '120px' }}
            />
          </div>

          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() && attachments.length === 0}
            className={cn(
              'p-2 rounded-lg transition-colors',
              inputText.trim() || attachments.length > 0
                ? cn(theme.primary.bg, 'text-white')
                : cn(theme.surfaceHighlight, theme.text.tertiary),
            )}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
