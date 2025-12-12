# Error Flow Diagrams

Visual representation of error handling flows in LexiFlow AI Legal Suite.

## 1. Complete Error Flow Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER INTERACTION                              │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
            ┌───────▼────────┐   ┌───────▼────────┐
            │   FRONTEND     │   │    BACKEND     │
            │     ERROR      │   │     ERROR      │
            └───────┬────────┘   └───────┬────────┘
                    │                    │
         ┌──────────▼──────────┐         │
         │  ErrorBoundary      │         │
         │  Catches Error      │         │
         └──────────┬──────────┘         │
                    │                    │
         ┌──────────▼──────────┐  ┌──────▼─────────┐
         │ Generate            │  │ Exception      │
         │ Correlation ID      │  │ Filter Catches │
         │ (fe-timestamp-xxx)  │  │ (be-timestamp) │
         └──────────┬──────────┘  └──────┬─────────┘
                    │                    │
         ┌──────────▼──────────┐  ┌──────▼─────────┐
         │ errorService        │  │ Error Tracking │
         │ logError()          │  │ Service        │
         └──────────┬──────────┘  └──────┬─────────┘
                    │                    │
                    │         ┌──────────▼─────────┐
                    │         │ Logging Service    │
                    │         │ (File + Console)   │
                    │         └──────────┬─────────┘
                    │                    │
                    │         ┌──────────▼─────────┐
                    │         │ Check Severity     │
                    │         │ & Frequency        │
                    │         └──────────┬─────────┘
                    │                    │
                    │         ┌──────────▼─────────┐
                    │         │ If HIGH/CRITICAL   │
                    │         │ & Threshold Met    │
                    │         └──────────┬─────────┘
                    │                    │
         ┌──────────▼──────────┐  ┌──────▼─────────┐
         │ Display Error Page  │  │ GitHub Issue   │
         │ (User-Friendly)     │  │ Service        │
         └──────────┬──────────┘  └──────┬─────────┘
                    │                    │
         ┌──────────▼──────────┐  ┌──────▼─────────┐
         │ User Clicks         │  │ Create/Update  │
         │ "Report Issue"      │  │ GitHub Issue   │
         └──────────┬──────────┘  └────────────────┘
                    │
         ┌──────────▼──────────┐
         │ githubIssueService  │
         │ createIssue()       │
         └──────────┬──────────┘
                    │
                    └──────────┐
                               │
                    ┌──────────▼──────────┐
                    │   GITHUB API        │
                    │   Issue Created     │
                    └─────────────────────┘
```

## 2. Backend Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     HTTP REQUEST                                 │
│                 (GET /api/cases/123)                            │
└──────────────────────┬──────────────────────────────────────────┘
                       │
           ┌───────────▼───────────┐
           │   NestJS Controller   │
           │   casesController     │
           └───────────┬───────────┘
                       │
           ┌───────────▼───────────┐
           │   Service Layer       │
           │   casesService        │
           └───────────┬───────────┘
                       │
                    ERROR!
                       │
           ┌───────────▼───────────┐
           │ Custom Exception      │
           │ throw new             │
           │ NotFoundException()   │
           └───────────┬───────────┘
                       │
           ┌───────────▼───────────┐
           │ Exception Filter      │
           │ (All/HTTP)            │
           └───────────┬───────────┘
                       │
           ┌───────────▼───────────┐
           │ Generate Correlation  │
           │ ID if not exists      │
           └───────────┬───────────┘
                       │
           ┌───────────▼───────────┐
           │ ErrorTrackingService  │
           │ .trackError()         │
           └───────────┬───────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
┌───────▼──────┐ ┌────▼────┐ ┌───────▼────────┐
│ Cache Error  │ │ Log to  │ │ Check Severity │
│ (Fingerprint)│ │ File    │ │ & Threshold    │
└──────────────┘ └─────────┘ └───────┬────────┘
                                     │
                          ┌──────────▼────────┐
                          │ If Threshold Met  │
                          │ Mark for GitHub   │
                          └──────────┬────────┘
                                     │
                          ┌──────────▼────────┐
                          │ Return Error      │
                          │ Response to       │
                          │ Client            │
                          └───────────────────┘
```

## 3. GitHub Issue Creation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│              ERROR TRACKED (HIGH/CRITICAL)                       │
└──────────────────────┬──────────────────────────────────────────┘
                       │
           ┌───────────▼───────────┐
           │ Check Error Count     │
           │ (In Memory Cache)     │
           └───────────┬───────────┘
                       │
           ┌───────────▼───────────┐
           │ Count >= Threshold?   │
           │ (Default: 5)          │
           └───────────┬───────────┘
                       │
                    YES│
                       │
           ┌───────────▼───────────┐
           │ Generate Fingerprint  │
           │ (name+msg+stack)      │
           └───────────┬───────────┘
                       │
           ┌───────────▼───────────┐
           │ GitHubIssueService    │
           │ .createIssue()        │
           └───────────┬───────────┘
                       │
           ┌───────────▼───────────┐
           │ Search Existing       │
           │ Issues (Fingerprint)  │
           └───────────┬───────────┘
                       │
              ┌────────┴────────┐
              │                 │
          FOUND│             NOT FOUND
              │                 │
  ┌───────────▼───────┐ ┌──────▼──────────┐
  │ Add Comment to    │ │ Create New      │
  │ Existing Issue    │ │ GitHub Issue    │
  └───────────┬───────┘ └──────┬──────────┘
              │                 │
              │   ┌─────────────▼────────┐
              │   │ Format Issue Body:   │
              │   │ - Error Details      │
              │   │ - Stack Trace        │
              │   │ - Environment        │
              │   │ - Context            │
              │   │ - Correlation ID     │
              │   └─────────────┬────────┘
              │                 │
              │   ┌─────────────▼────────┐
              │   │ Apply Labels:        │
              │   │ - severity: critical │
              │   │ - bug               │
              │   │ - auto-generated    │
              │   │ - database          │
              │   └─────────────┬────────┘
              │                 │
              └─────────────────┴────────┐
                                         │
                             ┌───────────▼────────┐
                             │ GitHub API POST    │
                             │ /repos/.../issues  │
                             └───────────┬────────┘
                                         │
                             ┌───────────▼────────┐
                             │ Update Error Cache │
                             │ with Issue Number  │
                             └────────────────────┘
```

## 4. Frontend Error Boundary Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    REACT COMPONENT                               │
│                  Throws Error/Exception                          │
└──────────────────────┬──────────────────────────────────────────┘
                       │
           ┌───────────▼───────────┐
           │   ErrorBoundary       │
           │   componentDidCatch() │
           └───────────┬───────────┘
                       │
           ┌───────────▼───────────┐
           │ Generate Correlation  │
           │ ID (fe-timestamp-xxx) │
           └───────────┬───────────┘
                       │
           ┌───────────▼───────────┐
           │ Update State:         │
           │ - hasError = true     │
           │ - error = error       │
           │ - correlationId       │
           └───────────┬───────────┘
                       │
           ┌───────────▼───────────┐
           │ errorService          │
           │ .logError({           │
           │   error,              │
           │   componentStack,     │
           │   correlationId       │
           │ })                    │
           └───────────┬───────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
┌───────▼──────┐             ┌────────▼────────┐
│ Queue Error  │             │ Call onError    │
│ for Batch    │             │ Prop (Optional) │
│ Sending      │             └─────────────────┘
└───────┬──────┘
        │
┌───────▼──────────┐
│ Process Queue    │
│ (Debounced)      │
└───────┬──────────┘
        │
┌───────▼──────────┐
│ POST to Backend  │
│ /api/errors/log  │
└───────┬──────────┘
        │
┌───────▼──────────┐
│ Render Fallback  │
│ Component        │
└──────────────────┘
```

## 5. Error Categorization Flow

```
                    ┌─────────────┐
                    │    ERROR    │
                    └──────┬──────┘
                           │
                ┌──────────▼──────────┐
                │ Extract Status Code │
                │ & Error Type        │
                └──────────┬──────────┘
                           │
           ┌───────────────┴───────────────┐
           │                               │
    ┌──────▼──────┐                ┌──────▼──────┐
    │ Status >= 500│                │Error Type   │
    │   SERVER     │                │Analysis     │
    └──────┬──────┘                └──────┬──────┘
           │                               │
    ┌──────▼──────────────┐        ┌──────▼────────────┐
    │ Check Error Name:   │        │ 401/403: AUTH     │
    │ - Database          │        │ 404: NOT_FOUND    │
    │ - External          │        │ 400/422: VALIDATION│
    │ - Payment           │        └───────────────────┘
    │ - AI                │
    └──────┬──────────────┘
           │
    ┌──────▼──────────────┐
    │ Determine Severity: │
    │                     │
    │ Database → CRITICAL │
    │ Payment  → CRITICAL │
    │ AI       → CRITICAL │
    │ 500      → HIGH     │
    │ 401/403  → MEDIUM   │
    │ 400      → LOW      │
    └──────┬──────────────┘
           │
    ┌──────▼──────────────┐
    │ Set Retryable Flag: │
    │                     │
    │ NETWORK  → Yes      │
    │ SERVER   → Yes      │
    │ AUTH     → No       │
    │ VALIDATION → No     │
    └─────────────────────┘
```

## 6. Log Level Decision Tree

```
                    ┌─────────────┐
                    │   MESSAGE   │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │ What Type?  │
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼────┐    ┌────────▼─────┐   ┌───────▼────┐
│ System     │    │ Error/Issue  │   │ Info Event │
│ Failure    │    │              │   │            │
└───────┬────┘    └────────┬─────┘   └───────┬────┘
        │                  │                  │
┌───────▼────┐    ┌────────▼─────┐   ┌───────▼────┐
│   FATAL    │    │ Severity?    │   │ DEBUG/INFO │
│            │    │              │   │            │
│ - DB Down  │    └────────┬─────┘   └────────────┘
│ - No Start │             │
└────────────┘    ┌────────┴────────┐
                  │                 │
          ┌───────▼──────┐  ┌───────▼──────┐
          │ Unrecoverable│  │ Recoverable  │
          │              │  │              │
          └───────┬──────┘  └───────┬──────┘
                  │                 │
          ┌───────▼──────┐  ┌───────▼──────┐
          │    ERROR     │  │     WARN     │
          │              │  │              │
          │ - Exception  │  │ - Deprecated │
          │ - API Fail   │  │ - Rate Limit │
          └──────────────┘  └──────────────┘
```

## 7. Error Fingerprinting Process

```
┌─────────────────────────────────────────────────────────────────┐
│                         ERROR OBJECT                             │
└──────────────────────┬──────────────────────────────────────────┘
                       │
           ┌───────────▼───────────┐
           │ Extract Components:   │
           │                       │
           │ 1. Error Name         │
           │ 2. Error Message      │
           │ 3. Stack Trace        │
           │ 4. Context            │
           └───────────┬───────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
┌───────▼──────┐ ┌─────▼─────┐ ┌─────▼─────┐
│ Error.name   │ │ Error.msg │ │ Stack[1]  │
│ (Full)       │ │ (100 char)│ │ (100 char)│
└───────┬──────┘ └─────┬─────┘ └─────┬─────┘
        │              │              │
        └──────────────┴──────────────┘
                       │
           ┌───────────▼───────────┐
           │ Concatenate:          │
           │ name:message:         │
           │ stackline:context     │
           └───────────┬───────────┘
                       │
           ┌───────────▼───────────┐
           │ Result Example:       │
           │                       │
           │ "DatabaseException:   │
           │  Connection timeout:  │
           │  at Service.query:    │
           │  {table:cases}"       │
           └───────────┬───────────┘
                       │
           ┌───────────▼───────────┐
           │ Use as Cache Key      │
           │ for Deduplication     │
           └───────────────────────┘
```

## Legend

```
┌─────────┐
│ Process │  = Processing step
└─────────┘

┌─────────┐
│Decision?│  = Decision point
└─────────┘

    │
    ▼        = Flow direction

┌─────────┐
│ Service │  = Service component
└─────────┘

┌─────────┐
│ Storage │  = Data storage
└─────────┘
```

---

## Notes

- **Correlation IDs** are unique identifiers that track errors across the entire system
- **Error Fingerprinting** prevents duplicate GitHub issues for the same error
- **Severity Classification** determines if and when a GitHub issue is created
- **Threshold** (default: 5) prevents issues for one-off errors
- **Deduplication** searches existing issues before creating new ones

---

For more details, see:
- [ERROR_REPORTING_WORKFLOW.md](./ERROR_REPORTING_WORKFLOW.md)
- [GITHUB_ISSUE_SETUP.md](./GITHUB_ISSUE_SETUP.md)
- [README.md](./README.md)
