import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ErrorTrackingEntry, ErrorSeverity } from './error-tracking.service';
import axios from 'axios';

/**
 * GitHub issue label configuration
 */
const SEVERITY_LABELS: Record<ErrorSeverity, string> = {
  [ErrorSeverity.LOW]: 'severity: low',
  [ErrorSeverity.MEDIUM]: 'severity: medium',
  [ErrorSeverity.HIGH]: 'severity: high',
  [ErrorSeverity.CRITICAL]: 'severity: critical',
};

/**
 * GitHub issue creation payload
 */
export interface GitHubIssuePayload {
  title: string;
  body: string;
  labels: string[];
  assignees?: string[];
}

/**
 * GitHub Issue Service
 * Creates GitHub issues from application errors
 * Requires GITHUB_TOKEN and GITHUB_REPO environment variables
 */
@Injectable()
export class GitHubIssueService {
  private readonly logger = new Logger(GitHubIssueService.name);
  private readonly githubApiUrl = 'https://api.github.com';
  private readonly enabled: boolean;
  private readonly token?: string;
  private readonly repo?: string;
  private readonly owner?: string;

  constructor(private readonly configService: ConfigService) {
    this.token = this.configService.get<string>('GITHUB_TOKEN');
    this.repo = this.configService.get<string>('GITHUB_REPO'); // e.g., "username/repo"
    this.enabled = this.configService.get<boolean>('GITHUB_ISSUE_REPORTING_ENABLED', false);

    if (this.repo) {
      const [owner, repoName] = this.repo.split('/');
      this.owner = owner;
      this.repo = repoName;
    }

    if (this.enabled && (!this.token || !this.owner || !this.repo)) {
      this.logger.warn(
        'GitHub issue reporting is enabled but GITHUB_TOKEN or GITHUB_REPO is not configured',
      );
      this.enabled = false;
    }
  }

  /**
   * Create a GitHub issue from an error
   */
  async createIssueFromError(
    entry: ErrorTrackingEntry,
    userDescription?: string,
    reproSteps?: string[],
  ): Promise<{ success: boolean; issueNumber?: number; url?: string; error?: string }> {
    if (!this.enabled) {
      this.logger.debug('GitHub issue reporting is disabled');
      return { success: false, error: 'GitHub issue reporting is disabled' };
    }

    try {
      const payload = this.buildIssuePayload(entry, userDescription, reproSteps);

      const response = await axios.post(
        `${this.githubApiUrl}/repos/${this.owner}/${this.repo}/issues`,
        payload,
        {
          headers: {
            Authorization: `token ${this.token}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
        },
      );

      const issueNumber = response.data.number;
      const issueUrl = response.data.html_url;

      this.logger.log(
        `Created GitHub issue #${issueNumber} for error ${entry.correlationId}`,
      );

      return {
        success: true,
        issueNumber,
        url: issueUrl,
      };
    } catch (error) {
      this.logger.error(
        `Failed to create GitHub issue for error ${entry.correlationId}`,
        error instanceof Error ? error.stack : String(error),
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create GitHub issue',
      };
    }
  }

  /**
   * Search for existing issues with the same fingerprint
   */
  async findExistingIssue(fingerprint: string): Promise<number | null> {
    if (!this.enabled) {
      return null;
    }

    try {
      const searchQuery = `repo:${this.owner}/${this.repo} is:issue is:open "${fingerprint}"`;

      const response = await axios.get(`${this.githubApiUrl}/search/issues`, {
        params: { q: searchQuery },
        headers: {
          Authorization: `token ${this.token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (response.data.total_count > 0) {
        return response.data.items[0].number;
      }

      return null;
    } catch (error) {
      this.logger.error(
        'Failed to search for existing GitHub issues',
        error instanceof Error ? error.stack : String(error),
      );
      return null;
    }
  }

  /**
   * Add a comment to an existing issue
   */
  async addCommentToIssue(
    issueNumber: number,
    comment: string,
  ): Promise<boolean> {
    if (!this.enabled) {
      return false;
    }

    try {
      await axios.post(
        `${this.githubApiUrl}/repos/${this.owner}/${this.repo}/issues/${issueNumber}/comments`,
        { body: comment },
        {
          headers: {
            Authorization: `token ${this.token}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(`Added comment to GitHub issue #${issueNumber}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to add comment to GitHub issue #${issueNumber}`,
        error instanceof Error ? error.stack : String(error),
      );
      return false;
    }
  }

  /**
   * Build GitHub issue payload from error tracking entry
   */
  private buildIssuePayload(
    entry: ErrorTrackingEntry,
    userDescription?: string,
    reproSteps?: string[],
  ): GitHubIssuePayload {
    const title = this.buildIssueTitle(entry);
    const body = this.buildIssueBody(entry, userDescription, reproSteps);
    const labels = this.buildIssueLabels(entry);

    return { title, body, labels };
  }

  /**
   * Build issue title
   */
  private buildIssueTitle(entry: ErrorTrackingEntry): string {
    const errorName = entry.error.name || 'Error';
    const errorMessage = entry.error.message.substring(0, 100);

    return `[${errorName}] ${errorMessage}`;
  }

  /**
   * Build issue body with detailed information
   */
  private buildIssueBody(
    entry: ErrorTrackingEntry,
    userDescription?: string,
    reproSteps?: string[],
  ): string {
    const sections: string[] = [];

    // Summary
    sections.push('## Error Report\n');
    sections.push(`**Error ID:** \`${entry.correlationId}\``);
    sections.push(`**Severity:** ${entry.severity.toUpperCase()}`);
    sections.push(`**Timestamp:** ${entry.timestamp.toISOString()}`);
    sections.push(`**Fingerprint:** \`${entry.fingerprint}\`\n`);

    // User Description
    if (userDescription) {
      sections.push('## User Description\n');
      sections.push(userDescription + '\n');
    }

    // Reproduction Steps
    if (reproSteps && reproSteps.length > 0) {
      sections.push('## Steps to Reproduce\n');
      reproSteps.forEach((step, index) => {
        sections.push(`${index + 1}. ${step}`);
      });
      sections.push('');
    }

    // Error Details
    sections.push('## Error Details\n');
    sections.push('```');
    sections.push(`Error: ${entry.error.name}`);
    sections.push(`Message: ${entry.error.message}`);
    if (entry.error.stack) {
      sections.push('\nStack Trace:');
      sections.push(entry.error.stack);
    }
    sections.push('```\n');

    // Request Context
    if (entry.url || entry.method || entry.statusCode) {
      sections.push('## Request Information\n');
      if (entry.method && entry.url) {
        sections.push(`**Endpoint:** \`${entry.method} ${entry.url}\``);
      }
      if (entry.statusCode) {
        sections.push(`**Status Code:** ${entry.statusCode}`);
      }
      sections.push('');
    }

    // Environment
    sections.push('## Environment\n');
    if (entry.userAgent) {
      sections.push(`**User Agent:** \`${entry.userAgent}\``);
    }
    if (entry.ip) {
      sections.push(`**IP Address:** \`${entry.ip}\``);
    }
    if (entry.userId) {
      sections.push(`**User ID:** \`${entry.userId}\``);
    }
    sections.push('');

    // Additional Context
    if (entry.context && Object.keys(entry.context).length > 0) {
      sections.push('## Additional Context\n');
      sections.push('```json');
      sections.push(JSON.stringify(entry.context, null, 2));
      sections.push('```\n');
    }

    // Footer
    sections.push('---');
    sections.push('*This issue was automatically generated by the LexiFlow error tracking system.*');

    return sections.join('\n');
  }

  /**
   * Build issue labels based on error properties
   */
  private buildIssueLabels(entry: ErrorTrackingEntry): string[] {
    const labels: string[] = ['bug', 'auto-generated'];

    // Add severity label
    labels.push(SEVERITY_LABELS[entry.severity]);

    // Add type labels based on error name
    if (entry.error.name.includes('Database')) {
      labels.push('database');
    } else if (entry.error.name.includes('External')) {
      labels.push('external-service');
    } else if (entry.error.name.includes('AI')) {
      labels.push('ai-service');
    } else if (entry.error.name.includes('Payment')) {
      labels.push('payment');
    } else if (entry.error.name.includes('Validation')) {
      labels.push('validation');
    } else if (entry.error.name.includes('Auth')) {
      labels.push('authentication');
    }

    // Add status code category labels
    if (entry.statusCode) {
      if (entry.statusCode >= 500) {
        labels.push('server-error');
      } else if (entry.statusCode >= 400) {
        labels.push('client-error');
      }
    }

    return labels;
  }

  /**
   * Check if service is properly configured
   */
  isConfigured(): boolean {
    return this.enabled;
  }

  /**
   * Get service configuration status
   */
  getStatus(): {
    enabled: boolean;
    configured: boolean;
    repo?: string;
  } {
    return {
      enabled: this.enabled,
      configured: !!(this.token && this.owner && this.repo),
      repo: this.repo ? `${this.owner}/${this.repo}` : undefined,
    };
  }
}
