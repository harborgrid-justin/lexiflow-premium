import axios from 'axios';
import { errorUtils } from '../utils/errorUtils';

/**
 * Error report for GitHub issue creation
 */
export interface ErrorReport {
  error: Error;
  componentStack?: string;
  correlationId: string;
  userDescription?: string;
  reproSteps?: string[];
  severity?: 'low' | 'medium' | 'high' | 'critical';
  environment?: {
    userAgent: string;
    url: string;
    timestamp: string;
    viewport: {
      width: number;
      height: number;
    };
  };
}

/**
 * GitHub issue response
 */
export interface GitHubIssueResponse {
  success: boolean;
  issueNumber?: number;
  issueUrl?: string;
  error?: string;
}

/**
 * GitHub Issue Service
 * Handles creation of GitHub issues from frontend errors
 * Routes through backend API for security (GitHub token not exposed)
 */
class GitHubIssueService {
  private apiBaseUrl: string;

  constructor() {
    this.apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  }

  /**
   * Create a GitHub issue from an error report
   */
  async createIssue(report: ErrorReport): Promise<GitHubIssueResponse> {
    try {
      const payload = this.buildIssuePayload(report);

      const response = await axios.post(
        `${this.apiBaseUrl}/errors/github-issue`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      return {
        success: true,
        issueNumber: response.data.issueNumber,
        issueUrl: response.data.issueUrl,
      };
    } catch (error) {
      console.error('Failed to create GitHub issue:', error);

      return {
        success: false,
        error: errorUtils.getErrorMessage(error),
      };
    }
  }

  /**
   * Check if GitHub issue reporting is enabled
   */
  async isEnabled(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.apiBaseUrl}/errors/github-status`);
      return response.data.enabled === true;
    } catch (error) {
      console.error('Failed to check GitHub issue status:', error);
      return false;
    }
  }

  /**
   * Build issue payload from error report
   */
  private buildIssuePayload(report: ErrorReport): any {
    return {
      error: {
        name: report.error.name,
        message: report.error.message,
        stack: report.error.stack,
      },
      componentStack: report.componentStack,
      correlationId: report.correlationId,
      userDescription: report.userDescription,
      reproSteps: report.reproSteps,
      severity: report.severity || this.determineSeverity(report.error),
      environment: report.environment || {
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      },
    };
  }

  /**
   * Determine error severity from error object
   */
  private determineSeverity(error: Error): 'low' | 'medium' | 'high' | 'critical' {
    const errorMessage = error.message.toLowerCase();
    const errorName = error.name.toLowerCase();

    // Critical errors
    if (
      errorName.includes('security') ||
      errorName.includes('payment') ||
      errorMessage.includes('data loss') ||
      errorMessage.includes('corruption')
    ) {
      return 'critical';
    }

    // High severity errors
    if (
      errorName.includes('database') ||
      errorName.includes('api') ||
      errorMessage.includes('failed to load') ||
      errorMessage.includes('cannot render')
    ) {
      return 'high';
    }

    // Low severity errors
    if (
      errorName.includes('validation') ||
      errorMessage.includes('invalid input') ||
      errorMessage.includes('format')
    ) {
      return 'low';
    }

    // Default to medium
    return 'medium';
  }

  /**
   * Format error for user-friendly display in GitHub issue
   */
  formatErrorForIssue(report: ErrorReport): string {
    const sections: string[] = [];

    sections.push('## Error Report\n');

    if (report.userDescription) {
      sections.push('### User Description\n');
      sections.push(report.userDescription);
      sections.push('\n');
    }

    if (report.reproSteps && report.reproSteps.length > 0) {
      sections.push('### Steps to Reproduce\n');
      report.reproSteps.forEach((step, index) => {
        sections.push(`${index + 1}. ${step}`);
      });
      sections.push('\n');
    }

    sections.push('### Error Details\n');
    sections.push('```');
    sections.push(`Error: ${report.error.name}`);
    sections.push(`Message: ${report.error.message}`);
    if (report.error.stack) {
      sections.push('\nStack Trace:');
      sections.push(report.error.stack);
    }
    sections.push('```\n');

    if (report.componentStack) {
      sections.push('### Component Stack\n');
      sections.push('```');
      sections.push(report.componentStack);
      sections.push('```\n');
    }

    sections.push('### Environment\n');
    if (report.environment) {
      sections.push(`- **URL:** ${report.environment.url}`);
      sections.push(`- **User Agent:** ${report.environment.userAgent}`);
      sections.push(
        `- **Viewport:** ${report.environment.viewport.width}x${report.environment.viewport.height}`,
      );
      sections.push(`- **Timestamp:** ${report.environment.timestamp}`);
    }

    sections.push(`\n**Correlation ID:** \`${report.correlationId}\``);

    return sections.join('\n');
  }

  /**
   * Get GitHub issue URL by correlation ID
   */
  async getIssueByCorrelationId(correlationId: string): Promise<string | null> {
    try {
      const response = await axios.get(
        `${this.apiBaseUrl}/errors/github-issue/${correlationId}`,
      );
      return response.data.issueUrl || null;
    } catch (error) {
      console.error('Failed to get GitHub issue:', error);
      return null;
    }
  }
}

// Export singleton instance
export const githubIssueService = new GitHubIssueService();
