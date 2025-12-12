import { Injectable } from '@nestjs/common';
import { LogEntry, LogCategory } from '../logging.service';

/**
 * Console Transport
 * Writes logs to console with color coding
 */
@Injectable()
export class ConsoleTransport {
  private readonly colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    green: '\x1b[32m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m',
    gray: '\x1b[90m',
  };

  /**
   * Write log entry to console
   */
  write(entry: LogEntry): void {
    const color = this.getColor(entry.level, entry.category);
    const prefix = this.getPrefix(entry);
    const message = this.formatMessage(entry);

    console.log(`${color}${prefix}${message}${this.colors.reset}`);

    // Log stack trace separately if present
    if (entry.stack) {
      console.log(`${this.colors.gray}${entry.stack}${this.colors.reset}`);
    }

    // Log context in development mode
    if (
      process.env.NODE_ENV === 'development' &&
      entry.context &&
      Object.keys(entry.context).length > 0
    ) {
      console.log(
        `${this.colors.gray}Context: ${JSON.stringify(entry.context, null, 2)}${this.colors.reset}`,
      );
    }
  }

  private getColor(level: string, category: LogCategory): string {
    // Security and audit logs
    if (category === LogCategory.SECURITY || category === LogCategory.AUDIT) {
      return this.colors.magenta;
    }

    // Performance logs
    if (category === LogCategory.PERFORMANCE) {
      return this.colors.cyan;
    }

    // Standard level colors
    switch (level) {
      case 'error':
        return this.colors.red;
      case 'warn':
        return this.colors.yellow;
      case 'debug':
      case 'verbose':
        return this.colors.gray;
      default:
        return this.colors.green;
    }
  }

  private getPrefix(entry: LogEntry): string {
    const timestamp = new Date(entry.timestamp).toISOString();
    const level = entry.level.toUpperCase().padEnd(7);
    const category = `[${entry.category}]`.padEnd(13);
    const correlationId = entry.correlationId
      ? `[${entry.correlationId}] `
      : '';

    return `${timestamp} ${level} ${category} ${correlationId}`;
  }

  private formatMessage(entry: LogEntry): string {
    const contextStr =
      entry.context && entry.context.context
        ? `[${entry.context.context}] `
        : '';
    return `${contextStr}${entry.message}`;
  }
}
