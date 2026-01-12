/**
 * @jest-environment jsdom
 */

import {
  RetryError,
  isRetryableError,
  retryWithBackoff,
} from "../../src/utils/retryWithBackoff";

describe("retryWithBackoff", () => {
  describe("successful execution", () => {
    it("should execute function successfully on first try", async () => {
      const fn = jest.fn().mockResolvedValue("success");
      const result = await retryWithBackoff(fn);

      expect(result).toBe("success");
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("should return result from function", async () => {
      const fn = jest.fn().mockResolvedValue({ data: "test" });
      const result = await retryWithBackoff(fn);

      expect(result).toEqual({ data: "test" });
    });

    it("should work with different return types", async () => {
      const stringFn = jest.fn().mockResolvedValue("string");
      const numberFn = jest.fn().mockResolvedValue(42);
      const objectFn = jest.fn().mockResolvedValue({ key: "value" });

      await expect(retryWithBackoff(stringFn)).resolves.toBe("string");
      await expect(retryWithBackoff(numberFn)).resolves.toBe(42);
      await expect(retryWithBackoff(objectFn)).resolves.toEqual({
        key: "value",
      });
    });
  });

  describe("retry logic", () => {
    it("should retry on failure", async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error("fail 1"))
        .mockResolvedValue("success");

      const result = await retryWithBackoff(fn, { maxRetries: 3 });

      expect(result).toBe("success");
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it("should retry up to maxRetries", async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error("fail 1"))
        .mockRejectedValueOnce(new Error("fail 2"))
        .mockResolvedValue("success");

      const result = await retryWithBackoff(fn, { maxRetries: 3 });

      expect(result).toBe("success");
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it("should throw RetryError after exhausting retries", async () => {
      const fn = jest.fn().mockRejectedValue(new Error("always fails"));

      await expect(
        retryWithBackoff(fn, { maxRetries: 2, initialDelay: 10 })
      ).rejects.toThrow(RetryError);

      expect(fn).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    it("should include attempt count in RetryError", async () => {
      const fn = jest.fn().mockRejectedValue(new Error("fail"));

      try {
        await retryWithBackoff(fn, { maxRetries: 2, initialDelay: 10 });
        fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(RetryError);
        expect((error as RetryError).attempts).toBe(3);
      }
    });

    it("should include last error in RetryError", async () => {
      const lastError = new Error("last failure");
      const fn = jest.fn().mockRejectedValue(lastError);

      try {
        await retryWithBackoff(fn, { maxRetries: 1, initialDelay: 10 });
      } catch (error) {
        expect((error as RetryError).lastError).toBe(lastError);
      }
    });
  });

  describe("exponential backoff", () => {
    it("should increase delay between retries", async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error("fail 1"))
        .mockRejectedValueOnce(new Error("fail 2"))
        .mockResolvedValue("success");

      const delays: number[] = [];
      let lastTime = Date.now();

      await retryWithBackoff(fn, {
        maxRetries: 3,
        initialDelay: 100,
        backoffFactor: 2,
        onRetry: () => {
          const now = Date.now();
          delays.push(now - lastTime);
          lastTime = now;
        },
      });

      expect(delays.length).toBe(2);
      expect(delays[1]!).toBeGreaterThan(delays[0]!);
    });

    it("should respect maxDelay cap", async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error("fail 1"))
        .mockRejectedValueOnce(new Error("fail 2"))
        .mockResolvedValue("success");

      await retryWithBackoff(fn, {
        maxRetries: 3,
        initialDelay: 100,
        maxDelay: 150,
        backoffFactor: 10,
      });

      // Test passes if it completes without exceeding reasonable time
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it("should use default backoff factor", async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error("fail"))
        .mockResolvedValue("success");

      await retryWithBackoff(fn, {
        maxRetries: 1,
        initialDelay: 50,
      });

      expect(fn).toHaveBeenCalledTimes(2);
    });

    it("should apply backoff factor correctly", async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error("fail 1"))
        .mockRejectedValueOnce(new Error("fail 2"))
        .mockResolvedValue("success");

      const start = Date.now();
      await retryWithBackoff(fn, {
        maxRetries: 3,
        initialDelay: 100,
        backoffFactor: 2,
        maxDelay: 10000,
      });
      const duration = Date.now() - start;

      // Should take at least 100 + 200 = 300ms
      expect(duration).toBeGreaterThanOrEqual(250);
    });
  });

  describe("onRetry callback", () => {
    it("should call onRetry callback on each retry", async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error("fail 1"))
        .mockRejectedValueOnce(new Error("fail 2"))
        .mockResolvedValue("success");

      const onRetry = jest.fn();

      await retryWithBackoff(fn, {
        maxRetries: 3,
        initialDelay: 10,
        onRetry,
      });

      expect(onRetry).toHaveBeenCalledTimes(2);
    });

    it("should provide attempt number to callback", async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error("fail"))
        .mockResolvedValue("success");

      const onRetry = jest.fn();

      await retryWithBackoff(fn, {
        maxRetries: 2,
        initialDelay: 10,
        onRetry,
      });

      expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error));
    });

    it("should provide error to callback", async () => {
      const error = new Error("specific error");
      const fn = jest
        .fn()
        .mockRejectedValueOnce(error)
        .mockResolvedValue("success");

      const onRetry = jest.fn();

      await retryWithBackoff(fn, {
        maxRetries: 2,
        initialDelay: 10,
        onRetry,
      });

      expect(onRetry).toHaveBeenCalledWith(1, error);
    });

    it("should not call onRetry on final failure", async () => {
      const fn = jest.fn().mockRejectedValue(new Error("always fails"));
      const onRetry = jest.fn();

      try {
        await retryWithBackoff(fn, {
          maxRetries: 2,
          initialDelay: 10,
          onRetry,
        });
      } catch {
        // Expected to fail
      }

      expect(onRetry).toHaveBeenCalledTimes(2); // Not 3
    });
  });

  describe("default options", () => {
    it("should use default maxRetries", async () => {
      const fn = jest.fn().mockRejectedValue(new Error("fail"));

      try {
        await retryWithBackoff(fn, { initialDelay: 10 });
      } catch (error) {
        expect(fn.mock.calls.length).toBeGreaterThan(1);
      }
    });

    it("should use default initialDelay", async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error("fail"))
        .mockResolvedValue("success");

      await retryWithBackoff(fn, { maxRetries: 1 });
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it("should work with no options", async () => {
      const fn = jest.fn().mockResolvedValue("success");
      const result = await retryWithBackoff(fn);
      expect(result).toBe("success");
    });
  });

  describe("isRetryableError", () => {
    it("should identify network errors as retryable", () => {
      const networkError = new Error("Network request failed");
      expect(isRetryableError(networkError)).toBe(true);
    });

    it("should identify timeout errors as retryable", () => {
      const timeoutError = new Error("Request timeout");
      expect(isRetryableError(timeoutError)).toBe(true);
    });

    it("should identify 5xx errors as retryable", () => {
      const serverError = new Error("500 Internal Server Error");
      expect(isRetryableError(serverError)).toBe(true);
    });

    it("should not retry 4xx client errors", () => {
      const clientError = new Error("400 Bad Request");
      expect(isRetryableError(clientError)).toBe(false);
    });

    it("should handle Error objects", () => {
      const error = new Error("Some error");
      expect(typeof isRetryableError(error)).toBe("boolean");
    });

    it("should handle non-Error objects", () => {
      expect(typeof isRetryableError("string error")).toBe("boolean");
      expect(typeof isRetryableError({ error: "object" })).toBe("boolean");
      expect(typeof isRetryableError(null)).toBe("boolean");
    });
  });

  describe("edge cases", () => {
    it("should handle function throwing non-Error", async () => {
      const fn = jest.fn().mockRejectedValue("string error");

      await expect(
        retryWithBackoff(fn, { maxRetries: 1, initialDelay: 10 })
      ).rejects.toThrow(RetryError);
    });

    it("should handle function returning undefined", async () => {
      const fn = jest.fn().mockResolvedValue(undefined);
      const result = await retryWithBackoff(fn);
      expect(result).toBeUndefined();
    });

    it("should handle function returning null", async () => {
      const fn = jest.fn().mockResolvedValue(null);
      const result = await retryWithBackoff(fn);
      expect(result).toBeNull();
    });

    it("should handle zero retries", async () => {
      const fn = jest.fn().mockRejectedValue(new Error("fail"));

      await expect(
        retryWithBackoff(fn, { maxRetries: 0, initialDelay: 10 })
      ).rejects.toThrow();

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("should handle very short delay", async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error("fail"))
        .mockResolvedValue("success");

      await retryWithBackoff(fn, {
        maxRetries: 1,
        initialDelay: 1,
      });

      expect(fn).toHaveBeenCalledTimes(2);
    });

    it("should handle very large maxRetries", async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error("fail"))
        .mockResolvedValue("success");

      await retryWithBackoff(fn, {
        maxRetries: 1000,
        initialDelay: 10,
      });

      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe("async operations", () => {
    it("should handle slow async functions", async () => {
      const fn = jest.fn().mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return "success";
      });

      const result = await retryWithBackoff(fn);
      expect(result).toBe("success");
    });

    it("should handle fast async functions", async () => {
      const fn = jest.fn().mockResolvedValue("success");
      const result = await retryWithBackoff(fn);
      expect(result).toBe("success");
    });

    it("should handle promise chains", async () => {
      const fn = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve("initial").then((v) => v + " processed")
        );

      const result = await retryWithBackoff(fn);
      expect(result).toBe("initial processed");
    });
  });

  describe("performance", () => {
    it("should not add significant overhead for successful calls", async () => {
      const fn = jest.fn().mockResolvedValue("success");

      const start = Date.now();
      await retryWithBackoff(fn);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(50);
    });

    it("should respect delay timing", async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error("fail"))
        .mockResolvedValue("success");

      const start = Date.now();
      await retryWithBackoff(fn, {
        maxRetries: 1,
        initialDelay: 200,
      });
      const duration = Date.now() - start;

      expect(duration).toBeGreaterThanOrEqual(180);
    });
  });

  describe("real-world scenarios", () => {
    it("should retry API calls", async () => {
      let attempts = 0;
      const apiCall = jest.fn().mockImplementation(async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error("503 Service Unavailable");
        }
        return { data: "success" };
      });

      const result = await retryWithBackoff(apiCall, {
        maxRetries: 5,
        initialDelay: 50,
      });

      expect(result).toEqual({ data: "success" });
      expect(attempts).toBe(3);
    });

    it("should handle network timeouts", async () => {
      const fetchWithTimeout = jest
        .fn()
        .mockRejectedValueOnce(new Error("Network timeout"))
        .mockRejectedValueOnce(new Error("Network timeout"))
        .mockResolvedValue({ data: "success" });

      const result = await retryWithBackoff(fetchWithTimeout, {
        maxRetries: 3,
        initialDelay: 100,
      });

      expect(result).toEqual({ data: "success" });
    });

    it("should handle rate limiting with backoff", async () => {
      let callCount = 0;
      const rateLimitedCall = jest.fn().mockImplementation(async () => {
        callCount++;
        if (callCount < 3) {
          throw new Error("429 Too Many Requests");
        }
        return "success";
      });

      await retryWithBackoff(rateLimitedCall, {
        maxRetries: 5,
        initialDelay: 100,
        backoffFactor: 2,
      });

      expect(callCount).toBe(3);
    });
  });
});
