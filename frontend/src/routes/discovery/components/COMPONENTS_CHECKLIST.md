================================================================================
ENTERPRISE COMPONENTS DIRECTORY CHECKLIST
(routes/discovery/components/)
================================================================================

## 0. PURPOSE OF THIS CHECKLIST (CRITICAL)

```
This checklist exists to:
• Evaluate feature UI components
• Guide incremental improvement
• Preserve proven implementations

It does NOT exist to:
• Enforce cosmetic purity
• Trigger rewrites
• Move code to _deprecated
```

```
UI QUALITY ≠ STRUCTURAL IDEALITY
```

## I. WHAT components/ IS (AND IS NOT)

### Definition

```
routes/discovery/components/ IS:
• Feature-scoped UI primitives
• Stateless render units
• Composition building blocks
```

```
routes/discovery/components/ IS NOT:
• A state layer
• A data-fetching layer
• A routing layer
• A dumping ground for logic
```

## II. GOVERNANCE RULES (MANDATORY)

```
===============================================================================
COMPONENTS GOVERNANCE RULES
===============================================================================

1. EXISTING COMPONENTS MUST BE REVIEWED BEFORE CHANGE
2. STRUCTURAL NON-COMPLIANCE ≠ DEPRECATION
3. REFACTOR IN PLACE IS THE DEFAULT
4. PARALLEL REIMPLEMENTATION IS FORBIDDEN
5. _deprecated/ IS NOT A REFACTOR TOOL
===============================================================================
```

## III. REQUIRED REVIEW PROTOCOL (BEFORE ANY CHANGE)

Before modifying any component:

```
===============================================================================
COMPONENT REVIEW PROTOCOL
===============================================================================

1. IDENTIFY:
   • props
   • responsibilities
   • invariants

2. VERIFY:
   • does it render correctly?
   • is it stable?

3. CLASSIFY ISSUES AS:
   • styling
   • naming
   • composition
   • responsibility

4. PROPOSE SMALLEST POSSIBLE DELTA
===============================================================================
```

```
NO COMPONENT MAY BE MOVED OR REWRITTEN
WITHOUT THIS REVIEW
```

## IV. NON-COMPLIANCE CLASSIFICATION (REQUIRED)

```
===============================================================================
COMPONENT NON-COMPLIANCE CLASSES
===============================================================================

CLASS A — ACCEPTABLE DIVERGENCE
• Correct
• Stable
• Style or structure differs from ideal
→ NO ACTION REQUIRED

CLASS B — EVOLVABLE
• Correct
• Readability or composability can improve
→ REFACTOR IN PLACE

CLASS C — LEGITIMATELY DEPRECATED
• Unused
• Broken
• Replaced by approved alternative
→ MOVE TO _deprecated WITH APPROVAL
===============================================================================
```

```
DEFAULT ASSUMPTION IS CLASS A OR B
```

## V. CANONICAL RESPONSIBILITIES OF FEATURE COMPONENTS

```yaml
COMPONENTS MAY:
✔ Receive props
✔ Render UI
✔ Emit events upward
✔ Compose child components
```

```
COMPONENTS MAY NOT:
✗ Fetch data
✗ Read router state
✗ Read context directly
✗ Own domain state
✗ Call services
```

## VI. DATA FLOW RULES (STRICT)

```sql
DATA FLOWS INTO COMPONENTS VIA PROPS ONLY
EVENTS FLOW OUT VIA CALLBACKS
```

```
NO SIDEWAYS COMMUNICATION
NO IMPLICIT GLOBALS
```

## VII. STRUCTURAL IDEAL (NOT A REQUIREMENT)

```
components/
├── DiscoveryHeader.tsx
├── DiscoveryFilters.tsx
├── DiscoveryTable.tsx
└── DiscoveryRow.tsx
```

```
THIS IS A TARGET SHAPE — NOT A REWRITE MANDATE
```

## VIII. ALLOWED EXCEPTIONS (EXPLICIT)

A component MAY:

```
• use local UI state (e.g., toggle, hover)
• use memoization (useMemo/useCallback)
• forward refs
```

A component MAY NOT:

```
• perform side effects
• derive domain state
• contain business logic
```

## IX. STABILITY & PERFORMANCE CHECKS

```
[ ] Are props shallow and explicit?
[ ] Is memoization intentional?
[ ] Are rerenders bounded?
[ ] Are keys stable?
```

## X. NAMING & FILE HYGIENE CHECKS

```
[ ] File name matches component name
[ ] Component name reflects responsibility
[ ] No unused exports
[ ] No dead code blocks
```

## XI. TESTABILITY CHECKS

```
[ ] Can this component be rendered in isolation?
[ ] Does it rely only on props?
[ ] Can events be simulated without setup?
```

## XII. PROHIBITED BEHAVIORS (HARD FAIL)

```
✗ Moving components to _deprecated due to style differences
✗ Rewriting components to match folder ideals
✗ Splitting components without functional reason
✗ Introducing new abstractions without justification
```

## XIII. REQUIRED CHANGE FORMAT (ENFORCED)

All proposed changes MUST be framed as:

```sql
CURRENT COMPONENT BEHAVIOR
→ IDENTIFIED ISSUE
→ PROPOSED DELTA
→ JUSTIFICATION
→ RISK
```

## XIV. PR REVIEW CHECKLIST (MANDATORY)

```
[ ] Was existing behavior preserved?
[ ] Is this a delta, not a rewrite?
[ ] Are responsibilities unchanged?
[ ] Is data passed via props only?
[ ] Are events emitted upward?
[ ] Is deprecation explicitly approved?
```

## XV. FINAL MENTAL MODEL (LOCKED)

```sql
FEATURE COMPONENTS ARE UI ASSETS
THEY ARE NOT ARCHITECTURE PROBLEMS
```
