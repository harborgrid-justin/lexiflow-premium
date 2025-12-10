export class TokenBucket {
    private tokens: number;
    private lastRefill: number;
    private readonly capacity: number;
    private readonly refillRate: number; // Tokens per second
  
    constructor(capacity: number, refillRate: number) {
      this.capacity = capacity;
      this.refillRate = refillRate;
      this.tokens = capacity;
      this.lastRefill = Date.now();
    }
  
    private refill() {
      const now = Date.now();
      const elapsed = (now - this.lastRefill) / 1000;
      const newTokens = elapsed * this.refillRate;
      
      if (newTokens > 0) {
        this.tokens = Math.min(this.capacity, this.tokens + newTokens);
        this.lastRefill = now;
      }
    }
  
    tryConsume(cost: number = 1): boolean {
      this.refill();
      if (this.tokens >= cost) {
        this.tokens -= cost;
        return true;
      }
      return false;
    }

    getTokensRemaining(): number {
        this.refill();
        return Math.floor(this.tokens);
    }
}

// Global Limiter: 10 requests burst, refilling 2 per second
export const globalRateLimiter = new TokenBucket(10, 2);