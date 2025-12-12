/**
 * useChatMessages Hook
 * Real-time chat messaging with typing indicators and read receipts
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { websocketClient } from '../services/websocket/WebSocketClient';
import { WS_EVENTS } from '../services/websocket/eventHandlers';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachments?: Array<{
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
  }>;
  replyToId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  readBy?: string[];
}

interface UseChatMessagesOptions {
  conversationId: string;
  onMessage?: (message: ChatMessage) => void;
  onMessageUpdated?: (messageId: string, changes: Record<string, any>) => void;
  onMessageDeleted?: (messageId: string) => void;
  autoJoin?: boolean;
}

/**
 * Hook for real-time chat messaging
 *
 * @example
 * const { messages, sendMessage, isJoined } = useChatMessages({
 *   conversationId: 'conv-123',
 *   onMessage: (msg) => console.log('New message:', msg),
 *   autoJoin: true,
 * });
 */
export function useChatMessages(options: UseChatMessagesOptions) {
  const {
    conversationId,
    onMessage,
    onMessageUpdated,
    onMessageDeleted,
    autoJoin = true,
  } = options;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const callbacksRef = useRef({ onMessage, onMessageUpdated, onMessageDeleted });

  // Update callbacks ref
  useEffect(() => {
    callbacksRef.current = { onMessage, onMessageUpdated, onMessageDeleted };
  }, [onMessage, onMessageUpdated, onMessageDeleted]);

  // Join conversation
  const join = useCallback(() => {
    if (!conversationId || isJoined) return;

    console.log(`[useChatMessages] Joining conversation ${conversationId}`);
    websocketClient.emit('chat:join', { conversationId });
    setIsJoined(true);
  }, [conversationId, isJoined]);

  // Leave conversation
  const leave = useCallback(() => {
    if (!conversationId || !isJoined) return;

    console.log(`[useChatMessages] Leaving conversation ${conversationId}`);
    websocketClient.emit('chat:leave', { conversationId });
    setIsJoined(false);
  }, [conversationId, isJoined]);

  // Send message
  const sendMessage = useCallback(async (
    content: string,
    options?: {
      attachments?: any[];
      replyToId?: string;
      metadata?: Record<string, any>;
    }
  ) => {
    if (!isJoined || !content.trim()) {
      console.warn('[useChatMessages] Cannot send message - not joined or empty content');
      return null;
    }

    setIsSending(true);

    try {
      const tempId = `temp-${Date.now()}`;
      const response = await websocketClient.emitWithAck<{ success: boolean; messageId: string }>(
        'chat:message:send',
        {
          conversationId,
          content,
          attachments: options?.attachments,
          replyToId: options?.replyToId,
          metadata: { ...options?.metadata, tempId },
        }
      );

      setIsSending(false);
      return response.messageId;
    } catch (error) {
      console.error('[useChatMessages] Failed to send message:', error);
      setIsSending(false);
      return null;
    }
  }, [conversationId, isJoined]);

  // Mark message as read
  const markAsRead = useCallback((messageId: string) => {
    if (!isJoined) return;

    websocketClient.emit('chat:message:read', {
      conversationId,
      messageId,
    });
  }, [conversationId, isJoined]);

  // Delete message
  const deleteMessage = useCallback((messageId: string) => {
    if (!isJoined) return;

    websocketClient.emit('chat:message:delete', {
      conversationId,
      messageId,
    });
  }, [conversationId, isJoined]);

  // Edit message
  const editMessage = useCallback((messageId: string, newContent: string) => {
    if (!isJoined) return;

    websocketClient.emit('chat:message:edit', {
      conversationId,
      messageId,
      content: newContent,
    });
  }, [conversationId, isJoined]);

  // Add reaction
  const addReaction = useCallback((messageId: string, emoji: string) => {
    if (!isJoined) return;

    websocketClient.emit('chat:reaction:add', {
      conversationId,
      messageId,
      emoji,
    });
  }, [conversationId, isJoined]);

  // Remove reaction
  const removeReaction = useCallback((messageId: string, emoji: string) => {
    if (!isJoined) return;

    websocketClient.emit('chat:reaction:remove', {
      conversationId,
      messageId,
      emoji,
    });
  }, [conversationId, isJoined]);

  // Handle new message
  useEffect(() => {
    const handleNewMessage = (data: ChatMessage) => {
      if (data.conversationId === conversationId) {
        setMessages(prev => [...prev, data]);
        callbacksRef.current.onMessage?.(data);
      }
    };

    websocketClient.on(WS_EVENTS.CHAT_MESSAGE_NEW, handleNewMessage);
    return () => websocketClient.off(WS_EVENTS.CHAT_MESSAGE_NEW, handleNewMessage);
  }, [conversationId]);

  // Handle message updated
  useEffect(() => {
    const handleMessageUpdated = (data: {
      conversationId: string;
      messageId: string;
      changes: Record<string, any>;
    }) => {
      if (data.conversationId === conversationId) {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === data.messageId ? { ...msg, ...data.changes } : msg
          )
        );
        callbacksRef.current.onMessageUpdated?.(data.messageId, data.changes);
      }
    };

    websocketClient.on(WS_EVENTS.CHAT_MESSAGE_UPDATED, handleMessageUpdated);
    return () => websocketClient.off(WS_EVENTS.CHAT_MESSAGE_UPDATED, handleMessageUpdated);
  }, [conversationId]);

  // Handle message deleted
  useEffect(() => {
    const handleMessageDeleted = (data: {
      conversationId: string;
      messageId: string;
    }) => {
      if (data.conversationId === conversationId) {
        setMessages(prev => prev.filter(msg => msg.id !== data.messageId));
        callbacksRef.current.onMessageDeleted?.(data.messageId);
      }
    };

    websocketClient.on(WS_EVENTS.CHAT_MESSAGE_DELETED, handleMessageDeleted);
    return () => websocketClient.off(WS_EVENTS.CHAT_MESSAGE_DELETED, handleMessageDeleted);
  }, [conversationId]);

  // Handle message read
  useEffect(() => {
    const handleMessageRead = (data: {
      conversationId: string;
      messageId: string;
      userId: string;
    }) => {
      if (data.conversationId === conversationId) {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === data.messageId
              ? { ...msg, readBy: [...(msg.readBy || []), data.userId] }
              : msg
          )
        );
      }
    };

    websocketClient.on(WS_EVENTS.CHAT_MESSAGE_READ, handleMessageRead);
    return () => websocketClient.off(WS_EVENTS.CHAT_MESSAGE_READ, handleMessageRead);
  }, [conversationId]);

  // Auto-join
  useEffect(() => {
    if (autoJoin && conversationId && websocketClient.isConnected()) {
      join();
    }

    return () => {
      if (autoJoin && isJoined) {
        leave();
      }
    };
  }, [autoJoin, conversationId, join, leave, isJoined]);

  return {
    messages,
    isJoined,
    isSending,
    join,
    leave,
    sendMessage,
    markAsRead,
    deleteMessage,
    editMessage,
    addReaction,
    removeReaction,
  };
}

export default useChatMessages;
