/**
 * @jest-environment jsdom
 * @module tests/services/infrastructure/apiClient
 * @description Tests for API client - HTTP request handling
 */

import { apiClient } from "@/services/infrastructure/apiClient";

// Mock fetch
global.fetch = jest.fn();

describe("ApiClient", () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET Requests", () => {
    it("should make GET request", async () => {
      const mockData = { id: 1, name: "Test" };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockData,
        headers: new Headers(),
      });

      const result = await apiClient.get("/api/test");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/test"),
        expect.objectContaining({
          method: "GET",
        })
      );
      expect(result).toEqual(mockData);
    });

    it("should handle query parameters", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({}),
        headers: new Headers(),
      });

      await apiClient.get("/api/search", { params: { q: "test", page: 1 } });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("q=test"),
        expect.any(Object)
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("page=1"),
        expect.any(Object)
      );
    });

    it("should handle array query parameters", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({}),
        headers: new Headers(),
      });

      await apiClient.get("/api/items", { params: { ids: [1, 2, 3] } });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/ids=1.*ids=2.*ids=3/),
        expect.any(Object)
      );
    });
  });

  describe("POST Requests", () => {
    it("should make POST request with JSON body", async () => {
      const postData = { name: "New Item", value: 42 };
      const responseData = { id: 1, ...postData };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => responseData,
        headers: new Headers(),
      });

      const result = await apiClient.post("/api/items", postData);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/items"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(postData),
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        })
      );
      expect(result).toEqual(responseData);
    });

    it("should handle FormData", async () => {
      const formData = new FormData();
      formData.append("file", new Blob(["test"]), "test.txt");

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
        headers: new Headers(),
      });

      await apiClient.post("/api/upload", formData);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: "POST",
          body: formData,
        })
      );
    });
  });

  describe("PUT Requests", () => {
    it("should make PUT request", async () => {
      const updateData = { id: 1, name: "Updated" };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => updateData,
        headers: new Headers(),
      });

      const result = await apiClient.put("/api/items/1", updateData);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/items/1"),
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify(updateData),
        })
      );
      expect(result).toEqual(updateData);
    });
  });

  describe("PATCH Requests", () => {
    it("should make PATCH request", async () => {
      const patchData = { name: "Patched" };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ id: 1, ...patchData }),
        headers: new Headers(),
      });

      await apiClient.patch("/api/items/1", patchData);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: "PATCH",
        })
      );
    });
  });

  describe("DELETE Requests", () => {
    it("should make DELETE request", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
        headers: new Headers(),
      });

      await apiClient.delete("/api/items/1");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/items/1"),
        expect.objectContaining({
          method: "DELETE",
        })
      );
    });
  });

  describe("Headers Management", () => {
    it("should include default headers", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({}),
        headers: new Headers(),
      });

      await apiClient.get("/api/test");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        })
      );
    });

    it("should merge custom headers", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({}),
        headers: new Headers(),
      });

      await apiClient.get("/api/test", {
        headers: {
          "X-Custom-Header": "value",
        },
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            "X-Custom-Header": "value",
          }),
        })
      );
    });

    it("should include authorization token", async () => {
      apiClient.setAuthToken("Bearer token123");

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({}),
        headers: new Headers(),
      });

      await apiClient.get("/api/protected");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer token123",
          }),
        })
      );

      apiClient.clearAuthToken();
    });
  });

  describe("Error Handling", () => {
    it("should throw on HTTP error status", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
        json: async () => ({ error: "Resource not found" }),
        headers: new Headers(),
      });

      await expect(apiClient.get("/api/missing")).rejects.toThrow();
    });

    it("should throw on network error", async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

      await expect(apiClient.get("/api/test")).rejects.toThrow("Network error");
    });

    it("should handle JSON parse errors", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => {
          throw new Error("Invalid JSON");
        },
        text: async () => "Not JSON",
        headers: new Headers(),
      });

      await expect(apiClient.get("/api/invalid")).rejects.toThrow();
    });

    it("should include error details", async () => {
      const errorResponse = {
        message: "Validation failed",
        errors: { name: "Required" },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        json: async () => errorResponse,
        headers: new Headers(),
      });

      try {
        await apiClient.post("/api/items", {});
        fail("Should have thrown");
      } catch (error: any) {
        expect(error.response).toBeDefined();
        expect(error.status).toBe(400);
      }
    });
  });

  describe("Request Interceptors", () => {
    it("should apply request interceptors", async () => {
      const interceptor = jest.fn((config) => ({
        ...config,
        headers: {
          ...config.headers,
          "X-Intercepted": "true",
        },
      }));

      apiClient.addRequestInterceptor(interceptor);

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({}),
        headers: new Headers(),
      });

      await apiClient.get("/api/test");

      expect(interceptor).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            "X-Intercepted": "true",
          }),
        })
      );

      apiClient.removeRequestInterceptor(interceptor);
    });

    it("should support multiple interceptors", async () => {
      const interceptor1 = jest.fn((config) => ({
        ...config,
        headers: { ...config.headers, "X-1": "value1" },
      }));

      const interceptor2 = jest.fn((config) => ({
        ...config,
        headers: { ...config.headers, "X-2": "value2" },
      }));

      apiClient.addRequestInterceptor(interceptor1);
      apiClient.addRequestInterceptor(interceptor2);

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({}),
        headers: new Headers(),
      });

      await apiClient.get("/api/test");

      expect(interceptor1).toHaveBeenCalled();
      expect(interceptor2).toHaveBeenCalled();

      apiClient.removeRequestInterceptor(interceptor1);
      apiClient.removeRequestInterceptor(interceptor2);
    });
  });

  describe("Response Interceptors", () => {
    it("should apply response interceptors", async () => {
      const responseData = { id: 1, name: "Test" };
      const interceptor = jest.fn((response) => ({
        ...response,
        data: {
          ...response.data,
          intercepted: true,
        },
      }));

      apiClient.addResponseInterceptor(interceptor);

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => responseData,
        headers: new Headers(),
      });

      const result = await apiClient.get("/api/test");

      expect(interceptor).toHaveBeenCalled();
      expect(result).toHaveProperty("intercepted", true);

      apiClient.removeResponseInterceptor(interceptor);
    });
  });

  describe("Timeout", () => {
    it("should timeout long requests", async () => {
      jest.useFakeTimers();

      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 10000))
      );

      const promise = apiClient.get("/api/slow", { timeout: 1000 });

      jest.advanceTimersByTime(1001);

      await expect(promise).rejects.toThrow("timeout");

      jest.useRealTimers();
    });

    it("should not timeout fast requests", async () => {
      jest.useFakeTimers();

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: "fast" }),
        headers: new Headers(),
      });

      const promise = apiClient.get("/api/fast", { timeout: 5000 });

      jest.advanceTimersByTime(100);

      const result = await promise;

      expect(result).toEqual({ data: "fast" });

      jest.useRealTimers();
    });
  });

  describe("Retry Logic", () => {
    it("should retry failed requests", async () => {
      let attempts = 0;

      (global.fetch as jest.Mock).mockImplementation(() => {
        attempts++;
        if (attempts < 3) {
          return Promise.reject(new Error("Network error"));
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true }),
          headers: new Headers(),
        });
      });

      const result = await apiClient.get("/api/flaky", {
        retry: 3,
        retryDelay: 100,
      });

      expect(attempts).toBe(3);
      expect(result).toEqual({ success: true });
    });

    it("should respect max retry attempts", async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error("Always fails"));

      await expect(
        apiClient.get("/api/broken", { retry: 2 })
      ).rejects.toThrow();

      expect(global.fetch).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });
  });

  describe("Abort Controller", () => {
    it("should support request cancellation", async () => {
      const abortController = new AbortController();

      (global.fetch as jest.Mock).mockImplementation(
        () =>
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Aborted")), 1000);
          })
      );

      const promise = apiClient.get("/api/slow", {
        signal: abortController.signal,
      });

      abortController.abort();

      await expect(promise).rejects.toThrow();
    });
  });

  describe("Base URL", () => {
    it("should use base URL", async () => {
      apiClient.setBaseURL("https://api.example.com");

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({}),
        headers: new Headers(),
      });

      await apiClient.get("/users");

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.example.com/users",
        expect.any(Object)
      );

      apiClient.setBaseURL("");
    });

    it("should handle absolute URLs", async () => {
      apiClient.setBaseURL("https://api.example.com");

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({}),
        headers: new Headers(),
      });

      await apiClient.get("https://other-api.com/data");

      expect(global.fetch).toHaveBeenCalledWith(
        "https://other-api.com/data",
        expect.any(Object)
      );

      apiClient.setBaseURL("");
    });
  });
});
