/**
 * useDocumentSync Hook
 * Real-time document synchronization for collaborative editing
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { websocketClient } from '../services/websocket/WebSocketClient';
import { WS_EVENTS } from '../services/websocket/eventHandlers';

export interface DocumentChange {
  documentId: string;
  userId: string;
  changeType: 'insert' | 'delete' | 'update';
  changes: any;
  timestamp: string;
}

export interface DocumentUpdate {
  documentId: string;
  changes: Record<string, any>;
  updatedBy: string;
  timestamp: string;
}

export interface DocumentProcessing {
  documentId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress?: number;
  message?: string;
  timestamp: string;
}

export interface ActiveUser {
  userId: string;
  cursor?: { x: number; y: number };
  selection?: { start: number; end: number };
  lastActivity: string;
}

interface UseDocumentSyncOptions {
  documentId: string;
  onUpdate?: (update: DocumentUpdate) => void;
  onChange?: (change: DocumentChange) => void;
  onProcessing?: (status: DocumentProcessing) => void;
  onUserJoin?: (userId: string) => void;
  onUserLeave?: (userId: string) => void;
  autoSubscribe?: boolean;
}

/**
 * Hook for real-time document synchronization
 *
 * @example
 * const { activeUsers, sendChange, isSubscribed } = useDocumentSync({
 *   documentId: 'doc-123',
 *   onChange: (change) => applyChange(change),
 *   autoSubscribe: true,
 * });
 */
export function useDocumentSync(options: UseDocumentSyncOptions) {
  const {
    documentId,
    onUpdate,
    onChange,
    onProcessing,
    onUserJoin,
    onUserLeave,
    autoSubscribe = true,
  } = options;

  const [activeUsers, setActiveUsers] = useState<Map<string, ActiveUser>>(new Map());
  const [latestUpdate, setLatestUpdate] = useState<DocumentUpdate | null>(null);
  const [processingStatus, setProcessingStatus] = useState<DocumentProcessing | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const callbacksRef = useRef({ onUpdate, onChange, onProcessing, onUserJoin, onUserLeave });

  // Update callbacks ref
  useEffect(() => {
    callbacksRef.current = { onUpdate, onChange, onProcessing, onUserJoin, onUserLeave };
  }, [onUpdate, onChange, onProcessing, onUserJoin, onUserLeave]);

  // Subscribe to document
  const subscribe = useCallback(() => {
    if (!documentId || isSubscribed) return;

    console.log(`[useDocumentSync] Subscribing to document ${documentId}`);
    websocketClient.emit('document:subscribe', { documentId });
    setIsSubscribed(true);
  }, [documentId, isSubscribed]);

  // Unsubscribe from document
  const unsubscribe = useCallback(() => {
    if (!documentId || !isSubscribed) return;

    console.log(`[useDocumentSync] Unsubscribing from document ${documentId}`);
    websocketClient.emit('document:unsubscribe', { documentId });
    setIsSubscribed(false);
    setActiveUsers(new Map());
  }, [documentId, isSubscribed]);

  // Send collaborative change
  const sendChange = useCallback((change: Omit<DocumentChange, 'documentId' | 'timestamp'>) => {
    if (!isSubscribed) {
      console.warn('[useDocumentSync] Cannot send change - not subscribed');
      return;
    }

    websocketClient.emit('document:change', {
      documentId,
      ...change,
      timestamp: new Date().toISOString(),
    });
  }, [documentId, isSubscribed]);

  // Update cursor position
  const updateCursor = useCallback((position: { x: number; y: number }) => {
    if (!isSubscribed) return;

    websocketClient.emit('document:cursor', {
      documentId,
      position,
      timestamp: new Date().toISOString(),
    });
  }, [documentId, isSubscribed]);

  // Update selection
  const updateSelection = useCallback((selection: { start: number; end: number }) => {
    if (!isSubscribed) return;

    websocketClient.emit('document:selection', {
      documentId,
      selection,
      timestamp: new Date().toISOString(),
    });
  }, [documentId, isSubscribed]);

  // Handle document updated
  useEffect(() => {
    const handleUpdate = (data: DocumentUpdate) => {
      if (data.documentId === documentId) {
        setLatestUpdate(data);
        callbacksRef.current.onUpdate?.(data);
      }
    };

    websocketClient.on(WS_EVENTS.DOCUMENT_UPDATED, handleUpdate);
    return () => websocketClient.off(WS_EVENTS.DOCUMENT_UPDATED, handleUpdate);
  }, [documentId]);

  // Handle collaborative change
  useEffect(() => {
    const handleChange = (data: DocumentChange) => {
      if (data.documentId === documentId) {
        callbacksRef.current.onChange?.(data);
      }
    };

    websocketClient.on('document:collab_change', handleChange);
    return () => websocketClient.off('document:collab_change', handleChange);
  }, [documentId]);

  // Handle document processing
  useEffect(() => {
    const handleProcessing = (data: DocumentProcessing) => {
      if (data.documentId === documentId) {
        setProcessingStatus(data);
        callbacksRef.current.onProcessing?.(data);
      }
    };

    websocketClient.on(WS_EVENTS.DOCUMENT_PROCESSING, handleProcessing);
    return () => websocketClient.off(WS_EVENTS.DOCUMENT_PROCESSING, handleProcessing);
  }, [documentId]);

  // Handle user join
  useEffect(() => {
    const handleUserJoin = (data: { documentId: string; userId: string }) => {
      if (data.documentId === documentId) {
        setActiveUsers(prev => {
          const next = new Map(prev);
          next.set(data.userId, {
            userId: data.userId,
            lastActivity: new Date().toISOString(),
          });
          return next;
        });
        callbacksRef.current.onUserJoin?.(data.userId);
      }
    };

    websocketClient.on('document:user_joined', handleUserJoin);
    return () => websocketClient.off('document:user_joined', handleUserJoin);
  }, [documentId]);

  // Handle user leave
  useEffect(() => {
    const handleUserLeave = (data: { documentId: string; userId: string }) => {
      if (data.documentId === documentId) {
        setActiveUsers(prev => {
          const next = new Map(prev);
          next.delete(data.userId);
          return next;
        });
        callbacksRef.current.onUserLeave?.(data.userId);
      }
    };

    websocketClient.on('document:user_left', handleUserLeave);
    return () => websocketClient.off('document:user_left', handleUserLeave);
  }, [documentId]);

  // Handle cursor updates
  useEffect(() => {
    const handleCursor = (data: {
      documentId: string;
      userId: string;
      position: { x: number; y: number };
    }) => {
      if (data.documentId === documentId) {
        setActiveUsers(prev => {
          const next = new Map(prev);
          const user = next.get(data.userId) || {
            userId: data.userId,
            lastActivity: new Date().toISOString(),
          };
          user.cursor = data.position;
          user.lastActivity = new Date().toISOString();
          next.set(data.userId, user);
          return next;
        });
      }
    };

    websocketClient.on('document:cursor', handleCursor);
    return () => websocketClient.off('document:cursor', handleCursor);
  }, [documentId]);

  // Auto-subscribe
  useEffect(() => {
    if (autoSubscribe && documentId && websocketClient.isConnected()) {
      subscribe();
    }

    return () => {
      if (autoSubscribe && isSubscribed) {
        unsubscribe();
      }
    };
  }, [autoSubscribe, documentId, subscribe, unsubscribe, isSubscribed]);

  return {
    activeUsers: Array.from(activeUsers.values()),
    latestUpdate,
    processingStatus,
    isSubscribed,
    subscribe,
    unsubscribe,
    sendChange,
    updateCursor,
    updateSelection,
  };
}

export default useDocumentSync;
