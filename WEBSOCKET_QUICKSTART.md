# WebSocket Quick Start Guide

## 5-Minute Setup

### Step 1: Install Dependencies (if needed)

```bash
# Backend
cd backend
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io

# Frontend
cd ..
npm install socket.io-client
```

### Step 2: Backend Setup

Add WebSocket module to your app:

```typescript
// backend/src/app.module.ts
import { WebSocketModule } from './websocket/websocket.module';

@Module({
  imports: [
    // ... existing modules
    WebSocketModule,
  ],
})
export class AppModule {}
```

### Step 3: Frontend Setup

Wrap your app with WebSocket provider:

```tsx
// src/main.tsx or src/App.tsx
import { WebSocketProvider } from './context/WebSocketContext';
import { ToastContainer } from './components/notifications';

function App() {
  return (
    <WebSocketProvider>
      <YourApp />
      <ToastContainer position="top-right" />
    </WebSocketProvider>
  );
}
```

### Step 4: Use in Components

```tsx
import { useCaseUpdates } from './hooks/useCaseUpdates';
import { useNotificationStream } from './hooks/useNotificationStream';
import { NotificationIcon } from './components/notifications';

function MyComponent({ caseId }) {
  // Real-time case updates
  const { latestUpdate } = useCaseUpdates({
    caseId,
    onUpdate: (update) => {
      console.log('Case updated!', update);
    },
  });

  // Notifications
  const { notifications, unreadCount } = useNotificationStream();

  return (
    <div>
      <NotificationIcon />
      {latestUpdate && <p>Last updated: {latestUpdate.timestamp}</p>}
    </div>
  );
}
```

### Step 5: Emit Events from Backend

```typescript
// In any backend service
import { CaseEventEmitter } from '../websocket/events';

@Injectable()
export class CasesService {
  constructor(private caseEvents: CaseEventEmitter) {}

  async updateCase(id: string, data: UpdateCaseDto) {
    const updated = await this.repository.update(id, data);

    // Emit real-time event
    this.caseEvents.emitCaseUpdated({
      caseId: id,
      changes: data,
      updatedBy: currentUserId,
      timestamp: new Date().toISOString(),
    });

    return updated;
  }
}
```

## Common Use Cases

### 1. Real-time Case Updates

```tsx
const { latestUpdate, latestStatusChange } = useCaseUpdates({
  caseId: 'case-123',
  onUpdate: (update) => refetchCaseData(),
  onStatusChange: (change) => showNotification(change),
  autoSubscribe: true,
});
```

### 2. Live Notifications

```tsx
const { notifications, unreadCount, markAsRead } = useNotificationStream({
  onNotification: (notif) => {
    console.log('New notification:', notif);
  },
  showToast: true,
});
```

### 3. Chat Messages

```tsx
const { messages, sendMessage, isSending } = useChatMessages({
  conversationId: 'conv-123',
  onMessage: (msg) => markAsRead(msg.id),
  autoJoin: true,
});

// Send message
await sendMessage('Hello!', {
  attachments: [],
  replyToId: 'msg-456',
});
```

### 4. User Presence

```tsx
const { onlineUsers, setStatus } = useOnlineStatus();

// Set your status
setStatus('away');

// Check who's online
console.log(`${onlineUsers.length} users online`);
```

### 5. Typing Indicators

```tsx
const { typingUsers, onInput, stopTyping } = useTypingIndicator({
  contextId: 'conv-123',
  contextType: 'conversation',
});

<input onChange={onInput} onBlur={stopTyping} />
{typingUsers.length > 0 && <p>{typingUsers.join(', ')} typing...</p>}
```

## Available Hooks

| Hook | Purpose | Auto-subscribe |
|------|---------|----------------|
| `useCaseUpdates` | Real-time case changes | Yes |
| `useDocumentSync` | Collaborative editing | Yes |
| `useNotificationStream` | Live notifications | Automatic |
| `useChatMessages` | Real-time chat | Yes |
| `useTypingIndicator` | Typing status | Automatic |
| `useOnlineStatus` | User presence | Automatic |

## Available Components

| Component | Purpose |
|-----------|---------|
| `NotificationCenter` | Notification list with filters |
| `NotificationItem` | Single notification display |
| `NotificationIcon` | Bell icon with badge |
| `NotificationBadge` | Unread count badge |
| `ToastContainer` | Toast notifications |

## Events You Can Listen To

### Case Events
- `case:created`, `case:updated`, `case:deleted`
- `case:status_changed`, `case:assigned`
- `case:comment_added`

### Document Events
- `document:uploaded`, `document:updated`, `document:deleted`
- `document:processing`, `document:shared`

### Notification Events
- `notification:new`, `notification:read`
- `notification:count`

### Chat Events
- `chat:message:new`, `chat:message:updated`, `chat:message:deleted`
- `chat:typing:start`, `chat:typing:stop`
- `chat:message:read`

### Presence Events
- `presence:update`, `presence:snapshot`
- `user:typing`, `user:activity`

## Debugging

### Check Connection Status

```tsx
const { isConnected, status } = useWebSocket();
console.log('Connected:', isConnected);
console.log('Status:', status);
```

### Monitor All Events

```tsx
useEffect(() => {
  const handleAll = (data) => {
    console.log('WebSocket event:', data);
  };

  websocketClient.on('*', handleAll);
  return () => websocketClient.off('*', handleAll);
}, []);
```

### View WebSocket Frames

1. Open Chrome DevTools
2. Go to Network tab
3. Filter by "WS"
4. Click on the WebSocket connection
5. View Messages tab

## Environment Variables

```env
# Backend
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000

# Frontend
VITE_WS_URL=http://localhost:3000
```

## Troubleshooting

**Problem:** WebSocket not connecting
- Check `VITE_WS_URL` is correct
- Verify backend is running
- Check auth token in localStorage

**Problem:** Events not received
- Verify you're subscribed to the room
- Check event name matches backend
- Use browser DevTools to inspect WebSocket frames

**Problem:** Memory leaks
- Ensure hooks are used inside components
- Don't create manual subscriptions without cleanup
- Use provided unsubscribe functions

## Next Steps

1. Read full documentation: `WEBSOCKET_README.md`
2. View examples: `examples/WebSocketIntegrationExample.tsx`
3. Check implementation summary: `WEBSOCKET_IMPLEMENTATION_SUMMARY.md`

## Need Help?

- Check browser console for errors
- View Network tab for WebSocket connection
- Review backend logs for authentication issues
- See documentation files for detailed guides
