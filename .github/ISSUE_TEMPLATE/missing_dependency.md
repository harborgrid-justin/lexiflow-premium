---
name: Missing Dependency
about: Report missing npm packages or dependencies
title: '[DEPENDENCY] '
labels: dependency
assignees: ''
---

## Missing Dependency
**Package Name:** <!-- e.g., passport-google-oauth20 -->
**Required By:** <!-- Module that needs it -->
**Location:** [ ] Frontend | [ ] Backend

## Error Message
```
<!-- Paste the error indicating missing dependency -->
```

## Required In Files
<!-- List files that import this dependency -->
-
-

## Installation Command
```bash
# For Agent 12 to execute
npm install <package-name>
# or
npm install --save-dev <package-name>
```

## Package.json Entry
```json
{
  "dependencies": {
    "<package-name>": "^<version>"
  }
}
```

## Related Agent
- **Agent Responsible:** <!-- Agent who added the code requiring this -->

## Type Definitions Needed
- [ ] Yes - `@types/<package-name>`
- [ ] No

---
**Reported by:** Agent <!-- Agent number -->
**Date:** <!-- YYYY-MM-DD -->
