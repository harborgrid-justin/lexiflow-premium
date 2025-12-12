import { Injectable } from '@nestjs/common';
import { LogEntry, LogCategory } from '../logging.service';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * File Transport
 * Writes logs to files organized by date and category
 */
@Injectable()
export class FileTransport {
  private readonly logsDir: string;
  private writeQueue: Promise<void> = Promise.resolve();

  constructor() {
    this.logsDir = path.join(process.cwd(), 'logs');
    this.ensureLogsDirectory();
  }

  /**
   * Write log entry to file
   */
  async write(entry: LogEntry): Promise<void> {
    // Queue writes to prevent concurrent file access issues
    this.writeQueue = this.writeQueue
      .then(() => this.writeToFile(entry))
      .catch((error) => {
        console.error('Error writing log to file:', error);
      });

    return this.writeQueue;
  }

  private async writeToFile(entry: LogEntry): Promise<void> {
    try {
      const fileName = this.getFileName(entry);
      const filePath = path.join(this.logsDir, fileName);
      const logLine = this.formatLogLine(entry);

      await fs.appendFile(filePath, logLine + '\n', 'utf8');
    } catch (error) {
      // Fail silently to not disrupt application flow
      console.error('Failed to write log to file:', error);
    }
  }

  private getFileName(entry: LogEntry): string {
    const date = new Date(entry.timestamp);
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD

    // Separate files for different log categories
    switch (entry.category) {
      case LogCategory.ERROR:
        return `error-${dateStr}.log`;
      case LogCategory.SECURITY:
        return `security-${dateStr}.log`;
      case LogCategory.AUDIT:
        return `audit-${dateStr}.log`;
      case LogCategory.PERFORMANCE:
        return `performance-${dateStr}.log`;
      default:
        return `application-${dateStr}.log`;
    }
  }

  private formatLogLine(entry: LogEntry): string {
    const logObject = {
      timestamp: entry.timestamp,
      level: entry.level,
      category: entry.category,
      message: entry.message,
      ...(entry.correlationId && { correlationId: entry.correlationId }),
      ...(entry.userId && { userId: entry.userId }),
      ...(entry.ip && { ip: entry.ip }),
      ...(entry.userAgent && { userAgent: entry.userAgent }),
      ...(entry.context && { context: entry.context }),
      ...(entry.stack && process.env.NODE_ENV === 'development' && { stack: entry.stack }),
    };

    return JSON.stringify(logObject);
  }

  private async ensureLogsDirectory(): Promise<void> {
    try {
      await fs.access(this.logsDir);
    } catch {
      try {
        await fs.mkdir(this.logsDir, { recursive: true });
      } catch (error) {
        console.error('Failed to create logs directory:', error);
      }
    }
  }

  /**
   * Clean up old log files (older than specified days)
   */
  async cleanupOldLogs(daysToKeep: number = 30): Promise<void> {
    try {
      const files = await fs.readdir(this.logsDir);
      const now = Date.now();
      const maxAge = daysToKeep * 24 * 60 * 60 * 1000;

      for (const file of files) {
        if (!file.endsWith('.log')) continue;

        const filePath = path.join(this.logsDir, file);
        const stats = await fs.stat(filePath);
        const age = now - stats.mtime.getTime();

        if (age > maxAge) {
          await fs.unlink(filePath);
          console.log(`Deleted old log file: ${file}`);
        }
      }
    } catch (error) {
      console.error('Error cleaning up old logs:', error);
    }
  }

  /**
   * Get logs for a specific date and category
   */
  async getLogs(
    date: string,
    category?: LogCategory,
  ): Promise<LogEntry[]> {
    try {
      const fileName = category
        ? `${category}-${date}.log`
        : `application-${date}.log`;
      const filePath = path.join(this.logsDir, fileName);

      const content = await fs.readFile(filePath, 'utf8');
      const lines = content.split('\n').filter((line) => line.trim());

      return lines.map((line) => JSON.parse(line));
    } catch (error) {
      console.error('Error reading log file:', error);
      return [];
    }
  }

  /**
   * Search logs by criteria
   */
  async searchLogs(criteria: {
    startDate: string;
    endDate: string;
    category?: LogCategory;
    correlationId?: string;
    userId?: string;
  }): Promise<LogEntry[]> {
    const results: LogEntry[] = [];

    try {
      const files = await fs.readdir(this.logsDir);

      for (const file of files) {
        // Filter by category if specified
        if (criteria.category && !file.startsWith(criteria.category)) {
          continue;
        }

        // Extract date from filename
        const match = file.match(/(\d{4}-\d{2}-\d{2})/);
        if (!match) continue;

        const fileDate = match[1];
        if (fileDate < criteria.startDate || fileDate > criteria.endDate) {
          continue;
        }

        const logs = await this.getLogs(fileDate, criteria.category);

        // Filter by additional criteria
        const filtered = logs.filter((log) => {
          if (criteria.correlationId && log.correlationId !== criteria.correlationId) {
            return false;
          }
          if (criteria.userId && log.userId !== criteria.userId) {
            return false;
          }
          return true;
        });

        results.push(...filtered);
      }
    } catch (error) {
      console.error('Error searching logs:', error);
    }

    return results;
  }
}
