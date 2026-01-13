# Real-Time Backend Monitoring

## Key Principle

**Backend status monitoring is ALWAYS active and INDEPENDENT of your current data source.**

You can be using IndexedDB (local storage) while the system continuously monitors if the backend is available. This allows you to see when the backend becomes available and switch to it whenever you're ready.

---

## Visual States

### Scenario 1: Local Mode + Backend Available ✅

```
┌─────────────────────────────────────────┐
│  Sidebar Footer                         │
│  ┌────────────────────────────────┐    │
│  │ 💚 Local (Backend Ready)  ⚡️  │    │
│  │    Backend ready • 45ms        │    │
│  └────────────────────────────────┘    │
└─────────────────────────────────────────┘

Status: Using IndexedDB, but backend is detected and healthy
Visual: Green pulse animation, shows latency
Action: Can switch to backend anytime
```

### Scenario 2: Local Mode + Backend Unavailable

```
┌─────────────────────────────────────────┐
│  Sidebar Footer                         │
│  ┌────────────────────────────────┐    │
│  │ ⬜ Local Only                  │    │
│  │    No backend connection       │    │
│  └────────────────────────────────┘    │
└─────────────────────────────────────────┘

Status: Using IndexedDB, backend not detected
Visual: Gray, no animation
Action: Cannot switch to backend (option disabled)
```

### Scenario 3: Backend Mode + Backend Available ✅

```
┌─────────────────────────────────────────┐
│  Sidebar Footer                         │
│  ┌────────────────────────────────┐    │
│  │ 🟢 Online  ⚡️                  │    │
│  │    45ms latency                │    │
│  └────────────────────────────────┘    │
└─────────────────────────────────────────┘

Status: Using backend, connection is healthy
Visual: Green pulse animation, shows latency
Action: Backend is active and responsive
```

### Scenario 4: Backend Mode + Backend Lost Connection 🔴

```
┌─────────────────────────────────────────┐
│  Sidebar Footer                         │
│  ┌────────────────────────────────┐    │
│  │ 🔴 Offline                     │    │
│  │    Connection lost             │    │
│  └────────────────────────────────┘    │
└─────────────────────────────────────────┘

Status: Was using backend, now offline
Visual: Red, no animation
Action: Can switch back to Local mode for offline work
```

---

## Admin Panel - Data Source Selector

When you open **Admin Console → System → Settings**, you see:

```
┌───────────────────────────────────────────────────────────┐
│  🔵 Real-Time Backend Monitoring                          │
│  Backend status is monitored continuously every 30        │
│  seconds, regardless of your current data source.         │
└───────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────┐
│  Backend Status: Online ✅                       🔄       │
│  • Latency: 45ms ⚡                                        │
│  • Version: 1.0.0                                         │
│  • Last checked: 3s ago (auto-refresh in 27s)            │
└───────────────────────────────────────────────────────────┘

Data Source Options:
○ Local (IndexedDB)         [Always available]
● Backend (PostgreSQL)      [Available now ✅]
○ Cloud Sync               [Coming soon]
```

---

## Real-Time Updates

### Live Countdown Timer

The system shows you exactly when the next check will happen:

```
Last checked: 5s ago (auto-refresh in 25s)
              ↓ updates every second ↓
Last checked: 6s ago (auto-refresh in 24s)
              ↓ updates every second ↓
Last checked: 7s ago (auto-refresh in 23s)
```

After 30 seconds, it refreshes:

```
[Polling backend...]
Last checked: 0s ago (auto-refresh in 30s)
Backend Status: Online ✅
Latency: 42ms
```

### Visual Pulse Animation

When backend is available, you see:

1. **Pulsing dot** in top-right of status panel
2. **Animated icon** that pulses gently
3. **Green glow** effect around status indicator

This continues **even when using Local mode** - reminding you that backend is ready whenever you want to switch.

---

## Timeline Example

Here's what happens in a typical session:

```
00:00  App starts
       └─ Data source: IndexedDB (Local)
       └─ Discovery service starts
       └─ Backend status: Checking...

00:02  First check completes
       └─ Backend status: Unavailable
       └─ Indicator: ⬜ Local Only

05:30  Backend server started by dev
       └─ Still polling in background...

05:32  Discovery detects backend! (30s interval)
       └─ Backend status: Available ✅
       └─ Indicator: 💚 Local (Backend Ready) + pulse
       └─ Notification: Backend is now available

05:45  User sees pulse in sidebar
       └─ "Oh, backend is ready!"
       └─ Navigates to Admin → System → Settings

05:46  User switches to Backend
       └─ Confirms dialog
       └─ Page reloads
       └─ Now using PostgreSQL
       └─ Indicator: 🟢 Online + pulse

15:00  Backend crashes (oops!)
       └─ Discovery detects in next poll...

15:02  Discovery marks backend offline
       └─ Backend status: Unavailable
       └─ Indicator: 🔴 Offline
       └─ User can switch back to Local if needed

15:05  Backend restarted and healthy
       └─ Discovery detects in next poll...

15:32  Discovery marks backend online again
       └─ Backend status: Available ✅
       └─ Indicator: 🟢 Online + pulse
       └─ Continues working normally
```

---

## Why This Matters

### 1. **Situational Awareness**

You always know if the backend is available, even when not using it.

```
Developer workflow:
1. Start frontend → works immediately (Local mode)
2. See "Local Only" in sidebar
3. Start backend when ready
4. Within 30s, see "Backend Ready" pulse
5. Switch when convenient
```

### 2. **Graceful Degradation**

If backend goes down while you're using it:

```
1. Indicator turns red 🔴
2. You see "Offline" status
3. Can immediately switch to Local mode
4. Keep working without backend
5. When backend returns, switch back
```

### 3. **No Surprises**

The system never automatically switches data sources:

```
✅ Backend detected → Shows indicator, waits for user
✅ Backend lost    → Shows indicator, waits for user
❌ Never auto-switches → User always in control
```

### 4. **Development Flexibility**

Perfect for development workflow:

```
Terminal 1: npm run dev (frontend)
           └─ Starts immediately, uses Local

Terminal 2: cd backend && npm run start:dev
           └─ Frontend detects it within 30s
           └─ Shows "Backend Ready" with pulse
           └─ Switch whenever you want to test API
```

---

## Technical Implementation

### Polling Logic

```typescript
class BackendDiscoveryService {
  private CHECK_INTERVAL = 30000; // 30 seconds
  private TIMEOUT = 5000;         // 5 seconds

  start() {
    // Initial check immediately
    this.checkBackend();

    // Then every 30 seconds
    setInterval(() => {
      this.checkBackend();
    }, 30000);
  }

  async checkBackend() {
    try {
      const response = await fetch('http://localhost:5000/health', {
        timeout: 5000
      });

      if (response.ok) {
        this.updateStatus({
          available: true,
          healthy: true,
          latency: responseTime
        });
      }
    } catch (error) {
      this.updateStatus({
        available: false,
        healthy: false,
        error: error.message
      });
    }
  }
}
```

### React Integration

```typescript
// In any component:
const { isAvailable, isHealthy, latency } = useBackendDiscovery();

// Updates automatically every 30s
// No manual polling needed
// No prop drilling required
```

### Visual Feedback

```typescript
// Pulse animation CSS (already included):
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .5; }
}

// Ping animation for status dot:
.animate-ping {
  animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}
```

---

## User Benefits

### For End Users

✅ **Always informed** - Know backend status at a glance  
✅ **No interruptions** - Never forced to switch  
✅ **Smooth transitions** - Switch when convenient  
✅ **Offline capable** - Keep working if backend goes down

### For Developers

✅ **Start fast** - Frontend works immediately  
✅ **Flexible workflow** - Start backend when needed  
✅ **Easy testing** - See backend availability in real-time  
✅ **Debug friendly** - Clear status indicators

### For System Admins

✅ **Health monitoring** - Live backend status  
✅ **Latency tracking** - Performance visibility  
✅ **Version info** - Know what's running  
✅ **Incident response** - Immediate problem visibility

---

## Summary

The backend discovery system provides **continuous, real-time monitoring** of backend availability while maintaining **complete user control** over data source selection.

**Key Features:**
- ⏰ Monitors every 30 seconds
- 🎯 Works regardless of active data source
- 👁️ Visual pulse when backend available
- ⏱️ Live countdown to next check
- 📊 Latency and version display
- 🔄 Auto-detects backend start/stop
- 🎨 Color-coded status indicators
- ⚡ Sub-100ms latency alerts

**The Result:**
Users have full situational awareness of backend availability while maintaining complete control over when and how they use it.
