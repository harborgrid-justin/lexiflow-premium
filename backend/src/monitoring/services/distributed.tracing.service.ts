import { Injectable, OnModuleInit } from "@nestjs/common";
import {
  trace,
  context,
  SpanStatusCode,
  Span,
  Tracer,
} from "@opentelemetry/api";
//
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import {
  StructuredLoggerService,
  HttpRequest,
  HttpResponse,
} from "./structured.logger.service";

export interface TraceContext {
  traceId: string;
  spanId: string;
  traceFlags: number;
}

export interface SpanOptions {
  name: string;
  attributes?: Record<string, string | number | boolean>;
  kind?: "server" | "client" | "producer" | "consumer" | "internal";
}

/**
 * Distributed Tracing Service
 * OpenTelemetry integration for distributed tracing across services
 * Provides span creation, propagation, and context management
 */
/**
 * ╔=================================================================================================================╗
 * ║DISTRIBUTEDTRACING                                                                                               ║
 * ╠=================================================================================================================╣
 * ║                                                                                                                 ║
 * ║  External Request                   Controller                            Service                                ║
 * ║       │                                   │                                     │                                ║
 * ║       │  HTTP Endpoints                  │                                     │                                ║
 * ║       └───────────────────────────────────►                                     │                                ║
 * ║                                                                                                                 ║
 * ║                                                                 ┌───────────────┴───────────────┐                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          Repository                    Database                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          PostgreSQL                                          ║
 * ║                                                                                                                 ║
 * ║  DATA IN:  Data input                                                                                         ║

 * ║                                                                                                                 ║
 * ║  DATA OUT: Data output                                                                                        ║

 * ║                                                                                                                 ║

 * ╚=================================================================================================================╝
 */

@Injectable()
export class DistributedTracingService implements OnModuleInit {
  private tracer: Tracer;
  private sdk: NodeSDK | null = null;
  private readonly serviceName = "lexiflow-backend";
  private readonly serviceVersion = process.env.npm_package_version || "1.0.0";

  constructor(private readonly logger: StructuredLoggerService) {
    this.tracer = trace.getTracer(this.serviceName, this.serviceVersion);
  }

  /**
   * Initialize OpenTelemetry SDK on module initialization
   */
  async onModuleInit(): Promise<void> {
    if (process.env.OTEL_ENABLED !== "true") {
      this.logger.log("OpenTelemetry disabled, skipping initialization");
      return;
    }

    try {
      await this.initializeTracing();
      this.logger.log("OpenTelemetry initialized successfully");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error("Failed to initialize OpenTelemetry", errorMessage);
    }
  }

  /**
   * Initialize OpenTelemetry tracing
   */
  private async initializeTracing(): Promise<void> {
    const resource = {
      attributes: {
        [ATTR_SERVICE_NAME]: this.serviceName,
        [ATTR_SERVICE_VERSION]: this.serviceVersion,
        environment: process.env.NODE_ENV || "development",
        deployment: process.env.DEPLOYMENT_ID || "local",
      },
    };

    // Configure OTLP exporter
    const otlpExporter = new OTLPTraceExporter({
      url:
        process.env.OTEL_EXPORTER_OTLP_ENDPOINT ||
        "http://localhost:4318/v1/traces",
      headers: {
        Authorization: process.env.OTEL_EXPORTER_OTLP_HEADERS || "",
      },
      timeoutMillis: 10000,
    });

    // Create span processor
    const spanProcessor = new BatchSpanProcessor(otlpExporter, {
      maxQueueSize: 2048,
      maxExportBatchSize: 512,
      scheduledDelayMillis: 5000,
      exportTimeoutMillis: 30000,
    });

    // Initialize SDK
    this.sdk = new NodeSDK({
      resource: resource as Resource,
      spanProcessors: [spanProcessor],
    });

    try {
      await this.sdk.start();
    } catch (error) {
      this.logger.error(
        "Failed to start OpenTelemetry SDK",
        error instanceof Error ? error.stack : String(error)
      );
      throw error;
    }

    // Graceful shutdown
    process.on("SIGTERM", async () => {
      try {
        await this.sdk?.shutdown();
        this.logger.log("OpenTelemetry shut down successfully");
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        this.logger.error("Error shutting down OpenTelemetry", errorMessage);
      }
    });
  }

  /**
   * Start a new span
   */
  startSpan(name: string, options?: Partial<SpanOptions>): Span {
    const span = this.tracer.startSpan(name, {
      attributes: {
        "service.name": this.serviceName,
        ...options?.attributes,
      },
    });

    return span;
  }

  /**
   * Start a span with active context
   */
  startActiveSpan<T>(
    name: string,
    callback: (span: Span) => Promise<T> | T,
    options?: Partial<SpanOptions>
  ): Promise<T> | T {
    return this.tracer.startActiveSpan(
      name,
      {
        attributes: {
          "service.name": this.serviceName,
          ...options?.attributes,
        },
      },
      async (span) => {
        try {
          const result = await callback(span);
          span.setStatus({ code: SpanStatusCode.OK });
          return result;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: errorMessage,
          });
          if (error instanceof Error) {
            span.recordException(error);
          }
          throw error;
        } finally {
          span.end();
        }
      }
    );
  }

  /**
   * Create a span for HTTP request
   */
  startHttpRequestSpan(req: HttpRequest): Span {
    const userAgent = Array.isArray(req.headers?.["user-agent"])
      ? req.headers["user-agent"][0]
      : req.headers?.["user-agent"];

    const traceParent = Array.isArray(req.headers?.["traceparent"])
      ? req.headers["traceparent"][0]
      : req.headers?.["traceparent"];

    const span = this.startSpan(
      `HTTP ${req.method} ${req.route?.path || req.url}`,
      {
        attributes: {
          "http.method": req.method,
          "http.url": req.url,
          "http.route": req.route?.path || req.url,
          "http.target": req.url,
          "http.user_agent": userAgent || "unknown",
          "http.client_ip":
            req.ip || req.connection?.remoteAddress || "unknown",
          "net.peer.ip": req.ip || req.connection?.remoteAddress || "unknown",
        },
      }
    );

    // Extract trace context from headers if present
    if (traceParent) {
      this.injectTraceContext(span, traceParent);
    }

    return span;
  }

  /**
   * End HTTP request span with response details
   */
  endHttpRequestSpan(span: Span, res: HttpResponse, error?: Error): void {
    span.setAttributes({
      "http.status_code": res.statusCode,
      "http.status_text": res.statusMessage || "",
    });

    if (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message,
      });
      span.recordException(error);
    } else {
      if (res.statusCode >= 500) {
        span.setStatus({ code: SpanStatusCode.ERROR });
      } else if (res.statusCode >= 400) {
        span.setStatus({ code: SpanStatusCode.ERROR, message: "Client error" });
      } else {
        span.setStatus({ code: SpanStatusCode.OK });
      }
    }

    span.end();
  }

  /**
   * Create a span for database operation
   */
  startDatabaseSpan(operation: string, table: string, query?: string): Span {
    const span = this.startSpan(`DB ${operation} ${table}`, {
      attributes: {
        "db.system": "postgresql",
        "db.operation": operation,
        "db.sql.table": table,
        ...(query ? { "db.statement": query.substring(0, 500) } : {}),
      },
    });

    return span;
  }

  /**
   * Create a span for external HTTP call
   */
  startExternalHttpSpan(method: string, url: string): Span {
    const span = this.startSpan(`HTTP ${method} ${url}`, {
      attributes: {
        "http.method": method,
        "http.url": url,
        "span.kind": "client",
      },
    });

    return span;
  }

  /**
   * Create a span for queue/message processing
   */
  startQueueSpan(queueName: string, operation: "send" | "receive"): Span {
    const span = this.startSpan(`QUEUE ${operation} ${queueName}`, {
      attributes: {
        "messaging.system": "redis",
        "messaging.destination": queueName,
        "messaging.operation": operation,
      },
    });

    return span;
  }

  /**
   * Create a span for cache operation
   */
  startCacheSpan(operation: "get" | "set" | "delete", key: string): Span {
    const span = this.startSpan(`CACHE ${operation} ${key}`, {
      attributes: {
        "cache.operation": operation,
        "cache.key": key,
        "cache.system": "redis",
      },
    });

    return span;
  }

  /**
   * Add event to current span
   */
  addEvent(
    name: string,
    attributes?: Record<string, string | number | boolean>
  ): void {
    const activeSpan = trace.getActiveSpan();
    if (activeSpan) {
      activeSpan.addEvent(name, attributes);
    }
  }

  /**
   * Set attributes on current span
   */
  setAttributes(attributes: Record<string, string | number | boolean>): void {
    const activeSpan = trace.getActiveSpan();
    if (activeSpan) {
      activeSpan.setAttributes(attributes);
    }
  }

  /**
   * Record exception on current span
   */
  recordException(
    error: Error,
    attributes?: Record<string, string | number | boolean>
  ): void {
    const activeSpan = trace.getActiveSpan();
    if (activeSpan) {
      activeSpan.recordException(error);
      if (attributes) {
        activeSpan.setAttributes(attributes as Attributes);
      }
      activeSpan.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message,
      });
    }
  }

  /**
   * Get current trace context
   */
  getCurrentTraceContext(): TraceContext | null {
    const activeSpan = trace.getActiveSpan();
    if (!activeSpan) {
      return null;
    }

    const spanContext = activeSpan.spanContext();
    return {
      traceId: spanContext.traceId,
      spanId: spanContext.spanId,
      traceFlags: spanContext.traceFlags,
    };
  }

  /**
   * Extract trace context from W3C traceparent header
   */
  private injectTraceContext(span: Span, traceParent: string): void {
    try {
      const parts = traceParent.split("-");
      if (parts.length === 4) {
        span.setAttributes({
          "trace.parent.version": parts[0],
          "trace.parent.trace_id": parts[1],
          "trace.parent.span_id": parts[2],
          "trace.parent.flags": parts[3],
        });
      }
    } catch {
      this.logger.warn("Failed to inject trace context", { traceParent });
    }
  }

  /**
   * Generate W3C traceparent header
   */
  generateTraceParent(): string | null {
    const traceContext = this.getCurrentTraceContext();
    if (!traceContext) {
      return null;
    }

    return `00-${traceContext.traceId}-${traceContext.spanId}-${traceContext.traceFlags.toString(16).padStart(2, "0")}`;
  }

  /**
   * Run function with trace context
   */
  runWithContext<T>(callback: () => T): T {
    return context.with(context.active(), callback);
  }

  /**
   * Create a child span from current context
   */
  createChildSpan(
    name: string,
    attributes?: Record<string, string | number | boolean>
  ): Span {
    return this.startSpan(name, { attributes });
  }

  /**
   * Wrap async function with tracing
   */
  async traced<T>(
    name: string,
    fn: () => Promise<T>,
    attributes?: Record<string, string | number | boolean>
  ): Promise<T> {
    return this.startActiveSpan(name, async (span) => {
      if (attributes) {
        span.setAttributes(attributes);
      }
      return await fn();
    });
  }

  /**
   * Get active span
   */
  getActiveSpan(): Span | undefined {
    return trace.getActiveSpan();
  }

  /**
   * Check if tracing is enabled
   */
  isEnabled(): boolean {
    return process.env.OTEL_ENABLED === "true";
  }

  /**
   * Shutdown tracing (cleanup)
   */
  async shutdown(): Promise<void> {
    if (this.sdk) {
      await this.sdk.shutdown();
      this.logger.log("OpenTelemetry SDK shut down");
    }
  }

  /**
   * Force flush pending spans
   */
  async flush(): Promise<void> {
    if (this.sdk) {
      await this.sdk.shutdown();
      this.logger.log("Flushed pending traces");
    }
  }
}
