# Error Handling System - Quick Start Guide

## Get Started in 5 Minutes

### 1. Configure GitHub Integration (Optional but Recommended)

```bash
# Create .env file in backend directory
cat >> backend/.env << 'ENVEOF'
# GitHub Issue Reporting
GITHUB_TOKEN=ghp_your_token_here
GITHUB_REPO=username/repository
GITHUB_ISSUE_REPORTING_ENABLED=true
ERROR_REPORT_THRESHOLD=5
ENVEOF
```

Get your token: https://github.com/settings/tokens

### 2. Install Dependencies (if needed)

```bash
# Backend
cd backend
npm install

# Frontend
cd ..
npm install
```

### 3. Use Error Handling in Your Code

#### Backend Example

```typescript
import { NotFoundException } from './common/exceptions';

// In your service
async findCase(id: string) {
  const case = await this.repository.findOne(id);
  if (!case) {
    throw new NotFoundException('Case', id);  // Auto-tracked!
  }
  return case;
}
```

#### Frontend Example

```tsx
import { ErrorBoundary } from './components/error';

function App() {
  return (
    <ErrorBoundary>
      <YourApp />
    </ErrorBoundary>
  );
}
```

### 4. Test It Works

```bash
# Start backend
cd backend && npm run start:dev

# In another terminal, test error tracking
curl http://localhost:3000/api/errors/statistics

# Should return:
# {
#   "total": 0,
#   "bySeverity": {...},
#   "recentErrors": 0
# }
```

### 5. View Error Pages

Navigate to these routes to see error pages:
- Network Error: Disconnect internet and reload
- 404 Not Found: Go to `/nonexistent-page`
- 403 Forbidden: Try accessing admin page without permissions
- 500 Server Error: Triggered automatically on server errors

## That's It!

Your error handling system is now active and will:
✅ Catch all errors automatically
✅ Log them with correlation IDs
✅ Display user-friendly error pages
✅ Create GitHub issues for critical errors (if configured)

## Next Steps

- Read the full documentation: `/docs/error-handling/README.md`
- Set up GitHub labels: `/docs/error-handling/GITHUB_ISSUE_SETUP.md`
- Learn the workflow: `/docs/error-handling/ERROR_REPORTING_WORKFLOW.md`

## Need Help?

Check the troubleshooting section in `/docs/error-handling/ERROR_REPORTING_WORKFLOW.md`
