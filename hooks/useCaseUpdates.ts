/**
 * useCaseUpdates Hook
 * Real-time case updates subscription
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { websocketClient } from '../services/websocket/WebSocketClient';
import { WS_EVENTS } from '../services/websocket/eventHandlers';

export interface CaseUpdate {
  caseId: string;
  changes: Record<string, any>;
  updatedBy: string;
  timestamp: string;
}

export interface CaseStatusChange {
  caseId: string;
  oldStatus: string;
  newStatus: string;
  changedBy: string;
  timestamp: string;
}

export interface CaseAssignment {
  caseId: string;
  assignedTo: string;
  assignedBy: string;
  timestamp: string;
}

export interface CaseComment {
  caseId: string;
  commentId: string;
  content: string;
  authorId: string;
  timestamp: string;
}

interface UseCaseUpdatesOptions {
  caseId: string;
  onUpdate?: (update: CaseUpdate) => void;
  onStatusChange?: (change: CaseStatusChange) => void;
  onAssignment?: (assignment: CaseAssignment) => void;
  onComment?: (comment: CaseComment) => void;
  autoSubscribe?: boolean;
}

/**
 * Hook for subscribing to real-time case updates
 *
 * @example
 * const { latestUpdate, subscribe, unsubscribe } = useCaseUpdates({
 *   caseId: '123',
 *   onUpdate: (update) => console.log('Case updated:', update),
 *   autoSubscribe: true,
 * });
 */
export function useCaseUpdates(options: UseCaseUpdatesOptions) {
  const {
    caseId,
    onUpdate,
    onStatusChange,
    onAssignment,
    onComment,
    autoSubscribe = true,
  } = options;

  const [latestUpdate, setLatestUpdate] = useState<CaseUpdate | null>(null);
  const [latestStatusChange, setLatestStatusChange] = useState<CaseStatusChange | null>(null);
  const [latestAssignment, setLatestAssignment] = useState<CaseAssignment | null>(null);
  const [latestComment, setLatestComment] = useState<CaseComment | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const callbacksRef = useRef({ onUpdate, onStatusChange, onAssignment, onComment });

  // Update callbacks ref when they change
  useEffect(() => {
    callbacksRef.current = { onUpdate, onStatusChange, onAssignment, onComment };
  }, [onUpdate, onStatusChange, onAssignment, onComment]);

  // Subscribe to case updates
  const subscribe = useCallback(() => {
    if (!caseId || isSubscribed) return;

    console.log(`[useCaseUpdates] Subscribing to case ${caseId}`);
    websocketClient.emit('case:subscribe', { caseId });
    setIsSubscribed(true);
  }, [caseId, isSubscribed]);

  // Unsubscribe from case updates
  const unsubscribe = useCallback(() => {
    if (!caseId || !isSubscribed) return;

    console.log(`[useCaseUpdates] Unsubscribing from case ${caseId}`);
    websocketClient.emit('case:unsubscribe', { caseId });
    setIsSubscribed(false);
  }, [caseId, isSubscribed]);

  // Handle case updated event
  useEffect(() => {
    const handleCaseUpdated = (data: CaseUpdate) => {
      if (data.caseId === caseId) {
        setLatestUpdate(data);
        callbacksRef.current.onUpdate?.(data);
      }
    };

    websocketClient.on(WS_EVENTS.CASE_UPDATED, handleCaseUpdated);
    return () => websocketClient.off(WS_EVENTS.CASE_UPDATED, handleCaseUpdated);
  }, [caseId]);

  // Handle case status changed event
  useEffect(() => {
    const handleStatusChange = (data: CaseStatusChange) => {
      if (data.caseId === caseId) {
        setLatestStatusChange(data);
        callbacksRef.current.onStatusChange?.(data);
      }
    };

    websocketClient.on(WS_EVENTS.CASE_STATUS_CHANGED, handleStatusChange);
    return () => websocketClient.off(WS_EVENTS.CASE_STATUS_CHANGED, handleStatusChange);
  }, [caseId]);

  // Handle case assigned event
  useEffect(() => {
    const handleAssignment = (data: CaseAssignment) => {
      if (data.caseId === caseId) {
        setLatestAssignment(data);
        callbacksRef.current.onAssignment?.(data);
      }
    };

    websocketClient.on(WS_EVENTS.CASE_ASSIGNED, handleAssignment);
    return () => websocketClient.off(WS_EVENTS.CASE_ASSIGNED, handleAssignment);
  }, [caseId]);

  // Handle case comment added event
  useEffect(() => {
    const handleComment = (data: CaseComment) => {
      if (data.caseId === caseId) {
        setLatestComment(data);
        callbacksRef.current.onComment?.(data);
      }
    };

    websocketClient.on(WS_EVENTS.CASE_COMMENT_ADDED, handleComment);
    return () => websocketClient.off(WS_EVENTS.CASE_COMMENT_ADDED, handleComment);
  }, [caseId]);

  // Auto-subscribe/unsubscribe
  useEffect(() => {
    if (autoSubscribe && caseId && websocketClient.isConnected()) {
      subscribe();
    }

    return () => {
      if (autoSubscribe && isSubscribed) {
        unsubscribe();
      }
    };
  }, [autoSubscribe, caseId, subscribe, unsubscribe, isSubscribed]);

  return {
    latestUpdate,
    latestStatusChange,
    latestAssignment,
    latestComment,
    isSubscribed,
    subscribe,
    unsubscribe,
  };
}

export default useCaseUpdates;
