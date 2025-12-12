import React, { useState, useEffect, useMemo } from 'react';
import { Search, MessageSquare, Archive, Pin, MoreVertical } from 'lucide-react';
import { chatService, Message } from '../../services/chatService';
import { UserPresence } from './UserPresence';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

/**
 * ConversationList Component
 *
 * Displays a list of conversations with real-time updates
 * Features:
 * - Real-time message updates
 * - Unread message badges
 * - Search/filter conversations
 * - Online presence indicators
 * - Pin conversations
 * - Archive conversations
 */

export interface ConversationItem {
  id: string;
  title: string;
  avatar?: string;
  participantIds: string[];
  lastMessage?: {
    text: string;
    timestamp: string;
    senderId: string;
  };
  unreadCount: number;
  isPinned: boolean;
  isArchived: boolean;
  type: 'direct' | 'group';
}

interface ConversationListProps {
  conversations: ConversationItem[];
  activeConversationId?: string;
  currentUserId: string;
  onSelectConversation: (conversationId: string) => void;
  onArchiveConversation?: (conversationId: string) => void;
  onPinConversation?: (conversationId: string) => void;
  className?: string;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversationId,
  currentUserId,
  onSelectConversation,
  onArchiveConversation,
  onPinConversation,
  className,
}) => {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all');
  const [localConversations, setLocalConversations] = useState<ConversationItem[]>(conversations);

  // Update local conversations when prop changes
  useEffect(() => {
    setLocalConversations(conversations);
  }, [conversations]);

  // Subscribe to new messages to update conversation list
  useEffect(() => {
    const unsubscribe = chatService.onMessage((message: Message) => {
      setLocalConversations((prev) =>
        prev.map((conv) =>
          conv.id === message.conversationId
            ? {
                ...conv,
                lastMessage: {
                  text: message.content,
                  timestamp: message.createdAt,
                  senderId: message.senderId,
                },
                unreadCount:
                  message.senderId !== currentUserId
                    ? conv.unreadCount + 1
                    : conv.unreadCount,
              }
            : conv,
        ),
      );
    });

    return unsubscribe;
  }, [currentUserId]);

  // Filter conversations
  const filteredConversations = useMemo(() => {
    let filtered = localConversations;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((conv) =>
        conv.title.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Apply status filter
    if (filter === 'unread') {
      filtered = filtered.filter((conv) => conv.unreadCount > 0);
    } else if (filter === 'archived') {
      filtered = filtered.filter((conv) => conv.isArchived);
    } else {
      filtered = filtered.filter((conv) => !conv.isArchived);
    }

    // Sort: pinned first, then by last message timestamp
    return filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      const aTime = a.lastMessage?.timestamp || '';
      const bTime = b.lastMessage?.timestamp || '';
      return bTime.localeCompare(aTime);
    });
  }, [localConversations, searchTerm, filter]);

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handlePinConversation = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    if (onPinConversation) {
      onPinConversation(conversationId);
      setLocalConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId ? { ...conv, isPinned: !conv.isPinned } : conv,
        ),
      );
    }
  };

  const handleArchiveConversation = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    if (onArchiveConversation) {
      onArchiveConversation(conversationId);
      setLocalConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId ? { ...conv, isArchived: !conv.isArchived } : conv,
        ),
      );
    }
  };

  return (
    <div className={cn('flex flex-col h-full', theme.surface.default, className)}>
      {/* Header */}
      <div className={cn('p-4 border-b', theme.border.default)}>
        <h2 className={cn('text-xl font-bold mb-4', theme.text.primary)}>Messages</h2>

        {/* Search */}
        <div className="relative mb-4">
          <Search
            className={cn('absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4', theme.text.tertiary)}
          />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={cn(
              'w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2',
              theme.surface.default,
              theme.border.default,
              theme.text.primary,
              theme.primary.border,
            )}
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              filter === 'all'
                ? cn(theme.primary.bg, 'text-white')
                : cn(theme.surfaceHighlight, theme.text.secondary),
            )}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              filter === 'unread'
                ? cn(theme.primary.bg, 'text-white')
                : cn(theme.surfaceHighlight, theme.text.secondary),
            )}
          >
            Unread
            {localConversations.filter((c) => c.unreadCount > 0).length > 0 && (
              <span className="ml-1">
                ({localConversations.filter((c) => c.unreadCount > 0).length})
              </span>
            )}
          </button>
          <button
            onClick={() => setFilter('archived')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              filter === 'archived'
                ? cn(theme.primary.bg, 'text-white')
                : cn(theme.surfaceHighlight, theme.text.secondary),
            )}
          >
            Archived
          </button>
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className={cn('p-8 text-center', theme.text.tertiary)}>
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">
              {searchTerm
                ? 'No conversations found'
                : filter === 'unread'
                  ? 'No unread messages'
                  : filter === 'archived'
                    ? 'No archived conversations'
                    : 'No conversations yet'}
            </p>
          </div>
        ) : (
          filteredConversations.map((conversation) => {
            const isActive = conversation.id === activeConversationId;
            const isUnread = conversation.unreadCount > 0;

            return (
              <div
                key={conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
                className={cn(
                  'p-4 border-b cursor-pointer transition-colors group',
                  theme.border.light,
                  isActive ? theme.primary.light : 'hover:' + theme.surfaceHighlight,
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    {conversation.avatar ? (
                      <img
                        src={conversation.avatar}
                        alt={conversation.title}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {conversation.title.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {conversation.type === 'direct' && conversation.participantIds.length > 0 && (
                      <UserPresence
                        userId={conversation.participantIds[0]}
                        size="md"
                        position="bottom-right"
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3
                        className={cn(
                          'font-semibold truncate',
                          isUnread ? theme.text.primary : theme.text.secondary,
                        )}
                      >
                        {conversation.title}
                        {conversation.isPinned && (
                          <Pin className="inline-block h-3 w-3 ml-1 text-blue-500" />
                        )}
                      </h3>
                      {conversation.lastMessage && (
                        <span className={cn('text-xs flex-shrink-0 ml-2', theme.text.tertiary)}>
                          {formatTimestamp(conversation.lastMessage.timestamp)}
                        </span>
                      )}
                    </div>

                    {conversation.lastMessage && (
                      <div className="flex items-center justify-between">
                        <p
                          className={cn(
                            'text-sm truncate',
                            isUnread ? theme.text.secondary : theme.text.tertiary,
                          )}
                        >
                          {conversation.lastMessage.senderId === currentUserId && 'You: '}
                          {conversation.lastMessage.text}
                        </p>

                        <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                          {isUnread && (
                            <span className="h-5 min-w-[20px] px-1.5 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                              {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => handlePinConversation(e, conversation.id)}
                        className={cn(
                          'p-1 rounded hover:' + theme.surfaceHighlight,
                          conversation.isPinned ? 'text-blue-500' : theme.text.tertiary,
                        )}
                        title={conversation.isPinned ? 'Unpin' : 'Pin'}
                      >
                        <Pin className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => handleArchiveConversation(e, conversation.id)}
                        className={cn(
                          'p-1 rounded hover:' + theme.surfaceHighlight,
                          theme.text.tertiary,
                        )}
                        title="Archive"
                      >
                        <Archive className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ConversationList;
