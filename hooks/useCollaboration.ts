import { useEffect, useState, useCallback, useRef } from 'react';
import {
  CollaborationService,
  CursorPosition,
  DocumentChange,
  CollaborationSession,
} from '../services/collaborationService';
import { WebSocketService } from '../services/websocketService';

export interface UseCollaborationOptions {
  documentId: string;
  userId: string;
  userName: string;
  autoJoin?: boolean;
}

export function useCollaboration(
  ws: WebSocketService | null,
  options: UseCollaborationOptions,
) {
  const [session, setSession] = useState<CollaborationSession | null>(null);
  const [cursors, setCursors] = useState<CursorPosition[]>([]);
  const [participants, setParticipants] = useState<string[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const collaborationServiceRef = useRef<CollaborationService | null>(null);

  // Initialize collaboration service
  useEffect(() => {
    if (!ws) return;

    const service = new CollaborationService(ws);
    collaborationServiceRef.current = service;

    // Subscribe to session changes
    const unsubscribeSession = service.onSessionChange((newSession) => {
      setSession(newSession);
      setIsJoined(true);
    });

    // Subscribe to cursor updates
    const unsubscribeCursors = service.onCursorUpdate((newCursors) => {
      // Filter out own cursor
      setCursors(newCursors.filter((c) => c.userId !== options.userId));
    });

    // Subscribe to participant changes
    const unsubscribeParticipants = service.onParticipantsChange((newParticipants) => {
      setParticipants(newParticipants);
    });

    // Auto-join if enabled
    if (options.autoJoin !== false) {
      service.joinSession(options.documentId).catch((error) => {
        console.error('[useCollaboration] Failed to join session:', error);
      });
    }

    return () => {
      unsubscribeSession();
      unsubscribeCursors();
      unsubscribeParticipants();
      service.cleanup();
    };
  }, [ws, options.documentId, options.userId, options.autoJoin]);

  const joinSession = useCallback(async () => {
    if (!collaborationServiceRef.current) return;

    try {
      await collaborationServiceRef.current.joinSession(options.documentId);
      setIsJoined(true);
    } catch (error) {
      console.error('[useCollaboration] Failed to join session:', error);
      throw error;
    }
  }, [options.documentId]);

  const leaveSession = useCallback(() => {
    if (!collaborationServiceRef.current) return;

    collaborationServiceRef.current.leaveSession(options.documentId);
    setIsJoined(false);
    setSession(null);
    setCursors([]);
    setParticipants([]);
  }, [options.documentId]);

  const updateCursor = useCallback(
    (
      position: {
        x: number;
        y: number;
        line?: number;
        column?: number;
        elementId?: string;
      },
      selection?: {
        start: { line: number; column: number };
        end: { line: number; column: number };
      },
      color: string = '#4F46E5',
    ) => {
      if (!collaborationServiceRef.current || !isJoined) return;

      collaborationServiceRef.current.updateCursor(
        options.documentId,
        position,
        selection,
        color,
      );
    },
    [options.documentId, isJoined],
  );

  const sendChange = useCallback(
    (operations: any[], version: number) => {
      if (!collaborationServiceRef.current || !isJoined) return;

      collaborationServiceRef.current.sendChange(
        options.documentId,
        operations,
        version,
      );
    },
    [options.documentId, isJoined],
  );

  const acquireLock = useCallback(
    async (sectionId?: string): Promise<boolean> => {
      if (!collaborationServiceRef.current || !isJoined) return false;

      return await collaborationServiceRef.current.acquireLock(
        options.documentId,
        sectionId,
      );
    },
    [options.documentId, isJoined],
  );

  const releaseLock = useCallback(
    (sectionId?: string) => {
      if (!collaborationServiceRef.current || !isJoined) return;

      collaborationServiceRef.current.releaseLock(options.documentId, sectionId);
    },
    [options.documentId, isJoined],
  );

  const onDocumentChange = useCallback(
    (handler: (change: DocumentChange) => void) => {
      if (!collaborationServiceRef.current) return () => {};

      return collaborationServiceRef.current.onDocumentChange(handler);
    },
    [],
  );

  return {
    session,
    cursors,
    participants,
    isJoined,
    joinSession,
    leaveSession,
    updateCursor,
    sendChange,
    acquireLock,
    releaseLock,
    onDocumentChange,
  };
}

export default useCollaboration;
