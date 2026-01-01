/**
 * MessageList Component
 * Displays a list of messages in a conversation with thread view support
 */

import React, { useRef, useEffect } from 'react';
import type { Message } from '@/api/communications/messaging-api';
import { formatDistanceToNow } from 'date-fns';

export interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  onMessageClick?: (message: Message) => void;
  onReply?: (message: Message) => void;
  onEdit?: (message: Message) => void;
  onDelete?: (message: Message) => void;
  isLoading?: boolean;
  className?: string;
}

export function MessageList({
  messages,
  currentUserId,
  onMessageClick,
  onReply,
  onEdit,
  onDelete,
  isLoading = false,
  className = '',
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center p-12 text-center ${className}`}>
        <svg
          className="mb-4 h-16 w-16 text-gray-300 dark:text-gray-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <p className="text-sm text-gray-500 dark:text-gray-400">No messages yet</p>
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
          Start the conversation by sending a message
        </p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col space-y-4 overflow-y-auto p-4 ${className}`}>
      {messages.map((message, index) => {
        const isOwnMessage = message.senderId === currentUserId;
        const showAvatar = !isOwnMessage && (index === 0 || messages[index - 1].senderId !== message.senderId);
        const showName = !isOwnMessage && showAvatar;

        return (
          <div
            key={message.id}
            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            onClick={() => onMessageClick?.(message)}
          >
            <div className={`flex max-w-[70%] ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} gap-2`}>
              {/* Avatar */}
              {!isOwnMessage && (
                <div className="flex-shrink-0">
                  {showAvatar ? (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-medium text-white">
                      {message.senderName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  ) : (
                    <div className="h-8 w-8" />
                  )}
                </div>
              )}

              {/* Message Content */}
              <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                {/* Sender Name */}
                {showName && (
                  <p className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                    {message.senderName}
                  </p>
                )}

                {/* Message Bubble */}
                <div
                  className={`group relative rounded-lg px-4 py-2 ${
                    isOwnMessage
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100'
                  }`}
                >
                  {/* Reply indicator */}
                  {message.replyTo && (
                    <div className="mb-2 border-l-2 border-current pl-2 opacity-70">
                      <p className="text-xs">Replying to previous message</p>
                    </div>
                  )}

                  {/* Message content */}
                  <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p>

                  {/* Edited indicator */}
                  {message.isEdited && (
                    <span className="ml-2 text-xs opacity-70">(edited)</span>
                  )}

                  {/* Attachments */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {message.attachments.map((attachment) => (
                        <a
                          key={attachment.id}
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 rounded bg-black/10 px-2 py-1 text-xs hover:bg-black/20"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                            />
                          </svg>
                          <span className="truncate">{attachment.name}</span>
                          <span className="text-xs opacity-70">
                            ({(attachment.size / 1024).toFixed(1)} KB)
                          </span>
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Action buttons (visible on hover) */}
                  <div
                    className={`absolute ${
                      isOwnMessage ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'
                    } top-0 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100`}
                  >
                    {onReply && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onReply(message);
                        }}
                        className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-600 dark:hover:text-gray-300"
                        title="Reply"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                          />
                        </svg>
                      </button>
                    )}
                    {isOwnMessage && onEdit && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(message);
                        }}
                        className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-600 dark:hover:text-gray-300"
                        title="Edit"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                    )}
                    {isOwnMessage && onDelete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Are you sure you want to delete this message?')) {
                            onDelete(message);
                          }
                        }}
                        className="rounded p-1 text-gray-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                        title="Delete"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Timestamp and Status */}
                <div className="mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>
                    {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                  </span>
                  {isOwnMessage && (
                    <span className="flex items-center gap-1">
                      {message.status === 'sending' && (
                        <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      )}
                      {message.status === 'sent' && (
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {message.status === 'delivered' && (
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13l4 4L23 7" />
                        </svg>
                      )}
                      {message.status === 'read' && (
                        <svg className="h-3 w-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13l4 4L23 7" />
                        </svg>
                      )}
                      {message.status === 'failed' && (
                        <svg className="h-3 w-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}
