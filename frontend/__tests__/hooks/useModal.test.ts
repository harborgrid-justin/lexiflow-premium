/**
 * @jest-environment jsdom
 * @module tests/hooks/useModal
 * @description Tests for useModal hook - modal state management
 */

import { useModal, useModalState } from "@/hooks/useModal";
import { act, renderHook } from "@testing-library/react";

describe("useModal", () => {
  describe("Basic State Management", () => {
    it("should initialize with closed state", () => {
      const { result } = renderHook(() => useModal());

      expect(result.current.isOpen).toBe(false);
    });

    it("should initialize with custom initial state", () => {
      const { result } = renderHook(() => useModal(true));

      expect(result.current.isOpen).toBe(true);
    });

    it("should open modal", () => {
      const { result } = renderHook(() => useModal());

      act(() => {
        result.current.open();
      });

      expect(result.current.isOpen).toBe(true);
    });

    it("should close modal", () => {
      const { result } = renderHook(() => useModal(true));

      act(() => {
        result.current.close();
      });

      expect(result.current.isOpen).toBe(false);
    });

    it("should toggle modal state", () => {
      const { result } = renderHook(() => useModal());

      expect(result.current.isOpen).toBe(false);

      act(() => {
        result.current.toggle();
      });

      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.toggle();
      });

      expect(result.current.isOpen).toBe(false);
    });
  });

  describe("Data Management", () => {
    it("should open modal with data", () => {
      const { result } = renderHook(() =>
        useModal<{ id: string; name: string }>()
      );

      const data = { id: "1", name: "Test" };

      act(() => {
        result.current.openWith(data);
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.data).toEqual(data);
    });

    it("should clear data on close", () => {
      const { result } = renderHook(() => useModal<{ id: string }>());

      act(() => {
        result.current.openWith({ id: "1" });
      });

      expect(result.current.data).toEqual({ id: "1" });

      act(() => {
        result.current.close();
      });

      expect(result.current.isOpen).toBe(false);
      expect(result.current.data).toBeUndefined();
    });

    it("should update data while modal is open", () => {
      const { result } = renderHook(() => useModal<{ count: number }>());

      act(() => {
        result.current.openWith({ count: 1 });
      });

      act(() => {
        result.current.setData({ count: 2 });
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.data).toEqual({ count: 2 });
    });

    it("should handle different data types", () => {
      // String
      const { result: stringResult } = renderHook(() => useModal<string>());
      act(() => stringResult.current.openWith("test string"));
      expect(stringResult.current.data).toBe("test string");

      // Number
      const { result: numberResult } = renderHook(() => useModal<number>());
      act(() => numberResult.current.openWith(42));
      expect(numberResult.current.data).toBe(42);

      // Array
      const { result: arrayResult } = renderHook(() => useModal<number[]>());
      act(() => arrayResult.current.openWith([1, 2, 3]));
      expect(arrayResult.current.data).toEqual([1, 2, 3]);

      // Object
      const { result: objectResult } = renderHook(() =>
        useModal<{ key: string }>()
      );
      act(() => objectResult.current.openWith({ key: "value" }));
      expect(objectResult.current.data).toEqual({ key: "value" });
    });
  });

  describe("Callback Handlers", () => {
    it("should call onOpen callback", () => {
      const onOpen = jest.fn();
      const { result } = renderHook(() => useModal(false, { onOpen }));

      act(() => {
        result.current.open();
      });

      expect(onOpen).toHaveBeenCalledTimes(1);
    });

    it("should call onClose callback", () => {
      const onClose = jest.fn();
      const { result } = renderHook(() => useModal(true, { onClose }));

      act(() => {
        result.current.close();
      });

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should not call onOpen if already open", () => {
      const onOpen = jest.fn();
      const { result } = renderHook(() => useModal(true, { onOpen }));

      act(() => {
        result.current.open();
      });

      expect(onOpen).not.toHaveBeenCalled();
    });

    it("should not call onClose if already closed", () => {
      const onClose = jest.fn();
      const { result } = renderHook(() => useModal(false, { onClose }));

      act(() => {
        result.current.close();
      });

      expect(onClose).not.toHaveBeenCalled();
    });

    it("should call callbacks on toggle", () => {
      const onOpen = jest.fn();
      const onClose = jest.fn();
      const { result } = renderHook(() => useModal(false, { onOpen, onClose }));

      act(() => {
        result.current.toggle(); // Open
      });

      expect(onOpen).toHaveBeenCalledTimes(1);
      expect(onClose).not.toHaveBeenCalled();

      act(() => {
        result.current.toggle(); // Close
      });

      expect(onOpen).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("useModalState", () => {
    it("should manage multiple modal states", () => {
      const { result } = renderHook(() =>
        useModalState({
          create: false,
          edit: false,
          delete: false,
        })
      );

      expect(result.current.states.create).toBe(false);
      expect(result.current.states.edit).toBe(false);
      expect(result.current.states.delete).toBe(false);

      act(() => {
        result.current.open("create");
      });

      expect(result.current.states.create).toBe(true);
      expect(result.current.states.edit).toBe(false);
      expect(result.current.states.delete).toBe(false);
    });

    it("should close specific modal", () => {
      const { result } = renderHook(() =>
        useModalState({
          modal1: true,
          modal2: true,
        })
      );

      act(() => {
        result.current.close("modal1");
      });

      expect(result.current.states.modal1).toBe(false);
      expect(result.current.states.modal2).toBe(true);
    });

    it("should toggle specific modal", () => {
      const { result } = renderHook(() =>
        useModalState({
          modal: false,
        })
      );

      act(() => {
        result.current.toggle("modal");
      });

      expect(result.current.states.modal).toBe(true);

      act(() => {
        result.current.toggle("modal");
      });

      expect(result.current.states.modal).toBe(false);
    });

    it("should close all modals", () => {
      const { result } = renderHook(() =>
        useModalState({
          modal1: true,
          modal2: true,
          modal3: true,
        })
      );

      act(() => {
        result.current.closeAll();
      });

      expect(result.current.states.modal1).toBe(false);
      expect(result.current.states.modal2).toBe(false);
      expect(result.current.states.modal3).toBe(false);
    });

    it("should check if specific modal is open", () => {
      const { result } = renderHook(() =>
        useModalState({
          open: true,
          closed: false,
        })
      );

      expect(result.current.isOpen("open")).toBe(true);
      expect(result.current.isOpen("closed")).toBe(false);
    });

    it("should check if any modal is open", () => {
      const { result } = renderHook(() =>
        useModalState({
          modal1: false,
          modal2: false,
        })
      );

      expect(result.current.isAnyOpen()).toBe(false);

      act(() => {
        result.current.open("modal1");
      });

      expect(result.current.isAnyOpen()).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle rapid open/close cycles", () => {
      const { result } = renderHook(() => useModal());

      act(() => {
        result.current.open();
        result.current.close();
        result.current.open();
        result.current.close();
        result.current.open();
      });

      expect(result.current.isOpen).toBe(true);
    });

    it("should handle undefined data", () => {
      const { result } = renderHook(() => useModal<string | undefined>());

      act(() => {
        result.current.openWith(undefined);
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.data).toBeUndefined();
    });

    it("should handle null data", () => {
      const { result } = renderHook(() => useModal<string | null>());

      act(() => {
        result.current.openWith(null);
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.data).toBeNull();
    });

    it("should preserve data across multiple opens", () => {
      const { result } = renderHook(() => useModal<{ id: string }>());

      act(() => {
        result.current.openWith({ id: "1" });
      });

      act(() => {
        result.current.close();
      });

      act(() => {
        result.current.openWith({ id: "2" });
      });

      expect(result.current.data).toEqual({ id: "2" });
    });
  });

  describe("Memory Management", () => {
    it("should clean up on unmount", () => {
      const onClose = jest.fn();
      const { result, unmount } = renderHook(() => useModal(true, { onClose }));

      unmount();

      // Should not throw or cause memory leaks
      expect(result.current.isOpen).toBe(true);
    });

    it("should handle multiple hook instances independently", () => {
      const { result: result1 } = renderHook(() => useModal());
      const { result: result2 } = renderHook(() => useModal());

      act(() => {
        result1.current.open();
      });

      expect(result1.current.isOpen).toBe(true);
      expect(result2.current.isOpen).toBe(false);

      act(() => {
        result2.current.open();
      });

      expect(result1.current.isOpen).toBe(true);
      expect(result2.current.isOpen).toBe(true);
    });
  });

  describe("Complex Scenarios", () => {
    it("should handle nested modal data", () => {
      interface NestedData {
        user: {
          id: string;
          profile: {
            name: string;
            email: string;
          };
        };
      }

      const { result } = renderHook(() => useModal<NestedData>());

      const complexData: NestedData = {
        user: {
          id: "1",
          profile: {
            name: "John Doe",
            email: "john@example.com",
          },
        },
      };

      act(() => {
        result.current.openWith(complexData);
      });

      expect(result.current.data).toEqual(complexData);
      expect(result.current.data?.user.profile.name).toBe("John Doe");
    });

    it("should support async operations", async () => {
      const { result } = renderHook(() => useModal<string>());

      await act(async () => {
        // Simulate async data loading
        await new Promise((resolve) => setTimeout(resolve, 100));
        result.current.openWith("Loaded data");
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.data).toBe("Loaded data");
    });
  });
});
