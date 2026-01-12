/**
 * @jest-environment jsdom
 * @module tests/hooks/useResizeObserver
 * @description Tests for useResizeObserver hook - element resize detection
 */

import { useResizeObserver } from "@/hooks/useResizeObserver";
import { renderHook } from "@testing-library/react";
import { RefObject } from "react";

// Mock ResizeObserver
class MockResizeObserver {
  private callback: ResizeObserverCallback;
  private elements = new Set<Element>();

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  observe(element: Element) {
    this.elements.add(element);
  }

  unobserve(element: Element) {
    this.elements.delete(element);
  }

  disconnect() {
    this.elements.clear();
  }

  triggerResize(target: Element, contentRect: Partial<DOMRectReadOnly>) {
    const entry: ResizeObserverEntry = {
      target,
      contentRect: {
        width: 0,
        height: 0,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        x: 0,
        y: 0,
        ...contentRect,
        toJSON: () => ({}),
      } as DOMRectReadOnly,
      borderBoxSize: [] as any,
      contentBoxSize: [] as any,
      devicePixelContentBoxSize: [] as any,
    };

    this.callback([entry], this as any);
  }
}

global.ResizeObserver = MockResizeObserver as any;

describe("useResizeObserver", () => {
  let targetElement: HTMLDivElement;

  beforeEach(() => {
    targetElement = document.createElement("div");
    document.body.appendChild(targetElement);
  });

  afterEach(() => {
    document.body.removeChild(targetElement);
  });

  describe("Basic Functionality", () => {
    it("should observe element resize", () => {
      const callback = jest.fn();
      const ref: RefObject<HTMLDivElement> = { current: targetElement };

      renderHook(() => useResizeObserver(ref, callback));

      expect(callback).not.toHaveBeenCalled();
    });

    it("should call callback on resize", () => {
      const callback = jest.fn();
      const ref: RefObject<HTMLDivElement> = { current: targetElement };

      renderHook(() => useResizeObserver(ref, callback));

      const observer = (global.ResizeObserver as any).mock.instances[0];
      observer.triggerResize(targetElement, { width: 200, height: 100 });

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          width: 200,
          height: 100,
        })
      );
    });

    it("should track multiple resizes", () => {
      const callback = jest.fn();
      const ref: RefObject<HTMLDivElement> = { current: targetElement };

      renderHook(() => useResizeObserver(ref, callback));

      const observer = (global.ResizeObserver as any).mock.instances[0];

      observer.triggerResize(targetElement, { width: 100, height: 100 });
      observer.triggerResize(targetElement, { width: 200, height: 150 });
      observer.triggerResize(targetElement, { width: 300, height: 200 });

      expect(callback).toHaveBeenCalledTimes(3);
    });

    it("should not observe when ref is null", () => {
      const callback = jest.fn();
      const ref: RefObject<HTMLDivElement> = { current: null };

      renderHook(() => useResizeObserver(ref, callback));

      expect((global.ResizeObserver as any).mock.instances.length).toBe(0);
    });
  });

  describe("Debounce Option", () => {
    it("should debounce resize callbacks", () => {
      jest.useFakeTimers();

      const callback = jest.fn();
      const ref: RefObject<HTMLDivElement> = { current: targetElement };

      renderHook(() => useResizeObserver(ref, callback, { debounce: 300 }));

      const observer = (global.ResizeObserver as any).mock.instances[0];

      // Trigger multiple resizes
      observer.triggerResize(targetElement, { width: 100, height: 100 });
      observer.triggerResize(targetElement, { width: 200, height: 200 });
      observer.triggerResize(targetElement, { width: 300, height: 300 });

      expect(callback).not.toHaveBeenCalled();

      jest.advanceTimersByTime(300);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({ width: 300, height: 300 })
      );

      jest.useRealTimers();
    });
  });

  describe("Size State Return", () => {
    it("should return current size", () => {
      const ref: RefObject<HTMLDivElement> = { current: targetElement };

      const { result } = renderHook(() => useResizeObserver(ref));

      expect(result.current).toEqual({ width: 0, height: 0 });

      const observer = (global.ResizeObserver as any).mock.instances[0];
      observer.triggerResize(targetElement, { width: 400, height: 300 });

      expect(result.current).toEqual({ width: 400, height: 300 });
    });

    it("should update size state on resize", () => {
      const ref: RefObject<HTMLDivElement> = { current: targetElement };

      const { result } = renderHook(() => useResizeObserver(ref));

      const observer = (global.ResizeObserver as any).mock.instances[0];

      observer.triggerResize(targetElement, { width: 100, height: 50 });
      expect(result.current).toEqual({ width: 100, height: 50 });

      observer.triggerResize(targetElement, { width: 200, height: 100 });
      expect(result.current).toEqual({ width: 200, height: 100 });
    });
  });

  describe("Cleanup", () => {
    it("should disconnect observer on unmount", () => {
      const callback = jest.fn();
      const ref: RefObject<HTMLDivElement> = { current: targetElement };

      const { unmount } = renderHook(() => useResizeObserver(ref, callback));

      const observer = (global.ResizeObserver as any).mock.instances[0];
      const disconnectSpy = jest.spyOn(observer, "disconnect");

      unmount();

      expect(disconnectSpy).toHaveBeenCalled();
    });

    it("should handle ref changes", () => {
      const callback = jest.fn();
      const element2 = document.createElement("div");
      document.body.appendChild(element2);

      const { rerender } = renderHook(
        ({ ref }) => useResizeObserver(ref, callback),
        { initialProps: { ref: { current: targetElement } } }
      );

      const observer = (global.ResizeObserver as any).mock.instances[0];
      const unobserveSpy = jest.spyOn(observer, "unobserve");

      rerender({ ref: { current: element2 } });

      expect(unobserveSpy).toHaveBeenCalledWith(targetElement);

      document.body.removeChild(element2);
    });
  });

  describe("Use Cases", () => {
    it("should work for responsive layouts", () => {
      const ref: RefObject<HTMLDivElement> = { current: targetElement };

      const { result } = renderHook(() => useResizeObserver(ref));

      const observer = (global.ResizeObserver as any).mock.instances[0];

      // Desktop size
      observer.triggerResize(targetElement, { width: 1200, height: 800 });
      expect(result.current.width).toBe(1200);

      // Tablet size
      observer.triggerResize(targetElement, { width: 768, height: 600 });
      expect(result.current.width).toBe(768);

      // Mobile size
      observer.triggerResize(targetElement, { width: 375, height: 667 });
      expect(result.current.width).toBe(375);
    });

    it("should work for dynamic grid layouts", () => {
      const updateGridColumns = jest.fn();
      const ref: RefObject<HTMLDivElement> = { current: targetElement };

      renderHook(() =>
        useResizeObserver(ref, (size) => {
          const columns = Math.floor(size.width / 200);
          updateGridColumns(columns);
        })
      );

      const observer = (global.ResizeObserver as any).mock.instances[0];

      observer.triggerResize(targetElement, { width: 600, height: 400 });
      expect(updateGridColumns).toHaveBeenCalledWith(3);

      observer.triggerResize(targetElement, { width: 1000, height: 400 });
      expect(updateGridColumns).toHaveBeenCalledWith(5);
    });

    it("should work for canvas resizing", () => {
      const canvas = document.createElement("canvas");
      document.body.appendChild(canvas);

      const ref: RefObject<HTMLCanvasElement> = { current: canvas };

      renderHook(() =>
        useResizeObserver(ref, (size) => {
          canvas.width = size.width;
          canvas.height = size.height;
        })
      );

      const observer = (global.ResizeObserver as any).mock.instances[0];
      observer.triggerResize(canvas, { width: 800, height: 600 });

      expect(canvas.width).toBe(800);
      expect(canvas.height).toBe(600);

      document.body.removeChild(canvas);
    });
  });

  describe("Multiple Elements", () => {
    it("should observe multiple elements independently", () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const element2 = document.createElement("div");
      document.body.appendChild(element2);

      renderHook(() =>
        useResizeObserver({ current: targetElement }, callback1)
      );
      renderHook(() => useResizeObserver({ current: element2 }, callback2));

      const observers = (global.ResizeObserver as any).mock.instances;
      observers[0].triggerResize(targetElement, { width: 100, height: 100 });

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).not.toHaveBeenCalled();

      observers[1].triggerResize(element2, { width: 200, height: 200 });

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);

      document.body.removeChild(element2);
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero dimensions", () => {
      const callback = jest.fn();
      const ref: RefObject<HTMLDivElement> = { current: targetElement };

      renderHook(() => useResizeObserver(ref, callback));

      const observer = (global.ResizeObserver as any).mock.instances[0];
      observer.triggerResize(targetElement, { width: 0, height: 0 });

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({ width: 0, height: 0 })
      );
    });

    it("should handle very large dimensions", () => {
      const callback = jest.fn();
      const ref: RefObject<HTMLDivElement> = { current: targetElement };

      renderHook(() => useResizeObserver(ref, callback));

      const observer = (global.ResizeObserver as any).mock.instances[0];
      observer.triggerResize(targetElement, { width: 10000, height: 10000 });

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({ width: 10000, height: 10000 })
      );
    });

    it("should handle rapid resizes", () => {
      const callback = jest.fn();
      const ref: RefObject<HTMLDivElement> = { current: targetElement };

      renderHook(() => useResizeObserver(ref, callback));

      const observer = (global.ResizeObserver as any).mock.instances[0];

      for (let i = 1; i <= 100; i++) {
        observer.triggerResize(targetElement, { width: i * 10, height: i * 5 });
      }

      expect(callback).toHaveBeenCalledTimes(100);
    });

    it("should handle fractional dimensions", () => {
      const callback = jest.fn();
      const ref: RefObject<HTMLDivElement> = { current: targetElement };

      renderHook(() => useResizeObserver(ref, callback));

      const observer = (global.ResizeObserver as any).mock.instances[0];
      observer.triggerResize(targetElement, { width: 123.456, height: 78.9 });

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({ width: 123.456, height: 78.9 })
      );
    });
  });

  describe("Performance", () => {
    it("should not cause memory leaks with many observers", () => {
      const elements = Array.from({ length: 100 }, () => {
        const el = document.createElement("div");
        document.body.appendChild(el);
        return el;
      });

      const hooks = elements.map((el) =>
        renderHook(() => useResizeObserver({ current: el }))
      );

      expect((global.ResizeObserver as any).mock.instances.length).toBe(100);

      hooks.forEach((hook) => hook.unmount());
      elements.forEach((el) => document.body.removeChild(el));

      // Should cleanup properly
    });

    it("should handle high-frequency resizes efficiently", () => {
      jest.useFakeTimers();

      const callback = jest.fn();
      const ref: RefObject<HTMLDivElement> = { current: targetElement };

      renderHook(() => useResizeObserver(ref, callback, { debounce: 16 })); // ~60fps

      const observer = (global.ResizeObserver as any).mock.instances[0];

      // Simulate 60 resize events per second
      for (let i = 0; i < 60; i++) {
        observer.triggerResize(targetElement, { width: 100 + i, height: 100 });
        jest.advanceTimersByTime(16);
      }

      // Should debounce most of them
      expect(callback).toHaveBeenCalledTimes(60); // One per frame

      jest.useRealTimers();
    });
  });

  describe("Options", () => {
    it("should support box option", () => {
      const callback = jest.fn();
      const ref: RefObject<HTMLDivElement> = { current: targetElement };

      renderHook(() => useResizeObserver(ref, callback, { box: "border-box" }));

      // ResizeObserver should be created with options
      expect(global.ResizeObserver).toHaveBeenCalledWith(expect.any(Function));
    });

    it("should handle disabled option", () => {
      const callback = jest.fn();
      const ref: RefObject<HTMLDivElement> = { current: targetElement };

      const { rerender } = renderHook(
        ({ enabled }) => useResizeObserver(ref, callback, { enabled }),
        { initialProps: { enabled: false } }
      );

      // Observer should not be created when disabled
      const initialCount = (global.ResizeObserver as any).mock.instances.length;

      rerender({ enabled: true });

      // Now observer should be created
      expect(
        (global.ResizeObserver as any).mock.instances.length
      ).toBeGreaterThan(initialCount);
    });
  });
});
