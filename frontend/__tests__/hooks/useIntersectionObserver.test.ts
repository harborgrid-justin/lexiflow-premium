/**
 * @jest-environment jsdom
 * @module tests/hooks/useIntersectionObserver
 * @description Tests for useIntersectionObserver hook - visibility detection
 */

import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { renderHook } from "@testing-library/react";
import { RefObject } from "react";

// Mock IntersectionObserver
class MockIntersectionObserver {
  private callback: IntersectionObserverCallback;
  private elements = new Set<Element>();

  constructor(
    callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit
  ) {
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

  triggerIntersection(isIntersecting: boolean, target: Element) {
    const entry: IntersectionObserverEntry = {
      isIntersecting,
      target,
      boundingClientRect: target.getBoundingClientRect(),
      intersectionRatio: isIntersecting ? 1 : 0,
      intersectionRect: {} as DOMRectReadOnly,
      rootBounds: null,
      time: Date.now(),
    };

    this.callback([entry], this as any);
  }
}

global.IntersectionObserver = MockIntersectionObserver as any;

describe("useIntersectionObserver", () => {
  let targetElement: HTMLDivElement;

  beforeEach(() => {
    targetElement = document.createElement("div");
    document.body.appendChild(targetElement);
  });

  afterEach(() => {
    document.body.removeChild(targetElement);
  });

  describe("Basic Functionality", () => {
    it("should observe element intersection", () => {
      const callback = jest.fn();
      const ref: RefObject<HTMLDivElement> = { current: targetElement };

      renderHook(() => useIntersectionObserver(ref, callback));

      expect(callback).not.toHaveBeenCalled();
    });

    it("should call callback when element intersects", () => {
      const callback = jest.fn();
      const ref: RefObject<HTMLDivElement> = { current: targetElement };

      renderHook(() => useIntersectionObserver(ref, callback));

      // Simulate intersection
      const observer = (global.IntersectionObserver as any).mock.instances[0];
      observer.triggerIntersection(true, targetElement);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          isIntersecting: true,
          target: targetElement,
        })
      );
    });

    it("should call callback when element exits viewport", () => {
      const callback = jest.fn();
      const ref: RefObject<HTMLDivElement> = { current: targetElement };

      renderHook(() => useIntersectionObserver(ref, callback));

      const observer = (global.IntersectionObserver as any).mock.instances[0];

      // Enter viewport
      observer.triggerIntersection(true, targetElement);
      expect(callback).toHaveBeenCalledTimes(1);

      // Exit viewport
      observer.triggerIntersection(false, targetElement);
      expect(callback).toHaveBeenCalledTimes(2);
    });

    it("should not observe when ref is null", () => {
      const callback = jest.fn();
      const ref: RefObject<HTMLDivElement> = { current: null };

      renderHook(() => useIntersectionObserver(ref, callback));

      // Observer should not be created
      expect((global.IntersectionObserver as any).mock.instances.length).toBe(
        0
      );
    });
  });

  describe("Options", () => {
    it("should pass options to IntersectionObserver", () => {
      const callback = jest.fn();
      const ref: RefObject<HTMLDivElement> = { current: targetElement };
      const options = {
        root: null,
        rootMargin: "10px",
        threshold: 0.5,
      };

      renderHook(() => useIntersectionObserver(ref, callback, options));

      expect(global.IntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        options
      );
    });

    it("should support threshold array", () => {
      const callback = jest.fn();
      const ref: RefObject<HTMLDivElement> = { current: targetElement };
      const options = { threshold: [0, 0.25, 0.5, 0.75, 1.0] };

      renderHook(() => useIntersectionObserver(ref, callback, options));

      expect(global.IntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({ threshold: options.threshold })
      );
    });

    it("should support custom root element", () => {
      const callback = jest.fn();
      const root = document.createElement("div");
      const ref: RefObject<HTMLDivElement> = { current: targetElement };

      renderHook(() => useIntersectionObserver(ref, callback, { root }));

      expect(global.IntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({ root })
      );
    });

    it("should support rootMargin", () => {
      const callback = jest.fn();
      const ref: RefObject<HTMLDivElement> = { current: targetElement };
      const rootMargin = "20px 10px";

      renderHook(() => useIntersectionObserver(ref, callback, { rootMargin }));

      expect(global.IntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({ rootMargin })
      );
    });
  });

  describe("Once Option", () => {
    it("should unobserve after first intersection when once is true", () => {
      const callback = jest.fn();
      const ref: RefObject<HTMLDivElement> = { current: targetElement };

      renderHook(() => useIntersectionObserver(ref, callback, { once: true }));

      const observer = (global.IntersectionObserver as any).mock.instances[0];
      const unobserveSpy = jest.spyOn(observer, "unobserve");

      observer.triggerIntersection(true, targetElement);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(unobserveSpy).toHaveBeenCalledWith(targetElement);
    });

    it("should continue observing when once is false", () => {
      const callback = jest.fn();
      const ref: RefObject<HTMLDivElement> = { current: targetElement };

      renderHook(() => useIntersectionObserver(ref, callback, { once: false }));

      const observer = (global.IntersectionObserver as any).mock.instances[0];

      observer.triggerIntersection(true, targetElement);
      observer.triggerIntersection(false, targetElement);
      observer.triggerIntersection(true, targetElement);

      expect(callback).toHaveBeenCalledTimes(3);
    });
  });

  describe("Cleanup", () => {
    it("should disconnect observer on unmount", () => {
      const callback = jest.fn();
      const ref: RefObject<HTMLDivElement> = { current: targetElement };

      const { unmount } = renderHook(() =>
        useIntersectionObserver(ref, callback)
      );

      const observer = (global.IntersectionObserver as any).mock.instances[0];
      const disconnectSpy = jest.spyOn(observer, "disconnect");

      unmount();

      expect(disconnectSpy).toHaveBeenCalled();
    });

    it("should handle ref changes", () => {
      const callback = jest.fn();
      const element2 = document.createElement("div");
      document.body.appendChild(element2);

      const { rerender } = renderHook(
        ({ ref }) => useIntersectionObserver(ref, callback),
        { initialProps: { ref: { current: targetElement } } }
      );

      const observer1 = (global.IntersectionObserver as any).mock.instances[0];
      const unobserveSpy = jest.spyOn(observer1, "unobserve");

      rerender({ ref: { current: element2 } });

      expect(unobserveSpy).toHaveBeenCalledWith(targetElement);

      document.body.removeChild(element2);
    });
  });

  describe("Edge Cases", () => {
    it("should handle rapid visibility changes", () => {
      const callback = jest.fn();
      const ref: RefObject<HTMLDivElement> = { current: targetElement };

      renderHook(() => useIntersectionObserver(ref, callback));

      const observer = (global.IntersectionObserver as any).mock.instances[0];

      // Rapid visibility changes
      for (let i = 0; i < 10; i++) {
        observer.triggerIntersection(i % 2 === 0, targetElement);
      }

      expect(callback).toHaveBeenCalledTimes(10);
    });

    it("should handle threshold near intersection", () => {
      const callback = jest.fn();
      const ref: RefObject<HTMLDivElement> = { current: targetElement };

      renderHook(() =>
        useIntersectionObserver(ref, callback, { threshold: 0.5 })
      );

      const observer = (global.IntersectionObserver as any).mock.instances[0];

      // Simulate partial intersection
      observer.triggerIntersection(true, targetElement);

      expect(callback).toHaveBeenCalled();
    });
  });

  describe("Use Cases", () => {
    it("should work for lazy loading images", () => {
      const loadImage = jest.fn();
      const ref: RefObject<HTMLDivElement> = { current: targetElement };

      renderHook(() =>
        useIntersectionObserver(
          ref,
          (entry) => {
            if (entry.isIntersecting) {
              loadImage();
            }
          },
          { once: true }
        )
      );

      const observer = (global.IntersectionObserver as any).mock.instances[0];
      observer.triggerIntersection(true, targetElement);

      expect(loadImage).toHaveBeenCalledTimes(1);

      // Should not load again
      observer.triggerIntersection(false, targetElement);
      observer.triggerIntersection(true, targetElement);

      expect(loadImage).toHaveBeenCalledTimes(1);
    });

    it("should work for infinite scroll", () => {
      const loadMore = jest.fn();
      const ref: RefObject<HTMLDivElement> = { current: targetElement };

      renderHook(() =>
        useIntersectionObserver(ref, (entry) => {
          if (entry.isIntersecting) {
            loadMore();
          }
        })
      );

      const observer = (global.IntersectionObserver as any).mock.instances[0];

      // Trigger multiple times as user scrolls
      observer.triggerIntersection(true, targetElement);
      observer.triggerIntersection(false, targetElement);
      observer.triggerIntersection(true, targetElement);

      expect(loadMore).toHaveBeenCalledTimes(2);
    });

    it("should work for view tracking", () => {
      const trackView = jest.fn();
      const ref: RefObject<HTMLDivElement> = { current: targetElement };

      renderHook(() =>
        useIntersectionObserver(
          ref,
          (entry) => {
            if (entry.isIntersecting) {
              trackView("item-viewed");
            }
          },
          { threshold: 0.75, once: true }
        )
      );

      const observer = (global.IntersectionObserver as any).mock.instances[0];
      observer.triggerIntersection(true, targetElement);

      expect(trackView).toHaveBeenCalledWith("item-viewed");
    });

    it("should work for animations on scroll", () => {
      const animate = jest.fn();
      const ref: RefObject<HTMLDivElement> = { current: targetElement };

      renderHook(() =>
        useIntersectionObserver(ref, (entry) => {
          if (entry.isIntersecting) {
            animate();
          }
        })
      );

      const observer = (global.IntersectionObserver as any).mock.instances[0];
      observer.triggerIntersection(true, targetElement);

      expect(animate).toHaveBeenCalled();
    });
  });

  describe("Multiple Elements", () => {
    it("should observe multiple elements independently", () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const element2 = document.createElement("div");
      document.body.appendChild(element2);

      renderHook(() =>
        useIntersectionObserver({ current: targetElement }, callback1)
      );
      renderHook(() =>
        useIntersectionObserver({ current: element2 }, callback2)
      );

      const observers = (global.IntersectionObserver as any).mock.instances;
      observers[0].triggerIntersection(true, targetElement);

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).not.toHaveBeenCalled();

      observers[1].triggerIntersection(true, element2);

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);

      document.body.removeChild(element2);
    });
  });

  describe("Performance", () => {
    it("should not create unnecessary observers", () => {
      const callback = jest.fn();
      const ref: RefObject<HTMLDivElement> = { current: targetElement };

      const { rerender } = renderHook(() =>
        useIntersectionObserver(ref, callback)
      );

      const initialCount = (global.IntersectionObserver as any).mock.instances
        .length;

      rerender();

      expect((global.IntersectionObserver as any).mock.instances.length).toBe(
        initialCount
      );
    });

    it("should handle many observed elements efficiently", () => {
      const elements = Array.from({ length: 100 }, () => {
        const el = document.createElement("div");
        document.body.appendChild(el);
        return el;
      });

      const hooks = elements.map((el) =>
        renderHook(() => useIntersectionObserver({ current: el }, jest.fn()))
      );

      expect((global.IntersectionObserver as any).mock.instances.length).toBe(
        100
      );

      hooks.forEach((hook) => hook.unmount());
      elements.forEach((el) => document.body.removeChild(el));
    });
  });
});
