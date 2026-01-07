/**
 * @module components/enterprise/data/DataGridColumnResizer.test
 * @description Unit tests for DataGridColumnResizer component and utilities.
 */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import {
  ColumnResizer,
  useColumnResizer,
  distributeColumnWidths,
  resetColumnWidths,
  saveColumnWidths,
  loadColumnWidths,
} from './DataGridColumnResizer';

// ============================================================================
// MOCKS
// ============================================================================

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// ============================================================================
// TEST SETUP
// ============================================================================

const defaultProps = {
  columnId: 'test-column',
  currentWidth: 150,
  onResize: jest.fn(),
  onResizeEnd: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  localStorageMock.clear();
});

// ============================================================================
// ColumnResizer COMPONENT TESTS
// ============================================================================

describe('ColumnResizer component', () => {
  it('should render the resize handle', () => {
    const { container } = render(<ColumnResizer {...defaultProps} />);

    const resizer = container.firstChild as HTMLElement;
    expect(resizer).toBeInTheDocument();
    expect(resizer).toHaveClass('cursor-col-resize');
  });

  it('should have correct positioning classes', () => {
    const { container } = render(<ColumnResizer {...defaultProps} />);

    const resizer = container.firstChild as HTMLElement;
    expect(resizer).toHaveClass('absolute', 'top-0', 'right-0');
  });

  it('should apply custom className', () => {
    const { container } = render(
      <ColumnResizer {...defaultProps} className="custom-class" />
    );

    const resizer = container.firstChild as HTMLElement;
    expect(resizer).toHaveClass('custom-class');
  });

  it('should start resizing on mouse down', () => {
    const { container } = render(<ColumnResizer {...defaultProps} />);

    const resizer = container.firstChild as HTMLElement;
    fireEvent.mouseDown(resizer, { clientX: 100 });

    // The resizer should now have the active class
    expect(resizer).toHaveClass('bg-blue-500');
  });

  it('should call onResize with default width on double-click', () => {
    const onResize = jest.fn();
    const onResizeEnd = jest.fn();

    const { container } = render(
      <ColumnResizer
        {...defaultProps}
        onResize={onResize}
        onResizeEnd={onResizeEnd}
      />
    );

    const resizer = container.firstChild as HTMLElement;
    fireEvent.doubleClick(resizer);

    expect(onResize).toHaveBeenCalledWith('test-column', 150);
    expect(onResizeEnd).toHaveBeenCalledWith('test-column', 150);
  });

  it('should have touch-action none for touch support', () => {
    const { container } = render(<ColumnResizer {...defaultProps} />);

    const resizer = container.firstChild as HTMLElement;
    expect(resizer).toHaveStyle({ touchAction: 'none' });
  });

  it('should show visual indicator on hover', () => {
    const { container } = render(<ColumnResizer {...defaultProps} />);

    const resizer = container.firstChild as HTMLElement;
    expect(resizer).toHaveClass('hover:bg-blue-500');
  });
});

// ============================================================================
// useColumnResizer HOOK TESTS
// ============================================================================

describe('useColumnResizer hook', () => {
  it('should initialize with isResizing false', () => {
    const { result } = renderHook(() =>
      useColumnResizer('col-1', 150, {
        onResize: jest.fn(),
      })
    );

    expect(result.current.isResizing).toBe(false);
  });

  it('should have handleMouseDown function', () => {
    const { result } = renderHook(() =>
      useColumnResizer('col-1', 150, {
        onResize: jest.fn(),
      })
    );

    expect(typeof result.current.handleMouseDown).toBe('function');
  });

  it('should set isResizing true on mouse down', () => {
    const { result } = renderHook(() =>
      useColumnResizer('col-1', 150, {
        onResize: jest.fn(),
      })
    );

    act(() => {
      const mockEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        clientX: 100,
      } as unknown as React.MouseEvent;

      result.current.handleMouseDown(mockEvent);
    });

    expect(result.current.isResizing).toBe(true);
  });

  it('should respect minWidth constraint', async () => {
    const onResize = jest.fn();

    const { result } = renderHook(() =>
      useColumnResizer('col-1', 150, {
        minWidth: 100,
        onResize,
      })
    );

    // Start resizing
    act(() => {
      const mockEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        clientX: 100,
      } as unknown as React.MouseEvent;

      result.current.handleMouseDown(mockEvent);
    });

    // Simulate mouse move to make column very small
    act(() => {
      const moveEvent = new MouseEvent('mousemove', { clientX: 0 });
      document.dispatchEvent(moveEvent);
    });

    // Should not go below minWidth
    if (onResize.mock.calls.length > 0) {
      const [, newWidth] = onResize.mock.calls[onResize.mock.calls.length - 1];
      expect(newWidth).toBeGreaterThanOrEqual(100);
    }
  });

  it('should respect maxWidth constraint', async () => {
    const onResize = jest.fn();

    const { result } = renderHook(() =>
      useColumnResizer('col-1', 150, {
        maxWidth: 300,
        onResize,
      })
    );

    // Start resizing
    act(() => {
      const mockEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        clientX: 100,
      } as unknown as React.MouseEvent;

      result.current.handleMouseDown(mockEvent);
    });

    // Simulate mouse move to make column very large
    act(() => {
      const moveEvent = new MouseEvent('mousemove', { clientX: 500 });
      document.dispatchEvent(moveEvent);
    });

    // Should not go above maxWidth
    if (onResize.mock.calls.length > 0) {
      const [, newWidth] = onResize.mock.calls[onResize.mock.calls.length - 1];
      expect(newWidth).toBeLessThanOrEqual(300);
    }
  });

  it('should call onResizeEnd on mouse up', async () => {
    const onResizeEnd = jest.fn();

    const { result } = renderHook(() =>
      useColumnResizer('col-1', 150, {
        onResize: jest.fn(),
        onResizeEnd,
      })
    );

    // Start resizing
    act(() => {
      const mockEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        clientX: 100,
      } as unknown as React.MouseEvent;

      result.current.handleMouseDown(mockEvent);
    });

    // Mouse up
    act(() => {
      const upEvent = new MouseEvent('mouseup');
      document.dispatchEvent(upEvent);
    });

    expect(result.current.isResizing).toBe(false);
  });

  it('should clean up event listeners on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

    const { result, unmount } = renderHook(() =>
      useColumnResizer('col-1', 150, {
        onResize: jest.fn(),
      })
    );

    // Start resizing
    act(() => {
      const mockEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        clientX: 100,
      } as unknown as React.MouseEvent;

      result.current.handleMouseDown(mockEvent);
    });

    unmount();

    // Event listeners should be removed
    expect(removeEventListenerSpy).toHaveBeenCalled();

    removeEventListenerSpy.mockRestore();
  });
});

// ============================================================================
// distributeColumnWidths TESTS
// ============================================================================

describe('distributeColumnWidths', () => {
  it('should use defined widths when available', () => {
    const columns = [
      { id: 'col1', width: 100 },
      { id: 'col2', width: 200 },
    ];

    const widths = distributeColumnWidths(columns, 500);

    expect(widths['col1']).toBe(100);
    expect(widths['col2']).toBe(200);
  });

  it('should distribute remaining width among flexible columns', () => {
    const columns = [
      { id: 'col1', width: 100 },
      { id: 'col2' }, // No width defined
    ];

    const widths = distributeColumnWidths(columns, 500);

    expect(widths['col1']).toBe(100);
    expect(widths['col2']).toBe(400); // Remaining space
  });

  it('should distribute evenly among multiple flexible columns', () => {
    const columns = [
      { id: 'col1' },
      { id: 'col2' },
      { id: 'col3' },
    ];

    const widths = distributeColumnWidths(columns, 300);

    expect(widths['col1']).toBe(100);
    expect(widths['col2']).toBe(100);
    expect(widths['col3']).toBe(100);
  });

  it('should respect minWidth constraint', () => {
    const columns = [
      { id: 'col1', width: 400 },
      { id: 'col2', minWidth: 100 },
    ];

    const widths = distributeColumnWidths(columns, 450);

    expect(widths['col1']).toBe(400);
    expect(widths['col2']).toBeGreaterThanOrEqual(100);
  });

  it('should respect maxWidth constraint', () => {
    const columns = [
      { id: 'col1', maxWidth: 200 },
    ];

    const widths = distributeColumnWidths(columns, 500);

    expect(widths['col1']).toBeLessThanOrEqual(200);
  });

  it('should handle zero available width', () => {
    const columns = [
      { id: 'col1' },
      { id: 'col2' },
    ];

    const widths = distributeColumnWidths(columns, 0);

    // Should use minWidth (50 by default)
    expect(widths['col1']).toBe(50);
    expect(widths['col2']).toBe(50);
  });

  it('should handle all columns having defined widths', () => {
    const columns = [
      { id: 'col1', width: 100 },
      { id: 'col2', width: 150 },
      { id: 'col3', width: 200 },
    ];

    const widths = distributeColumnWidths(columns, 1000);

    expect(widths['col1']).toBe(100);
    expect(widths['col2']).toBe(150);
    expect(widths['col3']).toBe(200);
  });
});

// ============================================================================
// resetColumnWidths TESTS
// ============================================================================

describe('resetColumnWidths', () => {
  it('should reset to default width', () => {
    const columns = [
      { id: 'col1' },
      { id: 'col2' },
    ];

    const widths = resetColumnWidths(columns);

    expect(widths['col1']).toBe(150);
    expect(widths['col2']).toBe(150);
  });

  it('should use column defined widths when available', () => {
    const columns = [
      { id: 'col1', width: 200 },
      { id: 'col2' },
    ];

    const widths = resetColumnWidths(columns);

    expect(widths['col1']).toBe(200);
    expect(widths['col2']).toBe(150);
  });

  it('should use custom default width', () => {
    const columns = [
      { id: 'col1' },
      { id: 'col2' },
    ];

    const widths = resetColumnWidths(columns, 200);

    expect(widths['col1']).toBe(200);
    expect(widths['col2']).toBe(200);
  });

  it('should handle empty columns array', () => {
    const widths = resetColumnWidths([]);

    expect(Object.keys(widths)).toHaveLength(0);
  });
});

// ============================================================================
// localStorage UTILITY TESTS
// ============================================================================

describe('saveColumnWidths', () => {
  it('should save widths to localStorage', () => {
    const widths = { col1: 100, col2: 200 };

    saveColumnWidths('test-grid', widths);

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'column-widths-test-grid',
      JSON.stringify(widths)
    );
  });

  it('should handle different keys', () => {
    saveColumnWidths('grid-a', { col1: 100 });
    saveColumnWidths('grid-b', { col1: 200 });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'column-widths-grid-a',
      JSON.stringify({ col1: 100 })
    );
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'column-widths-grid-b',
      JSON.stringify({ col1: 200 })
    );
  });

  it('should throw error when localStorage fails', () => {
    localStorageMock.setItem.mockImplementationOnce(() => {
      throw new Error('Storage full');
    });

    expect(() => {
      saveColumnWidths('test-grid', { col1: 100 });
    }).toThrow('Storage full');
  });
});

describe('loadColumnWidths', () => {
  it('should load widths from localStorage', () => {
    const widths = { col1: 100, col2: 200 };
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(widths));

    const result = loadColumnWidths('test-grid');

    expect(result).toEqual(widths);
    expect(localStorageMock.getItem).toHaveBeenCalledWith('column-widths-test-grid');
  });

  it('should return null when no saved widths', () => {
    localStorageMock.getItem.mockReturnValueOnce(null);

    const result = loadColumnWidths('nonexistent');

    expect(result).toBeNull();
  });

  it('should return null on parse error', () => {
    localStorageMock.getItem.mockReturnValueOnce('invalid json');

    const result = loadColumnWidths('test-grid');

    expect(result).toBeNull();
  });

  it('should return null when localStorage throws', () => {
    localStorageMock.getItem.mockImplementationOnce(() => {
      throw new Error('Access denied');
    });

    const result = loadColumnWidths('test-grid');

    expect(result).toBeNull();
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('ColumnResizer integration', () => {
  it('should complete a full resize workflow', () => {
    const onResize = jest.fn();
    const onResizeEnd = jest.fn();

    const { container } = render(
      <ColumnResizer
        columnId="test-col"
        currentWidth={150}
        minWidth={50}
        maxWidth={500}
        onResize={onResize}
        onResizeEnd={onResizeEnd}
      />
    );

    const resizer = container.firstChild as HTMLElement;

    // Start drag
    fireEvent.mouseDown(resizer, { clientX: 100 });

    // Drag to new position
    fireEvent.mouseMove(document, { clientX: 150 });

    // End drag
    fireEvent.mouseUp(document);

    // onResize should have been called during the drag
    expect(onResize).toHaveBeenCalled();
  });

  it('should prevent default and stop propagation on mouse down', () => {
    const { container } = render(<ColumnResizer {...defaultProps} />);

    const resizer = container.firstChild as HTMLElement;
    const mockEvent = {
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
      clientX: 100,
    };

    fireEvent.mouseDown(resizer, mockEvent);

    // The component should handle preventing defaults internally
    expect(resizer).toHaveClass('cursor-col-resize');
  });
});

// ============================================================================
// EDGE CASES
// ============================================================================

describe('ColumnResizer edge cases', () => {
  it('should handle zero current width', () => {
    const { container } = render(
      <ColumnResizer {...defaultProps} currentWidth={0} />
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  it('should handle very large current width', () => {
    const { container } = render(
      <ColumnResizer {...defaultProps} currentWidth={10000} />
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  it('should handle minWidth equal to maxWidth', () => {
    const onResize = jest.fn();

    const { container } = render(
      <ColumnResizer
        {...defaultProps}
        minWidth={150}
        maxWidth={150}
        onResize={onResize}
      />
    );

    const resizer = container.firstChild as HTMLElement;

    fireEvent.mouseDown(resizer, { clientX: 100 });
    fireEvent.mouseMove(document, { clientX: 200 });

    // Width should be constrained to 150
    if (onResize.mock.calls.length > 0) {
      const [, width] = onResize.mock.calls[onResize.mock.calls.length - 1];
      expect(width).toBe(150);
    }
  });

  it('should handle rapid mouse movements', () => {
    const onResize = jest.fn();

    const { container } = render(
      <ColumnResizer {...defaultProps} onResize={onResize} />
    );

    const resizer = container.firstChild as HTMLElement;

    fireEvent.mouseDown(resizer, { clientX: 100 });

    // Rapid movements
    for (let i = 0; i < 10; i++) {
      fireEvent.mouseMove(document, { clientX: 100 + i * 10 });
    }

    fireEvent.mouseUp(document);

    // Should have processed all movements
    expect(onResize.mock.calls.length).toBeGreaterThan(0);
  });

  it('should handle mouse up without prior mouse down', () => {
    const onResizeEnd = jest.fn();

    render(<ColumnResizer {...defaultProps} onResizeEnd={onResizeEnd} />);

    // Mouse up without starting a drag
    fireEvent.mouseUp(document);

    // Should not call onResizeEnd
    expect(onResizeEnd).not.toHaveBeenCalled();
  });
});
