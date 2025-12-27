import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Request ID Middleware
 * Generates or extracts request IDs for distributed tracing
 * MUST run before any other middleware that needs request ID
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request & { id?: string; correlationId?: string }, res: Response, next: NextFunction) {
    // Extract or generate request ID
    // Check multiple headers for compatibility with different clients
    const requestId =
      req.headers['x-request-id'] as string ||
      req.headers['x-correlation-id'] as string ||
      req.headers['x-trace-id'] as string ||
      uuidv4();

    // Attach to request for downstream use
    req.id = requestId;
    req.correlationId = requestId;

    // Set response headers for client tracking
    res.setHeader('X-Request-ID', requestId);
    res.setHeader('X-Correlation-ID', requestId);

    next();
  }
}
