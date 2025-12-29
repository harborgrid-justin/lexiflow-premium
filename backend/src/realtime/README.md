# WebSocket & Real-Time Integration

Comprehensive WebSocket implementation for LexiFlow Premium v0.5.2 providing real-time notifications, dashboard updates, presence tracking, and messaging features.

## Architecture Overview

### Backend Gateways

#### 1. **RealtimeGateway** (`/events` namespace)
Main event gateway for general real-time updates:
- Case events (created, updated, deleted)
- Document events (uploaded, processed)
- Docket entry events
- Room management (join/leave)
- Generic real-time updates

**Usage:**
```typescript
// Client connects to /events namespace
const socket = io('http://localhost:3000/events', {
  auth: { token: 'jwt-token' }
});

// Subscribe to case updates
socket.emit('subscribe:case', { caseId: '123' });
socket.on('case:updated', (data) => console.log('Case updated:', data));
```

#### 2. **NotificationsGateway** (`/notifications` namespace)
Dedicated notification delivery system:
- Real-time notification push
- Unread count tracking
- Mark as read/unread
- Notification deletion
- Multi-device support

**Events:**
- `notification:new` - New notification received
- `notification:read` - Notification marked as read
- `notification:deleted` - Notification deleted
- `notification:count` - Updated unread count
- `notification:all-read` - All notifications marked as read

**Usage:**
```typescript
socket.emit('notification:mark-read', { notificationId: '123' });
socket.emit('notification:mark-all-read', {});
socket.on('notification:new', (notification) => {
  // Handle new notification
});
```

#### 3. **DashboardGateway** (`/dashboard` namespace)
Live dashboard updates and analytics:
- Real-time metrics
- Activity feed
- Case statistics
- Team activity
- System alerts

**Events:**
- `dashboard:metrics` - Updated dashboard metrics
- `dashboard:activity` - New activity feed item
- `dashboard:case-stats` - Case statistics update
- `dashboard:team-activity` - Team member activity
- `dashboard:alert` - Critical alerts

**Usage:**
```typescript
socket.emit('dashboard:subscribe', { types: ['metrics', 'activity'] });
socket.on('dashboard:metrics', (metrics) => {
  // Update dashboard UI
});
```

#### 4. **MessagingGateway** (`/messaging` namespace)
Real-time messaging features:
- Message delivery
- Read receipts
- Typing indicators
- Conversation management

**Events:**
- `message:new` - New message received
- `message:read` - Message read receipt
- `typing:start` - User started typing
- `typing:stop` - User stopped typing
- `presence:update` - User presence changed

### Backend Services

#### **PresenceService**
Tracks user online/offline status:
- Automatic away detection (5 minutes)
- Multi-device connection support
- Activity tracking
- Custom status messages
- Heartbeat monitoring

**API:**
```typescript
presenceService.userConnected(userId, socketId);
presenceService.setStatus(userId, PresenceStatus.BUSY);
presenceService.setActivity(userId, 'Reviewing Case #123');
const presence = presenceService.getUserPresence(userId);
```

#### **WebSocketMonitorService**
Connection monitoring and health checks:
- Connection count tracking
- Memory usage monitoring
- Rate limit statistics
- Memory leak detection
- Automatic cleanup

**Metrics:**
```typescript
const stats = monitorService.getStats();
const health = monitorService.getHealthStatus();
const leakReport = monitorService.detectMemoryLeaks();
```

## Frontend Hooks

### 1. **useWebSocket**
Core WebSocket connection management with automatic reconnection.

**Features:**
- Automatic connection/reconnection
- Exponential backoff
- Event subscription
- Connection status tracking
- Type-safe event emissions

**Example:**
```tsx
import { useWebSocket } from '@/hooks';

function MyComponent() {
  const { socket, isConnected, emit, on, off } = useWebSocket({
    namespace: '/notifications',
    auth: { token: userToken },
    onConnect: () => console.log('Connected!'),
  });

  useEffect(() => {
    const handler = (data) => console.log('Event:', data);
    on('notification:new', handler);
    return () => off('notification:new', handler);
  }, [on, off]);

  const handleAction = () => {
    emit('notification:mark-read', { notificationId: '123' });
  };

  return <div>Connected: {isConnected ? 'Yes' : 'No'}</div>;
}
```

### 2. **useRealTimeData**
Subscribe to real-time data with automatic state management.

**Features:**
- Automatic subscription/unsubscription
- Data transformation
- Loading states
- Error handling
- Timestamp tracking

**Example:**
```tsx
import { useRealTimeData } from '@/hooks';

function DashboardMetrics() {
  const { data, isLoading, error } = useRealTimeData({
    namespace: '/dashboard',
    eventName: 'dashboard:metrics',
    subscribeEvent: 'dashboard:subscribe',
    subscribeData: { types: ['metrics'] },
  });

  if (isLoading) return <Loading />;
  if (error) return <Error error={error} />;

  return <MetricsDisplay data={data} />;
}
```

### 3. **usePresence**
Track user presence (online/offline status).

**Features:**
- Multi-user presence tracking
- Status management (online, away, busy, offline)
- Activity tracking
- Custom status messages
- Automatic heartbeat

**Example:**
```tsx
import { usePresence, PresenceStatus } from '@/hooks';

function UserList({ userIds }) {
  const { getPresence, setStatus, setActivity } = usePresence();

  const handleStatusChange = (status) => {
    setStatus(status);
  };

  return (
    <div>
      {userIds.map(userId => {
        const presence = getPresence(userId);
        return (
          <UserCard
            key={userId}
            userId={userId}
            isOnline={presence?.status === PresenceStatus.ONLINE}
            lastSeen={presence?.lastSeen}
          />
        );
      })}
    </div>
  );
}
```

### Helper Hooks

#### **useNotifications**
```tsx
const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
```

#### **useDashboard**
```tsx
const { metrics, activities, subscribe, unsubscribe, refresh } = useDashboard();
```

#### **useTypingIndicator**
```tsx
const { typingUsers, isTyping, startTyping, stopTyping } = useTypingIndicator('conversation-123');
```

#### **useUserPresence**
```tsx
const { presence, isOnline, isAway, lastSeen } = useUserPresence('user-123');
```

#### **useMultiUserPresence**
```tsx
const { presenceMap, onlineCount, offlineCount } = useMultiUserPresence(['user-1', 'user-2']);
```

## Type Safety

All WebSocket events are fully typed in `backend/src/realtime/types/websocket-events.types.ts`:

```typescript
import { WS_EVENTS, NotificationEvent, PresenceUpdateEvent } from '@realtime/types';

// Event name constants
socket.on(WS_EVENTS.NOTIFICATION_NEW, (event: NotificationEvent) => {
  console.log(event.title, event.message);
});

// Type guards
if (isNotificationEvent(event)) {
  // TypeScript knows this is NotificationEvent
}
```

## Security Features

### Authentication
- JWT token required for all connections
- Token verification on handshake
- Automatic token refresh support

### Rate Limiting
- 100 events/minute per client (configurable)
- Per-user connection limits (max 5)
- Room subscription limits (max 50 per user)

### Resource Protection
- Max 10,000 global connections
- Automatic stale connection cleanup
- Memory leak detection
- Graceful shutdown handling

## Configuration

### Backend (`master.config.ts`)
```typescript
REALTIME_CORS_ORIGIN: ['http://localhost:3000']
REALTIME_NAMESPACE: '/events'
REALTIME_MAX_HTTP_BUFFER_SIZE: 1048576 // 1MB
REALTIME_PING_TIMEOUT_MS: 60000
REALTIME_PING_INTERVAL_MS: 25000
```

### Frontend (`websocket.config.ts`)
```typescript
WS_ENABLED: true
WS_URL: 'ws://localhost:3000'
WS_RECONNECT_ATTEMPTS: 5
WS_RECONNECT_DELAY_MS: 1000
WS_PING_INTERVAL_MS: 25000
```

## Testing

### Manual Testing
```bash
# Start backend
cd backend
npm run start:dev

# Connect with socket.io-client
node test-websocket.js
```

### Integration Testing
```typescript
import { io } from 'socket.io-client';

describe('WebSocket Integration', () => {
  it('should connect and receive notifications', (done) => {
    const socket = io('http://localhost:3000/notifications', {
      auth: { token: testToken }
    });

    socket.on('connected', () => {
      expect(socket.connected).toBe(true);
      done();
    });
  });
});
```

## Performance Optimization

### Backend
- Connection pooling with Redis adapter (optional)
- Efficient room-based broadcasting
- Memory-efficient event tracking
- Automatic garbage collection triggers
- Sliding window metrics history

### Frontend
- Lazy connection establishment
- Automatic reconnection with backoff
- Event listener cleanup
- Memory leak prevention
- Optimistic updates

## Monitoring

### Health Checks
```typescript
GET /api/realtime/health

Response:
{
  "status": "healthy",
  "connections": 150,
  "rooms": 45,
  "memory": {
    "heapUsedMB": 120.5,
    "heapTotalMB": 256
  }
}
```

### Metrics
```typescript
GET /api/realtime/metrics

Response:
{
  "connections": {
    "total": 150,
    "max": 10000,
    "utilizationPercent": 1.5
  },
  "rooms": {
    "totalRooms": 45,
    "maxRoomsPerUser": 50
  },
  "rateLimits": {
    "activeClients": 150,
    "maxEventsPerMinute": 100
  }
}
```

## Troubleshooting

### Connection Issues
1. Verify JWT token is valid
2. Check CORS configuration
3. Ensure WebSocket port is accessible
4. Check firewall/proxy settings

### Memory Leaks
1. Monitor metrics endpoint
2. Check for orphaned event listeners
3. Verify cleanup in useEffect hooks
4. Use WebSocketMonitorService leak detection

### Performance Issues
1. Enable Redis adapter for scaling
2. Implement message throttling
3. Use selective subscriptions
4. Optimize payload sizes

## Migration Guide

### From Legacy WebSocket
```typescript
// Old
const ws = new WebSocket('ws://localhost:3000');
ws.onmessage = (event) => {
  // Handle message
};

// New
const { socket, on } = useWebSocket({ namespace: '/events' });
on('event:name', (data) => {
  // Handle event
});
```

## Best Practices

1. **Always clean up listeners**: Use `off()` in component unmount
2. **Use typed events**: Import event types from `@realtime/types`
3. **Handle reconnection**: Don't assume persistent connection
4. **Optimize subscriptions**: Only subscribe to needed events
5. **Monitor performance**: Use built-in monitoring tools
6. **Test offline scenarios**: Ensure graceful degradation
7. **Validate payloads**: Always validate incoming data
8. **Use namespaces**: Separate concerns with different namespaces

## Future Enhancements

- [ ] Redis adapter for horizontal scaling
- [ ] Binary protocol support (MessagePack)
- [ ] Compression for large payloads
- [ ] Advanced presence features (geolocation, device info)
- [ ] WebRTC integration for peer-to-peer
- [ ] GraphQL subscriptions integration
- [ ] Advanced analytics and monitoring dashboard

## Support

For issues, questions, or feature requests, contact the development team or create an issue in the project repository.
