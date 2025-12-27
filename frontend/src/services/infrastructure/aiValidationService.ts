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

    const responseObj = response as Record<string, unknown>;

    // Validate nodes array
    if (!Array.isArray(responseObj.nodes)) {
      errors.push('AI response missing valid nodes array');
    } else {
      this.validateNodesArray(responseObj.nodes, errors);
    }

    // Validate connections array
    if (!Array.isArray(responseObj.connections)) {
      errors.push('AI response missing valid connections array');
    } else {
      const nodes = Array.isArray(responseObj.nodes) ? responseObj.nodes : [];
      this.validateConnectionsArray(responseObj.connections, nodes, errors);
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
    const hasStart = nodes.some(n => {
      if (n && typeof n === 'object') {
        const nodeObj = n as Record<string, unknown>;
        return nodeObj.type === 'Start';
      }
      return false;
    });
    const hasEnd = nodes.some(n => {
      if (n && typeof n === 'object') {
        const nodeObj = n as Record<string, unknown>;
        return nodeObj.type === 'End';
      }
      return false;
    });

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

    const nodeIds = new Set<string>();
    nodes.forEach(n => {
      if (n && typeof n === 'object') {
        const nodeObj = n as Record<string, unknown>;
        if (typeof nodeObj.id === 'string') {
          nodeIds.add(nodeObj.id);
        }
      }
    });

    for (let i = 0; i < Math.min(connections.length, 20); i++) {
      const conn = connections[i];

      if (!this.isValidConnection(conn)) {
        errors.push(`Invalid connection structure at index ${i}`);
        continue;
      }

      // Validate connection references existing nodes
      if (conn && typeof conn === 'object') {
        const connObj = conn as Record<string, unknown>;
        const fromId = typeof connObj.from === 'string' ? connObj.from : '';
        const toId = typeof connObj.to === 'string' ? connObj.to : '';
        if (!nodeIds.has(fromId) || !nodeIds.has(toId)) {
          errors.push(`Connection ${i} references non-existent nodes`);
        }
      }
    }
  }

  /**
   * Check if node structure is valid
   */
  private static isValidNode(node: unknown): node is Record<string, unknown> {
    if (!node || typeof node !== 'object') return false;
    const nodeObj = node as Record<string, unknown>;
    return (
      typeof nodeObj.id === 'string' &&
      typeof nodeObj.type === 'string' &&
      typeof nodeObj.label === 'string' &&
      typeof nodeObj.x === 'number' &&
      typeof nodeObj.y === 'number' &&
      (nodeObj.config === undefined || nodeObj.config === null || typeof nodeObj.config === 'object')
    );
  }

  /**
   * Check if connection structure is valid
   */
  private static isValidConnection(conn: unknown): conn is Record<string, unknown> {
    if (!conn || typeof conn !== 'object') return false;
    const connObj = conn as Record<string, unknown>;
    return (
      typeof connObj.id === 'string' &&
      typeof connObj.from === 'string' &&
      typeof connObj.to === 'string'
    );
  }

  /**
   * Sanitize AI response to ensure safe values
   */
  private static sanitizeAIResponse(response: unknown): Record<string, unknown> {
    if (!response || typeof response !== 'object') {
      return { nodes: [], connections: [] };
    }

    const responseObj = response as Record<string, unknown>;
    const nodes = Array.isArray(responseObj.nodes) ? responseObj.nodes : [];
    const connections = Array.isArray(responseObj.connections) ? responseObj.connections : [];

    return {
      nodes: nodes.map((node: unknown) => {
        const nodeObj = node && typeof node === 'object' ? node as Record<string, unknown> : {};
        return {
          ...nodeObj,
          id: this.sanitizeString(typeof nodeObj.id === 'string' ? nodeObj.id : ''),
          label: this.sanitizeString(typeof nodeObj.label === 'string' ? nodeObj.label : ''),
          type: this.sanitizeString(typeof nodeObj.type === 'string' ? nodeObj.type : ''),
          x: this.clamp(typeof nodeObj.x === 'number' ? nodeObj.x : 0, 0, 2000),
          y: this.clamp(typeof nodeObj.y === 'number' ? nodeObj.y : 0, 0, 2000),
          config: this.sanitizeConfig(nodeObj.config),
        };
      }),
      connections: connections.map((conn: unknown) => {
        const connObj = conn && typeof conn === 'object' ? conn as Record<string, unknown> : {};
        return {
          ...connObj,
          id: this.sanitizeString(typeof connObj.id === 'string' ? connObj.id : ''),
          from: this.sanitizeString(typeof connObj.from === 'string' ? connObj.from : ''),
          to: this.sanitizeString(typeof connObj.to === 'string' ? connObj.to : ''),
          label: connObj.label && typeof connObj.label === 'string' ? this.sanitizeString(connObj.label) : undefined,
        };
      }),
    };
  }

  /**
   * Sanitize string values
   */
  private static sanitizeString(value: string): string {

    return value.slice(0, 200).replace(/[<>\"'`]/g, '');
  }

  /**
   * Sanitize config object
   */
  private static sanitizeConfig(config: unknown): Record<string, unknown> {
    if (!config || typeof config !== 'object') return {};

    const sanitized: Record<string, unknown> = {};
    const configObj = config as Record<string, unknown>;
    for (const key of Object.keys(configObj)) {
      const value = configObj[key];
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

