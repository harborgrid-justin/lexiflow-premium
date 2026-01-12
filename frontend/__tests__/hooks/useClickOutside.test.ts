/**
 * @jest-environment jsdom
 * @module tests/hooks/useClickOutside
 * @description Tests for useClickOutside hook - detect clicks outside element
 */

import { useClickOutside } from "@/hooks/useClickOutside";
import { renderHook } from "@testing-library/react";
import { RefObject } from "react";

describe("useClickOutside", () => {
  let targetElement: HTMLDivElement;
  let outsideElement: HTMLDivElement;

  beforeEach(() => {
    targetElement = document.createElement("div");
    outsideElement = document.createElement("div");
    document.body.appendChild(targetElement);
    document.body.appendChild(outsideElement);
  });

  afterEach(() => {
    document.body.removeChild(targetElement);
    document.body.removeChild(outsideElement);
  });

  describe("Basic Functionality", () => {
    it("should call handler when clicking outside", () => {
      const handler = jest.fn();
      const ref: RefObject<HTMLDivElement> = { current: targetElement };

      renderHook(() => useClickOutside(ref, handler));

      outsideElement.click();

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("should not call handler when clicking inside", () => {
      const handler = jest.fn();
      const ref: RefObject<HTMLDivElement> = { current: targetElement };

      renderHook(() => useClickOutside(ref, handler));

      targetElement.click();

      expect(handler).not.toHaveBeenCalled();
    });

    it("should not call handler when ref is null", () => {
      const handler = jest.fn();
      const ref: RefObject<HTMLDivElement> = { current: null };

      renderHook(() => useClickOutside(ref, handler));

      outsideElement.click();

      expect(handler).not.toHaveBeenCalled();
    });

    it("should work with children elements", () => {
      const handler = jest.fn();
      const child = document.createElement("span");
      targetElement.appendChild(child);
      const ref: RefObject<HTMLDivElement> = { current: targetElement };

      renderHook(() => useClickOutside(ref, handler));

      child.click();

      expect(handler).not.toHaveBeenCalled();

      outsideElement.click();

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe("Mouse Events", () => {
    it("should handle mousedown events", () => {
      const handler = jest.fn();
      const ref: RefObject<HTMLDivElement> = { current: targetElement };

      renderHook(() => useClickOutside(ref, handler, { event: "mousedown" }));

      const mousedownEvent = new MouseEvent("mousedown", { bubbles: true });
      outsideElement.dispatchEvent(mousedownEvent);

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("should handle click events", () => {
      const handler = jest.fn();
      const ref: RefObject<HTMLDivElement> = { current: targetElement };

      renderHook(() => useClickOutside(ref, handler, { event: "click" }));

      const clickEvent = new MouseEvent("click", { bubbles: true });
      outsideElement.dispatchEvent(clickEvent);

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("should pass event to handler", () => {
      const handler = jest.fn();
      const ref: RefObject<HTMLDivElement> = { current: targetElement };

      renderHook(() => useClickOutside(ref, handler));

      const event = new MouseEvent("mousedown", { bubbles: true });
      outsideElement.dispatchEvent(event);

      expect(handler).toHaveBeenCalledWith(event);
    });
  });

  describe("Touch Events", () => {
    it("should handle touch events", () => {
      const handler = jest.fn();
      const ref: RefObject<HTMLDivElement> = { current: targetElement };

      renderHook(() => useClickOutside(ref, handler));

      const touchEvent = new TouchEvent("touchstart", {
        bubbles: true,
        touches: [] as any,
        targetTouches: [] as any,
        changedTouches: [] as any,
      });
      Object.defineProperty(touchEvent, "target", { value: outsideElement });
      document.dispatchEvent(touchEvent);

      expect(handler).toHaveBeenCalled();
    });

    it("should not trigger on inside touch", () => {
      const handler = jest.fn();
      const ref: RefObject<HTMLDivElement> = { current: targetElement };

      renderHook(() => useClickOutside(ref, handler));

      const touchEvent = new TouchEvent("touchstart", {
        bubbles: true,
        touches: [] as any,
        targetTouches: [] as any,
        changedTouches: [] as any,
      });
      Object.defineProperty(touchEvent, "target", { value: targetElement });
      document.dispatchEvent(touchEvent);

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe("Multiple Elements", () => {
    it("should handle multiple refs", () => {
      const handler = jest.fn();
      const element2 = document.createElement("div");
      document.body.appendChild(element2);

      const refs: RefObject<HTMLElement>[] = [
        { current: targetElement },
        { current: element2 },
      ];

      renderHook(() => refs.forEach((ref) => useClickOutside(ref, handler)));

      targetElement.click();
      expect(handler).not.toHaveBeenCalled();

      element2.click();
      // Handler called for targetElement
      expect(handler).toHaveBeenCalledTimes(1);

      outsideElement.click();
      // Handler called for both refs
      expect(handler).toHaveBeenCalledTimes(3);

      document.body.removeChild(element2);
    });
  });

  describe("Enabled/Disabled State", () => {
    it("should respect enabled flag", () => {
      const handler = jest.fn();
      const ref: RefObject<HTMLDivElement> = { current: targetElement };

      const { rerender } = renderHook(
        ({ enabled }) => useClickOutside(ref, handler, { enabled }),
        { initialProps: { enabled: false } }
      );

      outsideElement.click();
      expect(handler).not.toHaveBeenCalled();

      rerender({ enabled: true });
      outsideElement.click();
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("should dynamically enable/disable", () => {
      const handler = jest.fn();
      const ref: RefObject<HTMLDivElement> = { current: targetElement };

      const { rerender } = renderHook(
        ({ enabled }) => useClickOutside(ref, handler, { enabled }),
        { initialProps: { enabled: true } }
      );

      outsideElement.click();
      expect(handler).toHaveBeenCalledTimes(1);

      rerender({ enabled: false });
      outsideElement.click();
      expect(handler).toHaveBeenCalledTimes(1); // Still 1

      rerender({ enabled: true });
      outsideElement.click();
      expect(handler).toHaveBeenCalledTimes(2);
    });
  });

  describe("Exception Elements", () => {
    it("should exclude exception elements", () => {
      const handler = jest.fn();
      const exceptionElement = document.createElement("div");
      document.body.appendChild(exceptionElement);

      const ref: RefObject<HTMLDivElement> = { current: targetElement };

      renderHook(() =>
        useClickOutside(ref, handler, {
          exceptions: [exceptionElement],
        })
      );

      exceptionElement.click();
      expect(handler).not.toHaveBeenCalled();

      outsideElement.click();
      expect(handler).toHaveBeenCalledTimes(1);

      document.body.removeChild(exceptionElement);
    });

    it("should handle multiple exception elements", () => {
      const handler = jest.fn();
      const exception1 = document.createElement("div");
      const exception2 = document.createElement("div");
      document.body.appendChild(exception1);
      document.body.appendChild(exception2);

      const ref: RefObject<HTMLDivElement> = { current: targetElement };

      renderHook(() =>
        useClickOutside(ref, handler, {
          exceptions: [exception1, exception2],
        })
      );

      exception1.click();
      exception2.click();
      expect(handler).not.toHaveBeenCalled();

      outsideElement.click();
      expect(handler).toHaveBeenCalledTimes(1);

      document.body.removeChild(exception1);
      document.body.removeChild(exception2);
    });
  });

  describe("Cleanup", () => {
    it("should remove event listeners on unmount", () => {
      const handler = jest.fn();
      const ref: RefObject<HTMLDivElement> = { current: targetElement };

      const { unmount } = renderHook(() => useClickOutside(ref, handler));

      unmount();

      outsideElement.click();

      expect(handler).not.toHaveBeenCalled();
    });

    it("should handle ref changes", () => {
      const handler = jest.fn();
      const element2 = document.createElement("div");
      document.body.appendChild(element2);

      const { rerender } = renderHook(
        ({ ref }) => useClickOutside(ref, handler),
        { initialProps: { ref: { current: targetElement } } }
      );

      outsideElement.click();
      expect(handler).toHaveBeenCalledTimes(1);

      rerender({ ref: { current: element2 } });

      targetElement.click(); // Now clicking old target should trigger handler
      expect(handler).toHaveBeenCalledTimes(2);

      document.body.removeChild(element2);
    });
  });

  describe("Edge Cases", () => {
    it("should handle rapid clicks", () => {
      const handler = jest.fn();
      const ref: RefObject<HTMLDivElement> = { current: targetElement };

      renderHook(() => useClickOutside(ref, handler));

      for (let i = 0; i < 10; i++) {
        outsideElement.click();
      }

      expect(handler).toHaveBeenCalledTimes(10);
    });

    it("should handle clicks on document body", () => {
      const handler = jest.fn();
      const ref: RefObject<HTMLDivElement> = { current: targetElement };

      renderHook(() => useClickOutside(ref, handler));

      document.body.click();

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("should handle nested elements", () => {
      const handler = jest.fn();
      const parent = document.createElement("div");
      const child = document.createElement("div");
      const grandchild = document.createElement("span");

      parent.appendChild(child);
      child.appendChild(grandchild);
      document.body.appendChild(parent);

      const ref: RefObject<HTMLDivElement> = { current: targetElement };

      renderHook(() => useClickOutside(ref, handler));

      grandchild.click(); // Click on deeply nested element
      expect(handler).toHaveBeenCalledTimes(1);

      document.body.removeChild(parent);
    });

    it("should handle dynamically created elements", () => {
      const handler = jest.fn();
      const ref: RefObject<HTMLDivElement> = { current: targetElement };

      renderHook(() => useClickOutside(ref, handler));

      const dynamicElement = document.createElement("div");
      document.body.appendChild(dynamicElement);

      dynamicElement.click();
      expect(handler).toHaveBeenCalledTimes(1);

      document.body.removeChild(dynamicElement);
    });
  });

  describe("Use Cases", () => {
    it("should work for dropdown menus", () => {
      const closeDropdown = jest.fn();
      const dropdownRef: RefObject<HTMLDivElement> = { current: targetElement };

      renderHook(() => useClickOutside(dropdownRef, closeDropdown));

      // Click outside - dropdown should close
      outsideElement.click();
      expect(closeDropdown).toHaveBeenCalledTimes(1);

      // Click inside - dropdown stays open
      targetElement.click();
      expect(closeDropdown).toHaveBeenCalledTimes(1);
    });

    it("should work for modal dialogs", () => {
      const closeModal = jest.fn();
      const modalContentRef: RefObject<HTMLDivElement> = {
        current: targetElement,
      };

      renderHook(() => useClickOutside(modalContentRef, closeModal));

      // Click on backdrop (outside content)
      outsideElement.click();
      expect(closeModal).toHaveBeenCalledTimes(1);

      // Click on modal content
      targetElement.click();
      expect(closeModal).toHaveBeenCalledTimes(1);
    });

    it("should work for tooltip dismissal", () => {
      const hideTooltip = jest.fn();
      const tooltipRef: RefObject<HTMLDivElement> = { current: targetElement };

      renderHook(() => useClickOutside(tooltipRef, hideTooltip));

      outsideElement.click();
      expect(hideTooltip).toHaveBeenCalledTimes(1);
    });
  });

  describe("Performance", () => {
    it("should not cause memory leaks with many instances", () => {
      const handlers = Array.from({ length: 100 }, () => jest.fn());
      const hooks = handlers.map((handler) =>
        renderHook(() => useClickOutside({ current: targetElement }, handler))
      );

      outsideElement.click();

      handlers.forEach((handler) => {
        expect(handler).toHaveBeenCalledTimes(1);
      });

      hooks.forEach((hook) => hook.unmount());

      outsideElement.click();

      handlers.forEach((handler) => {
        expect(handler).toHaveBeenCalledTimes(1); // Still 1, not called after unmount
      });
    });
  });
});
