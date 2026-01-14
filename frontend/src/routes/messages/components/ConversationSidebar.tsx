/**
 * ConversationSidebar Component
 * Displays a list of conversations with search and filtering
 */

import type { Conversation } from '@/api/communications/messaging-api';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';

export interface ConversationSidebarProps {
  conversations: Conversation[];
  activeConversationId?: string;
  onSelectConversation: (conversation: Conversation) => void;
  onNewConversation?: () => void;
  onArchive?: (conversation: Conversation) => void;
  onPin?: (conversation: Conversation) => void;
  onMute?: (conversation: Conversation) => void;
  isLoading?: boolean;
  className?: string;
}

export function ConversationSidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onArchive,
  onPin,
  onMute,
  isLoading = false,
  className = '',
}: ConversationSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'pinned' | 'archived'>('all');

  // Filter conversations
  const filteredConversations = conversations.filter((conversation) => {
    // Search filter
    const matchesSearch =
      !searchQuery ||
      conversation.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversation.participants.some((p) => p.userName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      conversation.lastMessage?.content.toLowerCase().includes(searchQuery.toLowerCase());

    // Type filter
    const matchesFilter =
      filter === 'all' ||
      (filter === 'unread' && conversation.unreadCount > 0) ||
      (filter === 'pinned' && conversation.isPinned) ||
      (filter === 'archived' && conversation.isArchived);

    return matchesSearch && matchesFilter;
  });

  // Sort conversations: pinned first, then by last message time
  const sortedConversations = [...filteredConversations].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;

    const aTime = a.lastMessage?.createdAt || a.createdAt;
    const bTime = b.lastMessage?.createdAt || b.createdAt;
    return new Date(bTime).getTime() - new Date(aTime).getTime();
  });

  const getConversationName = (conversation: Conversation): string => {
    if (conversation.name) return conversation.name;
    if (conversation.type === 'case' && conversation.caseId) return `Case: ${conversation.caseId}`;
    if (conversation.type === 'matter' && conversation.matterId) return `Matter: ${conversation.matterId}`;
    return conversation.participants.map((p) => p.userName).join(', ') || 'Unnamed Conversation';
  };

  const getConversationAvatar = (conversation: Conversation): string | null => {
    if (conversation.type === 'direct' && conversation.participants.length === 1) {
      return conversation.participants[0]?.userAvatar || null;
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className={`flex h-full flex-col bg-white dark:bg-gray-800 ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-4 dark:border-gray-700">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Messages</h2>
          {onNewConversation && (
            <button
              onClick={onNewConversation}
              className="rounded-lg bg-blue-600 p-2 text-white hover:bg-blue-700"
              title="New conversation"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
          />
          <svg
            className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Filters */}
        <div className="mt-3 flex gap-1">
          {(['all', 'unread', 'pinned', 'archived'] as const).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`rounded-md px-3 py-1 text-xs font-medium capitalize ${filter === filterType
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
            >
              {filterType}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {sortedConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <svg
              className="mb-3 h-12 w-12 text-gray-300 dark:text-gray-600"
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
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedConversations.map((conversation) => {
              const isActive = conversation.id === activeConversationId;
              const avatar = getConversationAvatar(conversation);
              const name = getConversationName(conversation);
              const onlineCount = conversation.participants.filter((p) => p.isOnline).length;
              const typingUsers = conversation.participants.filter((p) => p.isTyping);

              return (
                <div
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation)}
                  className={`group relative cursor-pointer p-4 transition-colors ${isActive
                    ? 'bg-blue-50 dark:bg-blue-900/20'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                >
                  <div className="flex gap-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {avatar ? (
                        <img src={avatar} alt={name} className="h-12 w-12 rounded-full" />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white">
                          {conversation.type === 'group' ? (
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                              />
                            </svg>
                          ) : conversation.type === 'case' ? (
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                              />
                            </svg>
                          ) : (
                            <span className="text-lg font-medium">{name.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                      )}
                      {onlineCount > 0 && (
                        <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-gray-800"></div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h3 className={`truncate text-sm font-semibold ${conversation.unreadCount > 0 ? 'text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'
                            }`}>
                            {name}
                          </h3>
                          {conversation.isPinned && (
                            <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
                            </svg>
                          )}
                          {conversation.isMuted && (
                            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                              />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                            </svg>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {conversation.lastMessage
                            ? formatDistanceToNow(new Date(conversation.lastMessage.createdAt), { addSuffix: true })
                            : ''}
                        </span>
                      </div>

                      {/* Last message or typing indicator */}
                      {typingUsers.length > 0 ? (
                        <p className="mt-1 truncate text-sm italic text-blue-600 dark:text-blue-400">
                          {typingUsers[0]?.userName} is typing...
                        </p>
                      ) : conversation.lastMessage ? (
                        <p className={`mt-1 truncate text-sm ${conversation.unreadCount > 0
                          ? 'font-medium text-gray-900 dark:text-gray-100'
                          : 'text-gray-600 dark:text-gray-400'
                          }`}>
                          {conversation.lastMessage.senderId !== 'current-user' && (
                            <span>{conversation.lastMessage.senderName}: </span>
                          )}
                          {conversation.lastMessage.content}
                        </p>
                      ) : (
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">No messages yet</p>
                      )}

                      {/* Unread badge */}
                      {conversation.unreadCount > 0 && (
                        <div className="mt-1">
                          <span className="inline-flex items-center rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
                            {conversation.unreadCount}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action buttons (visible on hover) */}
                  <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    {onPin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPin(conversation);
                        }}
                        className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-600 dark:hover:text-gray-300"
                        title={conversation.isPinned ? 'Unpin' : 'Pin'}
                      >
                        <svg className="h-4 w-4" fill={conversation.isPinned ? 'currentColor' : 'none'} viewBox="0 0 20 20" stroke="currentColor">
                          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
                        </svg>
                      </button>
                    )}
                    {onMute && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMute(conversation);
                        }}
                        className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-600 dark:hover:text-gray-300"
                        title={conversation.isMuted ? 'Unmute' : 'Mute'}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={conversation.isMuted ? "M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" : "M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"}
                          />
                        </svg>
                      </button>
                    )}
                    {onArchive && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onArchive(conversation);
                        }}
                        className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-600 dark:hover:text-gray-300"
                        title={conversation.isArchived ? 'Unarchive' : 'Archive'}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
