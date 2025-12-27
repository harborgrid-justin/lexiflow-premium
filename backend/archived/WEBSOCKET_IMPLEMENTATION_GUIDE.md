# WebSocket Implementation Guide
## Step-by-Step Instructions for Production Deployment

---

## STEP 1: Install Required Dependencies

```bash
cd backend
npm install @socket.io/redis-adapter
```

---

## STEP 2: Update main.ts to Enable Redis Adapter

**File:** `backend/src/main.ts`

Add after line 11 (after imports):

```typescript
import { RedisIoAdapter } from './realtime/adapters/redis-io.adapter';
```

Add after line 36 (after app creation):

```typescript
  // Configure Redis adapter for WebSocket horizontal scaling
  const isRedisEnabled = process.env.REDIS_ENABLED !== 'false' && process.env.DEMO_MODE !== 'true';

  if (isRedisEnabled) {
    try {
      const redisIoAdapter = new RedisIoAdapter(app);
      await redisIoAdapter.connectToRedis();
      app.useWebSocketAdapter(redisIoAdapter);
      logger.log('✅ WebSocket Redis adapter enabled for horizontal scaling');
    } catch (error) {
      logger.error('❌ Failed to initialize Redis adapter for WebSocket:', error);
      logger.warn('⚠️  WebSocket will run without Redis - horizontal scaling disabled');
    }
  } else {
    logger.warn('📦 WebSocket Redis adapter disabled - running without horizontal scaling');
  }
```

---

## STEP 3: Update realtime.module.ts

**File:** `backend/src/realtime/realtime.module.ts`

Update the providers array:

```typescript
@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('jwt.secret') || 'your-secret-key',
        signOptions: {
          expiresIn: configService.get('jwt.expiresIn') || '1d',
        },
      }),
    }),
  ],
  providers: [
    RealtimeGateway,
    WsRateLimitGuard,
    WsRoomLimitGuard,
    WebSocketMonitorService,  // ADD THIS
  ],
  exports: [RealtimeGateway, WebSocketMonitorService],  // ADD WebSocketMonitorService
})
export class RealtimeModule {}
```

Add import at top:

```typescript
import { WebSocketMonitorService } from './services/websocket-monitor.service';
```

---

## STEP 4: Update RealtimeGateway with Validation DTOs

**File:** `backend/src/realtime/realtime.gateway.ts`

Add imports at top:

```typescript
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { SubscribeCaseDto, JoinRoomDto, SendMessageDto } from './dto';
```

Update the subscribe:case handler:

```typescript
  @UseGuards(WsRateLimitGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @SubscribeMessage('subscribe:case')
  handleSubscribeCase(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SubscribeCaseDto,  // Use DTO
  ) {
    const roomId = `case:${data.caseId}`;

    // Validate input
    if (!data || !data.caseId) {
      client.emit('error', {
        code: 'INVALID_INPUT',
        message: 'caseId is required',
      });
      return { status: 'error', error: 'Invalid input' };
    }

    // Check room limit
    const limitCheck = this.wsRoomLimitGuard.canJoinRoom(client, roomId);
    if (!limitCheck.allowed) {
      return {
        status: 'error',
        error: limitCheck.reason,
        currentRoomCount: limitCheck.currentCount,
      };
    }

    client.join(roomId);
    this.logger.debug(`Client ${client.id} subscribed to case ${data.caseId}`);
    return { status: 'subscribed', caseId: data.caseId };
  }
```

Update join_room handler:

```typescript
  @UseGuards(WsRateLimitGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @SubscribeMessage('join_room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: JoinRoomDto,  // Use DTO
  ): { success: boolean; error?: string } {
    const { room, userId } = data;

    // Validate input
    if (!room) {
      client.emit('error', {
        code: 'INVALID_INPUT',
        message: 'room is required',
      });
      return { success: false, error: 'room is required' };
    }

    // Check room limit
    const limitCheck = this.wsRoomLimitGuard.canJoinRoom(client, room);
    if (!limitCheck.allowed) {
      this.logger.warn(`Client ${client.id} cannot join room ${room}: ${limitCheck.reason}`);
      client.emit('error', {
        code: 'ROOM_LIMIT_EXCEEDED',
        message: limitCheck.reason,
        currentRoomCount: limitCheck.currentCount,
      });
      return { success: false, error: limitCheck.reason };
    }

    client.join(room);

    if (!this.rooms.has(room)) {
      this.rooms.set(room, new Set());
    }

    const participant: RoomParticipant = {
      socketId: client.id,
      userId: userId || this.socketToUser.get(client.id),
      joinedAt: new Date(),
    };

    const roomParticipantsSet = this.rooms.get(room);
    if (roomParticipantsSet) {
      roomParticipantsSet.add(participant);
    }

    if (userId) {
      this.socketToUser.set(client.id, userId);
    }

    const roomParticipants = this.rooms.get(room);
    this.server.to(room).emit(WSEvent.USER_JOINED, {
      socketId: client.id,
      userId: participant.userId,
      participantCount: roomParticipants?.size ?? 0,
    });

    this.logger.log(`Client ${client.id} joined room: ${room}`);
    return { success: true };
  }
```

Update send_message handler:

```typescript
  @UseGuards(WsRateLimitGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @SubscribeMessage('send_message')
  handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SendMessageDto,  // Use DTO
  ): void {
    const { room, message } = data;

    // Validate input
    if (!room || message === undefined) {
      client.emit('error', {
        code: 'INVALID_INPUT',
        message: 'room and message are required',
      });
      return;
    }

    // Validate message size
    const messageSize = Buffer.byteLength(JSON.stringify(message), 'utf8');
    const MAX_MESSAGE_SIZE = 1048576; // 1MB

    if (messageSize > MAX_MESSAGE_SIZE) {
      this.logger.warn(`Message from client ${client.id} exceeds size limit: ${messageSize} bytes`);
      client.emit('error', {
        code: 'MESSAGE_TOO_LARGE',
        message: `Message size ${messageSize} bytes exceeds limit of ${MAX_MESSAGE_SIZE} bytes`,
      });
      return;
    }

    this.server.to(room).emit(WSEvent.MESSAGE, {
      from: client.id,
      userId: this.socketToUser.get(client.id),
      message,
      timestamp: new Date(),
    });

    this.logger.debug(`Message sent to room ${room} from ${client.id}`);
  }
```

---

## STEP 5: Environment Variables

**File:** `backend/.env`

Add or verify these variables:

```bash
# WebSocket Configuration
REALTIME_CORS_ORIGIN=http://localhost:3000,https://yourdomain.com
WS_MAX_CONNECTIONS_PER_USER=5
WS_MAX_GLOBAL_CONNECTIONS=10000
WS_MAX_ROOMS_PER_USER=50
WS_RATE_LIMIT_EVENTS_PER_MINUTE=100

# Redis Configuration (for WebSocket scaling)
REDIS_ENABLED=true
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
# OR use URL:
# REDIS_URL=redis://username:password@host:port

# Production settings
NODE_ENV=production
```

---

## STEP 6: Load Balancer Configuration (Nginx Example)

**File:** `nginx.conf`

```nginx
upstream websocket_backend {
    ip_hash;  # Sticky sessions
    server backend1:3000;
    server backend2:3000;
    server backend3:3000;
}

server {
    listen 80;
    server_name api.yourdomain.com;

    # WebSocket endpoints
    location /events {
        proxy_pass http://websocket_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket timeouts
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
    }

    location /messaging {
        proxy_pass http://websocket_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket timeouts
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
    }

    # Regular API endpoints
    location /api {
        proxy_pass http://websocket_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

---

## STEP 7: Docker Compose (Optional)

**File:** `docker-compose.yml`

```yaml
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis-data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - REDIS_ENABLED=true
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - NODE_ENV=production
    depends_on:
      redis:
        condition: service_healthy
    deploy:
      replicas: 3  # Scale to 3 instances
      restart_policy:
        condition: on-failure

volumes:
  redis-data:
```

---

## STEP 8: Client-Side Implementation

**Example React Client:**

```typescript
import { io, Socket } from 'socket.io-client';

class WebSocketService {
  private socket: Socket | null = null;
  private token: string = '';

  connect(token: string) {
    this.token = token;

    this.socket = io('http://localhost:3000/events', {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      transports: ['websocket'],  // Force WebSocket only
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to WebSocket');
    });

    this.socket.on('connected', (data) => {
      console.log('Server acknowledged:', data);
    });

    this.socket.on('error', (error) => {
      console.error('❌ WebSocket error:', error);

      if (error.code === 'RATE_LIMIT_EXCEEDED') {
        console.warn(`Rate limited. Retry after ${error.retryAfter} seconds`);
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error.message);
    });

    this.socket.on('disconnect', (reason) => {
      console.warn('Disconnected:', reason);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`Reconnected after ${attemptNumber} attempts`);
    });
  }

  subscribeToCase(caseId: string) {
    this.socket?.emit('subscribe:case', { caseId }, (response: any) => {
      if (response.status === 'error') {
        console.error('Subscription failed:', response.error);
      } else {
        console.log('Subscribed to case:', caseId);
      }
    });
  }

  onCaseUpdate(callback: (data: any) => void) {
    this.socket?.on('case:updated', callback);
  }

  disconnect() {
    this.socket?.disconnect();
  }
}

export default new WebSocketService();
```

**Usage in Component:**

```typescript
import { useEffect } from 'react';
import WebSocketService from './services/websocket';

function CaseDetail({ caseId }: { caseId: string }) {
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      WebSocketService.connect(token);
      WebSocketService.subscribeToCase(caseId);

      WebSocketService.onCaseUpdate((data) => {
        console.log('Case updated:', data);
        // Update UI
      });
    }

    return () => {
      WebSocketService.disconnect();
    };
  }, [caseId]);

  return <div>Case Details</div>;
}
```

---

## STEP 9: Testing

### Unit Tests:

```bash
npm run test -- ws-rate-limit.guard.spec.ts
npm run test -- ws-room-limit.guard.spec.ts
npm run test -- ws-connection-limit.guard.spec.ts
```

### Load Testing with Artillery:

Create `artillery-websocket.yml`:

```yaml
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 100
      name: "Ramp up"
    - duration: 300
      arrivalRate: 500
      name: "Sustained load"
  engines:
    socketio:
      transports: ["websocket"]

scenarios:
  - name: "WebSocket connections"
    engine: socketio
    flow:
      - emit:
          channel: "subscribe:case"
          data:
            caseId: "test-case-123"
      - think: 5
      - emit:
          channel: "join_room"
          data:
            room: "test-room"
      - think: 10
      - emit:
          channel: "send_message"
          data:
            room: "test-room"
            message: "Hello from Artillery"
```

Run test:

```bash
npm install -g artillery
artillery run artillery-websocket.yml
```

---

## STEP 10: Monitoring Setup

### Prometheus Metrics Endpoint:

Create `backend/src/realtime/websocket-metrics.controller.ts`:

```typescript
import { Controller, Get } from '@nestjs/common';
import { WebSocketMonitorService } from './services/websocket-monitor.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('websocket')
export class WebSocketMetricsController {
  constructor(private monitorService: WebSocketMonitorService) {}

  @Public()
  @Get('metrics')
  getMetrics() {
    return this.monitorService.getMetrics();
  }

  @Public()
  @Get('health')
  getHealth() {
    return this.monitorService.getHealthStatus();
  }
}
```

Add to module:

```typescript
@Module({
  // ...
  controllers: [WebSocketMetricsController],
})
```

---

## STEP 11: Production Checklist

Before going live:

- [ ] Redis adapter enabled and tested
- [ ] CORS origins configured (no wildcards)
- [ ] SSL/TLS certificates configured
- [ ] Load balancer with sticky sessions
- [ ] Monitoring and alerting set up
- [ ] Load testing completed (10K+ connections)
- [ ] Error tracking integrated (Sentry)
- [ ] Logging configured (Winston/ELK)
- [ ] Backup Redis instance configured
- [ ] Firewall rules configured
- [ ] Rate limits tuned for production
- [ ] Documentation updated
- [ ] Runbooks created
- [ ] Team trained on monitoring

---

## STEP 12: Troubleshooting

### Issue: Clients can't connect

**Check:**
```bash
# Verify WebSocket port is open
netstat -tuln | grep 3000

# Check CORS settings
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS http://localhost:3000/events

# Check Redis connection
redis-cli ping
```

### Issue: High memory usage

**Check:**
```bash
# Get WebSocket metrics
curl http://localhost:3000/api/websocket/metrics

# Force cleanup
curl -X POST http://localhost:3000/api/websocket/cleanup
```

### Issue: Messages not delivered across servers

**Check:**
- Redis pub/sub working
- All servers connected to same Redis instance
- Sticky sessions configured in load balancer

```bash
# Monitor Redis pub/sub
redis-cli
> SUBSCRIBE *
```

---

## STEP 13: Performance Tuning

### OS-Level Tuning (Linux):

```bash
# Increase file descriptors
ulimit -n 65535

# TCP tuning
sysctl -w net.core.somaxconn=65535
sysctl -w net.ipv4.tcp_max_syn_backlog=65535
sysctl -w net.ipv4.ip_local_port_range="1024 65535"
```

### Node.js Tuning:

```bash
# Increase memory
NODE_OPTIONS="--max-old-space-size=4096" npm start

# Enable GC logging
NODE_OPTIONS="--trace-gc" npm start
```

---

## STEP 14: Security Hardening

### Add Rate Limiting by IP:

```typescript
import * as rateLimit from 'express-rate-limit';

const wsRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 connections per IP
  message: 'Too many connection attempts from this IP',
});

app.use('/events', wsRateLimiter);
app.use('/messaging', wsRateLimiter);
```

### Add Helmet for Security Headers:

Already configured in main.ts, but verify:

```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      'connect-src': ["'self'", "ws://localhost:3000", "wss://api.yourdomain.com"],
    },
  },
}));
```

---

## COMPLETE! 🎉

Your WebSocket implementation is now production-ready with:
✅ Horizontal scaling via Redis
✅ Enterprise security controls
✅ Comprehensive monitoring
✅ Load balancing support
✅ Input validation
✅ Rate limiting
✅ Connection management
✅ Error handling

**Next Steps:**
1. Deploy to staging environment
2. Run load tests
3. Monitor for 24-48 hours
4. Deploy to production
5. Monitor continuously

---

**Questions?** Check the `WEBSOCKET_AUDIT_REPORT.md` for detailed security analysis.
