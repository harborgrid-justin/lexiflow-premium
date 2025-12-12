---
name: Agent Error Report
about: Report errors encountered during multi-agent development
title: '[AGENT ERROR] Agent [X] - '
labels: agent-error, development
assignees: ''
---

## Agent Information

**Agent Number:** [e.g. Agent 1, Agent 2, ... Agent 12]

**Agent Specialty:**
- [ ] Agent 1 - Database & PostgreSQL Infrastructure
- [ ] Agent 2 - Authentication & Security
- [ ] Agent 3 - Case Management & Workflow
- [ ] Agent 4 - Document Management & OCR
- [ ] Agent 5 - React Frontend Architecture
- [ ] Agent 6 - Billing & Financial Services
- [ ] Agent 7 - Compliance & Audit Trail
- [ ] Agent 8 - Real-time Communications
- [ ] Agent 9 - Analytics & ML Predictions
- [ ] Agent 10 - GraphQL & REST API Integration
- [ ] Agent 11 - Coordinator & Scratchpad Manager
- [ ] Agent 12 - Build & Test Engineer

**Session Date:** [e.g. 2025-12-12]

**Session ID:** [e.g. 01Dk2cNA1RPKLGn8bciBMEjS]

## Error Summary

**Error Type:**
- [ ] Build Error
- [ ] TypeScript Compilation Error
- [ ] Test Failure
- [ ] Migration Error
- [ ] Dependency Error
- [ ] Integration Error
- [ ] Coordination Error
- [ ] Other: [specify]

**Severity:**
- [ ] Blocking - Prevents all progress
- [ ] High - Blocks specific functionality
- [ ] Medium - Workaround available
- [ ] Low - Minor issue

**Description:**
A clear and concise description of the error encountered.

## Error Details

**Error Message:**
```
Paste the complete error message here
```

**Stack Trace:**
```
Paste the full stack trace here
```

**Command/Operation That Failed:**
```bash
# Paste the command that was executed
npm run build
```

**Exit Code:** [e.g. 1, 2, 127]

## Context

**Task Being Performed:**
Describe what the agent was trying to accomplish when the error occurred.

**Files Modified/Created:**
List the files that were being worked on:
- `/path/to/file1.ts`
- `/path/to/file2.tsx`
- `/path/to/file3.sql`

**Dependencies Installed:**
List any npm packages or dependencies that were added:
```json
{
  "package-name": "^1.0.0"
}
```

**Environment:**
- Node.js Version: [e.g. 18.17.0]
- npm Version: [e.g. 9.6.7]
- TypeScript Version: [e.g. 5.3.0]
- OS: [e.g. Linux, macOS, Windows]
- Docker: [e.g. Yes/No, version]

## Reproduction Steps

1. Step 1: [e.g. Run `npm install`]
2. Step 2: [e.g. Run `npm run build`]
3. Step 3: [e.g. Observe error in console]

## Expected vs Actual Behavior

**Expected:**
What should have happened?

**Actual:**
What actually happened?

## Impact Assessment

**Affected Agents:**
- [ ] Agent 1
- [ ] Agent 2
- [ ] Agent 3
- [ ] Agent 4
- [ ] Agent 5
- [ ] Agent 6
- [ ] Agent 7
- [ ] Agent 8
- [ ] Agent 9
- [ ] Agent 10
- [ ] Agent 11
- [ ] Agent 12

**Blocks Handoff:**
- [ ] Yes - Cannot proceed to next agent
- [ ] No - Can continue with workaround

**Integration Impact:**
- [ ] Frontend-Backend integration affected
- [ ] Database migration blocked
- [ ] API endpoints not functional
- [ ] WebSocket communication broken
- [ ] Build/deployment blocked
- [ ] Tests cannot run
- [ ] Other: [specify]

## Build Logs

**Backend Build Log:**
```
Paste backend build output here
```

**Frontend Build Log:**
```
Paste frontend build output here
```

**Test Output:**
```
Paste test results here
```

**Migration Output:**
```
Paste migration output here
```

## Code Snippet

**Problematic Code:**
```typescript
// Paste the problematic code here
// Include surrounding context (10-20 lines)
```

**File Path:** `/full/path/to/file.ts`

**Line Number:** [e.g. Line 42]

## Attempted Fixes

**What I Tried:**
1. Attempt 1: [e.g. Cleared node_modules and reinstalled]
   - Result: [e.g. Did not resolve]
2. Attempt 2: [e.g. Updated TypeScript version]
   - Result: [e.g. Different error appeared]
3. Attempt 3: [e.g. Checked dependencies]
   - Result: [e.g. Found version mismatch]

## Resolution

**Resolved:**
- [ ] Yes
- [ ] No
- [ ] Partial

**Solution Applied:**
If resolved, describe the solution:

**Files Changed:**
List files modified to fix the issue:
- `/path/to/fixed/file.ts`

**Commit SHA:** [e.g. abc123def456]

**PR Number:** [e.g. #42]

## Prevention

**Root Cause:**
Describe the root cause of the error:

**Preventive Measures:**
How can this be prevented in the future?
- [ ] Add validation check
- [ ] Update documentation
- [ ] Add error handling
- [ ] Improve type definitions
- [ ] Add unit test
- [ ] Add integration test
- [ ] Update linting rules
- [ ] Other: [specify]

## Related Issues

**Similar Issues:**
- #
- #

**Depends On:**
- #

**Blocks:**
- #

## Agent Coordination

**Coordination with Agent 11:**
- [ ] Agent 11 notified
- [ ] .scratchpad updated
- [ ] Status changed in dashboard

**Handoff Status:**
- Current: Agent [X]
- Next: Agent [Y]
- Status: [e.g. Blocked, Ready, Waiting]

**Communication Log Entry:**
```
[AGENT X] Error encountered: [brief description]
[AGENT X] Status: [BLOCKED/IN_PROGRESS]
[AGENT X] Next steps: [what needs to happen]
```

## Logs & Artifacts

**Log Files:**
Attach or link to relevant log files:
- Backend logs: [path or link]
- Frontend logs: [path or link]
- Docker logs: [path or link]
- Database logs: [path or link]

**Screenshots:**
Attach screenshots if applicable.

**Configuration Files:**
```yaml
# Paste relevant configuration
# e.g., tsconfig.json, package.json, .env
```

## Additional Context

Add any other context about the error here.

## Checklist

- [ ] I have provided complete error information
- [ ] I have included stack traces and logs
- [ ] I have listed attempted fixes
- [ ] I have assessed impact on other agents
- [ ] I have updated .scratchpad (if applicable)
- [ ] I have notified Agent 11 (coordinator)

---

**For Agent 11 (Coordinator):**

**Action Items:**
- [ ] Update .scratchpad
- [ ] Notify affected agents
- [ ] Reassign tasks if needed
- [ ] Create documentation
- [ ] Update integration checklist

**Priority Adjustment:**
- Original Priority: [e.g. P2]
- New Priority: [e.g. P0 - Blocking]

**Escalation:**
- [ ] Requires immediate attention
- [ ] Can be deferred
- [ ] Needs external review

**Documentation Updates:**
- [ ] Update UPDATES.md
- [ ] Update API docs
- [ ] Update component docs
- [ ] Update database schema docs

**Build Status:**
- Backend: [e.g. FAILING]
- Frontend: [e.g. PASSING]
- Tests: [e.g. FAILING]
- Integration: [e.g. BLOCKED]
