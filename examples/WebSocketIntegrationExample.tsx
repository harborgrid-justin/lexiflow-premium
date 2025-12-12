/**
 * WebSocket Integration Example
 * Demonstrates how to use the WebSocket system in LexiFlow
 */

import React, { useEffect, useState } from 'react';
import { useCaseUpdates } from '../hooks/useCaseUpdates';
import { useDocumentSync } from '../hooks/useDocumentSync';
import { useNotificationStream } from '../hooks/useNotificationStream';
import { useChatMessages } from '../hooks/useChatMessages';
import { useTypingIndicator } from '../hooks/useTypingIndicator';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { NotificationCenter } from '../components/notifications/NotificationCenter';
import { NotificationIcon } from '../components/notifications/NotificationBadge';
import { ToastContainer } from '../components/notifications/ToastContainer';

/**
 * Example 1: Case Updates
 * Subscribe to real-time case updates
 */
export const CaseUpdatesExample: React.FC<{ caseId: string }> = ({ caseId }) => {
  const { latestUpdate, latestStatusChange, isSubscribed } = useCaseUpdates({
    caseId,
    onUpdate: (update) => {
      console.log('Case updated:', update);
      // Refresh case data, show notification, etc.
    },
    onStatusChange: (change) => {
      console.log('Case status changed:', change);
      // Update UI to reflect new status
    },
    autoSubscribe: true,
  });

  return (
    <div className="p-4 border rounded">
      <h3 className="font-bold">Case Updates</h3>
      <p>Subscribed: {isSubscribed ? 'Yes' : 'No'}</p>
      {latestUpdate && (
        <div className="mt-2">
          <p className="text-sm text-gray-600">Latest Update:</p>
          <pre className="text-xs bg-gray-100 p-2 rounded">
            {JSON.stringify(latestUpdate, null, 2)}
          </pre>
        </div>
      )}
      {latestStatusChange && (
        <div className="mt-2">
          <p className="text-sm text-gray-600">Status Change:</p>
          <p className="text-sm">
            {latestStatusChange.oldStatus} → {latestStatusChange.newStatus}
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * Example 2: Collaborative Document Editing
 * Real-time document synchronization
 */
export const DocumentSyncExample: React.FC<{ documentId: string }> = ({ documentId }) => {
  const {
    activeUsers,
    sendChange,
    updateCursor,
    isSubscribed,
  } = useDocumentSync({
    documentId,
    onChange: (change) => {
      console.log('Document changed:', change);
      // Apply change to document
    },
    onUserJoin: (userId) => {
      console.log('User joined document:', userId);
    },
    onUserLeave: (userId) => {
      console.log('User left document:', userId);
    },
    autoSubscribe: true,
  });

  const handleTextChange = (text: string) => {
    sendChange({
      userId: 'current-user-id',
      changeType: 'update',
      changes: { text },
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    updateCursor({ x: e.clientX, y: e.clientY });
  };

  return (
    <div className="p-4 border rounded" onMouseMove={handleMouseMove}>
      <h3 className="font-bold">Collaborative Document</h3>
      <p>Active Users: {activeUsers.length}</p>
      <div className="mt-2">
        {activeUsers.map(user => (
          <div key={user.userId} className="text-sm">
            User {user.userId} - Cursor: {user.cursor ? `(${user.cursor.x}, ${user.cursor.y})` : 'N/A'}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Example 3: Notification Center
 * Real-time notifications with toast support
 */
export const NotificationExample: React.FC = () => {
  const [showCenter, setShowCenter] = useState(false);

  return (
    <div className="p-4 border rounded">
      <h3 className="font-bold mb-4">Notifications</h3>

      {/* Notification Icon with Badge */}
      <div className="mb-4">
        <NotificationIcon onClick={() => setShowCenter(!showCenter)} />
      </div>

      {/* Notification Center */}
      {showCenter && (
        <div className="mt-4">
          <NotificationCenter showFilters={true} />
        </div>
      )}

      {/* Toast Container (place once in app root) */}
      <ToastContainer position="top-right" />
    </div>
  );
};

/**
 * Example 4: Chat Messages
 * Real-time chat with typing indicators
 */
export const ChatExample: React.FC<{ conversationId: string }> = ({ conversationId }) => {
  const [messageText, setMessageText] = useState('');

  const { messages, sendMessage, isSending, markAsRead } = useChatMessages({
    conversationId,
    onMessage: (message) => {
      console.log('New message:', message);
      // Mark as read when user is viewing
      markAsRead(message.id);
    },
    autoJoin: true,
  });

  const { typingUsers, onInput, stopTyping } = useTypingIndicator({
    contextId: conversationId,
    contextType: 'conversation',
  });

  const handleSend = async () => {
    if (!messageText.trim()) return;

    await sendMessage(messageText);
    setMessageText('');
    stopTyping();
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="font-bold mb-4">Chat</h3>

      {/* Messages */}
      <div className="space-y-2 mb-4 max-h-96 overflow-y-auto">
        {messages.map(message => (
          <div key={message.id} className="p-2 bg-gray-100 rounded">
            <p className="text-sm font-semibold">User {message.senderId}</p>
            <p className="text-sm">{message.content}</p>
            <p className="text-xs text-gray-500">{new Date(message.createdAt).toLocaleTimeString()}</p>
          </div>
        ))}
      </div>

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <p className="text-sm text-gray-500 mb-2">
          {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
        </p>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={messageText}
          onChange={(e) => {
            setMessageText(e.target.value);
            onInput();
          }}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 px-3 py-2 border rounded"
          placeholder="Type a message..."
        />
        <button
          onClick={handleSend}
          disabled={isSending || !messageText.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
};

/**
 * Example 5: User Presence
 * Track online/offline status
 */
export const PresenceExample: React.FC = () => {
  const { onlineUsers, setStatus } = useOnlineStatus();

  return (
    <div className="p-4 border rounded">
      <h3 className="font-bold mb-4">Online Users</h3>

      {/* Status Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Your Status:</label>
        <select
          onChange={(e) => setStatus(e.target.value as any)}
          className="px-3 py-2 border rounded"
        >
          <option value="online">Online</option>
          <option value="away">Away</option>
          <option value="busy">Busy</option>
        </select>
      </div>

      {/* Online Users List */}
      <div className="space-y-2">
        <p className="text-sm text-gray-600">
          {onlineUsers.length} user(s) online
        </p>
        {onlineUsers.map(user => (
          <div key={user.userId} className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                user.status === 'online' ? 'bg-green-500' :
                user.status === 'away' ? 'bg-yellow-500' :
                user.status === 'busy' ? 'bg-red-500' :
                'bg-gray-500'
              }`}
            />
            <span className="text-sm">User {user.userId}</span>
            <span className="text-xs text-gray-500">({user.status})</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Full Integration Example
 * Complete WebSocket integration in a component
 */
export const FullWebSocketExample: React.FC<{
  caseId: string;
  documentId: string;
  conversationId: string;
}> = ({ caseId, documentId, conversationId }) => {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">WebSocket Integration Examples</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CaseUpdatesExample caseId={caseId} />
        <DocumentSyncExample documentId={documentId} />
        <ChatExample conversationId={conversationId} />
        <PresenceExample />
      </div>

      <NotificationExample />
    </div>
  );
};

export default FullWebSocketExample;
