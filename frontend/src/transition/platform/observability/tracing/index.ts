/**
 * Tracing - Distributed tracing utilities
 */

export interface Span {
  id: string;
  traceId: string;
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  attributes?: Record<string, unknown>;
}

class Tracer {
  private spans: Map<string, Span> = new Map();
  private _currentTraceId: string | null = null;

  startTrace(name: string): string {
    const traceId = this.generateId();
    this._currentTraceId = traceId;

    const span: Span = {
      id: this.generateId(),
      traceId,
      name,
      startTime: performance.now(),
    };

    this.spans.set(span.id, span);
    return span.id;
  }

  endTrace(spanId: string, attributes?: Record<string, any>) {
    const span = this.spans.get(spanId);
    if (!span) return;

    span.endTime = performance.now();
    span.duration = span.endTime - span.startTime;
    span.attributes = attributes;

    // Send to tracing backend
    if (process.env.NODE_ENV === "production") {
      this.sendSpan(span);
    }
  }

  private async sendSpan(span: Span) {
    try {
      await fetch("/api/traces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(span),
      });
    } catch (error) {
      console.error("Failed to send trace:", error);
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getSpans(): Span[] {
    return Array.from(this.spans.values());
  }
}

export const tracer = new Tracer();
