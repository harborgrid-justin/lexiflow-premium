---
name: Bug Report
about: Create a report to help us improve
title: '[BUG] '
labels: bug
assignees: ''
---

## Bug Description

**Summary**
A clear and concise description of what the bug is.

**Severity**
- [ ] Critical - System is unusable
- [ ] High - Major functionality is impacted
- [ ] Medium - Feature is partially broken
- [ ] Low - Minor issue or cosmetic problem

## To Reproduce

Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior

A clear and concise description of what you expected to happen.

## Actual Behavior

A clear and concise description of what actually happened.

## Screenshots

If applicable, add screenshots to help explain your problem.

## Environment

**Frontend:**
- Browser: [e.g. Chrome 120, Firefox 121]
- OS: [e.g. Windows 11, macOS 14, Ubuntu 22.04]
- Screen Resolution: [e.g. 1920x1080]

**Backend:**
- Node.js Version: [e.g. 18.17.0]
- Database: [e.g. PostgreSQL 15.3]
- Redis: [e.g. 7.0.12]

**Deployment:**
- Environment: [e.g. Development, Staging, Production]
- Docker: [e.g. Yes/No, version]
- Container/VM: [e.g. Docker, Kubernetes, VM]

## Error Logs

**Console Errors:**
```
Paste any browser console errors here
```

**Server Logs:**
```
Paste any server logs here
```

**Stack Trace:**
```
Paste stack trace if available
```

## Database State

**Affected Tables:**
- Table name: [e.g. cases, documents, time_entries]
- Record ID: [e.g. uuid-here]

**Migration Version:**
- Current version: [e.g. 1734019200000]

## API Details

**REST Endpoint:**
- Method: [e.g. POST]
- URL: [e.g. /api/cases/123]
- Status Code: [e.g. 500]
- Request Body:
```json
{
  "example": "data"
}
```
- Response:
```json
{
  "error": "message"
}
```

**GraphQL Query/Mutation:**
```graphql
query {
  # Paste your GraphQL query here
}
```

## User Impact

**Affected Users:**
- Number of users affected: [e.g. All users, 10 users, Single user]
- User roles affected: [e.g. ATTORNEY, PARALEGAL, ADMIN]

**Business Impact:**
- [ ] Blocking critical workflow
- [ ] Data loss or corruption
- [ ] Security vulnerability
- [ ] Performance degradation
- [ ] UI/UX issue
- [ ] Other: [describe]

## Workaround

If you found a temporary workaround, please describe it here.

## Additional Context

Add any other context about the problem here.

## Related Issues

Link to any related issues:
- #
- #

## Checklist

- [ ] I have searched for similar issues
- [ ] I have provided all required information
- [ ] I have included error logs
- [ ] I have tested in latest version
- [ ] I can reproduce this consistently

---

**For Internal Use:**

**Agent Assignment:**
- Assigned to Agent: [e.g. Agent 1, Agent 2, etc.]
- Priority: [e.g. P0 - Critical, P1 - High, P2 - Medium, P3 - Low]
- Sprint: [e.g. Sprint 1]

**Root Cause:**
- Category: [e.g. Frontend, Backend, Database, Integration]
- Component: [e.g. CaseForm, TimeEntryService, migrations]
- File: [e.g. /path/to/file.ts]

**Fix Information:**
- Fix Version: [e.g. 1.0.1]
- PR Number: #
- Commit SHA: [e.g. abc123]
