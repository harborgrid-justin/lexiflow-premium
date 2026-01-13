# Port Configuration Reference

## Summary
All configuration files and documentation have been verified and aligned.

## Actual Configuration

### Frontend (Vite)
- **Port**: `3000`
- **Config File**: `frontend/vite.config.ts`
- **Access**: `http://localhost:3000`

### Backend (NestJS)
- **Port**: `5000`
- **Config File**: `backend/src/config/configuration.ts`
- **Access**: `http://localhost:5000`
- **API Prefix**: `/api/v1`
- **Swagger**: `http://localhost:5000/api/docs`

### Frontend -> Backend Communication
- **API Base URL**: `http://localhost:5000` (in `frontend/config/master.config.ts`)
- **WebSocket URL**: `ws://localhost:5000` (in `frontend/config/master.config.ts`)
- **Health Check**: `http://localhost:5000/health`

## Environment Variables

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
VITE_WS_URL=ws://localhost:5000
VITE_USE_BACKEND_API=false
```

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
API_PREFIX=api/v1
```

## Quick Start

```bash
# Terminal 1: Frontend
cd frontend
npm install
npm run dev
# Access at http://localhost:3000

# Terminal 2: Backend
cd backend
npm install
npm run start:dev
# Access at http://localhost:5000
# Swagger at http://localhost:5000/api/docs
```

## Backend Discovery

The frontend automatically discovers the backend via:
- **Polling**: Every 30 seconds
- **Endpoint**: `http://localhost:5000/health`
- **Service**: `frontend/services/backendDiscovery.ts`

## Verification Status

✅ **All configuration files verified**
- frontend/vite.config.ts: port 3000
- backend/src/config/configuration.ts: port 5000
- backend/.env.example: PORT=5000
- frontend/config/master.config.ts: API_BASE_URL=http://localhost:5000
- frontend/.env.example: VITE_API_URL=http://localhost:5000

✅ **All documentation corrected**
- README.md (root): Correct ports documented
- backend/README.md: Swagger URL corrected
- docs/BACKEND_AUTO_DISCOVERY*.md: All ports corrected
- docs/backend/*.md: All API endpoints corrected

✅ **Backend discovery will work correctly**
- Frontend polls http://localhost:5000/health
- Discovery service configured with correct URL
- User-controlled data source switching enabled

## Common Issues Resolved

### Issue: Backend discovery fails
**Cause**: Frontend was trying to reach backend at wrong port
**Resolution**: Updated `master.config.ts` API_BASE_URL from `localhost:3000` to `localhost:5000`

### Issue: Documentation showed wrong ports
**Cause**: Mix-up between default Vite port (5173), configured frontend port (3000), and backend port (5000)
**Resolution**: Systematic review and correction of all documentation files

### Issue: Curl examples in docs didn't work
**Cause**: Backend docs showed `localhost:3000` instead of `localhost:5000`
**Resolution**: Updated all curl examples in backend documentation

## Notes

- Default Vite port is `5173`, but we configured it to `3000` in `vite.config.ts`
- Backend default port is `5000` (set in `configuration.ts`)
- CORS is configured to allow `http://localhost:3000` (frontend origin)
- Backend discovery is independent of data source selection (runs continuously)
