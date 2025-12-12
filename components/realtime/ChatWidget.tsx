import React, { useState, useRef, useEffect } from 'react';

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  avatarUrl?: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'file' | 'image' | 'system';
  isOwn?: boolean;
}

export interface ChatWidgetProps {
  roomId: string;
  messages: ChatMessage[];
  currentUserId: string;
  currentUserName: string;
  onSendMessage: (content: string) => void;
  onTyping?: (isTyping: boolean) => void;
  typingUsers?: string[];
  isConnected?: boolean;
  className?: string;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  roomId,
  messages,
  currentUserId,
  currentUserName,
  onSendMessage,
  onTyping,
  typingUsers = [],
  isConnected = true,
  className = '',
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);

    // Trigger typing indicator
    onTyping?.(true);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      onTyping?.(false);
    }, 1000);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim() || !isConnected) return;

    onSendMessage(inputValue.trim());
    setInputValue('');
    onTyping?.(false);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div
      className={`fixed bottom-4 right-4 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col ${isMinimized ? 'h-14' : 'h-[600px]'} transition-all duration-300 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-indigo-600 text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-gray-400'}`} />
          <h3 className="font-semibold">Team Chat</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="hover:bg-indigo-700 p-1 rounded"
          >
            {isMinimized ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 ${message.isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {!message.isOwn && (
                    <div className="flex-shrink-0">
                      {message.avatarUrl ? (
                        <img
                          src={message.avatarUrl}
                          alt={message.userName}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                          <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                            {message.userName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  <div className={`flex flex-col ${message.isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
                    {!message.isOwn && message.type !== 'system' && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {message.userName}
                      </span>
                    )}
                    {message.type === 'system' ? (
                      <div className="text-xs text-gray-500 dark:text-gray-400 italic text-center w-full">
                        {message.content}
                      </div>
                    ) : (
                      <div
                        className={`px-4 py-2 rounded-lg ${
                          message.isOwn
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                      </div>
                    )}
                    <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
            {typingUsers.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span>{typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={isConnected ? 'Type a message...' : 'Disconnected...'}
                disabled={!isConnected}
                className="flex-1 resize-none rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                rows={1}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || !isConnected}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatWidget;
