/**
 * @module utils/apiUtils
 * @category Utils - API
 * @description Enhanced API utilities with circuit breaker, semaphore concurrency control, token bucket
 * rate limiting, and exponential backoff with jitter. Provides withRetry wrapper for resilient fetch
 * operations, yieldToMain for non-blocking yielding, Semaphore for bulkhead pattern, and safeParseJSON
 * for robust JSON parsing with fallback.
 */

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Utils & Constants
import { apiCircuitBreaker } from './circuitBreaker';
import { globalRateLimiter } from './rateLimiter';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
// Non-blocking yield to main thread
export const yieldToMain = () => new Promise(resolve => setTimeout(resolve, 0));

// ============================================================================
// SEMAPHORE CLASS
// ============================================================================
export class Semaphore {
    private tasks: (() => void)[] = [];
    private count: number;
  
    constructor(public max: number) {
      this.count = max;
    }
  
    async acquire(): Promise<void> {
      if (this.count > 0) {
        this.count--;
        return;
      }
  
      return new Promise<void>(resolve => {
        this.tasks.push(resolve);
      });
    }
  
    release(): void {
      if (this.tasks.length > 0) {
        const next = this.tasks.shift();
        if (next) next();
      } else {
        this.count++;
      }
    }
}
  
const globalSemaphore = new Semaphore(5); // Max 5 concurrent requests

/**
 * Enhanced fetch with:
 * 1. Circuit Breaker
 * 2. Concurrency Semaphore
 * 3. Token Bucket Rate Limiting
 * 4. Exponential Backoff with Jitter
 */
export async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 500): Promise<T> {
  // 1. Rate Limiting check
  if (!globalRateLimiter.tryConsume()) {
      // If we are out of tokens, we wait a bit before even trying to acquire semaphore
      await new Promise(r => setTimeout(r, 1000));
      return withRetry(fn, retries, delay); 
  }

  // 2. Circuit Breaker check
  return apiCircuitBreaker.execute(async () => {
      try { 
          // 3. Semaphore (Bulkhead)
          await globalSemaphore.acquire();
          const result = await fn();
          return result;
      } 
      catch (error: unknown) {
        const status = (error as { status?: number }).status;
        
        // Don't retry 4xx errors (client fault), only 5xx or network
        if (retries === 0 || (status && status >= 400 && status < 500 && status !== 429)) {
            throw error;
        }

        // 4. Exponential Backoff with Jitter
        // jitter = random value between 0 and delay * 0.5
        const jitter = Math.random() * (delay * 0.5);
        const backoffTime = delay + jitter;

        console.warn(`[Retry] Attempt failed. Retrying in ${backoffTime.toFixed(0)}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
        
        // Release semaphore before recursing to avoid deadlock
        globalSemaphore.release(); 
        
        return withRetry(fn, retries - 1, delay * 2);
      } finally {
          globalSemaphore.release();
      }
  });
}

export function safeParseJSON<T>(text: string | undefined, fallback: T): T {
    if (!text) return fallback;
    try { 
        const cleanText = text.replace(/^```(json)?\s*|\s*```$/g, '').trim();
        return JSON.parse(cleanText); 
    } 
    catch (e) { 
        console.error("JSON Parse Error", e, "Raw text:", text);
        return fallback; 
    }
}
