/**
 * aiValidationService.ts
 * 
 * Security and validation service for AI-generated content.
 * Implements rate limiting, input sanitization, and output validation.
 * 
 * @module services/aiValidationService
 */

import { CANVAS_CONSTANTS, VALIDATION_MESSAGES } from '@/types/canvas-constants';
import { TypedWorkflowNode, WorkflowConnection } from '@/types/workflow-types';

/**
 * Rate limiter state
 */
interface RateLimiterState {
  requests: number[];
  windowStart: number;
}

/**
 * AI Response validation result
 */
export interface AIValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedPrompt?: string;
  sanitizedResponse?: unknown;
}

/**
 * AI Validation and Security Service
 */
export class AIValidationService {
  private static rateLimiter: Map<string, RateLimiterState> = new Map();

  /**
   * Validate and sanitize user prompt before sending to AI
   */
  static validatePrompt(prompt: string, userId: string = 'default'): AIValidationResult {
    const errors: string[] = [];

    // Check length
    if (prompt.length < CANVAS_CONSTANTS.AI_MIN_PROMPT_LENGTH) {
      errors.push(`Prompt must be at least ${CANVAS_CONSTANTS.AI_MIN_PROMPT_LENGTH} characters`);
    }

    if (prompt.length > CANVAS_CONSTANTS.AI_MAX_PROMPT_LENGTH) {
      errors.push(`Prompt cannot exceed ${CANVAS_CONSTANTS.AI_MAX_PROMPT_LENGTH} characters`);
    }

    // Check rate limiting
    if (!this.checkRateLimit(userId)) {
      errors.push(
        `Rate limit exceeded. Maximum ${CANVAS_CONSTANTS.AI_RATE_LIMIT_REQUESTS} requests per minute.`
      );
    }

    // Sanitize prompt
    const sanitizedPrompt = this.sanitizePrompt(prompt);

    // Check for potentially malicious content
    if (this.containsMaliciousPatterns(sanitizedPrompt)) {
      errors.push('Prompt contains potentially unsafe content');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedPrompt: errors.length === 0 ? sanitizedPrompt : undefined,
    };
  }

  /**
   * Sanitize user input prompt
   */
  private static sanitizePrompt(prompt: string): string {
    // Remove HTML tags
    let sanitized = prompt.replace(/<[^>]*>/g, '');

    // Remove potentially dangerous characters
    sanitized = sanitized.replace(/[<>\"'`]/g, '');

    // Normalize whitespace
    sanitized = sanitized.replace(/\s+/g, ' ').trim();

    // Limit special characters
    sanitized = sanitized.replace(/[^\w\s.,?!()-]/g, '');

    return sanitized;
  }

  /**
   * Check for malicious patterns in prompt
   */
  private static containsMaliciousPatterns(prompt: string): boolean {
    const maliciousPatterns = [
      /javascript:/i,
      /on\w+\s*=/i, // Event handlers
      /eval\(/i,
      /<script/i,
      /data:text\/html/i,
      /vbscript:/i,
    ];

    return maliciousPatterns.some(pattern => pattern.test(prompt));
  }

  /**
   * Validate AI-generated graph structure
   */
  static validateAIResponse(response: unknown): AIValidationResult {
    const errors: string[] = [];

    // Check response structure
    if (!response || typeof response !== 'object') {
      errors.push('Invalid AI response structure');
      return { isValid: false, errors };
    }

    // Validate nodes array
    if (!Array.isArray(response.nodes)) {
      errors.push('AI response missing valid nodes array');
    } else {
      this.validateNodesArray(response.nodes, errors);
    }

    // Validate connections array
    if (!Array.isArray(response.connections)) {
      errors.push('AI response missing valid connections array');
    } else {
      this.validateConnectionsArray(response.connections, response.nodes || [], errors);
    }

    // Sanitize response
    const sanitizedResponse = errors.length === 0 ? this.sanitizeAIResponse(response) : undefined;

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedResponse,
    };
  }

  /**
   * Validate nodes array from AI response
   */
  private static validateNodesArray(nodes: unknown[], errors: string[]): void {
    if (nodes.length === 0) {
      errors.push('AI response contains no nodes');
      return;
    }

    if (nodes.length > CANVAS_CONSTANTS.MAX_NODES) {
      errors.push(`AI generated too many nodes (max: ${CANVAS_CONSTANTS.MAX_NODES})`);
    }

    // Validate each node
    for (let i = 0; i < Math.min(nodes.length, 10); i++) {
      const node = nodes[i];
      if (!this.isValidNode(node)) {
        errors.push(`Invalid node structure at index ${i}`);
      }
    }

    // Check for required node types
    const hasStart = nodes.some(n => n.type === 'Start');
    const hasEnd = nodes.some(n => n.type === 'End');

    if (!hasStart) {
      errors.push('AI response missing Start node');
    }

    if (!hasEnd) {
      errors.push('AI response missing End node');
    }
  }

  /**
   * Validate connections array from AI response
   */
  private static validateConnectionsArray(
    connections: unknown[],
    nodes: unknown[],
    errors: string[]
  ): void {
    if (connections.length > CANVAS_CONSTANTS.MAX_CONNECTIONS) {
      errors.push(`AI generated too many connections (max: ${CANVAS_CONSTANTS.MAX_CONNECTIONS})`);
    }

    const nodeIds = new Set(nodes.map(n => n.id));

    for (let i = 0; i < Math.min(connections.length, 20); i++) {
      const conn = connections[i];

      if (!this.isValidConnection(conn)) {
        errors.push(`Invalid connection structure at index ${i}`);
        continue;
      }

      // Validate connection references existing nodes
      if (!nodeIds.has(conn.from) || !nodeIds.has(conn.to)) {
        errors.push(`Connection ${i} references non-existent nodes`);
      }
    }
  }

  /**
   * Check if node structure is valid
   */
  private static isValidNode(node: unknown): boolean {
    return (
      node &&
      typeof node === 'object' &&
      typeof node.id === 'string' &&
      typeof node.type === 'string' &&
      typeof node.label === 'string' &&
      typeof node.x === 'number' &&
      typeof node.y === 'number' &&
      typeof node.config === 'object'
    );
  }

  /**
   * Check if connection structure is valid
   */
  private static isValidConnection(conn: unknown): boolean {
    return (
      conn &&
      typeof conn === 'object' &&
      typeof conn.id === 'string' &&
      typeof conn.from === 'string' &&
      typeof conn.to === 'string'
    );
  }

  /**
   * Sanitize AI response to ensure safe values
   */
  private static sanitizeAIResponse(response: unknown): any {
    return {
      nodes: response.nodes.map((node: unknown) => ({
        ...(node && typeof node === 'object' ? node : {}),
        id: this.sanitizeString(node.id),
        label: this.sanitizeString(node.label),
        type: this.sanitizeString(node.type),
        x: this.clamp(node.x, 0, 2000),
        y: this.clamp(node.y, 0, 2000),
        config: this.sanitizeConfig(node.config),
      })),
      connections: response.connections.map((conn: unknown) => ({
        ...(conn && typeof conn === 'object' ? conn : {}),
        id: this.sanitizeString(conn.id),
        from: this.sanitizeString(conn.from),
        to: this.sanitizeString(conn.to),
        label: conn.label ? this.sanitizeString(conn.label) : undefined,
      })),
    };
  }

  /**
   * Sanitize string values
   */
  private static sanitizeString(value: string): string {
    if (typeof value !== 'string') return String(value);
    return value.slice(0, 200).replace(/[<>\"'`]/g, '');
  }

  /**
   * Sanitize config object
   */
  private static sanitizeConfig(config: unknown): any {
    if (!config || typeof config !== 'object') return {};

    const sanitized: unknown = {};
    for (const key of Object.keys(config)) {
      const value = config[key];
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeString(value);
      } else if (typeof value === 'number') {
        sanitized[key] = this.clamp(value, -10000, 10000);
      } else if (typeof value === 'boolean') {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  /**
   * Clamp number to range
   */
  private static clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  /**
   * Check rate limit for user
   */
  private static checkRateLimit(userId: string): boolean {
    const now = Date.now();
    const state = this.rateLimiter.get(userId) || { requests: [], windowStart: now };

    // Remove requests outside the window
    state.requests = state.requests.filter(
      timestamp => now - timestamp < CANVAS_CONSTANTS.AI_RATE_LIMIT_WINDOW_MS
    );

    // Check if limit exceeded
    if (state.requests.length >= CANVAS_CONSTANTS.AI_RATE_LIMIT_REQUESTS) {
      return false;
    }

    // Add current request
    state.requests.push(now);
    this.rateLimiter.set(userId, state);

    return true;
  }

  /**
   * Reset rate limiter for user (for testing)
   */
  static resetRateLimit(userId: string = 'default'): void {
    this.rateLimiter.delete(userId);
  }

  /**
   * Get remaining requests for user
   */
  static getRemainingRequests(userId: string = 'default'): number {
    const state = this.rateLimiter.get(userId);
    if (!state) return CANVAS_CONSTANTS.AI_RATE_LIMIT_REQUESTS;

    const now = Date.now();
    const recentRequests = state.requests.filter(
      timestamp => now - timestamp < CANVAS_CONSTANTS.AI_RATE_LIMIT_WINDOW_MS
    );

    return Math.max(0, CANVAS_CONSTANTS.AI_RATE_LIMIT_REQUESTS - recentRequests.length);
  }
}

