/**
 * @jest-environment jsdom
 * @module tests/services/infrastructure/socketService
 * @description Tests for socketService - Socket.IO connection management
 */

import { socketService } from "@/services/infrastructure/socketService";
import type { Socket } from "socket.io-client";
import { URLS } from "@/config/ports.config";

// Centralized test URLs
const TEST_BACKEND_URL = URLS.backend();
const TEST_WS_URL = URLS.websocket();

// Mock socket.io-client
const mockSocket = {
  connected: false,
  id: "mock-socket-id",
  on: jest.fn(),
  once: jest.fn(),
  off: jest.fn(),
  emit: jest.fn(),
  connect: jest.fn(),
  disconnect: jest.fn(),
};

jest.mock("socket.io-client", () => ({
  io: jest.fn(() => mockSocket as unknown as Socket),
}));

describe("SocketService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSocket.connected = false;

    // Reset the mock functions
    mockSocket.on = jest.fn();
    mockSocket.once = jest.fn((event, handler) => {
      // Immediately trigger connect for tests
      if (event === "connect") {
        setTimeout(() => handler(), 0);
      }
    });
    mockSocket.off = jest.fn();
    mockSocket.emit = jest.fn();
    mockSocket.connect = jest.fn();
    mockSocket.disconnect = jest.fn();
  });

  afterEach(() => {
    socketService.disconnect();
  });

  describe("Connection Management", () => {
    it("should connect to Socket.IO server", async () => {
      mockSocket.connected = true;

      await socketService.connect({ url: "TEST_BACKEND_URL" });

      expect(mockSocket.once).toHaveBeenCalledWith(
        "connect",
        expect.any(Function)
      );
      expect(mockSocket.on).toHaveBeenCalled();
    });

    it("should not connect if already connected", async () => {
      mockSocket.connected = true;

      // First connection
      await socketService.connect({ url: "TEST_BACKEND_URL" });

      // Clear mocks to test second call
      jest.clearAllMocks();

      // Second connection attempt
      await socketService.connect({ url: "TEST_BACKEND_URL" });

      // Should not create new socket
      expect(mockSocket.once).not.toHaveBeenCalled();
    });

    it("should disconnect from server", async () => {
      mockSocket.connected = true;
      await socketService.connect({ url: "TEST_BACKEND_URL" });

      socketService.disconnect();

      expect(mockSocket.disconnect).toHaveBeenCalled();
    });

    it("should handle connection timeout", async () => {
      jest.useFakeTimers();

      mockSocket.once = jest.fn(); // Don't trigger connect event

      const connectPromise = socketService.connect({
        url: "TEST_BACKEND_URL",
      });

      jest.advanceTimersByTime(11000); // More than 10s timeout

      await expect(connectPromise).rejects.toThrow("Socket connection timeout");

      jest.useRealTimers();
    });
  });

  describe("Event Registration", () => {
    it("should register message handlers", async () => {
      const onNewMessage = jest.fn();

      await socketService.connect(
        { url: "TEST_BACKEND_URL" },
        { onNewMessage }
      );

      expect(mockSocket.on).toHaveBeenCalledWith(
        "message:new",
        expect.any(Function)
      );
    });

    it("should register presence handlers", async () => {
      const onPresenceUpdate = jest.fn();

      await socketService.connect(
        { url: "TEST_BACKEND_URL" },
        { onPresenceUpdate }
      );

      expect(mockSocket.on).toHaveBeenCalledWith(
        "presence:update",
        expect.any(Function)
      );
    });

    it("should register notification handlers", async () => {
      const onNewNotification = jest.fn();

      await socketService.connect(
        { url: "TEST_BACKEND_URL" },
        { onNewNotification }
      );

      expect(mockSocket.on).toHaveBeenCalledWith(
        "notification:new",
        expect.any(Function)
      );
    });
  });

  describe("Message Emission", () => {
    it("should emit messages when connected", async () => {
      mockSocket.connected = true;
      await socketService.connect({ url: "TEST_BACKEND_URL" });

      socketService.emitMessage("test-event", { data: "test" });

      expect(mockSocket.emit).toHaveBeenCalledWith("test-event", {
        data: "test",
      });
    });

    it("should emit typing indicators", async () => {
      mockSocket.connected = true;
      await socketService.connect({ url: "TEST_BACKEND_URL" });

      const indicator = {
        userId: "user-1",
        conversationId: "conv-1",
        isTyping: true,
      };

      socketService.emitTyping(indicator);

      expect(mockSocket.emit).toHaveBeenCalledWith("typing:start", indicator);
    });

    it("should mark messages as read", async () => {
      mockSocket.connected = true;
      await socketService.connect({ url: "TEST_BACKEND_URL" });

      socketService.markMessageRead("message-1", "user-1");

      expect(mockSocket.emit).toHaveBeenCalledWith("message:read", {
        messageId: "message-1",
        userId: "user-1",
      });
    });
  });

  expect(() => {
    socketService.on("event", handler);
  }).not.toThrow();
});

it("should preserve subscriptions across reconnections", async () => {
  const handler = jest.fn();
  socketService.on("event", handler);

  await socketService.connect("TEST_WS_URL");
  socketService.disconnect();
  await socketService.connect("TEST_WS_URL");

  const ws = (socketService as any).socket;
  ws.onmessage?.(
    new MessageEvent("message", {
      data: JSON.stringify({ type: "event", data: "test" }),
    })
  );

  expect(handler).toHaveBeenCalled();
});

it("should support wildcards for event matching", async () => {
  const handler = jest.fn();
  socketService.on("*", handler);

  await socketService.connect("TEST_WS_URL");

  describe("Connection State and Cleanup", () => {
    it("should track connection state correctly", async () => {
      mockSocket.connected = false;
      expect(socketService.isConnected()).toBe(false);

      mockSocket.connected = true;
      await socketService.connect({ url: "TEST_BACKEND_URL" });

      expect(socketService.isConnected()).toBe(true);
    });

    it("should clean up resources on disconnect", async () => {
      mockSocket.connected = true;
      await socketService.connect({ url: "TEST_BACKEND_URL" });

      socketService.disconnect();

      expect(mockSocket.disconnect).toHaveBeenCalled();
      expect(mockSocket.off).toHaveBeenCalled();
    });
  });

  describe("Presence Management", () => {
    it("should update user presence", async () => {
      mockSocket.connected = true;
      await socketService.connect({ url: "TEST_BACKEND_URL" });

      const presence = {
        userId: "user-1",
        status: "online" as const,
        lastSeen: new Date().toISOString(),
      };

      socketService.updatePresence(presence);

      expect(mockSocket.emit).toHaveBeenCalledWith("presence:update", presence);
    });

    it("should join conversation rooms", async () => {
      mockSocket.connected = true;
      await socketService.connect({ url: "TEST_BACKEND_URL" });

      socketService.joinConversation("conv-1");

      expect(mockSocket.emit).toHaveBeenCalledWith("room:join", {
        conversationId: "conv-1",
      });
    });

    it("should leave conversation rooms", async () => {
      mockSocket.connected = true;
      await socketService.connect({ url: "TEST_BACKEND_URL" });

      socketService.leaveConversation("conv-1");

      expect(mockSocket.emit).toHaveBeenCalledWith("room:leave", {
        conversationId: "conv-1",
      });
    });
  });
});
