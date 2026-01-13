# Features Architecture Summary

## Quick Reference

### ✅ Good Imports
```typescript
// UI components
import { Button } from '@/components/atoms';

// Feature public API
import { EvidenceVault } from '@features/litigation/evidence';

// Shared utilities
import { GeminiService } from '@features/shared/services';
```

### ❌ Bad Imports
```typescript
// Direct internal imports
import { InternalComponent } from '@features/cases/components/internal/Component';

// Cross-feature internal access
import { Helper } from '@features/knowledge/utils/helper';
```

## Architecture at a Glance

```
667 files across 10 feature domains:
├── cases (197)      - Case management & workflows
├── litigation (140) - Evidence, discovery, pleadings
├── admin (127)      - System administration  
├── operations (85)  - Documents, messaging, billing
├── knowledge (84)   - Research, citations, rules
├── dashboard (9)    - Main dashboard
├── drafting (8)     - Document templates
├── visual (7)       - Graph visualization
├── profile (6)      - User profile
└── document-assembly (4) - Doc generation wizard
```

## Structure Pattern

```
feature/
├── components/  → Feature UI
├── hooks/       → Feature logic
├── services/    → Feature services
├── types/       → Feature types
├── utils/       → Feature utilities
└── index.ts     → Public API ⭐
```

## Key Principles

1. **Barrel Exports** - Always export through index.ts
2. **No Cross-Feature** - Features don't import from other features directly
3. **Use Shared** - Common code goes in /features/shared
4. **UI Separation** - Pure UI in /components, business logic in /features

## Documentation

- [Full README](./README.md) - Complete architecture guide
- [Reorganization Plan](./REORGANIZATION_PLAN.md) - Migration strategy
- [Shared Layer](./shared/README.md) - Cross-feature utilities

**Last Updated:** December 28, 2025
