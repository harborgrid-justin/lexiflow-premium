================================================================================
ENTERPRISE COMPONENTS DIRECTORY CHECKLIST
================================================================================

## 0. PURPOSE OF THIS CHECKLIST (CRITICAL)

This checklist exists to:
• Evaluate feature UI components
• Guide incremental improvement
• Preserve proven implementations

It does NOT exist to:
• Enforce cosmetic purity
• Trigger rewrites
• Move code to _deprecated

**UI QUALITY ≠ STRUCTURAL IDEALITY**

## I. WHAT components/ IS (AND IS NOT)

### Definition
routes/FEATURE/components/ IS:
• Feature-scoped UI primitives
• Stateless render units
• Composition building blocks

routes/FEATURE/components/ IS NOT:
• A state layer
• A data-fetching layer
• A routing layer
• A dumping ground for logic

## II. GOVERNANCE RULES (MANDATORY)

1. EXISTING COMPONENTS MUST BE REVIEWED BEFORE CHANGE
2. STRUCTURAL NON-COMPLIANCE ≠ DEPRECATION
3. REFACTOR IN PLACE IS THE DEFAULT
4. PARALLEL REIMPLEMENTATION IS FORBIDDEN
5. _deprecated/ IS NOT A REFACTOR TOOL

## III. REQUIRED REVIEW PROTOCOL

Before modifying any component:

1. IDENTIFY: props, responsibilities, invariants
2. VERIFY: does it render correctly? is it stable?
3. CLASSIFY ISSUES AS: styling, naming, composition, responsibility
4. PROPOSE SMALLEST POSSIBLE DELTA

**NO COMPONENT MAY BE MOVED OR REWRITTEN WITHOUT THIS REVIEW**

## IV. NON-COMPLIANCE CLASSIFICATION

CLASS A — ACCEPTABLE DIVERGENCE
• Correct, Stable, Style differs from ideal
→ NO ACTION REQUIRED

CLASS B — EVOLVABLE
• Correct, Readability/composability can improve
→ REFACTOR IN PLACE

CLASS C — LEGITIMATELY DEPRECATED
• Unused, Broken, Replaced by approved alternative
→ MOVE TO _deprecated WITH APPROVAL

**DEFAULT ASSUMPTION IS CLASS A OR B**

## V. CANONICAL RESPONSIBILITIES

COMPONENTS MAY:
✔ Receive props
✔ Render UI
✔ Emit events upward
✔ Compose child components

COMPONENTS MAY NOT:
✗ Fetch data
✗ Read router state
✗ Read context directly
✗ Own domain state
✗ Call services

## VI. DATA FLOW RULES (STRICT)

**DATA FLOWS INTO COMPONENTS VIA PROPS ONLY**
**EVENTS FLOW OUT VIA CALLBACKS**

NO SIDEWAYS COMMUNICATION
NO IMPLICIT GLOBALS

## VII. ALLOWED EXCEPTIONS

A component MAY:
• use local UI state (e.g., toggle, hover)
• use memoization (useMemo/useCallback)
• forward refs

A component MAY NOT:
• perform side effects
• derive domain state
• contain business logic

## VIII. PROHIBITED BEHAVIORS (HARD FAIL)

✗ Moving components to _deprecated due to style differences
✗ Rewriting components to match folder ideals
✗ Splitting components without functional reason
✗ Introducing new abstractions without justification

## IX. FINAL MENTAL MODEL (LOCKED)

**FEATURE COMPONENTS ARE UI ASSETS**
**THEY ARE NOT ARCHITECTURE PROBLEMS**
