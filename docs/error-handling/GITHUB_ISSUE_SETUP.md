# GitHub Issue Reporting Setup Guide

## Quick Start

This guide will help you set up automated GitHub issue reporting for LexiFlow errors.

## Prerequisites

1. GitHub account with repository access
2. Repository where issues will be created
3. Administrative access to create personal access tokens

## Step 1: Create GitHub Personal Access Token

### For GitHub.com

1. Go to https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a descriptive name: `LexiFlow Error Reporting`
4. Set expiration (recommended: 90 days for security)
5. Select scopes:
   - ✅ `repo` - Full control of private repositories
   - ✅ `public_repo` - Access public repositories (if using public repo)
6. Click "Generate token"
7. **IMPORTANT:** Copy the token immediately (you won't see it again!)

### For GitHub Enterprise

1. Go to `https://your-github-enterprise.com/settings/tokens`
2. Follow same steps as above

## Step 2: Configure Environment Variables

Add these variables to your `.env` file:

```env
# GitHub Issue Reporting Configuration
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_REPO=your-username/your-repository
GITHUB_ISSUE_REPORTING_ENABLED=true

# Optional: Error Reporting Threshold
ERROR_REPORT_THRESHOLD=5  # Create issue after 5 occurrences
```

### Example:
```env
GITHUB_TOKEN=ghp_1234567890abcdefghijklmnopqrstuvwxyzAB
GITHUB_REPO=harborgrid-justin/lexiflow-premium
GITHUB_ISSUE_REPORTING_ENABLED=true
ERROR_REPORT_THRESHOLD=5
```

## Step 3: Set Up Issue Labels

Create these labels in your GitHub repository:

### Severity Labels
- `severity: low` - Low severity issues (🟢 Green: #28a745)
- `severity: medium` - Medium severity issues (🟡 Yellow: #ffd33d)
- `severity: high` - High severity issues (🟠 Orange: #ff6b35)
- `severity: critical` - Critical severity issues (🔴 Red: #d73a49)

### Type Labels
- `bug` - Bug reports (🐛 Red: #d73a49)
- `auto-generated` - Automatically created (🤖 Gray: #6c757d)
- `database` - Database related (💾 Blue: #0366d6)
- `external-service` - External service issues (🌐 Purple: #6f42c1)
- `ai-service` - AI service issues (🧠 Teal: #20c997)
- `payment` - Payment related (💳 Gold: #f1c40f)
- `validation` - Validation errors (✅ Green: #28a745)
- `authentication` - Auth issues (🔐 Orange: #fd7e14)
- `server-error` - Server errors (⚠️ Red: #dc3545)
- `client-error` - Client errors (📱 Blue: #007bff)

### Quick Label Creation Script

Run this in your terminal (requires `gh` CLI):

```bash
gh label create "severity: low" --color 28a745 --description "Low severity issues"
gh label create "severity: medium" --color ffd33d --description "Medium severity issues"
gh label create "severity: high" --color ff6b35 --description "High severity issues"
gh label create "severity: critical" --color d73a49 --description "Critical severity issues"
gh label create "bug" --color d73a49 --description "Bug reports"
gh label create "auto-generated" --color 6c757d --description "Automatically created"
gh label create "database" --color 0366d6 --description "Database related"
gh label create "external-service" --color 6f42c1 --description "External service issues"
gh label create "ai-service" --color 20c997 --description "AI service issues"
gh label create "payment" --color f1c40f --description "Payment related"
gh label create "validation" --color 28a745 --description "Validation errors"
gh label create "authentication" --color fd7e14 --description "Authentication issues"
gh label create "server-error" --color dc3545 --description "Server errors"
gh label create "client-error" --color 007bff --description "Client errors"
```

## Step 4: Test the Integration

### Backend Test

```bash
# Start your backend server
npm run start:dev

# In another terminal, trigger a test error
curl -X POST http://localhost:3000/api/errors/test-github \
  -H "Content-Type: application/json" \
  -d '{
    "severity": "high",
    "message": "Test error for GitHub integration"
  }'
```

### Frontend Test

```typescript
// In your browser console or test file
import { githubIssueService } from './services/githubIssueService';

const testError = new Error('Test error for GitHub integration');
const report = {
  error: testError,
  correlationId: 'test-' + Date.now(),
  severity: 'high',
  userDescription: 'Testing GitHub issue creation',
  reproSteps: [
    'Open application',
    'Click test button',
    'Error occurred'
  ]
};

githubIssueService.createIssue(report)
  .then(result => console.log('Issue created:', result))
  .catch(error => console.error('Failed:', error));
```

## Step 5: Verify Configuration

Check if GitHub integration is properly configured:

```bash
curl http://localhost:3000/api/errors/github-status
```

Expected response:
```json
{
  "enabled": true,
  "configured": true,
  "repo": "your-username/your-repository"
}
```

## Security Best Practices

### 1. Token Security

- ✅ Never commit `.env` file to version control
- ✅ Use environment-specific tokens (dev, staging, prod)
- ✅ Set token expiration dates
- ✅ Rotate tokens regularly (every 90 days)
- ✅ Use GitHub Actions secrets for CI/CD
- ❌ Don't expose token in client-side code
- ❌ Don't log the token value

### 2. Repository Access

- ✅ Use separate repository for error tracking (optional)
- ✅ Limit token scope to minimum required permissions
- ✅ Use team-based access control
- ✅ Enable branch protection rules

### 3. Rate Limiting

GitHub API has rate limits:
- **Authenticated requests:** 5,000 requests per hour
- **Issue creation:** Unlimited, but subject to abuse detection

Our implementation includes:
- Error fingerprinting to prevent duplicates
- Frequency threshold to batch similar errors
- Exponential backoff for retries

## Troubleshooting

### Issue: "GitHub issue reporting is disabled"

**Solution:**
- Set `GITHUB_ISSUE_REPORTING_ENABLED=true` in `.env`
- Restart your server

### Issue: "GitHub Token not configured"

**Solution:**
- Verify `GITHUB_TOKEN` is set in `.env`
- Check token hasn't expired
- Ensure token has `repo` scope

### Issue: "Repository not found"

**Solution:**
- Verify `GITHUB_REPO` format: `owner/repository`
- Check token has access to the repository
- For private repos, ensure token has `repo` scope

### Issue: "Issues not being created"

**Solution:**
1. Check error severity (only HIGH and CRITICAL create issues)
2. Verify threshold is met (default: 5 occurrences)
3. Check for duplicate fingerprints
4. Review backend logs for GitHub API errors

### Issue: "403 Forbidden"

**Solution:**
- Token may have expired
- Token lacks required permissions
- Repository may have restricted issue creation
- Check if token is valid: `gh auth status`

### Issue: "422 Unprocessable Entity"

**Solution:**
- Issue body may be too large (max 65,536 chars)
- Labels may not exist in repository
- Invalid issue format

## Advanced Configuration

### Custom Issue Templates

Modify `/backend/src/common/exceptions/github-issue.service.ts`:

```typescript
private buildIssueBody(entry: ErrorTrackingEntry): string {
  // Customize issue body format here
  // Add custom sections, format differently, etc.
}
```

### Webhook Integration

Set up GitHub webhooks to receive notifications:

```typescript
// In your NestJS controller
@Post('/webhooks/github')
async handleGitHubWebhook(@Body() payload: any) {
  if (payload.action === 'closed') {
    // Handle issue closed event
    await this.updateErrorStatus(payload.issue.number);
  }
}
```

### Custom Severity Logic

Modify error severity detection:

```typescript
// In ErrorTrackingService
static categorizeSeverity(statusCode: number, error: Error): ErrorSeverity {
  // Add custom logic based on your needs
  if (error.message.includes('YOUR_CRITICAL_KEYWORD')) {
    return ErrorSeverity.CRITICAL;
  }
  // ... existing logic
}
```

## Monitoring

### Check Issue Creation Rate

```bash
# Get number of auto-generated issues created today
gh issue list --label auto-generated --created ">=2024-01-01"
```

### Monitor Token Usage

```bash
# Check API rate limit status
curl -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/rate_limit
```

### Error Statistics

```bash
# Get error statistics from your API
curl http://localhost:3000/api/errors/statistics
```

## Production Deployment

### Docker

```dockerfile
# In your Dockerfile
ENV GITHUB_TOKEN=${GITHUB_TOKEN}
ENV GITHUB_REPO=${GITHUB_REPO}
ENV GITHUB_ISSUE_REPORTING_ENABLED=true
```

### Kubernetes

```yaml
# In your deployment.yaml
apiVersion: v1
kind: Secret
metadata:
  name: github-credentials
type: Opaque
stringData:
  token: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  repo: owner/repository
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: lexiflow-backend
spec:
  template:
    spec:
      containers:
      - name: backend
        env:
        - name: GITHUB_TOKEN
          valueFrom:
            secretKeyRef:
              name: github-credentials
              key: token
        - name: GITHUB_REPO
          valueFrom:
            secretKeyRef:
              name: github-credentials
              key: repo
```

### Environment Variables in CI/CD

**GitHub Actions:**
```yaml
env:
  GITHUB_TOKEN: ${{ secrets.GITHUB_ERROR_REPORTING_TOKEN }}
  GITHUB_REPO: ${{ secrets.GITHUB_ERROR_REPO }}
```

**GitLab CI:**
```yaml
variables:
  GITHUB_TOKEN: $GITHUB_ERROR_REPORTING_TOKEN
  GITHUB_REPO: $GITHUB_ERROR_REPO
```

## Support

For issues with GitHub integration:
1. Check this guide's troubleshooting section
2. Review backend logs: `tail -f logs/error.log`
3. Test GitHub API access directly
4. Contact DevOps team

## References

- [GitHub API Documentation](https://docs.github.com/en/rest)
- [Creating Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [GitHub Issue Labels](https://docs.github.com/en/issues/using-labels-and-milestones-to-track-work/managing-labels)
