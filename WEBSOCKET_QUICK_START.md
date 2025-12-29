# WebSocket Quick Start Guide

## Installation

```bash
# Frontend only (backend dependencies already installed)
cd frontend
npm install socket.io-client
```

## Enable WebSocket

```typescript
// frontend/src/config/network/websocket.config.ts
export const WS_ENABLED = true; // Change from false to true
```

## Quick Examples

### 1. Basic WebSocket Connection

```tsx
import { useWebSocket } from '@/hooks';

function MyComponent() {
  const { isConnected, emit } = useWebSocket({
    namespace: '/notifications',
  });

  return <div>Status: {isConnected ? 'Connected' : 'Disconnected'}</div>;
}
```

### 2. Real-Time Notifications

```tsx
import { useNotifications } from '@/hooks';

function NotificationBell() {
  const { notifications, unreadCount, markAsRead } = useNotifications();

  return (
    <div>
      <Badge count={unreadCount} />
      {notifications.map(notif => (
        <NotificationItem
          key={notif.id}
          notification={notif}
          onRead={() => markAsRead(notif.id)}
        />
      ))}
    </div>
  );
}
```

### 3. Live Dashboard

```tsx
import { useDashboard } from '@/hooks';

function Dashboard() {
  const { metrics, activities } = useDashboard();

  return (
    <div>
      <MetricsPanel metrics={metrics} />
      <ActivityFeed activities={activities} />
    </div>
  );
}
```

### 4. User Presence

```tsx
import { useUserPresence, PresenceStatus } from '@/hooks';

function UserAvatar({ userId }) {
  const { isOnline, presence } = useUserPresence(userId);

  return (
    <Avatar
      src={user.avatar}
      status={isOnline ? 'online' : 'offline'}
      activity={presence?.currentActivity}
    />
  );
}
```

### 5. Typing Indicators

```tsx
import { useTypingIndicator } from '@/hooks';

function ChatInput({ conversationId }) {
  const { typingUsers, startTyping, stopTyping } = useTypingIndicator(conversationId);

  return (
    <div>
      {typingUsers.length > 0 && <TypingIndicator users={typingUsers} />}
      <input
        onChange={() => startTyping()}
        onBlur={() => stopTyping()}
      />
    </div>
  );
}
```

### 6. Custom Real-Time Data

```tsx
import { useRealTimeData } from '@/hooks';

function CaseUpdates({ caseId }) {
  const { data, isLoading } = useRealTimeData({
    namespace: '/events',
    eventName: 'case:updated',
    subscribeEvent: 'subscribe:case',
    subscribeData: { caseId },
    unsubscribeEvent: 'unsubscribe:case',
  });

  if (isLoading) return <Loading />;
  return <CaseDetails data={data} />;
}
```

## Available Namespaces

- `/events` - General events (cases, documents, dockets)
- `/notifications` - User notifications
- `/dashboard` - Dashboard metrics and activity
- `/messaging` - Chat messages and typing indicators

## Available Hooks

| Hook | Purpose |
|------|---------|
| `useWebSocket` | Core WebSocket connection |
| `useRealTimeData` | Subscribe to real-time data |
| `useNotifications` | Real-time notifications |
| `useDashboard` | Dashboard updates |
| `usePresence` | Track user presence |
| `useUserPresence` | Single user presence |
| `useMultiUserPresence` | Multiple users presence |
| `useTypingIndicator` | Typing indicators |

## Common Events

### Notifications
- `notification:new` - New notification
- `notification:read` - Notification read
- `notification:count` - Unread count update

### Dashboard
- `dashboard:metrics` - Updated metrics
- `dashboard:activity` - New activity
- `dashboard:alert` - System alert

### Cases
- `case:created` - New case
- `case:updated` - Case updated
- `case:deleted` - Case deleted

### Presence
- `presence:update` - User status changed

## Troubleshooting

**Not connecting?**
1. Check `WS_ENABLED = true` in config
2. Verify JWT token is valid
3. Check browser console for errors

**Events not received?**
1. Verify you're subscribed to the correct event
2. Check namespace is correct
3. Ensure cleanup in useEffect return

**Memory leaks?**
1. Always return cleanup function in useEffect
2. Call `off()` for all `on()` listeners
3. Use provided hooks instead of manual socket.io

## Full Documentation

See `/home/user/lexiflow-premium/backend/src/realtime/README.md` for complete documentation.

## Support

- TypeScript types: `/backend/src/realtime/types/websocket-events.types.ts`
- Backend gateways: `/backend/src/realtime/gateways/`
- Frontend hooks: `/frontend/src/hooks/`
