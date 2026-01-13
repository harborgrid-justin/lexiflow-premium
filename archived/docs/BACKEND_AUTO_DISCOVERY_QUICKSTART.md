# Backend Auto-Discovery - Quick Start Guide

## For End Users

### Real-Time Backend Status Monitoring

**Important**: Backend status is monitored **continuously every 30 seconds**, regardless of which data source you're currently using. The status you see is always live and up-to-date.

1. Look at the **sidebar footer** - you'll see a **real-time status indicator**:
   - 💚 **Local (Backend Ready)** + pulse - Using browser storage, backend detected and ready to use
   - ⬜ **Local Only** - Using browser storage, no backend available
   - 🟩 **Online** + pulse - Using backend server (healthy connection)
   - 🟨 **Degraded** - Using backend server (slow or issues)
   - 🟥 **Offline** - Backend unavailable (can switch to Local mode)

2. **Watch for the pulse animation** - When you see a pulsing indicator, the backend is healthy and available!

### Switching Data Sources

1. **Navigate to Settings**:
   - Click **Admin Console** in the sidebar
   - Select **System** tab
   - Click **Settings** sub-tab

2. **Check Backend Status**:
   - Look at the "Backend Status" panel
   - Ensure it shows "Online ✅" before switching
   - Note the latency (should be <100ms for good performance)

3. **Select Data Source**:
   - Choose between:
     - **Local (IndexedDB)** - Works offline, browser storage
     - **Backend (PostgreSQL)** - Server storage, real-time sync
     - **Cloud Sync** - Coming soon
   
4. **Confirm Switch**:
   - Click your desired option
   - Read the confirmation dialog
   - Click "OK" to proceed
   - App will reload automatically

5. **Verify**:
   - After reload, check sidebar footer
   - Should show new data source

---

## For Developers

### Local Development Setup

```bash
# Terminal 1: Start Frontend
npm run dev
# Runs on http://localhost:3000

# Terminal 2: Start Backend (optional)
cd backend
npm run start:dev
# Runs on http://localhost:5000
```

### Testing Real-Time Auto-Discovery

1. **Start only frontend** (no backend):
   ```bash
   npm run dev
   ```
   - Open browser: http://localhost:3000
   - Check console: `[BackendDiscovery] Backend unavailable`
   - Sidebar shows: "Local Only" (gray, no pulse)

2. **Start backend while frontend is running**:
   ```bash
   cd backend
   npm run start:dev
   ```
   - **Wait up to 30 seconds** (next polling cycle)
   - Console: `[BackendDiscovery] Backend is healthy (45ms)`
   - **Sidebar automatically updates to**: "Local (Backend Ready)" with green pulse! 
   - **You didn't reload** - it updated in real-time!

3. **Manual switch** (when ready):
   - Go to Admin Console → System → Settings
   - Notice the blue "Real-Time Monitoring Active" badge
   - Backend status shows "Online ✅" with pulse animation
   - See live countdown: "Last checked: 5s ago (auto-refresh in 25s)"
   - Click "Backend (PostgreSQL)"
   - Confirm → Page reloads
   - Sidebar now shows: "Online" with pulse

4. **Test disconnection** (while using backend):
   - Stop backend: `Ctrl+C` in Terminal 2
   - Wait up to 30 seconds
   - **Sidebar automatically turns red**: "Offline"
   - You can switch back to "Local" mode to keep working

### Adding Status Indicator to Your Component

```tsx
import { BackendStatusIndicator } from '../common/BackendStatusIndicator';

export const YourComponent = () => {
  return (
    <div>
      {/* Compact variant */}
      <BackendStatusIndicator variant="compact" showLabel={true} />
      
      {/* Full variant */}
      <BackendStatusIndicator variant="full" showLabel={true} />
    </div>
  );
};
```

### Using Backend Discovery in Your Component

```tsx
import { useBackendDiscovery } from '@/hooks/useBackendDiscovery';

export const YourComponent = () => {
  const { 
    isAvailable,    // Backend reachable
    isHealthy,      // Backend healthy
    latency,        // Response time in ms
    version,        // Backend version
    error,          // Error message if any
    refresh,        // Manual refresh function
  } = useBackendDiscovery();

  return (
    <div>
      {isAvailable ? (
        <p>Backend online ({latency}ms)</p>
      ) : (
        <p>Backend offline: {error}</p>
      )}
      
      <button onClick={refresh}>Refresh Status</button>
    </div>
  );
};
```

### Checking Current Data Source

```tsx
import { useDataSource } from '../../context/DataSourceContext';

export const YourComponent = () => {
  const { 
    currentSource,      // 'indexeddb' | 'postgresql' | 'cloud'
    switchDataSource,   // Function to switch
    isBackendApiEnabled // Boolean flag
  } = useDataSource();

  const handleSwitch = async () => {
    await switchDataSource('postgresql');
    // Page will reload automatically
  };

  return (
    <div>
      <p>Current source: {currentSource}</p>
      <p>Backend API enabled: {isBackendApiEnabled ? 'Yes' : 'No'}</p>
    </div>
  );
};
```

### Data Access Pattern

**Always use DataService** - it automatically routes to correct source:

```tsx
import { DataService } from '../services/dataService';

export const YourComponent = () => {
  const loadCases = async () => {
    // DataService automatically uses IndexedDB or Backend
    // based on current data source setting
    const cases = await DataService.cases.getAll();
    console.log(cases);
  };

  return <button onClick={loadCases}>Load Cases</button>;
};
```

### Backend Health Endpoint

Ensure your backend has a health endpoint:

```typescript
// backend/src/health/health.controller.ts
@Get('health')
async check() {
  return {
    status: 'ok',
    version: '1.0.0',
  };
}
```

### Configuration Options

Edit polling interval in `services/backendDiscovery.ts`:

```typescript
private readonly CHECK_INTERVAL_MS = 30000; // 30 seconds
private readonly TIMEOUT_MS = 5000;         // 5 seconds
```

### Debugging Tips

**Check discovery status**:
```javascript
// In browser console
localStorage.getItem('VITE_USE_BACKEND_API')
// Returns: 'true' (backend) or 'false' (local)
```

**Test backend manually**:
```bash
curl http://localhost:5000/health
# Should return: {"status":"ok","version":"1.0.0"}
```

**Check console logs**:
```
[BackendDiscovery] Starting auto-discovery service
[BackendDiscovery] Backend is healthy (45ms)
[DataSource] Current data source: indexeddb
```

### Common Issues

**Backend shows offline but is running**:
- Check CORS is enabled (should already be configured)
- Verify health endpoint: `curl http://localhost:5000/health`
- Check backend logs for errors
- Click "Refresh" button in status panel

**Can't switch to backend**:
- Verify backend status shows "Online" not just "Available"
- Check for popup blockers (confirmation dialog)
- Ensure localStorage is accessible

**Data not appearing after switch**:
- Data sources are separate - no auto-sync
- IndexedDB data ≠ PostgreSQL data
- Must manually migrate data if needed

### Testing Checklist

- [ ] Start frontend only - shows "Local" status
- [ ] Start backend - discovery detects it within 30s
- [ ] Switch to backend - page reloads, shows "Online"
- [ ] Stop backend - status changes to "Offline"
- [ ] Switch back to local - page reloads, shows "Local"
- [ ] Status indicator updates in real-time
- [ ] Manual refresh button works

---

## Architecture Quick Reference

```
Frontend (Vite)                Backend (NestJS)
http://localhost:3000          http://localhost:5000
        │                              │
        ├─ BackendDiscovery ──────────┤ GET /health
        │  (polls every 30s)           │
        │                              │
        ├─ DataService                 │
        │  ├─ IndexedDB (local)        │
        │  └─ apiClient ───────────────┤ /api/v1/*
        │                              │
        └─ User selects in             │
           Admin → System → Settings   │
```

## File Locations

**Core Services**:
- `frontend/services/backendDiscovery.ts` - Discovery service
- `frontend/services/dataService.ts` - Data access facade
- `frontend/context/DataSourceContext.tsx` - Switching logic

**UI Components**:
- `frontend/components/common/DataSourceSelector.tsx` - Full UI
- `frontend/components/common/BackendStatusIndicator.tsx` - Status badge
- `frontend/components/admin/SystemSettings.tsx` - Settings panel

**Hooks**:
- `frontend/hooks/useBackendDiscovery.ts` - React hook
- `frontend/context/DataSourceContext.tsx` - useDataSource hook

**Configuration**:
- `frontend/config/master.config.ts` - API_BASE_URL
- `frontend/config/tabs.config.ts` - Admin tabs
- `.env` - Environment variables (optional)

## Next Steps

1. ✅ Test auto-discovery with backend on/off
2. ✅ Try switching data sources
3. ✅ Add status indicator to your components
4. ✅ Use useBackendDiscovery hook for reactive UIs
5. ✅ Always use DataService for data access

## Support

- Check `docs/BACKEND_AUTO_DISCOVERY.md` for full documentation
- Check `docs/BACKEND_AUTO_DISCOVERY_ARCHITECTURE.md` for diagrams
- Review implementation in `frontend/services/backendDiscovery.ts`
- Test with provided backend: `cd backend && npm run start:dev`
