# Enterprise Components Directory Checklist

## What `components/` IS

**Feature-scoped UI primitives** - Presentational components specific to this route module.

```
✓ Stateless render units
✓ Pure presentation logic
✓ Composable building blocks
✓ Feature-specific widgets
```

## What `components/` IS NOT

```
✗ A state management layer
✗ A data-fetching layer
✗ A routing layer
✗ A business logic layer
✗ A dumping ground for "misc" code
```

## Governance Rules

### 1. Data Flow
- Components receive ALL data via **props**
- Components emit events via **callbacks**
- NO direct API calls (`api.*`, `DataService`, `fetch()`)
- NO direct service layer access

### 2. State Management
- Local UI state ONLY (toggles, hover, focus)
- NO domain state ownership
- NO global state reads (except via props)
- Context usage ONLY for theme/i18n/auth (already provided)

### 3. Component Responsibilities
```typescript
// ✅ ALLOWED
export function FeatureCard({ data, onAction }: Props) {
  const [expanded, setExpanded] = useState(false); // Local UI state OK
  return <Card onClick={() => onAction(data.id)} />; // Event emission OK
}

// ❌ PROHIBITED
export function FeatureCard({ id }: Props) {
  const data = useQuery(() => api.feature.get(id)); // NO data fetching
  const dispatch = useDispatch(); // NO global state access
  return <Card />;
}
```

### 4. Import Restrictions
```typescript
// ✅ ALLOWED IMPORTS
import { Button } from '@/components/common/atoms';
import { useTheme } from '@/hooks';
import { FeatureType } from '@/types';

// ❌ PROHIBITED IMPORTS
import { api } from '@/api'; // NO - data layer
import { DataService } from '@/services/data'; // NO - service layer
import { useRouter } from 'react-router'; // NO - routing in components
```

## Review Protocol

Before adding/modifying any component in this directory, verify:

1. **[ ]** Component receives data via props (not fetching)
2. **[ ]** Component emits events via callbacks (not dispatching)
3. **[ ]** Component has no business logic (pure presentation)
4. **[ ]** Component has no routing logic (no useNavigate/useParams)
5. **[ ]** Component imports are from allowed layers only

## Architectural Boundary

```
routes/<feature>/
├── loader.ts          ← Data fetching happens HERE
├── route.tsx          ← Orchestration happens HERE
├── hooks/             ← Custom hooks go HERE
└── components/        ← PURE UI ONLY
    ├── FeatureCard.tsx
    └── FeatureList.tsx
```

**Components are RENDER-ONLY. Data flows DOWN, events flow UP.**

---

*This checklist enforces the separation of concerns required for maintainable, testable, and scalable enterprise architecture.*
