/**
 * Logger - Centralized logging utility
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: unknown;
  timestamp: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  private log(level: LogLevel, message: string, ...data: unknown[]) {
    const entry: LogEntry = {
      level,
      message,
      data: data.length > 0 ? data : undefined,
      timestamp: new Date().toISOString(),
    };

    this.logs.push(entry);

    // Keep logs under max limit
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output
    const consoleMethod = level === "debug" ? "log" : level;
    console[consoleMethod](`[${level.toUpperCase()}]`, message, ...data);

    // Send to remote logging service in production
    if (
      typeof window !== "undefined" &&
      process.env.NODE_ENV === "production"
    ) {
      this.sendToRemote(entry);
    }
  }

  private async sendToRemote(entry: LogEntry) {
    try {
      await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });
    } catch {
      // Silently fail for logging errors
    }
  }

  debug(message: string, ...data: unknown[]) {
    this.log("debug", message, ...data);
  }

  info(message: string, ...data: unknown[]) {
    this.log("info", message, ...data);
  }

  warn(message: string, ...data: unknown[]) {
    this.log("warn", message, ...data);
  }

  error(message: string, ...data: unknown[]) {
    this.log("error", message, ...data);
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }
}

export const logger = new Logger();
