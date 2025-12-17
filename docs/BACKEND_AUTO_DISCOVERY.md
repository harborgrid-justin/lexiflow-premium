# Backend Auto-Discovery & Data Source Switching

## Overview

LexiFlow now features **real-time backend discovery** with user-controlled data source switching. The system **continuously monitors backend availability every 30 seconds**, displaying live status updates **regardless of which data source is currently active**. This allows users to see backend availability in real-time while maintaining full control over when to switch data sources.

## Architecture

### Components

1. **BackendDiscoveryService** (`services/backendDiscovery.ts`)
   - Polls backend health endpoint every 30 seconds
   - Tracks availability, health status, latency, and version
   - Publishes status updates to subscribers
   - Operates independently from data source selection

2. **useBackendDiscovery Hook** (`hooks/useBackendDiscovery.ts`)
   - React hook providing reactive access to backend status
   - Auto-subscribes to status changes
   - Provides manual refresh capability

3. **DataSourceSelector** (`components/common/DataSourceSelector.tsx`)
   - UI for switching between data sources
   - Shows backend availability status
   - Prevents switching to backend sources when unavailable
   - Confirms before switching (triggers page reload)

4. **BackendStatusIndicator** (`components/common/BackendStatusIndicator.tsx`)
   - Minimal status indicator for header/sidebar
   - Shows current data source and backend health
   - Available in compact and full variants

5. **SystemSettings** (`components/admin/SystemSettings.tsx`)
   - Admin panel section for system configuration
   - Houses the DataSourceSelector
   - Accessible via Admin Console → System → Settings

## Data Sources

### IndexedDB (Local)
- **Default mode** - works offline
- All data stored in browser's IndexedDB
- No backend connection required
- Best for: Development, offline work, demos

### PostgreSQL (Backend)
- Server-backed data storage
- Requires backend running on `http://localhost:5000`
- Real-time sync capabilities
- Best for: Production, multi-user, data persistence

### Cloud Sync (Future)
- Hybrid mode with local cache
- Cloud backup and synchronization
- Currently placeholder for future implementation

## User Workflow

### Initial State
1. Frontend starts in IndexedDB (local) mode
2. Backend discovery service starts automatically
3. Status indicator shows "Local" mode with real-time backend status
4. Backend availability monitored in background **continuously** (updates every 30s)
5. If backend is detected while in Local mode, indicator shows "Local (Backend Ready)" with pulse animation

### Switching to Backend
1. User navigates to **Admin Console → System → Settings**
2. Backend status panel shows:
   - ✅ Online (if backend detected)
   - ❌ Offline (if backend unavailable)
   - Latency and version info
3. User selects "Backend (PostgreSQL)" option
4. Confirmation dialog appears (warns about reload)
5. On confirm:
   - Data source preference saved to localStorage
   - Page reloads with backend mode active
   - All subsequent API calls go to backend

### Switching Back to Local
1. Follow same process as above
2. Select "Local (IndexedDB)" option
3. Confirm and reload
4. Data source reverts to browser storage

## Implementation Details

### Backend Health Endpoint

The discovery service expects a `/health` endpoint:

```typescript
GET http://localhost:5000/health

Response:
{
  "status": "ok",
  "version": "1.0.0"
}
```

### Real-Time Status Polling

- **Interval**: 30 seconds (configurable)
- **Timeout**: 5 seconds per check
- **Continuous**: Always running, independent of current data source
- **Silent failures**: Only logs when status changes
- **Automatic retry**: Continues polling even if backend goes down
- **Visual feedback**: 
  - Pulse animation when backend is detected
  - Live countdown to next check
  - Millisecond latency display
  - "Time since last check" counter

### Data Source Persistence

```typescript
// Stored in localStorage
VITE_USE_BACKEND_API: 'true' | 'false'

// Maps to:
'true'  → PostgreSQL/Cloud mode
'false' → IndexedDB mode
```

### Integration Points

**App.tsx**
```typescript
useEffect(() => {
  backendDiscovery.start(); // Start on mount
  return () => backendDiscovery.stop(); // Stop on unmount
}, []);
```

**DataSourceContext**
```typescript
// Reads localStorage on init
// Provides switchDataSource() method
// Invalidates queries and reloads on switch
```

**DataService Facade**
```typescript
// Already checks isBackendApiEnabled()
// Routes to apiServices or repositories
// No changes needed
```

## Configuration

### Environment Variables

```env
# Backend URL (default: http://localhost:5000)
VITE_API_URL=http://localhost:5000

# API prefix (default: /api/v1)
VITE_API_PREFIX=/api/v1
```

### Discovery Settings

Edit `services/backendDiscovery.ts`:

```typescript
private readonly CHECK_INTERVAL_MS = 30000; // Polling interval
private readonly TIMEOUT_MS = 5000;         // Request timeout
```

## UI Locations

### Admin Console
**Path**: Admin Console → System → Settings  
**Component**: `<DataSourceSelector />`  
**Purpose**: Full data source management interface

### Status Indicator
**Locations**: Can be added to:
- AppHeader (top bar)
- Sidebar footer
- Settings dropdown

**Component**: `<BackendStatusIndicator variant="compact" />`

## Backend Setup

### Starting the Backend

```bash
cd backend
npm install
npm run start:dev  # Runs on port 5000
```

### Health Check

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "memory": { "status": "up" }
  }
}
```

## Development Notes

### Testing Auto-Discovery

1. Start frontend: `npm run dev` (from root)
2. Check console for: `[BackendDiscovery] Starting auto-discovery service`
3. Initially shows: `Backend unavailable`
4. Start backend: `cd backend && npm run start:dev`
5. Within 30s, status updates to: `Backend is healthy`

### Testing Data Source Switching

1. Go to Admin Console → System → Settings
2. Verify backend status shows "Online"
3. Click "Backend (PostgreSQL)" option
4. Confirm reload dialog
5. After reload, verify:
   - Status indicator shows "Online"
   - DataService routes to API endpoints
   - Data persists to PostgreSQL

### Debugging

Enable detailed logging:

```typescript
// In backendDiscovery.ts
console.log('[BackendDiscovery]', ...);  // Already present

// Check current data source
localStorage.getItem('VITE_USE_BACKEND_API')  // 'true' or 'false'
```

## Future Enhancements

### Planned Features
- [ ] Automatic failover to IndexedDB if backend goes down
- [ ] Background sync queue for offline changes
- [ ] Cloud sync implementation
- [ ] Multiple backend support (staging, production)
- [ ] Health metrics dashboard
- [ ] Connection retry with exponential backoff
- [ ] WebSocket connection for real-time status

### API Improvements
- [ ] Backend version compatibility checking
- [ ] Feature flag support
- [ ] Dynamic API endpoint discovery
- [ ] Authentication token refresh on reconnect

## Troubleshooting

### Backend Shows Offline When Running

**Check:**
1. Backend is running: `curl http://localhost:5000/health`
2. CORS is enabled (already configured in backend)
3. No firewall blocking localhost:5000
4. Check browser console for CORS errors

**Solution:**
- Click refresh button in status panel
- Check backend logs: `npm run start:dev`

### Data Not Switching After Source Change

**Cause:** Query cache not invalidated

**Solution:**
```typescript
// DataSourceContext already calls this:
queryClient.invalidate('');  // Clears all queries
window.location.reload();    // Full page reload
```

### Backend Available But Can't Switch

**Check:**
1. Backend health status is "healthy" (not just "available")
2. No confirmation dialog blocking (popup blockers)
3. localStorage is accessible

## Files Modified

### New Files
- `frontend/services/backendDiscovery.ts`
- `frontend/hooks/useBackendDiscovery.ts`
- `frontend/components/common/DataSourceSelector.tsx`
- `frontend/components/common/BackendStatusIndicator.tsx`
- `frontend/components/admin/SystemSettings.tsx`

### Modified Files
- `frontend/App.tsx` - Added discovery service initialization
- `frontend/components/admin/AdminPanelContent.tsx` - Added SystemSettings route
- `frontend/config/tabs.config.ts` - Added System Settings tab

### Existing Files (No Changes)
- `frontend/context/DataSourceContext.tsx` - Already supports switching
- `frontend/services/dataService.ts` - Already routes based on flag
- `frontend/services/apiClient.ts` - Already configured for backend

## Best Practices

### For Users
1. **Start local** - Begin with IndexedDB for immediate access
2. **Check status** - Verify backend is online before switching
3. **Backup first** - Export data before switching sources
4. **Confirm switch** - Understand that switching reloads the app

### For Developers
1. **Test both modes** - Ensure features work in local and backend modes
2. **Handle offline** - Design for backend unavailability
3. **Use DataService** - Always use the facade, never direct DB/API calls
4. **Monitor status** - Subscribe to discovery events for reactive UIs

## Summary

The backend auto-discovery system provides:
- ✅ Automatic backend detection
- ✅ User-controlled data source switching
- ✅ Visual status indicators
- ✅ No automatic switches (user choice)
- ✅ Graceful offline handling
- ✅ Minimal performance impact (30s polling)

Users maintain full control while benefiting from automatic backend detection and seamless infrastructure switching.
