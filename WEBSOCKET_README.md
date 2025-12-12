# LexiFlow WebSocket System Documentation

## Overview

The LexiFlow AI Legal Suite includes a comprehensive real-time WebSocket system built on Socket.IO, providing:

- Real-time case updates
- Collaborative document editing
- Live chat messaging
- User presence tracking
- Instant notifications
- Typing indicators
- Auto-reconnection with exponential backoff
- Message queuing when offline
- Type-safe event handling

## Architecture

### Backend (NestJS + Socket.IO)

```
backend/src/websocket/
├── websocket.gateway.ts       # Main WebSocket gateway with authentication
├── websocket.module.ts        # WebSocket module configuration
├── websocket.service.ts       # Service for broadcasting events
└── events/
    ├── event-types.ts         # Type definitions and constants
    ├── case.events.ts         # Case event emitters
    ├── document.events.ts     # Document event emitters
    ├── notification.events.ts # Notification event emitters
    ├── billing.events.ts      # Billing event emitters
    ├── chat.events.ts         # Chat event emitters
    ├── presence.events.ts     # Presence event emitters
    └── index.ts               # Centralized exports
```

### Frontend (React + Socket.IO Client)

```
Frontend Structure:
├── services/websocket/
│   ├── WebSocketClient.ts     # Enhanced Socket.IO client
│   └── eventHandlers.ts       # Event handler utilities
├── context/
│   └── WebSocketContext.tsx   # Global WebSocket context
├── hooks/
│   ├── useWebSocket.ts        # Base WebSocket hook
│   ├── useCaseUpdates.ts      # Case updates hook
│   ├── useDocumentSync.ts     # Document sync hook
│   ├── useNotificationStream.ts # Notifications hook
│   ├── useChatMessages.ts     # Chat messages hook
│   ├── useTypingIndicator.ts  # Typing indicator hook
│   └── useOnlineStatus.ts     # User presence hook
└── components/notifications/
    ├── NotificationCenter.tsx  # Notification center UI
    ├── NotificationItem.tsx    # Individual notification
    ├── NotificationBadge.tsx   # Unread count badge
    └── ToastContainer.tsx      # Toast notifications
```

## Features

### 1. Authentication

WebSocket connections are automatically authenticated using JWT tokens:

```typescript
// Backend automatically validates JWT from:
// - handshake.auth.token
// - handshake.query.token
// - handshake.headers.authorization

// Frontend automatically sends token from localStorage
const token = localStorage.getItem('auth_token');
```

### 2. Room Management

Users automatically join rooms for:
- Personal room: `user:{userId}`
- Case rooms: `case:{caseId}`
- Document rooms: `document:{documentId}`
- Conversation rooms: `conversation:{conversationId}`
- Organization rooms: `org:{orgId}`

### 3. Presence Tracking

Track who's online and what they're doing:

```typescript
const { isOnline, status, lastSeen } = useOnlineStatus({ userId: 'user-123' });
const { onlineUsers } = useOnlineStatus(); // All users
```

### 4. Auto-Reconnection

Automatic reconnection with exponential backoff:
- Initial delay: 1 second
- Max delay: 5 seconds
- Max attempts: 5
- Queues messages while disconnected

### 5. Event Types

**Case Events:**
- `case:created` - New case created
- `case:updated` - Case updated
- `case:deleted` - Case deleted
- `case:status_changed` - Status changed
- `case:assigned` - Case assigned
- `case:comment_added` - Comment added

**Document Events:**
- `document:uploaded` - Document uploaded
- `document:updated` - Document updated
- `document:deleted` - Document deleted
- `document:processing` - Processing status
- `document:shared` - Document shared
- `document:collab_change` - Collaborative edit

**Notification Events:**
- `notification:new` - New notification
- `notification:read` - Notification read
- `notification:count` - Unread count update

**Chat Events:**
- `chat:message:new` - New message
- `chat:message:updated` - Message edited
- `chat:message:deleted` - Message deleted
- `chat:message:read` - Read receipt
- `chat:typing:start` - Typing started
- `chat:typing:stop` - Typing stopped

**Presence Events:**
- `presence:update` - User status change
- `presence:snapshot` - Initial presence state
- `user:typing` - User typing
- `user:activity` - User activity

## Usage Examples

### Example 1: Case Updates

```typescript
import { useCaseUpdates } from './hooks/useCaseUpdates';

function CaseDetail({ caseId }) {
  const { latestUpdate, isSubscribed } = useCaseUpdates({
    caseId,
    onUpdate: (update) => {
      // Refresh case data
      refetchCase();
    },
    onStatusChange: (change) => {
      // Show notification
      toast.info(`Case status: ${change.oldStatus} → ${change.newStatus}`);
    },
    autoSubscribe: true,
  });

  return <div>Case details...</div>;
}
```

### Example 2: Collaborative Document Editing

```typescript
import { useDocumentSync } from './hooks/useDocumentSync';

function DocumentEditor({ documentId }) {
  const { activeUsers, sendChange, updateCursor } = useDocumentSync({
    documentId,
    onChange: (change) => {
      // Apply remote change to document
      applyChange(change);
    },
    autoSubscribe: true,
  });

  const handleEdit = (content) => {
    sendChange({
      userId: currentUserId,
      changeType: 'update',
      changes: { content },
    });
  };

  return (
    <div>
      <p>Editing with: {activeUsers.map(u => u.userId).join(', ')}</p>
      <Editor onChange={handleEdit} />
    </div>
  );
}
```

### Example 3: Notifications

```typescript
import { NotificationCenter } from './components/notifications';
import { ToastContainer } from './components/notifications';

function App() {
  return (
    <>
      <NotificationCenter />
      <ToastContainer position="top-right" />
    </>
  );
}
```

### Example 4: Chat Messages

```typescript
import { useChatMessages } from './hooks/useChatMessages';
import { useTypingIndicator } from './hooks/useTypingIndicator';

function ChatRoom({ conversationId }) {
  const { messages, sendMessage, markAsRead } = useChatMessages({
    conversationId,
    onMessage: (msg) => {
      markAsRead(msg.id);
    },
    autoJoin: true,
  });

  const { typingUsers, onInput } = useTypingIndicator({
    contextId: conversationId,
    contextType: 'conversation',
  });

  return (
    <div>
      {messages.map(msg => <Message key={msg.id} {...msg} />)}
      {typingUsers.length > 0 && <TypingIndicator users={typingUsers} />}
      <MessageInput onChange={onInput} onSend={sendMessage} />
    </div>
  );
}
```

### Example 5: User Presence

```typescript
import { useOnlineStatus } from './hooks/useOnlineStatus';

function UserList({ userIds }) {
  const { getUserStatus, isUserOnline } = useOnlineStatus();

  return (
    <div>
      {userIds.map(userId => (
        <div key={userId}>
          <StatusDot status={getUserStatus(userId)} />
          <span>{userId}</span>
          {isUserOnline(userId) ? 'Online' : 'Offline'}
        </div>
      ))}
    </div>
  );
}
```

## Backend Integration

### Emitting Events from Services

```typescript
import { CaseEventEmitter } from '../websocket/events';

@Injectable()
export class CasesService {
  constructor(private caseEvents: CaseEventEmitter) {}

  async updateCase(id: string, data: UpdateCaseDto) {
    const updatedCase = await this.caseRepository.update(id, data);

    // Broadcast real-time update
    this.caseEvents.emitCaseUpdated({
      caseId: id,
      changes: data,
      updatedBy: currentUserId,
      timestamp: new Date().toISOString(),
    });

    return updatedCase;
  }
}
```

### Custom Event Broadcasting

```typescript
import { WebSocketService } from '../websocket/websocket.service';

@Injectable()
export class CustomService {
  constructor(private wsService: WebSocketService) {}

  async doSomething() {
    // Send to specific user
    this.wsService.sendToUser(userId, 'custom:event', data);

    // Send to case room
    this.wsService.sendToCase(caseId, 'custom:event', data);

    // Broadcast to all
    this.wsService.broadcastToAll('custom:event', data);
  }
}
```

## Environment Configuration

```env
# Backend (.env)
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000

# Frontend (.env)
VITE_WS_URL=http://localhost:3000
```

## Best Practices

1. **Always unsubscribe** - Hooks handle this automatically, but manual subscriptions need cleanup
2. **Use auto-reconnection** - Enabled by default, ensures reliable connections
3. **Handle offline state** - Messages are queued automatically when disconnected
4. **Optimize subscriptions** - Only subscribe to needed events/rooms
5. **Type safety** - Use provided TypeScript types for all events
6. **Error handling** - Wrap WebSocket calls in try-catch blocks
7. **Testing** - Use dev mode userId param for testing without authentication

## Troubleshooting

### Connection Issues

```typescript
// Check connection status
const { isConnected, status } = useWebSocket();
console.log('Status:', status);

// Force reconnection
const { connect } = useWebSocket();
await connect();
```

### Event Not Received

1. Check if subscribed to the room
2. Verify event name matches backend
3. Check network tab for WebSocket frames
4. Ensure authentication is working

### Memory Leaks

- Hooks automatically cleanup on unmount
- For manual subscriptions, always call `off()` or unsubscribe functions

## Performance Considerations

- Maximum 100 queued messages (configurable)
- Heartbeat every 30 seconds
- Typing indicators auto-stop after 3 seconds
- Notification limit: 100 (configurable)
- Toast limit: 3 simultaneous (configurable)

## Security

- JWT authentication required
- Token validation on connection
- Room-based access control
- User can only join authorized rooms
- All events include user context for audit

## Future Enhancements

- [ ] Collaborative cursors visualization
- [ ] Voice/video call signaling
- [ ] File transfer progress
- [ ] Advanced presence states
- [ ] Message persistence
- [ ] Offline sync
- [ ] E2E encryption for sensitive data

## Support

For issues or questions, see:
- `/examples/WebSocketIntegrationExample.tsx` - Full integration examples
- Backend gateway: `/backend/src/websocket/websocket.gateway.ts`
- Event types: `/backend/src/websocket/events/event-types.ts`
