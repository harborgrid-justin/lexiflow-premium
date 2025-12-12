/**
 * useTypingIndicator Hook
 * Typing indicator for chat and collaborative editing
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { websocketClient } from '../services/websocket/WebSocketClient';
import { WS_EVENTS } from '../services/websocket/eventHandlers';

export interface TypingUser {
  userId: string;
  contextId: string;
  contextType: 'conversation' | 'document' | 'comment';
  timestamp: string;
}

interface UseTypingIndicatorOptions {
  contextId: string;
  contextType: 'conversation' | 'document' | 'comment';
  typingTimeout?: number; // milliseconds
}

/**
 * Hook for typing indicator functionality
 *
 * @example
 * const { typingUsers, setTyping } = useTypingIndicator({
 *   contextId: 'conv-123',
 *   contextType: 'conversation',
 * });
 *
 * // In input onChange:
 * setTyping(true);
 */
export function useTypingIndicator(options: UseTypingIndicatorOptions) {
  const {
    contextId,
    contextType,
    typingTimeout = 3000,
  } = options;

  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [isTyping, setIsTyping] = useState(false);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const userTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Set typing status
  const setTyping = useCallback((typing: boolean) => {
    if (isTyping === typing) return;

    setIsTyping(typing);

    // Emit typing status to server
    websocketClient.emit('presence:typing', {
      contextId,
      contextType,
      isTyping: typing,
    });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    // Set auto-stop timeout if typing
    if (typing) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        websocketClient.emit('presence:typing', {
          contextId,
          contextType,
          isTyping: false,
        });
      }, typingTimeout);
    }
  }, [contextId, contextType, isTyping, typingTimeout]);

  // Auto-trigger typing on text input
  const onInput = useCallback(() => {
    setTyping(true);
  }, [setTyping]);

  // Stop typing
  const stopTyping = useCallback(() => {
    setTyping(false);
  }, [setTyping]);

  // Add typing user
  const addTypingUser = useCallback((userId: string) => {
    setTypingUsers(prev => {
      const next = new Set(prev);
      next.add(userId);
      return next;
    });

    // Clear existing timeout for this user
    const existingTimeout = userTimeoutsRef.current.get(userId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Set auto-remove timeout
    const timeout = setTimeout(() => {
      setTypingUsers(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
      userTimeoutsRef.current.delete(userId);
    }, typingTimeout + 1000); // Add 1s buffer

    userTimeoutsRef.current.set(userId, timeout);
  }, [typingTimeout]);

  // Remove typing user
  const removeTypingUser = useCallback((userId: string) => {
    setTypingUsers(prev => {
      const next = new Set(prev);
      next.delete(userId);
      return next;
    });

    // Clear timeout
    const timeout = userTimeoutsRef.current.get(userId);
    if (timeout) {
      clearTimeout(timeout);
      userTimeoutsRef.current.delete(userId);
    }
  }, []);

  // Listen for typing start
  useEffect(() => {
    const handleTypingStart = (data: TypingUser) => {
      if (data.contextId === contextId && data.contextType === contextType) {
        addTypingUser(data.userId);
      }
    };

    websocketClient.on(WS_EVENTS.USER_TYPING, handleTypingStart);
    return () => websocketClient.off(WS_EVENTS.USER_TYPING, handleTypingStart);
  }, [contextId, contextType, addTypingUser]);

  // Listen for typing stop
  useEffect(() => {
    const handleTypingStop = (data: TypingUser) => {
      if (data.contextId === contextId && data.contextType === contextType) {
        removeTypingUser(data.userId);
      }
    };

    const event = WS_EVENTS.USER_TYPING.replace('typing', 'typing_stop');
    websocketClient.on(event, handleTypingStop);
    return () => websocketClient.off(event, handleTypingStop);
  }, [contextId, contextType, removeTypingUser]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Clear all user timeouts
      userTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      userTimeoutsRef.current.clear();

      // Stop typing on unmount
      if (isTyping) {
        websocketClient.emit('presence:typing', {
          contextId,
          contextType,
          isTyping: false,
        });
      }
    };
  }, [contextId, contextType, isTyping]);

  return {
    typingUsers: Array.from(typingUsers),
    isTyping,
    setTyping,
    onInput,
    stopTyping,
  };
}

export default useTypingIndicator;
