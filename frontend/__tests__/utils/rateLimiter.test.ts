/**
 * @jest-environment jsdom
 */

import { TokenBucket, globalRateLimiter } from "../../src/utils/rateLimiter";

describe("rateLimiter", () => {
  describe("TokenBucket constructor", () => {
    it("should create token bucket with capacity and refill rate", () => {
      const bucket = new TokenBucket(10, 2);
      expect(bucket).toBeInstanceOf(TokenBucket);
    });

    it("should initialize with full capacity", () => {
      const bucket = new TokenBucket(5, 1);
      expect(bucket.getTokensRemaining()).toBe(5);
    });

    it("should accept different configurations", () => {
      expect(() => new TokenBucket(100, 10)).not.toThrow();
      expect(() => new TokenBucket(1, 0.5)).not.toThrow();
      expect(() => new TokenBucket(50, 5)).not.toThrow();
    });
  });

  describe("tryConsume", () => {
    it("should consume tokens successfully when available", () => {
      const bucket = new TokenBucket(10, 2);
      expect(bucket.tryConsume(1)).toBe(true);
      expect(bucket.getTokensRemaining()).toBe(9);
    });

    it("should fail when insufficient tokens", () => {
      const bucket = new TokenBucket(2, 1);
      bucket.tryConsume(1);
      bucket.tryConsume(1);
      expect(bucket.tryConsume(1)).toBe(false);
    });

    it("should consume multiple tokens", () => {
      const bucket = new TokenBucket(10, 2);
      expect(bucket.tryConsume(5)).toBe(true);
      expect(bucket.getTokensRemaining()).toBe(5);
    });

    it("should default to consuming 1 token", () => {
      const bucket = new TokenBucket(10, 2);
      bucket.tryConsume();
      expect(bucket.getTokensRemaining()).toBe(9);
    });

    it("should fail when consuming more than capacity", () => {
      const bucket = new TokenBucket(5, 1);
      expect(bucket.tryConsume(10)).toBe(false);
      expect(bucket.getTokensRemaining()).toBe(5);
    });

    it("should handle zero cost consumption", () => {
      const bucket = new TokenBucket(10, 2);
      expect(bucket.tryConsume(0)).toBe(true);
      expect(bucket.getTokensRemaining()).toBe(10);
    });

    it("should handle fractional costs", () => {
      const bucket = new TokenBucket(10, 2);
      expect(bucket.tryConsume(0.5)).toBe(true);
      expect(bucket.getTokensRemaining()).toBeLessThanOrEqual(10);
    });
  });

  describe("token refilling", () => {
    it("should refill tokens over time", async () => {
      const bucket = new TokenBucket(10, 10); // 10 tokens per second
      bucket.tryConsume(5); // Use 5 tokens

      await new Promise((resolve) => setTimeout(resolve, 600)); // Wait 0.6 seconds

      // Should have refilled ~6 tokens (5 + 6 = 11, capped at 10)
      expect(bucket.getTokensRemaining()).toBeGreaterThan(5);
    });

    it("should not exceed capacity when refilling", async () => {
      const bucket = new TokenBucket(5, 10);

      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second

      expect(bucket.getTokensRemaining()).toBeLessThanOrEqual(5);
    });

    it("should refill at correct rate", async () => {
      const bucket = new TokenBucket(100, 5); // 5 tokens per second
      bucket.tryConsume(50); // Use half

      const before = bucket.getTokensRemaining();
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
      const after = bucket.getTokensRemaining();

      // Should have gained approximately 5 tokens
      expect(after - before).toBeGreaterThan(3);
      expect(after - before).toBeLessThan(7);
    });

    it("should handle rapid refill rates", async () => {
      const bucket = new TokenBucket(10, 100); // 100 tokens per second
      bucket.tryConsume(10);

      await new Promise((resolve) => setTimeout(resolve, 150)); // Wait 0.15 seconds

      // Should have fully refilled
      expect(bucket.getTokensRemaining()).toBeGreaterThan(8);
    });

    it("should handle slow refill rates", async () => {
      const bucket = new TokenBucket(10, 0.5); // 0.5 tokens per second
      bucket.tryConsume(5);

      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second

      const remaining = bucket.getTokensRemaining();
      expect(remaining).toBeGreaterThan(5);
      expect(remaining).toBeLessThan(7);
    });
  });

  describe("getTokensRemaining", () => {
    it("should return initial capacity", () => {
      const bucket = new TokenBucket(10, 2);
      expect(bucket.getTokensRemaining()).toBe(10);
    });

    it("should return remaining after consumption", () => {
      const bucket = new TokenBucket(10, 2);
      bucket.tryConsume(3);
      expect(bucket.getTokensRemaining()).toBe(7);
    });

    it("should return 0 when depleted", () => {
      const bucket = new TokenBucket(5, 1);
      bucket.tryConsume(5);
      expect(bucket.getTokensRemaining()).toBe(0);
    });

    it("should reflect refilled tokens", async () => {
      const bucket = new TokenBucket(10, 10);
      bucket.tryConsume(5);

      await new Promise((resolve) => setTimeout(resolve, 500));

      expect(bucket.getTokensRemaining()).toBeGreaterThan(5);
    });

    it("should return integer values", () => {
      const bucket = new TokenBucket(10, 2);
      bucket.tryConsume(0.5);
      const remaining = bucket.getTokensRemaining();
      expect(Number.isInteger(remaining)).toBe(true);
    });
  });

  describe("burst handling", () => {
    it("should allow burst up to capacity", () => {
      const bucket = new TokenBucket(10, 1);

      for (let i = 0; i < 10; i++) {
        expect(bucket.tryConsume(1)).toBe(true);
      }
      expect(bucket.tryConsume(1)).toBe(false);
    });

    it("should handle rapid consecutive requests", () => {
      const bucket = new TokenBucket(5, 1);
      const results = [];

      for (let i = 0; i < 10; i++) {
        results.push(bucket.tryConsume(1));
      }

      const successes = results.filter((r) => r).length;
      expect(successes).toBe(5);
    });

    it("should recover from burst", async () => {
      const bucket = new TokenBucket(5, 5);

      // Consume all tokens
      for (let i = 0; i < 5; i++) {
        bucket.tryConsume(1);
      }
      expect(bucket.tryConsume(1)).toBe(false);

      // Wait for refill
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // Should be able to consume again
      expect(bucket.tryConsume(1)).toBe(true);
    });
  });

  describe("globalRateLimiter", () => {
    it("should be exported and configured", () => {
      expect(globalRateLimiter).toBeInstanceOf(TokenBucket);
    });

    it("should have correct configuration", () => {
      const tokens = globalRateLimiter.getTokensRemaining();
      expect(tokens).toBeGreaterThan(0);
      expect(tokens).toBeLessThanOrEqual(10);
    });

    it("should be usable", () => {
      expect(globalRateLimiter.tryConsume(1)).toBeDefined();
    });
  });

  describe("edge cases", () => {
    it("should handle very small capacity", () => {
      const bucket = new TokenBucket(1, 1);
      expect(bucket.tryConsume(1)).toBe(true);
      expect(bucket.tryConsume(1)).toBe(false);
    });

    it("should handle very large capacity", () => {
      const bucket = new TokenBucket(10000, 100);
      expect(bucket.getTokensRemaining()).toBe(10000);
    });

    it("should handle fractional refill rates", () => {
      const bucket = new TokenBucket(10, 0.1);
      expect(bucket).toBeDefined();
    });

    it("should handle zero initial state correctly", () => {
      const bucket = new TokenBucket(0, 1);
      expect(bucket.tryConsume(1)).toBe(false);
    });

    it("should handle consuming exactly the remaining tokens", () => {
      const bucket = new TokenBucket(5, 1);
      expect(bucket.tryConsume(5)).toBe(true);
      expect(bucket.getTokensRemaining()).toBe(0);
      expect(bucket.tryConsume(1)).toBe(false);
    });
  });

  describe("rate limiting scenarios", () => {
    it("should limit API calls per second", () => {
      const bucket = new TokenBucket(10, 2); // 2 calls per second sustained

      // Burst of 10 calls should succeed
      for (let i = 0; i < 10; i++) {
        expect(bucket.tryConsume(1)).toBe(true);
      }

      // 11th call should fail
      expect(bucket.tryConsume(1)).toBe(false);
    });

    it("should allow sustained rate after initial burst", async () => {
      const bucket = new TokenBucket(5, 2); // 2 per second

      // Use burst
      for (let i = 0; i < 5; i++) {
        bucket.tryConsume(1);
      }

      // Wait and try again
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Should be able to make ~3 more calls
      expect(bucket.tryConsume(1)).toBe(true);
      expect(bucket.tryConsume(1)).toBe(true);
    });

    it("should handle bursty traffic patterns", async () => {
      const bucket = new TokenBucket(10, 5);

      // First burst
      for (let i = 0; i < 5; i++) {
        bucket.tryConsume(1);
      }

      await new Promise((resolve) => setTimeout(resolve, 500));

      // Second burst
      for (let i = 0; i < 3; i++) {
        expect(bucket.tryConsume(1)).toBe(true);
      }
    });
  });

  describe("concurrent access patterns", () => {
    it("should handle multiple consumers", () => {
      const bucket = new TokenBucket(10, 1);

      const consumer1 = bucket.tryConsume(3);
      const consumer2 = bucket.tryConsume(3);
      const consumer3 = bucket.tryConsume(3);

      expect([consumer1, consumer2, consumer3].filter((r) => r).length).toBe(3);
      expect(bucket.tryConsume(3)).toBe(false);
    });

    it("should be fair in token distribution", () => {
      const bucket = new TokenBucket(10, 1);
      const results = [];

      for (let i = 0; i < 20; i++) {
        results.push(bucket.tryConsume(1));
      }

      const successes = results.filter((r) => r).length;
      expect(successes).toBe(10);
    });
  });

  describe("performance", () => {
    it("should handle many consume operations quickly", () => {
      const bucket = new TokenBucket(1000, 100);

      const start = Date.now();
      for (let i = 0; i < 1000; i++) {
        bucket.tryConsume(1);
      }
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100);
    });

    it("should check remaining tokens quickly", () => {
      const bucket = new TokenBucket(1000, 100);

      const start = Date.now();
      for (let i = 0; i < 1000; i++) {
        bucket.getTokensRemaining();
      }
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(50);
    });
  });
});
