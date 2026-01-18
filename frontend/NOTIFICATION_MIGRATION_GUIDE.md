# Notification Service Migration Guide

## Overview
The notification services have been consolidated into a single, enhanced `BrowserNotificationService` that combines the best features from both previous implementations.

## What Changed

### ✅ Consolidated Services
- **OLD**: Two separate browser notification implementations
  - `BrowserNotificationService` (notification/NotificationService.ts)
  - `NotificationServiceClass` (infrastructure/notification.service.ts)
- **NEW**: Single enhanced `BrowserNotificationService` with all features

### ✅ Features Preserved
All features from both implementations are preserved:
- ✓ Desktop notifications (Notification API)
- ✓ Audio feedback with priority-based frequencies
- ✓ Notification grouping (3+ similar → collapsed)
- ✓ Auto-dismiss with configurable durations
- ✓ EventEmitter pattern for subscriptions
- ✓ Listener pattern for backward compatibility
- ✓ Convenience functions (notify.success, notify.error, etc.)
- ✓ Persistent storage of preferences
- ✓ BaseService lifecycle management
- ✓ ServiceRegistry integration

## Migration Steps

### For Components Using `notify.*` Convenience Functions

**Before:**
```typescript
import { notify } from '@/services/infrastructure/notification.service';

notify.success('Saved', 'Document saved successfully');
notify.error('Failed', 'Upload failed');
notify.withUndo('Deleted', 'Item deleted', () => restore());
```

**After:**
```typescript
import { notify } from '@/services/notification/NotificationService';

// Same API - no code changes needed!
notify.success('Saved', 'Document saved successfully');
notify.error('Failed', 'Upload failed');
notify.withUndo('Deleted', 'Item deleted', () => restore());
```

### For Components Using Direct NotificationService

**Before:**
```typescript
import { NotificationService } from '@/services/infrastructure/notification.service';

const id = NotificationService.add({
  title: 'Hello',
  message: 'World',
  type: 'info',
  priority: 'normal'
});

NotificationService.markAsRead(id);
const count = NotificationService.getUnreadCount();
```

**After:**
```typescript
import { notify } from '@/services/notification/NotificationService';
// OR via ServiceRegistry:
import { ServiceRegistry } from '@/services/core/ServiceRegistry';

const service = ServiceRegistry.get('NotificationService');
const id = service.show({
  title: 'Hello',
  message: 'World',
  type: 'info',
  priority: 'normal'
});

service.markAsRead(id);
const count = service.getUnreadCount();
```

### For Hooks Using ServiceRegistry

**No changes needed!**
```typescript
// useNotification.ts - Already using ServiceRegistry
const notificationService = ServiceRegistry.get('NotificationService');
// Works automatically with enhanced service
```

## API Changes

### Method Mapping

| Old (infrastructure) | New (enhanced) | Notes |
|---------------------|----------------|-------|
| `NotificationService.add()` | `service.show()` | Same functionality |
| `NotificationService.remove()` | `service.dismiss()` | Same functionality |
| `NotificationService.subscribe()` | `service.addListener()` | Same functionality |
| `NotificationService.markAsRead()` | `service.markAsRead()` | Same functionality |
| `NotificationService.markAllAsRead()` | `service.markAllAsRead()` | Same functionality |
| `NotificationService.getAll()` | `service.getAll()` | Same functionality |
| `NotificationService.getUnreadCount()` | `service.getUnreadCount()` | Same functionality |
| `NotificationService.getGrouped()` | `service.getGrouped()` | Same functionality |
| `NotificationService.setSoundEnabled()` | `service.setSoundEnabled()` | Same functionality |
| `NotificationService.getSoundEnabled()` | `service.getSoundEnabled()` | Same functionality |
| `NotificationService.getDesktopEnabled()` | `service.getDesktopEnabled()` | Same functionality |
| `notify.*` functions | `notify.*` functions | ✅ No changes |

## Deprecation Timeline

### Phase 1: Soft Deprecation (Current)
- ✅ Enhanced BrowserNotificationService available
- ⚠️ `infrastructure/notification.service.ts` marked as deprecated
- ✅ Convenience functions (`notify.*`) work from both locations
- 📝 This migration guide created

### Phase 2: Update Imports (Next PR)
- Update all imports to use new location
- Fix any breaking changes
- Test all notification flows

### Phase 3: Remove Deprecated (Future)
- Remove `infrastructure/notification.service.ts`
- Final cleanup

## Testing Checklist

After migration, test these flows:

- [ ] Toast notifications appear correctly
- [ ] Desktop notifications work (with permission)
- [ ] Sound plays for different priorities
- [ ] Auto-dismiss works (success, warning)
- [ ] Persistent notifications don't auto-dismiss (errors)
- [ ] Grouping works (3+ similar notifications)
- [ ] Mark as read works
- [ ] Mark all as read works
- [ ] Unread count is accurate
- [ ] Notification actions work (buttons)
- [ ] Undo functionality works
- [ ] Sound preference persists
- [ ] ServiceRegistry integration works
- [ ] useNotification hook works
- [ ] useNotifications hook works

## Breaking Changes

### None! 
The migration is designed to be backward compatible. The convenience functions (`notify.*`) work from the new location with the same API.

## Known Issues

None at this time.

## Support

For questions or issues with migration:
1. Check this guide
2. Review PHASE_2_ANALYSIS.md
3. Check the enhanced NotificationService implementation
4. Ask the team

## Examples

### Basic Toast Notification
```typescript
import { notify } from '@/services/notification/NotificationService';

// Info (no auto-dismiss)
notify.info('Meeting Started', 'The team standup has begun');

// Success (3s auto-dismiss)
notify.success('Saved', 'Document saved successfully');

// Warning (5s auto-dismiss)
notify.warning('Slow Connection', 'Check your internet');

// Error (persistent, manual dismiss)
notify.error('Upload Failed', 'Please try again');
```

### With Actions
```typescript
import { notify } from '@/services/notification/NotificationService';

// Undo pattern
notify.withUndo(
  'Deleted',
  'Item moved to trash',
  () => restoreItem()
);

// Custom actions
const id = getNotificationService().show({
  title: 'Approval Needed',
  message: 'Review the document',
  type: 'info',
  priority: 'high',
  actions: [
    { label: 'Approve', onClick: handleApprove, variant: 'primary' },
    { label: 'Reject', onClick: handleReject, variant: 'danger' }
  ]
});
```

### Desktop Notifications
```typescript
import { ServiceRegistry } from '@/services/core/ServiceRegistry';

const service = ServiceRegistry.get('NotificationService');

// Request permission first
const granted = await service.requestDesktopPermission();

if (granted) {
  // Show desktop notification
  service.show({
    title: 'New Message',
    message: 'You have a new message',
    type: 'info',
    priority: 'normal',
    desktop: true, // Enable desktop notification
    sound: true    // Enable sound
  });
}
```

### Grouping Similar Notifications
```typescript
import { notify } from '@/services/notification/NotificationService';

// These will automatically group (3+)
for (let i = 0; i < 5; i++) {
  notify.info('File Uploaded', `File ${i} uploaded`, {
    groupKey: 'file-uploads' // Same key = grouped
  });
}

// Get grouped notifications
const grouped = service.getGrouped();
// Returns: [NotificationGroup] with count: 5
```

### Subscription Pattern
```typescript
import { ServiceRegistry } from '@/services/core/ServiceRegistry';

const service = ServiceRegistry.get('NotificationService');

const unsubscribe = service.addListener((notifications) => {
  console.log(`${notifications.length} notifications`);
  const unread = notifications.filter(n => !n.read).length;
  console.log(`${unread} unread`);
});

// Later: cleanup
unsubscribe();
```

## Performance Notes

- Notifications are limited to 50 (configurable via ServiceConfig)
- Grouping happens on-demand (not on every notification)
- EventEmitter pattern ensures efficient updates
- Desktop notifications are browser-native (no overhead)
- Timers are managed and cleaned up automatically

## Security Notes

- Desktop notification permission required (user opt-in)
- XSS protection: Notification content is not executed as code
- Sound generation uses Web Audio API (safe)
- No external dependencies or network calls

---

**Last Updated**: 2025-01-XX  
**Phase**: 2 - Consolidation  
**Status**: Complete ✅
