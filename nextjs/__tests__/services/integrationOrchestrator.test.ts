/**
 * Integration Orchestrator Tests
 * Tests event publishing and handler execution
 */

import { IntegrationOrchestrator } from "@/services/integration/integrationOrchestrator";
import { SystemEventType } from "@/types/enums";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

describe("IntegrationOrchestrator", () => {
  beforeEach(() => {
    // Clear all event handlers before each test
    IntegrationOrchestrator["handlers"].clear();
  });

  describe("Event Publishing", () => {
    it("should publish event to registered handlers", async () => {
      const mockHandler = jest.fn();

      // Register handler
      IntegrationOrchestrator.subscribe(
        SystemEventType.CASE_CREATED,
        mockHandler
      );

      // Publish event
      const payload = { case: { id: "test-1", title: "Test Case" } };
      await IntegrationOrchestrator.publish(
        SystemEventType.CASE_CREATED,
        payload
      );

      // Verify handler was called
      expect(mockHandler).toHaveBeenCalledWith(payload);
    });

    it("should handle multiple handlers for same event", async () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      IntegrationOrchestrator.subscribe(
        SystemEventType.DOCUMENT_UPLOADED,
        handler1
      );
      IntegrationOrchestrator.subscribe(
        SystemEventType.DOCUMENT_UPLOADED,
        handler2
      );

      const payload = { documentId: "doc-1" };
      await IntegrationOrchestrator.publish(
        SystemEventType.DOCUMENT_UPLOADED,
        payload
      );

      expect(handler1).toHaveBeenCalledWith(payload);
      expect(handler2).toHaveBeenCalledWith(payload);
    });

    it("should not call unsubscribed handlers", async () => {
      const handler = jest.fn();

      IntegrationOrchestrator.subscribe(SystemEventType.CASE_CREATED, handler);
      IntegrationOrchestrator.unsubscribe(
        SystemEventType.CASE_CREATED,
        handler
      );

      await IntegrationOrchestrator.publish(SystemEventType.CASE_CREATED, {});

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("should continue publishing if handler throws error", async () => {
      const errorHandler = jest
        .fn()
        .mockRejectedValue(new Error("Handler error"));
      const successHandler = jest.fn();

      IntegrationOrchestrator.subscribe(
        SystemEventType.TASK_COMPLETED,
        errorHandler
      );
      IntegrationOrchestrator.subscribe(
        SystemEventType.TASK_COMPLETED,
        successHandler
      );

      const payload = { taskId: "task-1" };
      await IntegrationOrchestrator.publish(
        SystemEventType.TASK_COMPLETED,
        payload
      );

      // Both should be called despite error in first handler
      expect(errorHandler).toHaveBeenCalledWith(payload);
      expect(successHandler).toHaveBeenCalledWith(payload);
    });
  });

  describe("Event Types", () => {
    it("should support all system event types", () => {
      const eventTypes = Object.values(SystemEventType);

      expect(eventTypes).toContain("CASE_CREATED");
      expect(eventTypes).toContain("DOCUMENT_UPLOADED");
      expect(eventTypes).toContain("DOCKET_INGESTED");
      expect(eventTypes).toContain("TIME_LOGGED");
      expect(eventTypes.length).toBeGreaterThan(10);
    });
  });
});

describe("Event Handler Registry", () => {
  it("should have handler registry structure", () => {
    // Verify IntegrationOrchestrator has expected methods
    expect(typeof IntegrationOrchestrator.subscribe).toBe("function");
    expect(typeof IntegrationOrchestrator.unsubscribe).toBe("function");
    expect(typeof IntegrationOrchestrator.publish).toBe("function");
  });
});
