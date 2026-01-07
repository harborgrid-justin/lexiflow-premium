# DATA PROVIDER RECOMMENDATIONS

## 1. OWNERSHIP & RESPONSIBILITY
[ ] Providers own data, lifecycle, and business rules
[ ] UI components consume data; they do not coordinate it
[ ] Providers expose intent-based actions, not raw setters
[ ] One provider = one bounded domain (auth, flags, data, etc.)

## 2. PROVIDER COMPOSITION ORDER
[ ] Order providers by dependency (top → bottom):
    - Auth
    - Feature Flags
    - Entitlements / Policy
    - Data
[ ] A provider may depend on parents, never on children
[ ] Cross-provider logic belongs in the higher-level provider

## 3. CONTEXT SURFACE DESIGN
[ ] Export a single custom hook per provider (useX)
[ ] Throw if hook is used outside its provider
[ ] Context value is stable and intentionally shaped
[ ] Avoid leaking implementation details into consumers

## 4. DATA SHAPING & POLICY
[ ] Providers enforce access rules (role, plan, flags)
[ ] Consumers never interpret entitlements or permissions
[ ] Data returned is already filtered and policy-safe
[ ] Prefer "what you may see" over "what exists"

## 5. ACTION DESIGN
[ ] Actions express intent (refresh, load, mutate)
[ ] Actions encapsulate async behavior
[ ] Consumers never call APIs directly
[ ] Side effects live in providers, not components

## 6. LOADING & ERROR STRATEGY
[ ] Providers expose loading states explicitly
[ ] Errors are first-class (not console-only)
[ ] Consider coarse-grained error handling per provider
[ ] UI decides how to render loading/error, not when to fetch

## 7. FLAG & CONDITIONAL AWARENESS
[ ] Providers react to flag changes naturally
[ ] Flags influence:
    - Data shape
    - Data availability
    - Action behavior
[ ] Routing decisions consume provider state, not vice versa

## 8. ROUTING INTEGRATION
[ ] Providers are route-agnostic
[ ] Routing gates evaluate provider state
[ ] No navigation logic inside providers
[ ] No business policy hidden inside route components

## 9. PERFORMANCE & STABILITY
[ ] Memoize provider values where appropriate
[ ] Avoid recreating functions unnecessarily
[ ] Keep provider trees shallow where possible
[ ] Split providers if update frequency diverges

## 10. TESTABILITY
[ ] Providers can be rendered in isolation
[ ] Context hooks are easy to mock
[ ] Policies can be validated without rendering UI
[ ] Avoid implicit globals or hidden singletons

## 11. SCALING GUIDELINES
[ ] Split providers by domain, not by page
[ ] Introduce a policy layer when rules grow complex
[ ] Prefer composition over mega-providers
[ ] Graduate to state libraries only when needed

## 12. NAMING & STRUCTURE
[ ] Provider name matches domain (AuthProvider, DataProvider)
[ ] Hook name matches provider (useAuth, useData)
[ ] Context files are boring and predictable
[ ] Folder structure mirrors mental model, not framework quirks

## END STATE
✓ Providers are boring, predictable, and authoritative
✓ Pages are thin and expressive
✓ Routes are declarative and auditable
✓ Policy is explicit, centralized, and testable
